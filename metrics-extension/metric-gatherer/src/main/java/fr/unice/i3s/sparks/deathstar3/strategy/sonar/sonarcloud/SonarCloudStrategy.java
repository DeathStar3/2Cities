package fr.unice.i3s.sparks.deathstar3.strategy.sonar.sonarcloud;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import fr.unice.i3s.sparks.deathstar3.exception.HttpResponseException;
import fr.unice.i3s.sparks.deathstar3.serializer.model.Metric;
import fr.unice.i3s.sparks.deathstar3.serializer.model.Node;
import fr.unice.i3s.sparks.deathstar3.strategy.MetricGatheringStrategy;
import fr.unice.i3s.sparks.deathstar3.strategy.sonar.model.SonarMetricAvailable;
import fr.unice.i3s.sparks.deathstar3.strategy.sonar.model.SonarResults;
import fr.unice.i3s.sparks.deathstar3.utils.HttpRequest;
import org.apache.hc.core5.http.HttpStatus;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SonarCloudStrategy implements MetricGatheringStrategy {

    private final ObjectMapper objectMapper = new ObjectMapper(new YAMLFactory());
    private final HttpRequest httpRequest = new HttpRequest();

    @Override
    public List<Node> getMetrics(String sourceUrl, String componentName, List<String> metricNames) throws IOException {

        SonarResults sonarResults = performHttpRequest(sourceUrl, componentName, metricNames);
        return formatResults(sonarResults);
    }

    /**
     * Query the Sonar API (https://sonarcloud.io/web_api/api/measures) to retrieve the metrics wanted
     */
    public SonarResults performHttpRequest(String rootUrl, String componentName, List<String> metricNames) throws IOException {

        int numElementsPerPage = 500;

        String baseUrl = rootUrl + "/api/measures/component_tree?component=" + componentName + "&metricKeys=" + String.join(",", metricNames) + "&ps=" + numElementsPerPage; //TODO Manage API errors when the metric asked is not find by sonar

        SonarResults sonarResults = new SonarResults();
        sonarResults.setComponents(new ArrayList<>());

        int page = 1;
        do {
            String json = null;
            try {
                // Make the http request to Sonar Cloud
                json = httpRequest.get(baseUrl + "&p=" + page);
            } catch (HttpResponseException e) {
                e.printStackTrace();

                if (e.getCode() == HttpStatus.SC_NOT_FOUND) {
                    //Display the available metrics for the project
                    displayAvailableMetrics(rootUrl, componentName);
                }
                Thread.currentThread().stop(); // Kill thread: an error occur
            }

            SonarResults sonarResultsTemp = objectMapper.readValue(json, SonarResults.class);

            // Update SonarResults
            sonarResults.setPaging(sonarResultsTemp.getPaging());
            sonarResults.getComponents().addAll(sonarResultsTemp.getComponents());

            page++;
        } while (sonarResults.getPaging().getTotal() > (sonarResults.getPaging().getPageIndex() * sonarResults.getPaging().getPageSize()));

        return sonarResults;
    }

    /**
     * Format correctly the response form Sonar
     */
    public List<Node> formatResults(SonarResults sonarResults) {
        List<Node> nodes = new ArrayList<>();

        for (SonarResults.Component component : sonarResults.getComponents()) {

            Node node = new Node();
            node.setName(((component.getPath().replaceAll("^src/main/java/", "")).replaceAll("\\.java$", "")).replaceAll("/", "."));
            node.setMetrics(new ArrayList<>());

            for (SonarResults.Metric metric : component.getMeasures()) {
                node.getMetrics().add(new Metric(metric.getMetric(), metric.getValue()));
            }

            nodes.add(node);
        }
        return nodes;
    }

    /**
     * In case of error we will display the available metrics
     */
    public void displayAvailableMetrics(String rootUrl, String projectName) {

        String url = rootUrl + "/api/metrics/search?&component=" + projectName;

        try {
            String json = httpRequest.get(url);
            SonarMetricAvailable sonarMetricAvailable = objectMapper.readValue(json, SonarMetricAvailable.class);

            System.err.println("\n >>> Project Name: " + projectName + " (source = SonarCloud)");
            sonarMetricAvailable.formatPrint();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
