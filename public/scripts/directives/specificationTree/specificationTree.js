/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/underscore/underscore.d.ts" />
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
                        selectedCandidateParent: "=?",
                        canBeAddedToProductCandidate: "@",
                        insertIntoProductCandidate: "@"
                    };
                    this.templateUrl = "scripts/directives/specificationTree/specificationTree.html";
                }
                specificationTree.prototype.link = function (scope, element, attributes) {
                    var selectedSpecificationNode = null;
                    scope.canBeAddedToProductCandidate = false;
                    scope.$watch("selectedCandidateParent", function () {
                        scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                    });
                    if (scope.data == null) {
                        scope.$watch("data", function () {
                            if (scope.data != null) {
                                initSubTree();
                                renderTree();
                            }
                        }, true);
                    }
                    else {
                        initSubTree();
                        renderTree();
                    }
                    function initSubTree() {
                        scope.selectedSubTree = _.clone(scope.data);
                        scope.selectedSubTree.children = [];
                        scope.selectedSubTree.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                        scope.selectedSubTree.children = prePopulateSubTreeWithOneToOneCardinality(scope.data.children);
                    }
                    function prePopulateSubTreeWithOneToOneCardinality(children) {
                        var childrenToPrePopulateWith = [];
                        for (var childIndex = 0; childIndex < children.length; childIndex++) {
                            if (InstanceTreeUtilities.isOneToOneCardinality(children[childIndex])) {
                                var addedChild = _.clone(children[childIndex]);
                                addedChild.children = [];
                                addedChild.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                                addedChild.children = prePopulateSubTreeWithOneToOneCardinality(children[childIndex].children);
                                childrenToPrePopulateWith.push(addedChild);
                            }
                        }
                        return childrenToPrePopulateWith;
                    }
                    scope.insertIntoProductCandidate = function () {
                        var selectedCandidateParentObjectReference = InstanceTreeUtilities.findNodeByNodeGuid(scope.selectedSubTree, scope.selectedCandidateParent.nodeGuid);
                        selectedSpecificationNode.nodeGuid = InstanceTreeUtilities.generateRandomNodeId();
                        selectedSpecificationNode.children = prePopulateSubTreeWithOneToOneCardinality(selectedSpecificationNode.children);
                        selectedCandidateParentObjectReference.children.push(selectedSpecificationNode);
                        scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                    };
                    function renderTree() {
                        console.log(scope.data);
                        $($(element)).find("#spec-tree").jstree("destroy");
                        $($(element)).find("#spec-tree").jstree({ 'core': {
                            'data': [
                                scope.data
                            ]
                        } });
                        $($(element)).find("#spec-tree").on('select_node.jstree', function (e, data) {
                            var selectedNode = data.node.original;
                            selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));
                            scope.$apply(function () {
                                selectedSpecificationNode = selectedNode;
                                scope.canBeAddedToProductCandidate = checkIfSelectedNodesCanBeAddedToCandidateTree();
                            });
                        });
                    }
                    function checkIfSelectedNodesCanBeAddedToCandidateTree() {
                        if (scope.selectedCandidateParent == null || selectedSpecificationNode == null) {
                            return false;
                        }
                        var specificationParent = InstanceTreeUtilities.findNodeInTreeByGuid(scope.data, scope.selectedCandidateParent.guid);
                        if (InstanceTreeUtilities.isParentOfNode(specificationParent, selectedSpecificationNode)) {
                            if (InstanceTreeUtilities.isBetweenCardinality(scope.selectedCandidateParent, selectedSpecificationNode)) {
                                return true;
                            }
                        }
                        return false;
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
                    function getNodeParent(instance, node) {
                        return instance.get_node(instance.get_parent(node));
                    }
                };
                return specificationTree;
            })();
            _specificationTree.specificationTree = specificationTree;
        })(specificationTree = directives.specificationTree || (directives.specificationTree = {}));
    })(directives = app.directives || (app.directives = {}));
})(app || (app = {}));
//# sourceMappingURL=specificationTree.js.map