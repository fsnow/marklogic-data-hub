/**
 Copyright 2012-2019 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');

// define constants for caching expensive operations
const dataHub = DataHubSingleton.instance();

const collections = ['http://marklogic.com/data-hub/load-data-artifact'];
const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
const permissions = [xdmp.permission(dataHub.consts.DATA_HUB_DEVELOPER_ROLE, 'update'), xdmp.permission(dataHub.consts.DATA_HUB_OPERATOR_ROLE, 'read')];
const requiredProperties = ['name', 'sourceFormat', 'targetFormat'];

export function getNameProperty() {
    return 'name';
}

export function getVersionProperty() {
    return null;
}

export function getCollections() {
    return collections;
}

export function getStorageDatabases() {
    return databases;
}

export function getPermissions() {
    return permissions;
}

export function getArtifactNode(artifactName, artifactVersion) {
    // Currently there is no versioning for loadData artifacts
    const results = cts.search(cts.andQuery([cts.collectionQuery(collections[0]), cts.jsonPropertyValueQuery('name', artifactName)]));
    if (fn.empty(results)) {
        returnErrToClient(404, 'Not found!');
    }
    return fn.head(results);
}

export function validateArtifact(artifact) {
    const missingProperties = requiredProperties.filter((propName) => !artifact[propName]);
    if (missingProperties.length) {
        returnErrToClient(400, 'BAD REQUEST', `Missing the following required properties: ${JSON.stringify(missingProperties)}`);
    }
    return artifact;
}

function returnErrToClient(statusCode, statusMsg, body)
{
    fn.error(null, 'RESTAPI-SRVEXERR',
        Sequence.from([statusCode, statusMsg, body]));
}