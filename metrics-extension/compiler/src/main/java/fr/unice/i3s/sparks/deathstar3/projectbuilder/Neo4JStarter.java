package fr.unice.i3s.sparks.deathstar3.projectbuilder;

import java.time.Duration;
import java.util.List;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.ExposedPort;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.PortBinding;
import com.github.dockerjava.api.model.Ports;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientBuilder;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;

import fr.unice.i3s.sparks.deathstar3.engine.configuration.Neo4jParameters;
import fr.unice.i3s.sparks.deathstar3.utils.Utils;
import fr.unice.i3s.sparks.deathstar3.utils.WaitFor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Neo4JStarter {
    private final DockerClient dockerClient;

    private final Utils utils=new Utils();

    public Neo4JStarter() {
        DockerClientConfig standard = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
        ApacheDockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(standard.getDockerHost())
                .sslConfig(standard.getSSLConfig())
                .maxConnections(100)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(45))
                .build();
        dockerClient = DockerClientBuilder.getInstance().withDockerHttpClient(httpClient).build();

    }

    public synchronized Neo4jParameters startNeo4J(){

        utils.createNetwork();

        if (!utils.checkIfImageExists(Constants.SYMFINDER_NEO4J_IMAGE,   Constants.SYMFINDER_NEO4J_TAG )) {
            try {
                utils.downloadImage(Constants.SYMFINDER_NEO4J_IMAGE, Constants.SYMFINDER_NEO4J_TAG);
            } catch (InterruptedException exception) {
                log.error("Cannot neo4j image requested "+Constants.SYMFINDER_NEO4J_IMAGE +":" +  Constants.SYMFINDER_NEO4J_TAG );
                throw new RuntimeException(exception);
            }

        }

        utils.removeOldExitedContainer(Constants.NEO4J_CONTAINER_NAME);

        if(existingNeo4J()){
            log.info("An instance of neo4j seems to be already running ");
            return new Neo4jParameters("bolt://"+ Constants.getNeo4jLocalHostname()+":7687","","");
        }



        // Create the container.
      CreateContainerResponse createContainerResponse=   dockerClient
                .createContainerCmd(Constants.SYMFINDER_NEO4J_IMAGE + ":" + Constants.SYMFINDER_NEO4J_TAG)
                .withName(Constants.NEO4J_CONTAINER_NAME)
                .withHostName(Constants.NEO4J_HOSTNAME)
              .withExposedPorts(ExposedPort.parse("7687"))
                .withHostConfig(
                        HostConfig
                                .newHostConfig().withPortBindings(PortBinding.parse("7687:7687"))

                                .withNetworkMode(Constants.NETWORK_NAME)
                )
                .withEnv(List.of(
                        "NEO4J_AUTH=none"
                ))
                .exec();

        dockerClient.startContainerCmd(createContainerResponse.getId()).exec();
        
        //WaitFor.waitForPort(Constants.getNeo4jLocalHostname(), 7474,120_000);

        return new Neo4jParameters("bolt://"+ Constants.getNeo4jLocalHostname()+":7687","","");

    }

    private boolean existingNeo4J(){
        var containers = dockerClient.listContainersCmd()
                .withNameFilter(List.of(Constants.NEO4J_CONTAINER_NAME)).exec();
        return !containers.isEmpty();
    }

}
