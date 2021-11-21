package fr.unice.i3s.sparks.deathstar3.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetricSource {

    private String name; // Mandatory
    private boolean enabled = true; // Optional (default to true)
    private List<String> commands; // Optional
    private String sourceUrl; // Mandatory

    private List<String> metrics;

    @Override
    public String toString() {
        return "MetricSource{" + "name='" + name + '\'' + ", enabled=" + enabled + ", commands=" + commands
                + ", sourceUrl='" + sourceUrl + '\'' + ", metrics=" + metrics + '}';
    }
}
