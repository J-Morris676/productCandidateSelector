/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />

module app.directives.candidateTree {
    'use strict';

    interface ICandidateTreeScope extends ng.IScope {
        data: data.IInstanceNode;
        selectedNode: data.IInstanceNode;
        downloadFile: any;
        exportService: any;
    }

    export class CandidateTree implements ng.IDirective {

        static $inject = ["exportService"];
        constructor(public exportService: any) {}

        public restrict = 'E';
        public scope = {
            data: "=",
            selectedNode: "=?"
        };
        public templateUrl = "scripts/directives/candidateTree/candidateTree.html";

        link = (scope:ICandidateTreeScope, element:EventTarget, attributes:ng.IAttributes) => {
            var self = this;
            if (scope.data == null) {
                scope.$watch("data", function () {
                    if (scope.data != null) {
                        renderTreeAndRegisterEvents();
                    }
                }, true)
            }
            else {
                renderTreeAndRegisterEvents();
            }

            function renderTreeAndRegisterEvents(): void {
                $($(element)).find("#candidate-tree").jstree("destroy");
                scope.selectedNode = null;

                $($(element)).find("#candidate-tree").jstree({ 'core' : {
                        'multiple': false,
                        'data' : [
                            scope.data
                        ]
                    }
                }).on('loaded.jstree', function() {
                    $($(element)).find("#candidate-tree").jstree('open_all');
                }).on('select_node.jstree', setSelectedNode);
            }

            function setSelectedNode(event, data) {
                var selectedNode: data.IInstanceNode = data.instance.get_node(data.selected[0]).original;
                selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));

                scope.$apply(function() {
                    scope.selectedNode = selectedNode;
                });
            }

            function getNodeChildren(instance, node): data.IInstanceNode[] {
                var children: data.IInstanceNode[] = [];
                for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                    children.push(instance.get_node(node.children[childIndex]).original);
                }
                return children;
            }


            scope.downloadFile = function(fileType) {
                var treeRoot: data.IInstanceNode = _.clone(scope.data, true);
                var exportTree: data.ICandidateExportNode = generateTransformedTreeForExport(treeRoot);

                self.exportService.postCandidate(exportTree).success(function (response) {
                    self.exportService.downloadCandidateFile(response.ID, fileType)
                });
            };

            function generateTransformedTreeForExport(treeNode): data.ICandidateExportNode {
                var newNode: data.ICandidateExportNode = {
                    ID: treeNode.nodeGuid,
                    EntityId: treeNode.guid,
                    _IsNewForCustomer: true,
                    ChildEntity: treeNode.children
                };
                treeNode = newNode;

                for (var childIndex = 0; childIndex < treeNode.ChildEntity.length; childIndex++) {
                    treeNode.ChildEntity[childIndex] = generateTransformedTreeForExport(treeNode.ChildEntity[childIndex])
                }
                return treeNode;
            }
        }
    }
}