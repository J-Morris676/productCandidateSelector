/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/express/express-middleware.d.ts' />
var express = require('express');
var bodyParser = require("body-parser");
var app = require('express')();
var fs = require('fs');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/miniProject.log'), 'miniProject');
var logger = log4js.getLogger('miniProject');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.get("/api/docs/instances", function (req, res) {
    logger.info("GET: Instances");
    try {
        var instances = JSON.parse(fs.readFileSync('docs/Instances.json', 'utf8'));
        res.json(instances);
    }
    catch (e) {
        logger.error(e);
        res.status(500).json(e);
    }
});
app.get("/api/docs/relationships", function (req, res) {
    logger.info("GET: Relationships");
    try {
        var relationships = JSON.parse(fs.readFileSync('docs/Relationships.json', 'utf8'));
        res.json(relationships);
    }
    catch (e) {
        logger.error(e);
        res.status(500).json(e);
    }
});
app.listen(3000);
//# sourceMappingURL=app.js.map