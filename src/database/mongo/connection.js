"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.getConnectionOptions = void 0;
const nconf = require("nconf");
const winston = require("winston");
const _ = require("lodash");
const mongodb_1 = require("mongodb");
function getConnectionString(mongo) {
    mongo = mongo || nconf.get('mongo');
    let usernamePassword = '';
    const uri = mongo.uri || '';
    if (mongo.username && mongo.password) {
        usernamePassword = `${mongo.username}:${encodeURIComponent(mongo.password)}@`;
    }
    else if (!uri.includes('@') || !uri.slice(uri.indexOf('://') + 3, uri.indexOf('@'))) {
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
exports.default = getConnectionString;
function getConnectionOptions(mongo) {
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const nconfVar = nconf.get('mongo');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    mongo = mongo || nconfVar;
    const connOptions = {
        maxPoolSize: 10,
        minPoolSize: 3,
        connectTimeoutMS: 90000,
    };
    return _.merge(connOptions, mongo.options || {});
}
exports.getConnectionOptions = getConnectionOptions;
function connect(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const connString = getConnectionString(options);
        const connOptions = getConnectionOptions(options);
        return yield mongodb_1.MongoClient.connect(connString, connOptions);
    });
}
exports.connect = connect;
