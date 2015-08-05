/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />


module app.directives.specificationTree {
    'use strict';

    interface ISpecificationTreeScope extends ng.IScope {
        data: data.IInstanceNode;
        selectedSubTree: data.IInstanceNode;
        selectedCandidateNode: data.IInstanceNode;
        selectedSpecificationNode: data.IInstanceNode;

        canBeAddedToProductCandidate: boolean;

        insertIntoProductCandidate();
    }

    export class specificationTree implements ng.IDirective {
        public restrict = 'E';
        public scope = {
            data: "=",
            selectedSubTree: "=?",
            selectedCandidateNode: "=?",
            selectedSpecificationNode: "@",

            canBeAddedToProductCandidate: "@",
            insertIntoProductCandidate: "@"
        };
        public templateUrl = "scripts/directives/specificationTree/specificationTree.html";

        public link(scope:ISpecificationTreeScope, element:EventTarget, attributes:ng.IAttributes) {
            scope.canBeAddedToProductCandidate = false;

            scope.$watch("selectedCandidateNode", function() {
                scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
            });

             if (scope.data == null) {
                scope.$watch("data", function () {
                    if (scope.data != null) {
                        scope.selectedSpecificationNode = null;
                        initSubTreeWithNodeGuidsAndOneToOneCardinality();
                        renderTreeAndRegisterEvents();
                    }
                }, true)
            }
            else {
                 initSubTreeWithNodeGuidsAndOneToOneCardinality();
                 renderTreeAndRegisterEvents();
            }

            function initSubTreeWithNodeGuidsAndOneToOneCardinality() {
                scope.selectedSubTree = _.clone(scope.data);
                scope.selectedSubTree.children = [];
                scope.selectedSubTree.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();

                scope.selectedSubTree.children = prePopulateSubTreeWithValidChildren(scope.data.children);
            }

            function renderTreeAndRegisterEvents(): void {
                $($(element)).find("#spec-tree").jstree("destroy");

                $($(element)).find("#spec-tree").jstree({ 'core' : {
                    'data' : [
                        scope.data
                    ]
                }
                });

                $($(element)).find("#spec-tree").on('select_node.jstree', setSelectedNode);
            }

            function prePopulateSubTreeWithValidChildren(children: data.IInstanceNode[]): data.IInstanceNode[] {
                var childrenToPrePopulateWith: data.IInstanceNode[] = [];

                for (var childIndex: number = 0; childIndex < children.length; childIndex++) {

                    if ((InstanceTreeUtilities.isLaunchEntity(children[childIndex])
                            && InstanceTreeUtilities.isOneToOneCardinality(children[childIndex]))
                            || InstanceTreeUtilities.isCharacteristicNode(children[childIndex])
                            || InstanceTreeUtilities.isUDCNode(children[childIndex])) {
                        var addedChild: data.IInstanceNode = _.clone(children[childIndex]);
                        addedChild.children = [];
                        addedChild.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();

                        addedChild.children = prePopulateSubTreeWithValidChildren(children[childIndex].children);
                        childrenToPrePopulateWith.push(addedChild);
                    }
                }

                return childrenToPrePopulateWith;
            }



            function setSelectedNode(event, data) {
                var selectedNode: data.IInstanceNode = data.node.original;
                selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));

                console.log(selectedNode);

                scope.$apply(function() {
                    scope.selectedSpecificationNode = selectedNode;
                    scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                });
            }

            function getNodeChildren(instance, node): data.IInstanceNode[] {
                var children: data.IInstanceNode[] = [];

                for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                    var child = instance.get_node(node.children[childIndex]).original;
                    child.children = getNodeChildren(instance, instance.get_node(node.children[childIndex]));
                    children.push(child);
                }
                return children;
            }

            function checkIfSelectedNodesCanBeAddedToCandidateTree(): boolean {
                if (scope.selectedCandidateNode == null || scope.selectedSpecificationNode == null) {
                    return false;
                }

                var specificationParent = InstanceTreeUtilities.findNodeInTreeByGuid(scope.data, scope.selectedCandidateNode.guid);

                if (InstanceTreeUtilities.isParentOfNode(specificationParent, scope.selectedSpecificationNode)) {
                    if (InstanceTreeUtilities.isBetweenCardinality(scope.selectedCandidateNode, scope.selectedSpecificationNode)
                        && InstanceTreeUtilities.isLowerThanMaxGroupCardinality(scope.selectedCandidateNode)) {
                        return true;
                    }
                }

                return false;
            }

            scope.insertIntoProductCandidate = function(): void {
                var selectedCandidateParentObjectReference: data.IInstanceNode = InstanceTreeUtilities.findNodeByNodeGuid(scope.selectedSubTree, scope.selectedCandidateNode.nodeGuid);
                var newNode: data.IInstanceNode = _.clone(scope.selectedSpecificationNode, true);
                newNode.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                newNode.children = prePopulateSubTreeWithValidChildren(newNode.children);

                selectedCandidateParentObjectReference.children.push(newNode);
                scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
            };
        }
    }
}