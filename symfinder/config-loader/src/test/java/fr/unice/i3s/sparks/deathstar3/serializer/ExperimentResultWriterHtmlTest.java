/*
 * This file is part of symfinder.
 *
 *  symfinder is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  symfinder is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 *  Copyright 2018-2021 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 *  Copyright 2018-2021 Xhevahire Tërnava <t.xheva@gmail.com>
 *  Copyright 2018-2021 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

package fr.unice.i3s.sparks.deathstar3.serializer;

import fr.unice.i3s.sparks.deathstar3.model.ExperimentConfig;
import fr.unice.i3s.sparks.deathstar3.model.ExperimentResult;
import org.junit.jupiter.api.Test;

import java.util.List;

public class ExperimentResultWriterHtmlTest {
    private ExperimentResultWriterHtml experimentResultWriterHtml = new ExperimentResultWriterHtml("old-visu");

    @Test
    void writeResultTest() throws Exception {
        var experimentResult = new ExperimentResult();
        experimentResult.setProjectName("junit");
        var config = new ExperimentConfig();
        config.setFilters(List.of("org.jfree.chart.util.PublicCloneable", "org.jfree.chart.event"));
        experimentResult.setExperimentConfig(config);
        experimentResultWriterHtml.writeResult(experimentResult);
    }

}
