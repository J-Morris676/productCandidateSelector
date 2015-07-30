// vim: noai:ts=2:sw=2
/*jshint strict:false*/
/*global __dirname describe it require*/

var assert  = require("chai").assert,
    fs      = require("fs"),
    path    = require("path"),

    easyXML = require("../easyxml-ts.js");

describe("Node EasyXML", function () {
    var should = {
        "names"  : "should parse a JSON object into XML",
        "names1" : "should parse a JSON object with attrs into XML",
        "names2" : "should parse a JSON object with attrs and text node into XML",
        "singularizeChildren" : "should parse a JSON object without singularizeChildren to XML",
        "singularizeChildren2" : "should parse a JSON object without singularizeChildren to XML (with object)",
        "singularizeChildren3" : "should parse a JSON object with correct captalization",
        "complex" : "testing a more complex XML object",
        "unwrappedArrays" : "should be able to use unwrapped child nodes to represent an array",
        "wrappedArrays" : "should normally wrap array elements in a single parent element",
        "null"    : "should parse a null value",
        "undefined":"should parse undefined values",
        "stressTest" : "should handle a stress test",
        "groupedAttributes" : "should be able to handle grouped attributes",
        "schemaOrder" : "should order output elements based on schema if one is provided",
        "bareArray" : "should be able to convert an array that is not contained in an object",
        "schemaNamedElementsOnly" : "should output only elements named in schema in the order provided",
        "schemaValidAttributes" : "should output only ValidAttributes if specified in schema",
        "namedArrayElements" : "should name elements within an array based on the configuration"
    };

    Object.keys(should)
        .forEach(function(name){
            it(should[name], function (done) {

                var config = {};
                var objectType = undefined;
                var json;

                if (name === 'singularizeChildren' || name === 'singularizeChildren2') {
                    config.singularizeChildren = false;
                } else {
                    config.singularizeChildren = true;
                }
                if (name === 'unwrappedArrays') {
                    config.unwrappedArrays = true;
                } else {
                    config.unwrappedArrays = false;
                }
                if (name === 'bareArray') {
                    config.schema = require('./schemaOrderSchema');
                    objectType = "schemaRoot";
                } else if (name.indexOf('schema') === 0) {
                    var filePath = './' + name + 'Schema';
                    config.schema = require(filePath);
                    objectType = "schemaRoot";
                } else {
                    config.schema = undefined;
                }
                if (name === 'namedArrayElements') {
                    config.bareItemContainer = "TestObject";
                }

                easyXML.configure(config);

                var file = __dirname + "/fixtures/" + name;

                fs.readFile(file + ".xml", "UTF-8", function (err, data) {
                    if (err) {
                      throw err;
                    }

                    json = require(file + ".json");
                    if (name === "undefined") {
                      json.undefinedz = undefined;
                    }

                    assert.equal(easyXML.render(json, objectType), data, "EasyXML should create the correct XML from a JSON data structure.");
                    assert.strictEqual(easyXML.render(json, objectType), data, "EasyXML should create the correct XML from a JSON data structure.");

                    done();
                });
            });
        });
});

