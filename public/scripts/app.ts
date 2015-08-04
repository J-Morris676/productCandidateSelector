/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="services/apiServices.ts" />
/// <reference path="services/dataGenerationServices.ts" />
/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />

var appModule = angular.module("app", ['ngResource']);

appModule.service("instancesService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.InstancesService($http, $q) ]);

appModule.service("relationshipsService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.RelationshipsService($http, $q) ]);

appModule.service("exportService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.exportService($http, $q) ]);

appModule.service("specificationDataGenerationService", [ ()
    => new app.services.dataGenerationServices.specificationTreeDataGenerationService() ]);

appModule.filter("elementKindUniqueFilter", ()
    => app.filters.elementKindUniqueFilter());

appModule.filter("nameByElementKindFilter", ()
    => app.filters.nameByElementKindFilter());

appModule.controller("selectController",
    ["$scope", "instancesService", "relationshipsService", "specificationDataGenerationService", "$filter",
    ($scope, instancesService, relationshipsService, specificationDataGenerationService, $filter)
    => new app.controllers.selectController($scope, instancesService, relationshipsService, specificationDataGenerationService, $filter)]);


appModule.directive("specificationTree", ()
    => new app.directives.specificationTree.specificationTree());

appModule.directive("candidateTree", (exportService: any)
    => new app.directives.candidateTree.CandidateTree(exportService));