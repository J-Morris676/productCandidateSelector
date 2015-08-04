/// <reference path="../interfaces/data.ts" />
var app;
(function (app) {
    var services;
    (function (services) {
        var dataGenerationServices;
        (function (dataGenerationServices) {
            'use strict';
            var specificationTreeDataGenerationService = (function () {
                function specificationTreeDataGenerationService() {
                }
                specificationTreeDataGenerationService.prototype.setInstances = function (instances) {
                    this.instances = instances;
                };
                specificationTreeDataGenerationService.prototype.setRelationships = function (relationships) {
                    this.relationships = relationships;
                };
                specificationTreeDataGenerationService.prototype.generateSpecificationTreeData = function (guid) {
                    var instance = this.instances[guid];
                    var instanceAsObjects = this.convertInstanceObjectArraysToObjects(instance);
                    var instanceMeta = instanceAsObjects.Meta;
                    var instanceData = instanceAsObjects.Data;
                    var children = this.relationships[guid] || [];
                    var node = {
                        type: instanceMeta.ElementKind,
                        name: null,
                        text: instanceMeta.ElementKind,
                        guid: guid,
                        children: Array(),
                        cardinality: null,
                        elementHierarchy: instanceMeta.ElementHierarchy
                    };
                    if (instanceMeta.ElementHierarchy.indexOf("Launch_Entity") != -1) {
                        this.nameNodeForLaunchEntity(node, instanceData.Name);
                    }
                    else if (instanceMeta.ElementKind == "TSpecCharUse") {
                        node.text = instanceData.Description;
                        node.cardinality = {
                            max: instanceData.Max_Occurs,
                            min: instanceData.Min_Occurs
                        };
                    }
                    else if (instanceMeta.ElementKind == "TOrderChar") {
                        node.text = instanceData.Name;
                    }
                    else if (instanceMeta.ElementKind == "TSpecCharValue") {
                        node.text = instanceData.Value;
                    }
                    else if (instanceMeta.ElementKind == "TUserDefinedCharacteristicValue") {
                        node.text = instanceData.Name;
                    }
                    for (var childIndex = 0; childIndex < children.length; childIndex++) {
                        var childInstance = this.instances[children[childIndex].Child];
                        var childInstanceAsObjects = this.convertInstanceObjectArraysToObjects(childInstance);
                        var childInstanceMeta = childInstanceAsObjects.Meta;
                        var childInstanceData = childInstanceAsObjects.Data;
                        var childHierarchyPath = childInstanceMeta.ElementHierarchy;
                        var childExplicitType = this.findHierarchyType(childHierarchyPath);
                        if (childExplicitType == "Relation_Entity") {
                            if (this.isInDate(new Date(childInstanceData.Association_Start_Date), new Date(childInstanceData.Association_End_Date))) {
                                var grandchildGuid = this.relationships[children[childIndex].Child][0].Child;
                                var grandchild = this.generateSpecificationTreeData(grandchildGuid);
                                grandchild.cardinality = {
                                    max: childInstanceData.Max_Occurs,
                                    min: childInstanceData.Min_Occurs
                                };
                                grandchild.text = grandchild.text + " (" + grandchild.cardinality["min"] + ":" + grandchild.cardinality["max"] + ")";
                                node.children.push(grandchild);
                            }
                        }
                        else {
                            node.children.push(this.generateSpecificationTreeData(children[childIndex].Child));
                        }
                    }
                    return node;
                };
                specificationTreeDataGenerationService.prototype.findHierarchyType = function (path) {
                    var finalSlashIndex = path.lastIndexOf("/");
                    var explicitType = path.substring(finalSlashIndex + 1);
                    return explicitType;
                };
                specificationTreeDataGenerationService.prototype.isInDate = function (startDate, endDate) {
                    var todaysDate = new Date();
                    if (endDate.valueOf() == 0) {
                        return true;
                    }
                    else if (todaysDate > startDate && todaysDate < endDate) {
                        return true;
                    }
                    return false;
                };
                specificationTreeDataGenerationService.prototype.convertInstanceObjectArraysToObjects = function (instance) {
                    var meta = instance.Meta;
                    var data = instance.Data;
                    var instanceObject = {
                        Meta: {
                            ElementKind: null,
                            ElementHierarchy: null
                        },
                        Data: {}
                    };
                    for (var metaIndex = 0; metaIndex < meta.length; metaIndex++) {
                        instanceObject.Meta[meta[metaIndex].Name] = meta[metaIndex].Value;
                    }
                    for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                        instanceObject.Data[data[dataIndex].Name] = data[dataIndex].Value;
                    }
                    return instanceObject;
                };
                specificationTreeDataGenerationService.prototype.nameNodeForLaunchEntity = function (node, name) {
                    node.name = name;
                    node.text = node.text + " - " + name;
                };
                return specificationTreeDataGenerationService;
            })();
            dataGenerationServices.specificationTreeDataGenerationService = specificationTreeDataGenerationService;
        })(dataGenerationServices = services.dataGenerationServices || (services.dataGenerationServices = {}));
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=dataGenerationServices.js.map