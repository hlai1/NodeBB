import nconf = require('nconf');

import winston = require('winston');
import _ = require('lodash');
import { MongoClient, MongoClientOptions } from 'mongodb';

interface Mongo {
    uri: string;
    username: string;
    password: string;
    host: string;
    port: number;
    database: string;
    options: MongoClientOptions;
}
export default function getConnectionString(mongo: Mongo): string {
    let usernamePassword = '';
    const uri = mongo.uri || '';
    if (mongo.username && mongo.password) {
        usernamePassword = `${mongo.username}:${encodeURIComponent(mongo.password)}@`;
    } else if (!uri.includes('@') || !uri.slice(uri.indexOf('://') + 3, uri.indexOf('@'))) {
        winston.warn('You have no mongo username/password setup!');
    }

    // Sensible defaults for Mongo, if not set
    if (!mongo.host) {
        mongo.host = '127.0.0.1';
    }
    if (!mongo.port) {
        mongo.port = 27017;
    }
    const dbName = mongo.database;
    if (dbName === undefined || dbName === '') {
        winston.warn('You have no database name, using "nodebb"');
        mongo.database = 'nodebb';
    }

    const hosts = mongo.host.split(',');
    const ports = mongo.port.toString().split(',');
    const servers = [];

    for (let i = 0; i < hosts.length; i += 1) {
        servers.push(`${hosts[i]}:${ports[i]}`);
    }

    return uri || `mongodb://${usernamePassword}${servers.join()}/${mongo.database}`;
}

export function getConnectionOptions(mongo: Mongo): MongoClientOptions {
    const connOptions = {
        maxPoolSize: 10,
        minPoolSize: 3,
        connectTimeoutMS: 90000,
    };

    return _.merge(connOptions, mongo.options || {});
}

export async function connect(options: Mongo): Promise<MongoClient> {
    const connString: string = getConnectionString(options);
    const connOptions: MongoClientOptions = getConnectionOptions(options);

    return await MongoClient.connect(connString, connOptions);
}



