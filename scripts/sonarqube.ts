/*
 * Copyright (C) 2020 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { exec } from 'shelljs';
import minimist from 'minimist';
import { resolve } from 'path';

const argv = minimist(process.argv.slice(0));
const values = argv._;

const version = '8.4.1-community';
const versionScanner = '4.4';
const containerName = 'sonarqube';

const startSonarQube = () => {
    // docker pull sonarqube:$version
    // http://localhost:9000
    // login=admin, password=admin

    const sonarqubeDir = resolve('C:\\', 'Zimmermann', 'sonarqube');
    exec(
        // prettier-ignore
        'docker run --publish 9000:9000 ' +
            `--mount type=bind,src=${resolve(sonarqubeDir, 'data')},dst=/opt/sonarqube/data ` +
            `--mount type=bind,src=${resolve(sonarqubeDir, 'logs')},dst=/opt/sonarqube/logs ` +
            `--mount type=bind,src=${resolve(sonarqubeDir, 'extensions')},dst=/opt/sonarqube/extensions ` +
            `--name ${containerName} --rm ` +
            `sonarqube:${version}`,
    );
};

const scan = () => {
    exec(
        // prettier-ignore
        'docker run ' +
            `--mount type=bind,src=${process.cwd()},dst=/usr/src ` +
            '--env SONAR_HOST_URL="http://host.docker.internal:9000" ' +
            '--name sonar-scanner-cli --rm ' +
            `sonarsource/sonar-scanner-cli:${versionScanner}`,
    );
};

const stopSonarQube = () => {
    exec(`docker stop ${containerName}`);
};

switch (values[2]) {
    case 'stop':
        stopSonarQube();
        break;

    case 'scan':
        scan();
        break;

    case 'start':
    default:
        startSonarQube();
}
