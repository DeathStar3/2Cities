"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
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
var js_yaml_1 = require("js-yaml");
var fs_1 = require("fs");
var Configuration = /** @class */ (function () {
    function Configuration(runner) {
        this.runner = runner;
        if (this.runner === "docker") {
            this.properties = (0, js_yaml_1.load)((0, fs_1.readFileSync)('./neo4j_docker.yaml', 'utf8'));
        }
        else {
            this.properties = (0, js_yaml_1.load)((0, fs_1.readFileSync)('./neo4j.yaml', 'utf8'));
        }
    }
    Configuration.prototype.getNeo4JBoltAdress = function () {
        return this.properties.neo4j.boltAddress;
    };
    Configuration.prototype.getNeo4JUser = function () {
        return this.properties.neo4j.user;
    };
    Configuration.prototype.getNeo4JPassword = function () {
        return this.properties.neo4j.password;
    };
    return Configuration;
}());
exports.Configuration = Configuration;
