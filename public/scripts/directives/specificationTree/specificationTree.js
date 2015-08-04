/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />
/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />
var app;
(function (app) {
    var directives;
    (function (directives) {
        var specificationTree;
        (function (_specificationTree) {
            'use strict';
            var specificationTree = (function () {
                function specificationTree() {
                    this.restrict = 'E';
                    this.scope = {
                        data: "=",
                        selectedSubTree: "=?",
                        selectedCandidateNode: "=?",
                        canBeAddedToProductCandidate: "@",
                        insertIntoProductCandidate: "@"
                    };
                    this.templateUrl = "scripts/directives/specificationTree/specificationTree.html";
                }
                specificationTree.prototype.link = function (scope, element, attributes) {
                    var selectedSpecificationNode = null;
                    scope.canBeAddedToProductCandidate = false;
                    scope.$watch("selectedCandidateNode", function () {
                        scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                    });
                    if (scope.data == null) {
                        scope.$watch("data", function () {
                            if (scope.data != null) {
                                initSubTreeWithNodeGuidsAndOneToOneCardinality();
                                renderTreeAndRegisterEvents();
                            }
                        }, true);
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
                    function renderTreeAndRegisterEvents() {
                        $($(element)).find("#spec-tree").jstree("destroy");
                        $($(element)).find("#spec-tree").jstree({ 'core': {
                            'data': [
                                scope.data
                            ]
                        } });
                        $($(element)).find("#spec-tree").on('select_node.jstree', setSelectedNode);
                    }
                    function prePopulateSubTreeWithValidChildren(children) {
                        var childrenToPrePopulateWith = [];
                        for (var childIndex = 0; childIndex < children.length; childIndex++) {
                            if ((InstanceTreeUtilities.isLaunchEntity(children[childIndex]) && InstanceTreeUtilities.isOneToOneCardinality(children[childIndex])) || InstanceTreeUtilities.isCharacteristicNode(children[childIndex])) {
                                var addedChild = _.clone(children[childIndex]);
                                addedChild.children = [];
                                addedChild.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                                addedChild.children = prePopulateSubTreeWithValidChildren(children[childIndex].children);
                                childrenToPrePopulateWith.push(addedChild);
                            }
                        }
                        return childrenToPrePopulateWith;
                    }
                    function setSelectedNode(event, data) {
                        var selectedNode = data.node.original;
                        selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));
                        console.log(selectedNode);
                        scope.$apply(function () {
                            selectedSpecificationNode = selectedNode;
                            scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                        });
                    }
                    function getNodeChildren(instance, node) {
                        var children = [];
                        for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                            var child = instance.get_node(node.children[childIndex]).original;
                            child.children = getNodeChildren(instance, instance.get_node(node.children[childIndex]));
                            children.push(child);
                        }
                        return children;
                    }
                    function checkIfSelectedNodesCanBeAddedToCandidateTree() {
                        if (scope.selectedCandidateNode == null || selectedSpecificationNode == null) {
                            return false;
                        }
                        var specificationParent = InstanceTreeUtilities.findNodeInTreeByGuid(scope.data, scope.selectedCandidateNode.guid);
                        if (InstanceTreeUtilities.isParentOfNode(specificationParent, selectedSpecificationNode)) {
                            if (InstanceTreeUtilities.isBetweenCardinality(scope.selectedCandidateNode, selectedSpecificationNode)) {
                                return true;
                            }
                        }
                        return false;
                    }
                    scope.insertIntoProductCandidate = function () {
                        var selectedCandidateParentObjectReference = InstanceTreeUtilities.findNodeByNodeGuid(scope.selectedSubTree, scope.selectedCandidateNode.nodeGuid);
                        var newNode = _.clone(selectedSpecificationNode, true);
                        newNode.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                        newNode.children = prePopulateSubTreeWithValidChildren(newNode.children);
                        selectedCandidateParentObjectReference.children.push(newNode);
                        scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                    };
                };
                return specificationTree;
            })();
            _specificationTree.specificationTree = specificationTree;
        })(specificationTree = directives.specificationTree || (directives.specificationTree = {}));
    })(directives = app.directives || (app.directives = {}));
})(app || (app = {}));
//# sourceMappingURL=specificationTree.js.map