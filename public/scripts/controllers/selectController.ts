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

        constructor($scope:ISelectScope, instanceService, relationshipService, $filter)
        {
            this.$scope = $scope;
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
            this.$scope.specificationTree = this.generateSpecificationTreeData(this.$scope.elementNameAndGuid["guid"]);
            console.log(this.$scope.specificationTree);
        };

        generateSpecificationTreeData = (guid: string): data.IInstanceNode =>
        {
            var relationships: data.IRelationships = this.$scope.relationships;
            var instance: data.IInstance = this.$scope.instances[guid];
            var children: data.IRelationship[] = relationships[guid] || [];

            var node: data.IInstanceNode = {
                type: instance.Meta[0].Value,
                name: null,
                text: instance.Meta[0].Value,
                guid: guid,
                children: Array<data.IInstanceNode>(),
                cardinality: null
            };

            if (instance.Meta[1].Value.indexOf("Launch_Entity") != -1) {
                node.name = instance.Data[7].Value;
                node.text = node.text + " - " + instance.Data[7].Value;
            }

            for (var childIndex = 0; childIndex < children.length; childIndex++) {
                var child: data.IInstance = this.$scope.instances[children[childIndex].Child];
                var childHierarchyPath:string = this.$scope.instances[children[childIndex].Child].Meta[1].Value;
                var childExplicitType:string = this.findHierarchyType(childHierarchyPath);

                if (childExplicitType  == "Relation_Entity") {
                    if (this.isInDate(new Date(child.Data[0].Value), new Date(child.Data[1].Value))) {
                        var grandchildGuid: string = relationships[children[childIndex].Child][0].Child;
                        var grandchild: data.IInstanceNode = this.generateSpecificationTreeData(grandchildGuid);
                        grandchild.cardinality = {
                            max: child.Data[2].Value,
                            min: child.Data[3].Value
                        };
                        grandchild.text = grandchild.text + " (" + grandchild.cardinality["min"] + ":" + grandchild.cardinality["max"] + ")";

                        node.children.push(grandchild);
                    }
                }
                else {
                    node.children.push(this.generateSpecificationTreeData(children[childIndex].Child));
                }

            }

            return node;
        };

        findHierarchyType(path: string): string {
            var finalSlashIndex: number = path.lastIndexOf("/");
            var explicitType: string = path.substring(finalSlashIndex + 1);
            return explicitType;
        }

        isInDate(startDate: Date, endDate: Date): boolean {
            var todaysDate: Date = new Date();

            if (endDate.valueOf() == 0) {
                return true;
            }
            else if (todaysDate > startDate  && todaysDate < endDate) {
                return true
            }
            return false;
        }
    }
}