/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="services/apiServices.ts" />
/// <reference path="services/dataGenerationServices.ts" />
/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="controllers/aliasModalInstanceController/aliasModalInstanceController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />

var appModule = angular.module("app", ['ngResource', 'ngAnimate', 'ui.bootstrap']);

appModule.service("getService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.GetService($http, $q) ]);

appModule.service("exportService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.exportService($http, $q) ]);

appModule.service("specificationDataGenerationService", [ ()
    => new app.services.dataGenerationServices.specificationTreeDataGenerationService() ]);

appModule.filter("elementKindUniqueFilter", ()
    => app.filters.elementKindUniqueFilter());

appModule.filter("nameByElementKindFilter", ()
    => app.filters.nameByElementKindFilter());

appModule.controller("aliasModalInstanceController",
    ["$scope", "$modalInstance", "rootNode", "aliases", "exportService",
        ($scope, $modalInstance, rootNode, aliases, exportService)
            => new app.controllers.modalInstance.aliasModalInstanceController($scope, $modalInstance, rootNode, aliases, exportService)]);

appModule.controller("selectController",
    ["$scope", "getService", "specificationDataGenerationService", "$filter", "$modal",
    ($scope, getService, specificationDataGenerationService, $filter, $modal)
    => new app.controllers.select.selectController($scope, getService, specificationDataGenerationService, $filter, $modal)]);

appModule.directive("specificationTree", ()
    => new app.directives.specificationTree.specificationTree());

appModule.directive("candidateTree", (exportService: any)
    => new app.directives.candidateTree.CandidateTree(exportService));