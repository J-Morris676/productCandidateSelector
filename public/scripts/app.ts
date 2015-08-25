/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="services/apiServices.ts" />
/// <reference path="services/dataGenerationServices.ts" />
/// <reference path="services/featureGenerationServices.ts" />

/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="controllers/aliasModalInstanceController/aliasModalInstanceController.ts" />
/// <reference path="controllers/featureGenerationModalInstanceController/featureGenerationModalInstanceController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />

var appModule = angular.module("app", ['ngResource', 'ngAnimate', 'ui.bootstrap']);

appModule.service("getService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.GetService($http, $q) ]);

appModule.service("exportService", [ "$http", "$q", ($http, $q)
    => new app.services.apiServices.exportService($http, $q) ]);

appModule.service("dataGenerationService", [ ()
    => new app.services.dataGenerationServices.dataGenerationService() ]);

appModule.service("featureGenerationService", [ "dataGenerationService", (dataGenerationService)
    => new app.services.featureGenerationServices.featureGenerationService(dataGenerationService) ]);

appModule.filter("elementKindUniqueFilter", ()
    => app.filters.elementKindUniqueFilter());

appModule.filter("nameByElementKindFilter", ()
    => app.filters.nameByElementKindFilter());

appModule.controller("aliasModalInstanceController",
    ["$scope", "$modalInstance", "specificationTree", "candidateTree", "aliases", "exportService",
        ($scope, $modalInstance, specificationTree, candidateTree, aliases, exportService)
            => new app.controllers.aliasModalInstance.aliasModalInstanceController($scope, $modalInstance, specificationTree, candidateTree, aliases, exportService)]);

appModule.controller("featureGenerationModalInstanceController",
    ["$scope", "$modalInstance", "selectedStory", "specificationTree", "candidateTree", "aliases", "exportService", "featureGenerationService",
        ($scope, $modalInstance, selectedStory, specificationTree, candidateTree, aliases, exportService, featureGenerationService)
            => new app.controllers.featureGenerationModalInstance.featureGenerationModalInstanceController($scope, $modalInstance, selectedStory, specificationTree, candidateTree, aliases, exportService, featureGenerationService)]);

appModule.controller("selectController",
    ["$scope", "getService", "dataGenerationService", "$filter", "$modal",
    ($scope, getService, dataGenerationService, $filter, $modal)
    => new app.controllers.select.selectController($scope, getService, dataGenerationService, $filter, $modal)]);

appModule.directive("specificationTree", ()
    => new app.directives.specificationTree.specificationTree());

appModule.directive("candidateTree", (exportService: any, dataGenerationService: any)
    => new app.directives.candidateTree.CandidateTree(exportService, dataGenerationService));