/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="services/apiServices.ts" />
/// <reference path="services/dataGenerationServices.ts" />
/// <reference path="services/features/featureBuilderServices.ts" />

/// <reference path="services/features/steps/stepBuilderService.ts" />
/// <reference path="services/features/steps/tableSteps/instanceTableService.ts" />
/// <reference path="services/features/steps/tableSteps/propertyTableService.ts" />
/// <reference path="services/features/featureBuilderUtils.ts" />

/// <reference path="filters/selectFilters.ts" />
/// <reference path="controllers/selectController.ts" />
/// <reference path="controllers/aliasModalInstanceController/aliasModalInstanceController.ts" />
/// <reference path="controllers/featureGenerationModalInstanceController/featureGenerationModalInstanceController.ts" />
/// <reference path="directives/specificationTree/specificationTree.ts" />
/// <reference path="directives/candidateTree/candidateTree.ts" />

module moduleBuilder {

    export class ModuleBuilder {
        angularModule:ng.IModule;

        constructor(angularModule:ng.IModule) {
            this.angularModule = angularModule;
        }

        initServices(): ModuleBuilder {
            this.angularModule.service("getService", ["$http", "$q", ($http, $q)
                => new app.services.apiServices.GetService($http, $q)]);

            this.angularModule.service("exportService", ["$http", "$q", ($http, $q)
                => new app.services.apiServices.exportService($http, $q)]);

            this.angularModule.service("dataGenerationService", [()
                => new app.services.dataGenerationServices.dataGenerationService()]);

            this.angularModule.service("featureBuilderUtils", [()
                => new  app.services.featureBuilderUtils.featureBuilderUtils()]);

            this.angularModule.service("stepBuilderService", [()
                => new  app.services.stepBuilderServices.stepBuilderService()]);

            this.angularModule.service("instanceTableService", ["featureBuilderUtils", (featureBuilderUtils)
                => new  app.services.instanceTableServices.instanceTableService(featureBuilderUtils)]);

            this.angularModule.service("propertyTableService", ["featureBuilderUtils", (featureBuilderUtils)
                => new  app.services.propertyTableServices.propertyTableService(featureBuilderUtils)]);

            this.angularModule.service("featureBuilderService", ["dataGenerationService", "stepBuilderService", "instanceTableService", "propertyTableService", "featureBuilderUtils",
                (dataGenerationService, stepBuilderService, instanceTableService, propertyTableService, featureBuilderUtils)
                => new app.services.featureBuilderServices.featureBuilderService(dataGenerationService, stepBuilderService, instanceTableService, propertyTableService, featureBuilderUtils)]);

            return this;
        }

        initFilters(): ModuleBuilder {
            this.angularModule.filter("elementKindUniqueFilter", ()
                => app.filters.elementKindUniqueFilter());

            this.angularModule.filter("nameByElementKindFilter", ()
                => app.filters.nameByElementKindFilter());

            return this;
        }

        initControllers(): ModuleBuilder {
            this.angularModule.controller("aliasModalInstanceController",
                ["$scope", "$modalInstance", "specificationTree", "candidateTree", "aliases", "exportService",
                    ($scope, $modalInstance, specificationTree, candidateTree, aliases, exportService)
                        => new app.controllers.aliasModalInstance.aliasModalInstanceController($scope, $modalInstance, specificationTree, candidateTree, aliases, exportService)]);

            this.angularModule.controller("featureGenerationModalInstanceController",
                ["$scope", "$modalInstance", "selectedStory", "specificationTree", "candidateTree", "aliases", "exportService", "featureBuilderService", "featureFormFields",
                    ($scope, $modalInstance, selectedStory, specificationTree, candidateTree, aliases, exportService, featureBuilderService, featureFormFields)
                        => new app.controllers.featureGenerationModalInstance.featureGenerationModalInstanceController($scope, $modalInstance, selectedStory, specificationTree, candidateTree, aliases, exportService, featureBuilderService, featureFormFields)]);

            this.angularModule.controller("selectController",
                ["$scope", "getService", "dataGenerationService", "$filter", "$modal",
                    ($scope, getService, dataGenerationService, $filter, $modal)
                        => new app.controllers.select.selectController($scope, getService, dataGenerationService, $filter, $modal)]);

            return this;
        }

        initDirectives(): ModuleBuilder {
            this.angularModule.directive("specificationTree", ()
                => new app.directives.specificationTree.specificationTree());

            this.angularModule.directive("candidateTree", (exportService:any, dataGenerationService:any)
                => new app.directives.candidateTree.CandidateTree(exportService, dataGenerationService));

            return this;
        }
    }
}

