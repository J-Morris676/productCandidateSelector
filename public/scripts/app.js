/// <reference path="../typings/angular/angular.d.ts" />
/// <reference path="services/apiServices.ts" />
/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />
var appModule = angular.module("app", ['ngResource']);
appModule.service("instancesService", ["$http", "$q", function ($http, $q) { return new app.services.InstancesService($http, $q); }]);
appModule.service("relationshipsService", ["$http", "$q", function ($http, $q) { return new app.services.RelationshipsService($http, $q); }]);
appModule.service("exportService", ["$http", "$q", function ($http, $q) { return new app.services.exportService($http, $q); }]);
appModule.filter("elementKindUniqueFilter", function () { return app.filters.elementKindUniqueFilter(); });
appModule.filter("nameByElementKindFilter", function () { return app.filters.nameByElementKindFilter(); });
appModule.controller("selectController", ["$scope", "instancesService", "relationshipsService", "$filter", function ($scope, instancesService, relationshipsService, $filter) { return new app.controllers.selectController($scope, instancesService, relationshipsService, $filter); }]);
appModule.directive("specificationTree", function () { return new app.directives.specificationTree.specificationTree(); });
appModule.directive("candidateTree", function (exportService) { return new app.directives.candidateTree.CandidateTree(exportService); });
//# sourceMappingURL=app.js.map