/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../interfaces/data.ts" />
/// <reference path="../filters/selectFilters.ts" />

/// <reference path="../modules/InstanceTreeUtilities.ts" />

module app.controllers {
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

        selectedStory: string;
        stories: string[];
    }

    export class selectController
    {
        $scope:ISelectScope;
        $filter: any;
        specificationDataGenerationService: any;
        getService: any;

        constructor($scope:ISelectScope, getService, specificationDataGenerationService, $filter)
        {
            this.$scope = $scope;
            this.specificationDataGenerationService = specificationDataGenerationService;
            this.$filter = $filter;
            this.getService = getService;

            this.getService.datasets()
                .success(this.assignDatasetResponse)
                .error(this.errorHandler);

            $scope.events = this;
        }

        updateDataset() {
            this.$scope.instances = null;
            this.getService.instances(this.$scope.selectedStory)
                .success(this.assignInstancesResponse)
                .error(this.errorHandler);

            this.getService.relationships(this.$scope.selectedStory)
                .success(this.assignRelationshipsResponse)
                .error(this.errorHandler);
        }

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

        drawGraph = (): void =>
        {
            this.specificationDataGenerationService.setInstances(this.$scope.instances);
            this.specificationDataGenerationService.setRelationships(this.$scope.relationships);

            this.$scope.specificationTree = this.specificationDataGenerationService.generateSpecificationTreeData(this.$scope.elementNameAndGuid["guid"]);
        };
    }
}