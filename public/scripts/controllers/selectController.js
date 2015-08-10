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
            function selectController($scope, instanceService, relationshipService, specificationDataGenerationService, $filter) {
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
                    _this.specificationDataGenerationService.setInstances(_this.$scope.instances);
                    _this.specificationDataGenerationService.setRelationships(_this.$scope.relationships);
                    _this.$scope.specificationTree = _this.specificationDataGenerationService.generateSpecificationTreeData(_this.$scope.elementNameAndGuid["guid"]);
                };
                this.$scope = $scope;
                this.specificationDataGenerationService = specificationDataGenerationService;
                this.$filter = $filter;
                instanceService.getInstances()
                    .success(this.assignInstancesResponse)
                    .error(this.errorHandler);
                relationshipService.getRelationships()
                    .success(this.assignRelationshipsResponse)
                    .error(this.errorHandler);
                $scope.events = this;
            }
            return selectController;
        })();
        controllers.selectController = selectController;
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=selectController.js.map