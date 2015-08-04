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
    }

    export class selectController
    {
        $scope:ISelectScope;
        $filter: any;
        specificationDataGenerationService: any;

        constructor($scope:ISelectScope, instanceService, relationshipService, specificationDataGenerationService, $filter)
        {
            this.$scope = $scope;
            this.specificationDataGenerationService = specificationDataGenerationService;
            this.$filter = $filter;

            instanceService.getInstances()
                .success(this.assignInstancesResponse)
                .error(this.errorHandler);

            relationshipService.getRelationships()
                .success(this.assignRelationshipsResponse)
                .error(this.errorHandler);

            $scope.events = this;
        }

        errorHandler = (error: any):  void =>
        {
            console.log(error);
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