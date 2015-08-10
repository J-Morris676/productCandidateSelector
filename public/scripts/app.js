/// <reference path="../typings/angular/angular.d.ts" />
/// <reference path="services/apiServices.ts" />
/// <reference path="services/dataGenerationServices.ts" />
/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />
var appModule = angular.module("app", ['ngResource']);
appModule.service("instancesService", ["$http", "$q", function ($http, $q) {
        return new app.services.apiServices.InstancesService($http, $q);
    }]);
appModule.service("relationshipsService", ["$http", "$q", function ($http, $q) {
        return new app.services.apiServices.RelationshipsService($http, $q);
    }]);
appModule.service("exportService", ["$http", "$q", function ($http, $q) {
        return new app.services.apiServices.exportService($http, $q);
    }]);
appModule.service("specificationDataGenerationService", [function () {
        return new app.services.dataGenerationServices.specificationTreeDataGenerationService();
    }]);
appModule.filter("elementKindUniqueFilter", function () {
    return app.filters.elementKindUniqueFilter();
});
appModule.filter("nameByElementKindFilter", function () {
    return app.filters.nameByElementKindFilter();
});
appModule.controller("selectController", ["$scope", "instancesService", "relationshipsService", "specificationDataGenerationService", "$filter",
    function ($scope, instancesService, relationshipsService, specificationDataGenerationService, $filter) {
        return new app.controllers.selectController($scope, instancesService, relationshipsService, specificationDataGenerationService, $filter);
    }]);
appModule.directive("specificationTree", function () {
    return new app.directives.specificationTree.specificationTree();
});
appModule.directive("candidateTree", function (exportService) {
    return new app.directives.candidateTree.CandidateTree(exportService);
});
//# sourceMappingURL=app.js.map