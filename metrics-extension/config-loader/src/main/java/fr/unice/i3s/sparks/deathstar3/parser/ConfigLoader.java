package fr.unice.i3s.sparks.deathstar3.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import fr.unice.i3s.sparks.deathstar3.model.Config;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;

@Slf4j
public class ConfigLoader {

    private static final String CONFIG_FILE_PATH = ""; //TODO need to be defined

    public Config loadConfigFile(String fileName) {

        try {
            File configFile = new File(CONFIG_FILE_PATH + fileName);

            ObjectMapper om = new ObjectMapper(new YAMLFactory());
            Config config = om.readValue(configFile, Config.class); //TODO Missing a verification layer to check that all the mandatory properties are given

            log.info("Config file loaded: " + config);
            return config;
        } catch (IOException e) {
            e.printStackTrace();
        }
        throw new RuntimeException("Could not load config file (" +  fileName + ")");
    }
}
