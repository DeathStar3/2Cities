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

import neo4j_types.EntityAttribute;
import neo4j_types.EntityType;
import neo4j_types.RelationType;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.types.Node;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class HotspotTest extends Neo4jTest {

    @Test
    public void subtypingOneVariantThresholdTwo() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            Node rectangleNode = graph.createNode("Rectangle", EntityType.CLASS);
            graph.linkTwoNodes(shapeNode, rectangleNode, RelationType.EXTENDS);
            graph.detectVPsAndVariants();
            graph.detectSingularHotspotsInSubtyping(2);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.VP.toString()));
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertFalse(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void subtypingTwoVariantsThresholdTwo() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            Node rectangleNode = graph.createNode("Rectangle", EntityType.CLASS);
            Node circleNode = graph.createNode("Circle", EntityType.CLASS);
            graph.linkTwoNodes(shapeNode, rectangleNode, RelationType.EXTENDS);
            graph.linkTwoNodes(shapeNode, circleNode, RelationType.EXTENDS);
            graph.detectVPsAndVariants();
            graph.detectSingularHotspotsInSubtyping(2);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.VP.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Circle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Circle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void subtypingTwoVariantsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            Node rectangleNode = graph.createNode("Rectangle", EntityType.CLASS);
            Node circleNode = graph.createNode("Circle", EntityType.CLASS);
            graph.linkTwoNodes(shapeNode, rectangleNode, RelationType.EXTENDS);
            graph.linkTwoNodes(shapeNode, circleNode, RelationType.EXTENDS);
            graph.detectVPsAndVariants();
            graph.detectSingularHotspotsInSubtyping(3);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.VP.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Circle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Circle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void subtypingThreeVariantsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            Node rectangleNode = graph.createNode("Rectangle", EntityType.CLASS);
            Node circleNode = graph.createNode("Circle", EntityType.CLASS);
            Node triangleNode = graph.createNode("Triangle", EntityType.CLASS);
            graph.linkTwoNodes(shapeNode, rectangleNode, RelationType.EXTENDS);
            graph.linkTwoNodes(shapeNode, circleNode, RelationType.EXTENDS);
            graph.linkTwoNodes(shapeNode, triangleNode, RelationType.EXTENDS);
            graph.detectVPsAndVariants();
            graph.detectSingularHotspotsInSubtyping(3);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.VP.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Circle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Triangle").get().hasLabel(EntityAttribute.VARIANT.toString()));
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Rectangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Circle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Triangle").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void methodOverloadingTwoVariantsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "methodVPs", 2);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 0);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void methodOverloadingNoVariant() {
        runTest(graph -> {
            graph.createNode("Shape", EntityType.CLASS);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void methodOverloadingThreeVariantsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "methodVPs", 3);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 0);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void constructorOverloadingOneVPThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "methodVPs", 0);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 1);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void constructorOverloadingThreeVariantsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "methodVPs", 0);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 3);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void mixedOverloadingTwoVPsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 1);
            graph.setNodeAttribute(shapeNode, "methodVPs", 1);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void mixedOverloadingThreeVPsThresholdThree() {
        runTest(graph -> {
            Node shapeNode = graph.createNode("Shape", EntityType.CLASS);
            graph.setNodeAttribute(shapeNode, "constructorVPs", 2);
            graph.setNodeAttribute(shapeNode, "methodVPs", 1);
            graph.detectSingularHotspotsInOverloading(3);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Shape").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void VPConcentrationTwoInterestsThresholdTwo() {
        runTest(graph -> {
            Node vp1 = graph.createNode("Vp1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("Vp2", EntityType.CLASS, EntityAttribute.VP);
            graph.setNodeAttribute(vp1, "interest", true);
            graph.setNodeAttribute(vp2, "interest", true);
            graph.linkTwoNodes(vp1, vp2, RelationType.EXTENDS);
            graph.detectAggregatedHotspots(2);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Vp1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Vp2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void VPConcentrationTwoInterestsThresholdThree() {
        runTest(graph -> {
            Node vp1 = graph.createNode("Vp1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("Vp2", EntityType.CLASS, EntityAttribute.VP);
            graph.setNodeAttribute(vp1, "interest", true);
            graph.setNodeAttribute(vp2, "interest", true);
            graph.linkTwoNodes(vp1, vp2, RelationType.EXTENDS);
            graph.detectAggregatedHotspots(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Vp1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void VPConcentrationThreeNodesTwoInterestsThresholdTwo() {
        runTest(graph -> {
            Node vp1 = graph.createNode("Vp1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("Vp2", EntityType.CLASS, EntityAttribute.VP);
            Node vp3 = graph.createNode("Vp3", EntityType.CLASS, EntityAttribute.VP);
            graph.setNodeAttribute(vp1, "interest", true);
            graph.setNodeAttribute(vp2, "interest", true);
            graph.linkTwoNodes(vp1, vp2, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, vp3, RelationType.EXTENDS);
            graph.detectAggregatedHotspots(2);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Vp1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Vp2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp3").get().hasLabel(EntityAttribute.HOTSPOT.toString())); // ICI
        });
    }

    @Test
    public void VPConcentrationThreeNodesTwoInterestsThresholdThree() {
        runTest(graph -> {
            Node vp1 = graph.createNode("Vp1", EntityType.CLASS, EntityAttribute.VP);
            Node vp2 = graph.createNode("Vp2", EntityType.CLASS, EntityAttribute.VP);
            Node vp3 = graph.createNode("Vp3", EntityType.CLASS, EntityAttribute.VP);
            graph.setNodeAttribute(vp1, "interest", true);
            graph.setNodeAttribute(vp2, "interest", true);
            graph.linkTwoNodes(vp1, vp2, RelationType.EXTENDS);
            graph.linkTwoNodes(vp1, vp3, RelationType.EXTENDS);
            graph.detectAggregatedHotspots(3);
            graph.setHotspotLabels();
            assertFalse(graph.getNode("Vp1").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp2").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp3").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

    @Test
    public void VPConcentrationTwoTrees() {
        runTest(graph -> {
            Node vp01 = graph.createNode("Vp01", EntityType.CLASS, EntityAttribute.VP);
            Node vp02 = graph.createNode("Vp02", EntityType.CLASS, EntityAttribute.VP);
            Node vp03 = graph.createNode("Vp03", EntityType.CLASS, EntityAttribute.VP);
            Node vp11 = graph.createNode("Vp11", EntityType.CLASS, EntityAttribute.VP);
            Node vp12 = graph.createNode("Vp12", EntityType.CLASS, EntityAttribute.VP);
            Node vp13 = graph.createNode("Vp13", EntityType.CLASS, EntityAttribute.VP);
            graph.setNodeAttribute(vp01, "interest", true);
            graph.setNodeAttribute(vp02, "interest", true);
            graph.setNodeAttribute(vp11, "interest", true);
            graph.linkTwoNodes(vp01, vp02, RelationType.EXTENDS);
            graph.linkTwoNodes(vp01, vp03, RelationType.EXTENDS);
            graph.linkTwoNodes(vp11, vp12, RelationType.EXTENDS);
            graph.linkTwoNodes(vp11, vp13, RelationType.EXTENDS);
            graph.detectAggregatedHotspots(2);
            graph.setHotspotLabels();
            assertTrue(graph.getNode("Vp01").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertTrue(graph.getNode("Vp02").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp03").get().hasLabel(EntityAttribute.HOTSPOT.toString())); // ICI
            assertFalse(graph.getNode("Vp11").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp12").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
            assertFalse(graph.getNode("Vp13").get().hasLabel(EntityAttribute.HOTSPOT.toString()));
        });
    }

}
