/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2018-2019 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2019 Xhevahire Tërnava <xhevahire.ternava@lip6.fr>
 * Copyright 2018-2019 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

import neograph.NeoGraph;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.harness.junit.rule.Neo4jRule;

import java.util.function.Consumer;

public class Neo4jTest {

    @Rule
    public Neo4jRule neo4jRule = new Neo4jRule();
    protected GraphDatabaseService graphDatabaseService;

    @Before
    public void setUp() {
        graphDatabaseService = neo4jRule.defaultDatabaseService();
    }

    @After
    public void tearDown() {
        graphDatabaseService.executeTransactionally("MATCH (n) DETACH DELETE (n)");
    }

    protected void runTest(Consumer<NeoGraph> consumer){
        try (Driver driver = GraphDatabase.driver(neo4jRule.boltURI())) {
            NeoGraph graph = new NeoGraph(driver);
            consumer.accept(graph);
        }
    }

}
