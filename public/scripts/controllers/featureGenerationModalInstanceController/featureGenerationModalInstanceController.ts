/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />
/// <reference path="../../services/features/featureBuilderServices.ts" />

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
        featureBuilderService: any;

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

        constructor($scope:IAliasModalScope, $modalInstance:any, selectedStory: string, specificationTree:data.IInstanceNode, candidateTree:data.IInstanceNode,
                    aliases: data.IAliases, exportService: any, featureBuilderService: any, featureFormFields: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;
            this.featureBuilderService = featureBuilderService;

            this.initVariables();
            this.$scope.formFields.storyNo = selectedStory;

            this.$scope.specificationTree = specificationTree;
            this.$scope.candidateTree = candidateTree;
            this.$scope.aliases= aliases;

            this.$scope.formFields = featureFormFields || this.$scope.formFields;

            $scope.events = this;
        }

        generateFeatureString(): string {
            var scope = this.$scope;

            var feature: data.IFeature = {
                storyNo: scope.formFields.storyNo,
                aliases: scope.aliases,
                specificationTree: scope.specificationTree,
                candidateTree: scope.candidateTree,

                description: scope.formFields.feature,
                dataPath: scope.formFields.dataPath,
                aliasPath: scope.formFields.aliasPath,
                scenario: scope.formFields.scenario,
                requestPath: scope.formFields.requestPath
            };

            this.featureBuilderService.setFeature(feature);

            scope.featureString = this.featureBuilderService.generateFeature();

            return scope.featureString;
        }

        downloadFeatureFile(): void {
            var self = this;
            self.exportService.postFeature(self.generateFeatureString()).success(function (response) {
                self.exportService.downloadFeatureFile(response.ID, self.$scope.formFields.storyNo);
            });
        }

        close() {
            this.$modalInstance.close(this.$scope.formFields);
        }
    }
}