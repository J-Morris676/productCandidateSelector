/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../interfaces/data.ts" />
/// <reference path="../filters/selectFilters.ts" />
/// <reference path="../modules/InstanceTreeUtilities.ts" />
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        'use strict';
        var selectController = (function () {
            function selectController($scope, instanceService, relationshipService, $filter) {
                var _this = this;
                this.errorHandler = function (error) {
                    console.log(error);
                };
                this.assignInstancesResponse = function (instances) {
                    _this.$scope.instances = instances;
                    _this.$scope.elementKinds = _this.$filter('elementKindUniqueFilter')(_this.$scope.instances);
                };
                this.assignRelationshipsResponse = function (relationships) {
                    _this.$scope.relationships = relationships;
                };
                this.updateNameDropDown = function () {
                    _this.$scope.elementNames = _this.$filter('nameByElementKindFilter')(_this.$scope.instances, _this.$scope.elementKinds[_this.$scope.elementKindGuid]);
                };
                this.drawGraph = function () {
                    _this.$scope.specificationTree = _this.generateSpecificationTreeData(_this.$scope.elementNameAndGuid["guid"]);
                    console.log(_this.$scope.specificationTree);
                };
                this.generateSpecificationTreeData = function (guid) {
                    var relationships = _this.$scope.relationships;
                    var instance = _this.$scope.instances[guid];
                    var children = relationships[guid] || [];
                    var node = {
                        type: instance.Meta[0].Value,
                        name: null,
                        text: instance.Meta[0].Value,
                        guid: guid,
                        children: Array(),
                        cardinality: null
                    };
                    if (instance.Meta[1].Value.indexOf("Launch_Entity") != -1) {
                        node.name = instance.Data[7].Value;
                        node.text = node.text + " - " + instance.Data[7].Value;
                    }
                    for (var childIndex = 0; childIndex < children.length; childIndex++) {
                        var child = _this.$scope.instances[children[childIndex].Child];
                        var childHierarchyPath = _this.$scope.instances[children[childIndex].Child].Meta[1].Value;
                        var childExplicitType = _this.findHierarchyType(childHierarchyPath);
                        if (childExplicitType == "Relation_Entity") {
                            if (_this.isInDate(new Date(child.Data[0].Value), new Date(child.Data[1].Value))) {
                                var grandchildGuid = relationships[children[childIndex].Child][0].Child;
                                var grandchild = _this.generateSpecificationTreeData(grandchildGuid);
                                grandchild.cardinality = {
                                    max: child.Data[2].Value,
                                    min: child.Data[3].Value
                                };
                                grandchild.text = grandchild.text + " (" + grandchild.cardinality["min"] + ":" + grandchild.cardinality["max"] + ")";
                                node.children.push(grandchild);
                            }
                        }
                        else {
                            node.children.push(_this.generateSpecificationTreeData(children[childIndex].Child));
                        }
                    }
                    return node;
                };
                this.$scope = $scope;
                this.$filter = $filter;
                instanceService.getInstances().success(this.assignInstancesResponse).error(this.errorHandler);
                relationshipService.getRelationships().success(this.assignRelationshipsResponse).error(this.errorHandler);
                $scope.events = this;
            }
            selectController.prototype.findHierarchyType = function (path) {
                var finalSlashIndex = path.lastIndexOf("/");
                var explicitType = path.substring(finalSlashIndex + 1);
                return explicitType;
            };
            selectController.prototype.isInDate = function (startDate, endDate) {
                var todaysDate = new Date();
                if (endDate.valueOf() == 0) {
                    return true;
                }
                else if (todaysDate > startDate && todaysDate < endDate) {
                    return true;
                }
                return false;
            };
            return selectController;
        })();
        controllers.selectController = selectController;
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=selectController.js.map