package fr.unice.i3s.sparks.deathstar3.projectbuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.CreateNetworkResponse;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.api.command.PullImageResultCallback;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.DockerClientBuilder;

import fr.unice.i3s.sparks.deathstar3.exceptions.PullException;
import fr.unice.i3s.sparks.deathstar3.model.Config;
import fr.unice.i3s.sparks.deathstar3.models.SonarQubeToken;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

public class Compiler {

    private final DockerClient dockerClient = DockerClientBuilder.getInstance().build();

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Logger logger = Logger.getLogger(Compiler.class.getName());

    public static final String NETWORK_NAME = "varicity-config";

    private static final String SONARQUBE_LOCAL_URL = "http://localhost:9000";

    public Compiler() {

    }

    public void executeProject(Config projectConfig) {

        if (projectConfig.isBuildCmdIncludeSonar()) {
            logger.info("Hello "+projectConfig);
            try {
                var compileAndScanProjectId =this.compileAndScanProject(projectConfig);
                waitForContainerCorrectExit(compileAndScanProjectId);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        } else {
            var compileProjectId = compileProject(projectConfig);

            waitForContainerCorrectExit(compileProjectId);

            try {
                String tokenName = RandomStringUtils.randomAlphabetic(8, 10).toUpperCase(Locale.ENGLISH);
                SonarQubeToken result = this.getToken(tokenName, SONARQUBE_LOCAL_URL);
                String scannerContainerId = this.runSonarScannerCli(projectConfig, result);
                waitForContainerCorrectExit(scannerContainerId);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }

        }

    }

    private void waitForContainerCorrectExit(String containerId) {
        InspectContainerResponse container = dockerClient.inspectContainerCmd(containerId).exec();

        while (!container.getState().getStatus().strip().equals("exited")) {
            logger.info(container.getState().toString());
            logger.info(containerId + " : " + container.getState().getStatus());
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            container = dockerClient.inspectContainerCmd(containerId).exec();

        }

        if (container.getState().getExitCodeLong() != 0) {
            logger.severe("Container exited with non-zero code");
        }

        logger.info("End waiting for " + containerId + " " + container.getState());
    }

    /**
     * Compile and scan the project in the same step if
     * 
     * @param projectConfig
     * @return the containerId
     */
    public String compileAndScanProject(Config projectConfig) throws JsonProcessingException {
        if (!checkIfImageExists(projectConfig.getBuildEnv(), projectConfig.getBuildEnvTag())) {
            try {
                downloadImage(projectConfig.getBuildEnv(), projectConfig.getBuildEnvTag());
            } catch (PullException exception) {
                this.logger.severe("Cannot pull image necessary to compile project");
                System.exit(1);
            }

        }

        String tokenName = RandomStringUtils.randomAlphabetic(8, 10).toUpperCase(Locale.ENGLISH);
        SonarQubeToken result = this.getToken(tokenName, SONARQUBE_LOCAL_URL);
        Volume volume = new Volume("/project");

        var command = dockerClient.createContainerCmd(projectConfig.getBuildEnv() + ":" + projectConfig.getBuildEnvTag());
        if (projectConfig.getBuildEnv().equals("maven")) { // to use sonar in maven jdk version need to be greater or
                                                        // equals to 11

            List<String> mvnCommmands = new ArrayList<>(projectConfig.getBuildCmds());
            mvnCommmands.add("-Dsonar.login=" + result.token());
            mvnCommmands.add("-Dsonar.host.url=" + projectConfig.getSonarqubeUrl());
            mvnCommmands.add("-Dsonar.projectKey=" + projectConfig.getProjectName());
            command = command.withEntrypoint(mvnCommmands);
        }

        var container = command
                .withHostConfig(HostConfig.newHostConfig()
                        .withBinds(new Bind(projectConfig.getPath(), volume, AccessMode.rw)).withNetworkMode(NETWORK_NAME))
                .exec();

        dockerClient.startContainerCmd(container.getId()).exec();

        return container.getId();

    }

    public String compileProject(Config projectConfig) {

        if (!checkIfImageExists(projectConfig.getBuildEnv(), projectConfig.getBuildEnvTag())) {
            try {
                downloadImage(projectConfig.getBuildEnv(), projectConfig.getBuildEnvTag());
            } catch (PullException exception) {
                this.logger.severe("Cannot pull image necessary to compile project");
                System.exit(1);
            }

        }

        Volume volume = new Volume("/project");
        CreateContainerResponse container = dockerClient
                .createContainerCmd(projectConfig.getBuildEnv() + ":" + projectConfig.getBuildEnvTag())
                .withHostConfig(
                        HostConfig.newHostConfig().withBinds(new Bind(projectConfig.getPath(), volume, AccessMode.rw)))
                .withEntrypoint(projectConfig.getBuildCmds()).exec();// TODO assuming the project is a mvn project

        dockerClient.startContainerCmd(container.getId()).exec();

        return container.getId();

    }

    private boolean checkIfImageExists(String image, String tag) {
        return dockerClient.listImagesCmd().exec().stream()
                .anyMatch(img -> Arrays.stream(img.getRepoTags()).anyMatch(name -> name.equals(image + ":" + tag)));
    }

    private void downloadImage(String image, String tag) throws PullException {
        try {
            dockerClient.pullImageCmd(image).withTag(tag).exec(new PullImageResultCallback()).awaitCompletion(5,
                    TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            throw new PullException();
        }
    }



    private HttpHeaders createHeaders(String username, String password) {
        return new HttpHeaders() {
            {
                String auth = username + ":" + password;
                byte[] encodedAuth = Base64.encodeBase64(auth.getBytes(StandardCharsets.US_ASCII));
                String authHeader = "Basic " + new String(encodedAuth);
                set("Authorization", authHeader);
            }
        };
    }

    /**
     * https://www.baeldung.com/how-to-use-resttemplate-with-basic-authentication-in-spring
     * 
     * @param token_name
     * @return
     * @throws JsonProcessingException
     */
    public SonarQubeToken getToken(String token_name, String sonarqubeUrl) throws JsonProcessingException {
        // curl -u admin:admin -X POST
        // http://localhost:9000/api/user_tokens/generate?name=mytoken

        var response = restTemplate.exchange(sonarqubeUrl + "/api/user_tokens/generate?name=" + token_name,
                HttpMethod.POST, new HttpEntity<>(createHeaders("admin", "admin")), String.class);

        return this.objectMapper.readValue(response.getBody(), SonarQubeToken.class);
    }

    public String runSonarScannerCli(Config projectConfig, SonarQubeToken token) {



        Volume volume = new Volume("/usr/src");
        String completePath = "";
        if (projectConfig.getSourcePackage().isBlank() || projectConfig.getSourcePackage().strip().equals(".")) {
            completePath = projectConfig.getPath();
        } else {
            completePath = projectConfig.getPath() + "/" + projectConfig.getSourcePackage();
        }

        CreateContainerResponse container = dockerClient.createContainerCmd("sonarsource/sonar-scanner-cli")
                .withEnv("SONAR_LOGIN=" + token.token())
                .withHostConfig(HostConfig.newHostConfig().withBinds(new Bind(completePath, volume, AccessMode.rw))
                        .withNetworkMode(NETWORK_NAME))

                .withEnv("SONAR_HOST_URL=" + projectConfig.getSonarqubeUrl()).exec();

        dockerClient.startContainerCmd(container.getId()).exec();

        return container.getId();
    }
}
