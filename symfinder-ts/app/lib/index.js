"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * Copyright 2021-2022 Bruel Martin <martin.bruel999@gmail.com>
 */
var symfinder_1 = require("./symfinder");
var runner = process.env.ENGINE_RUNNER;
var symfinder = new symfinder_1.Symfinder(runner);
//symfinder.run('../test_project/strategy');
//symfinder.run('../experiments/n8n/packages');
//symfinder.run('../experiments/grafana');
//symfinder.run('../test_project/modules');
//symfinder.run('../test_project/proximity');
//symfinder.run('../experiments/satellizer');
//symfinder.run('../experiments/Babylon.js');
//symfinder.run('../experiments/ant-design');
//symfinder.run('../experiments/angular');
//symfinder.run('../experiments/typeorm');
//symfinder.run('../experiments/vscode');
var path = process.env.PROJECT_PATH;
var http_path = process.env.HTTP_PATH;
var analysis_base = process.argv.find(function (arg) { return arg === "-b"; }) !== undefined;
var stats_file = process.argv.find(function (arg) { return arg === "-sf"; }) !== undefined;
if (path === undefined)
    console.log("Error path undefined...");
else {
    if (http_path === undefined) {
        console.log("Executing locally...");
        symfinder.run(path, "", analysis_base, stats_file);
    }
    else {
        console.log("Sending result to " + http_path + " ...");
        symfinder.run(path, http_path, analysis_base, stats_file);
    }
}
// MATCH (n:VP_FOLDER)-[:CHILD]->(d:VARIANT_FOLDER)-[:CHILD]->(f:SUPER_VARIANT_FILE) RETURN n, d, f
// MATCH (n1:FILE_VARIANT)-[r:CODE_DUPLICATED]->(n2:FILE_VARIANT) RETURN n1, n2
