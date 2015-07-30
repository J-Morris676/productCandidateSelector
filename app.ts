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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.get("/api/docs/instances", function(req, res) {
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

app.get("/api/docs/relationships", function(req, res) {
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

app.listen(3000);
