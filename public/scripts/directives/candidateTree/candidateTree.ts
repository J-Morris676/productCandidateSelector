/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />

/// <reference path="../../interfaces/data.ts" />

module app.directives.candidateTree {
    'use strict';

    interface ICandidateTreeScope extends ng.IScope {
        data: data.IInstanceNode;
        selectedNode: data.IInstanceNode;
    }

    export class CandidateTree implements ng.IDirective {
        public restrict = 'E';
        public scope = {
            data: "=",
            selectedNode: "=?"
        };
        public templateUrl = "scripts/directives/candidateTree/candidateTree.html";

        public link(scope:ICandidateTreeScope, element:EventTarget, attributes:ng.IAttributes) {
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
        }
    }
}