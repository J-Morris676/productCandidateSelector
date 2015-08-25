/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />
/// <reference path="../../services/featureGenerationServices.ts" />

module app.controllers.featureGenerationModalInstance {
    'use strict';

    interface IAliasModalScope extends ng.IScope {
        ok: () => void;
        cancel: () => void;
        events: featureGenerationModalInstanceController;
        exportService: any;

        featureString: string;

        nodesInTree: Array<data.IInstanceNode>;
        aliases: data.IAliases;
        specificationTree: data.IInstanceNode;
        candidateTree: data.IInstanceNode;

        formFields: {
            storyNo: string;
            feature: string;
            dataPath: string;
            aliasPath: string;
            scenario: string;
            requestPath: string;
        }
    }

    export class featureGenerationModalInstanceController {
        $scope:IAliasModalScope;
        $modalInstance: any;
        exportService: any;
        featureGenerationService: any;

        initVariables(): void {
            this.$scope.formFields = {
                storyNo: "",
                feature: "",
                dataPath: "",
                aliasPath: "",
                scenario: "",
                requestPath: ""
            }

        }

        constructor($scope:IAliasModalScope, $modalInstance:any, selectedStory: string, specificationTree:data.IInstanceNode, candidateTree:data.IInstanceNode, aliases: data.IAliases, exportService: any, featureGenerationService: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;
            this.featureGenerationService = featureGenerationService;

            this.initVariables();
            this.$scope.formFields.storyNo = selectedStory;

            this.$scope.specificationTree = specificationTree;
            this.$scope.candidateTree = candidateTree;
            this.$scope.aliases= aliases;

            $scope.events = this;
        }

        generateFeatureString(): void {
            var scope = this.$scope;
            this.featureGenerationService.setStoryNo(scope.formFields.storyNo);
            this.featureGenerationService.setAliases(scope.aliases);
            this.featureGenerationService.setSpecificationTree(scope.specificationTree);
            this.featureGenerationService.setCandidateTree(scope.candidateTree);
            this.featureGenerationService.setFeature(scope.formFields.feature);
            this.featureGenerationService.setDataPath(scope.formFields.dataPath);
            this.featureGenerationService.setAliasPath(scope.formFields.aliasPath);
            this.featureGenerationService.setScenario(scope.formFields.scenario);
            this.featureGenerationService.setRequestPath(scope.formFields.requestPath);

            scope.featureString = this.featureGenerationService.generateFeature();
        }
    }
}