/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../interfaces/data.ts" />
/// <reference path="../filters/selectFilters.ts" />

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
    }

    export class selectController
    {
        $scope:ISelectScope;
        $filter: any;
        specificationDataGenerationService: any;
        getService: any;
        $modal: any;

        constructor($scope:ISelectScope, getService, specificationDataGenerationService, $filter, $modal)
        {
            this.$scope = $scope;
            this.specificationDataGenerationService = specificationDataGenerationService;
            this.$filter = $filter;
            this.getService = getService;
            this.$modal = $modal;

            this.getService.datasets()
                .success(this.assignDatasetResponse)
                .error(this.errorHandler);

            $scope.events = this;
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
            var specificationTree = self.$scope.specificationTree;

            var modalInstance = this.$modal.open({
                templateUrl: 'scripts/controllers/aliasModalInstanceController/aliasModalInstanceTpl.html',
                controller: 'aliasModalInstanceController',
                size: 'lg',
                resolve: {
                    rootNode: function () {
                        return specificationTree;
                    },
                    aliases: function() {
                        return self.$scope.aliases;
                    }
                }
            });

            modalInstance.result.then(function(aliases) {
                self.$scope.aliases = aliases;
                console.log(aliases);
            })
        };

        drawGraph = (): void =>
        {
            this.specificationDataGenerationService.setInstances(this.$scope.instances);
            this.specificationDataGenerationService.setRelationships(this.$scope.relationships);

            this.$scope.specificationTree = this.specificationDataGenerationService.generateSpecificationTreeData(this.$scope.elementNameAndGuid["guid"]);
        };
    }
}