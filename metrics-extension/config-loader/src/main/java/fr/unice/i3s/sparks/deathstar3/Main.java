package fr.unice.i3s.sparks.deathstar3;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import fr.unice.i3s.sparks.deathstar3.deserializer.ConfigLoader;
import fr.unice.i3s.sparks.deathstar3.deserializer.SymfinderConfigParser;
import fr.unice.i3s.sparks.deathstar3.entrypoint.MetricExtensionEntrypoint;
import fr.unice.i3s.sparks.deathstar3.model.ExperimentConfig;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

@Slf4j
public class Main {

    private static final List<String> VALID_LEVELS = Arrays.asList("TRACE", "DEBUG", "INFO", "WARN", "ERROR");

    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("""
                        Not enough arguments
                        Usage: 
                        symfinder-cli <experiment-config-file> <symfinder-config-file> <log-level : optional>
                    """);
        }

        if (args.length == 3) {
            if (VALID_LEVELS.contains(args[1].toUpperCase())) {
                Logger root = (Logger) LoggerFactory.getLogger(org.slf4j.Logger.ROOT_LOGGER_NAME);
                root.setLevel(Level.valueOf(args[1].toUpperCase()));
            }
        }

        String configFilePath = args[0];
        ConfigLoader configLoader = new ConfigLoader();
        SymfinderConfigParser symfinderConfigParser = new SymfinderConfigParser();
        List<ExperimentConfig> configs = configLoader.loadConfigFile(configFilePath);
        MetricExtensionEntrypoint metricExtension = new MetricExtensionEntrypoint();

        metricExtension.runExperiment(configs.get(0), symfinderConfigParser.parseSymfinderConfigurationFromFile(args[1]));

        // TODO Filter configFile to call project builder and test runner one one side and directly MetricGatherer for the rest
    }
}
