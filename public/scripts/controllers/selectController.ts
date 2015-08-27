/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../interfaces/data.ts" />
/// <reference path="../filters/selectFilters.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />

/// <reference path="../modules/InstanceTreeUtilities.ts" />

module app.controllers.select {
    'use strict';

    interface ISelectScope extends ng.IScope
    {
        instances: data.IInstances;
        relationships: data.IRelationships;

        elementKinds: any;
        elementKindGuid: any;

        elementNames: any;
        elementNameAndGuid: string;

        selectedCandidateNode: data.IInstanceNode;

        specificationTree: data.IInstanceNode;

        events: selectController;

        candidateTree: data.IInstanceNode;
        aliases: {};

        selectedStory: string;
        stories: string[];

        getCandidateTreeWithSelections: () => data.IInstanceNode;
    }

    export class selectController
    {
        $scope:ISelectScope;
        $filter: any;
        dataGenerationService: any;
        getService: any;
        $modal: any;

        featureFormFields: {};

        constructor($scope:ISelectScope, getService, dataGenerationService, $filter, $modal)
        {
            this.$scope = $scope;
            this.dataGenerationService = dataGenerationService;
            this.$filter = $filter;
            this.getService = getService;
            this.$modal = $modal;

            this.getService.datasets()
                .success(this.assignDatasetResponse)
                .error(this.errorHandler);

            $scope.events = this;

            $scope.$watch("candidateTree", function() {
               $scope.aliases = null;
            })
        }

        updateDataset()
        {
            this.clearTreeSelectionVariables();

            this.getService.instances(this.$scope.selectedStory)
                .success(this.assignInstancesResponse)
                .error(this.errorHandler);

            this.getService.relationships(this.$scope.selectedStory)
                .success(this.assignRelationshipsResponse)
                .error(this.errorHandler);
        }

        clearTreeSelectionVariables = (): void =>
        {
            this.$scope.instances = null;
            this.$scope.elementKindGuid = null;
            this.$scope.elementNameAndGuid = null;
            this.$scope.candidateTree = null;
            this.$scope.specificationTree = null;
            this.$scope.aliases = null;
        };

        errorHandler = (error: any):  void =>
        {
            console.log(error);
        };

        assignDatasetResponse = (stories: string[]): void =>
        {
            this.$scope.stories = stories;
            this.$scope.selectedStory = stories[0];
            this.updateDataset();
        };

        assignInstancesResponse = (instances: data.IInstances): void =>
        {
            this.$scope.instances = instances;
            this.$scope.elementKinds = this.$filter('elementKindUniqueFilter')(this.$scope.instances);
        };

        assignRelationshipsResponse = (relationships: data.IRelationships): void =>
        {
            this.$scope.relationships = relationships;
        };

        updateNameDropDown = (): void =>
        {
            this.$scope.elementNames = this.$filter('nameByElementKindFilter')(this.$scope.instances, this.$scope.elementKinds[this.$scope.elementKindGuid]);
        };

        openAliasModal = (): void => {
            var self = this;

            var clonedCandidateTreeWithCharSelections = self.$scope.getCandidateTreeWithSelections();

            var modalInstance = this.$modal.open({
                templateUrl: 'scripts/controllers/aliasModalInstanceController/aliasModalInstanceTpl.html',
                controller: 'aliasModalInstanceController',
                size: 'lg',
                resolve: {
                    specificationTree: function () {
                        return self.$scope.specificationTree;
                    },
                    candidateTree: function() {
                        return self.dataGenerationService.generateTransformedCandidateTree(clonedCandidateTreeWithCharSelections, null, true);
                    },
                    aliases: function() {
                        return self.$scope.aliases;
                    }
                }
            });

            modalInstance.result.then(function(aliases) {
                self.$scope.aliases = aliases;
            })
        };

        openFeatureGenerationModal = (): void => {
            var self = this;

            var clonedCandidateTreeWithCharSelections = self.$scope.getCandidateTreeWithSelections();

            var modalInstance = this.$modal.open({
                templateUrl: 'scripts/controllers/featureGenerationModalInstanceController/featureGenerationModalInstanceTpl.html',
                controller: 'featureGenerationModalInstanceController',
                size: 'lg',
                resolve: {
                    selectedStory: function() {
                        return self.$scope.selectedStory;
                    },
                    specificationTree: function () {
                        return self.$scope.specificationTree;
                    },
                    aliases: function() {
                        return self.$scope.aliases;
                    },
                    candidateTree: function() {
                        return clonedCandidateTreeWithCharSelections;
                    },
                    featureFormFields: function() {
                        return self.featureFormFields;
                    }
                }
            });

            modalInstance.result.then(function(featureFormFields) {
                self.featureFormFields = featureFormFields;
            })
        };

        drawGraph = (): void =>
        {
            this.$scope.aliases = null;

            this.dataGenerationService.setInstances(this.$scope.instances);
            this.dataGenerationService.setRelationships(this.$scope.relationships);

            this.$scope.specificationTree = this.dataGenerationService.generateSpecificationTreeData(null, this.$scope.elementNameAndGuid["guid"]);
        };
    }
}