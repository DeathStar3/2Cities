package fr.unice.i3s.sparks.deathstar3.projectbuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DockerClientBuilder;
import fr.unice.i3s.sparks.deathstar3.model.Config;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class CompilerTest {

    private SonarQubeStarter sonarqubeStarter = new SonarQubeStarter();
    private final DockerClient dockerClient = DockerClientBuilder.getInstance().build();

    private Compiler compiler = new Compiler();

    private Config jfreeChart = new Config("jfreechart", "/tmp/varicity-xp-projects/jfreechart", "", "maven",
            "3.8.2-jdk-11", List.of("mvn", "clean", "install", "sonar:sonar", "-f", "/project/pom.xml"),
            "http://sonarqubehost:9000", true);

    private Config junit = new Config("junit", "/tmp/varicity-xp-projects/junit4", "", "maven", "3.8.2-jdk-11",
            List.of("mvn", "clean", "install", "sonar:sonar", "-f", "/project/pom.xml", "-DskipTests=true"),
            "http://sonarqubehost:9000", true);

    private Config argoUml = new Config("argouml", "", "", "openjdk", "8-jdk",
            List.of("/bin/sh ", "-c", "chmod +x /project/tools/apache-ant-1.8.0/bin/ant \n bash build.sh"),
            "http://sonarqubehost:9000", false);

    @Test
    public void getTokenTest() throws JsonProcessingException {
        var result = compiler.getToken("my_vezdzhdgreatest_name", "http://localhost:9000");
        System.out.println(result);
        assertNotNull(result);

    }

    /**
     * the test is executed by a shell script which does the equivalent of the asserts
     */
    @Test
    public void executeTest() {

        sonarqubeStarter.startSonarqube();
        compiler.executeProject(jfreeChart);

    }

    /**
     * the test is executed by a shell script which does the equivalent of the asserts
     */
    @Test
    public void compileAndScanJunit4() {
        sonarqubeStarter.startSonarqube();
        compiler.executeProject(junit);
    }

    @Test
    public void compileAndScanArgoUmlSPL() throws IOException, GitAPIException {

        Path projectDest = Files.createTempDirectory("varicity-xp-projets-clone");
        Git.cloneRepository().setURI("https://github.com/marcusvnac/argouml-spl.git").setDirectory(projectDest.toFile())
                .call();

        Files.copy(CompilerTest.class.getClassLoader().getResourceAsStream("argouml/sonar-project.properties"),
                Path.of(projectDest.toAbsolutePath().toString(), "sonar-project.properties"));

        System.out.println(projectDest);
        // sonarqubeStarter.startSonarqube();
        argoUml.setPath(projectDest.toAbsolutePath().toString());
        compiler.executeProject(argoUml);

        Assertions.assertTrue(Files.exists(Path.of(projectDest.toAbsolutePath().toString(), "src/argouml-app/build")));

    }
}
