/// <reference path='typings/node/node.d.ts' />
/// <reference path='typings/express/express.d.ts' />
/// <reference path='typings/express/express-middleware.d.ts' />
/// <reference path='typings/easyxml-ts/easyxml-ts.d.ts' />

import express = require('express');
import bodyParser = require("body-parser");

var app = require('express')();
var fs = require('fs');
var log4js = require('log4js');
var easyXml = require('easyxml-ts');

easyXml.configure({
    singularizeChildren: true,
    allowAttributes: true,
    rootElement: 'response',
    dateFormat: 'ISO',
    indent: 2,
    manifest: true
});

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/miniProject.log'), 'miniProject');

var logger = log4js.getLogger('miniProject');

var candidateTrees = {};
var candidateTreeCount = 0;

var aliases = {};
var aliasesCount = 0;

var features = {};
var featuresCount = 0;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(express.static(__dirname + '/public'));

app.get("/api/data", function(req, res) {
    logger.info("GET: Data Directory Names");

    var files = fs.readdirSync(__dirname + "/data");
    res.json(files);
});

app.get("/api/data/:storyNo/instances", function(req, res) {
    logger.info("GET: Instances");

    try {
        var instances = JSON.parse(fs.readFileSync('data/' + req.params.storyNo + '/Instances.json', 'utf8'));
        res.json(instances);
    }
    catch (e) {
        logger.error(e);
        res.status(500).json(e);
    }
});

app.get("/api/data/:storyNo/relationships", function(req, res) {
    logger.info("GET: Relationships");

    try {
        var relationships = JSON.parse(fs.readFileSync('data/' + req.params.storyNo + '/Relationships.json', 'utf8'));
        res.json(relationships);
    }
    catch (e) {
        logger.error(e);
        res.status(500).json(e);
    }
});

app.post("/api/aliases", function(req, res) {
    logger.info("POST: Saving Alias");

    var ID = ++aliasesCount;
    aliases[aliasesCount.toString()] = req.body;

    res.json({
        "ID": ID
    })
});

app.get("/api/aliases/:ID", function(req, res) {
    logger.info("GET: Aliases " + req.params.ID);

    res.setHeader("Content-Disposition", "attachment; filename=\"Aliases.json\"");
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(aliases[req.params.ID], null, 2));

    delete aliases[req.params.ID];
});

app.post("/api/candidateTrees", function(req, res) {
    logger.info("POST: Saving Candidate Tree");

    var ID = ++candidateTreeCount;
    candidateTrees[candidateTreeCount.toString()] = req.body;

    res.json({
        "ID": ID
    })
});

app.get("/api/candidateTrees/:ID", function(req, res) {
    logger.info("GET: Candidate Tree " + req.params.ID + "[" + req.query.format + "]");

    if (req.query.format == "xml") {
        res.setHeader("Content-Disposition", "attachment; filename=\"candidate.xml\"");
        res.setHeader('Content-Type', 'application/xml');
        res.send(easyXml.render(candidateTrees[req.params.ID]));
    }
    else {
        res.setHeader("Content-Disposition", "attachment; filename=\"candidate.json\"");
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(candidateTrees[req.params.ID], null, 2));
    }

    delete candidateTrees[req.params.ID];
});

app.post("/api/features", function(req, res) {
    logger.info("POST: Saving Feature");

    var ID = ++featuresCount;
    features[featuresCount.toString()] = req.body;

    res.json({
        "ID": ID
    })
});

app.get("/api/features/:ID", function(req, res) {
    logger.info("GET: Feature " + req.params.ID);

    var fileName = req.query.fileName || "feature";
    fileName += ".feature\"";

    res.setHeader("Content-Disposition", "attachment; filename=\"" + fileName);
    res.setHeader('Content-Type', 'text/plain');
    res.send(features[req.params.ID]);

    delete features[req.params.ID];
});

app.listen(3000);
