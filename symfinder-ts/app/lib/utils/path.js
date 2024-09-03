"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.filname_from_filepath = void 0;
/**
 * get fileame from filepath
 * @param filePath
 * @returns filname
 */
function filname_from_filepath(filePath) {
    return filePath.split('/').slice(-1)[0];
}
exports.filname_from_filepath = filname_from_filepath;
