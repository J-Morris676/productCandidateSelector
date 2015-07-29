/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="services/apiServices.ts" />
/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />

var appModule = angular.module("app", ['ngResource']);

appModule.service("instancesService", [ "$http", "$q", ($http, $q)
    => new app.services.InstancesService($http, $q) ]);

appModule.service("relationshipsService", [ "$http", "$q", ($http, $q)
    => new app.services.RelationshipsService($http, $q) ]);

appModule.filter("elementKindUniqueFilter", ()
    => app.filters.elementKindUniqueFilter());

appModule.filter("nameByElementKindFilter", ()
    => app.filters.nameByElementKindFilter());

appModule.controller("selectController",
    ["$scope", "instancesService", "relationshipsService", "$filter",
    ($scope, instancesService, relationshipsService, $filter)
    => new app.controllers.selectController($scope, instancesService, relationshipsService, $filter)]);


appModule.directive("specificationTree", ()
    => new app.directives.specificationTree.specificationTree());

appModule.directive("candidateTree", ()
    => new app.directives.candidateTree.CandidateTree());