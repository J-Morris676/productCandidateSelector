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
            function selectController($scope, getService, specificationDataGenerationService, $filter) {
                var _this = this;
                this.clearTreeSelectionVariables = function () {
                    _this.$scope.instances = null;
                    _this.$scope.elementKindGuid = null;
                    _this.$scope.elementNameAndGuid = null;
                    _this.$scope.candidateTree = null;
                    _this.$scope.specificationTree = null;
                };
                this.errorHandler = function (error) {
                    console.log(error);
                };
                this.assignDatasetResponse = function (stories) {
                    _this.$scope.stories = stories;
                    _this.$scope.selectedStory = stories[0];
                    _this.updateDataset();
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
                    _this.specificationDataGenerationService.setInstances(_this.$scope.instances);
                    _this.specificationDataGenerationService.setRelationships(_this.$scope.relationships);
                    _this.$scope.specificationTree = _this.specificationDataGenerationService.generateSpecificationTreeData(_this.$scope.elementNameAndGuid["guid"]);
                };
                this.$scope = $scope;
                this.specificationDataGenerationService = specificationDataGenerationService;
                this.$filter = $filter;
                this.getService = getService;
                this.getService.datasets().success(this.assignDatasetResponse).error(this.errorHandler);
                $scope.events = this;
            }
            selectController.prototype.updateDataset = function () {
                this.clearTreeSelectionVariables();
                this.getService.instances(this.$scope.selectedStory).success(this.assignInstancesResponse).error(this.errorHandler);
                this.getService.relationships(this.$scope.selectedStory).success(this.assignRelationshipsResponse).error(this.errorHandler);
            };
            return selectController;
        })();
        controllers.selectController = selectController;
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=selectController.js.map