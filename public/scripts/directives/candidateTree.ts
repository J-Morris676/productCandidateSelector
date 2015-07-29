/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../../typings/jstree/jstree.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../interfaces/data.ts" />

module app.directives.candidateTree {
    'use strict';

    interface ICandidateTreeScope extends ng.IScope {
        data: data.IInstanceNode;
        selectedNode: {};
    }

    export class CandidateTree implements ng.IDirective {
        public restrict = 'E';
        public scope = {
            data: "=",
            selectedNode: "=?"
        };

        public link(scope:ICandidateTreeScope, element:EventTarget, attributes:ng.IAttributes) {
            if (scope.data == null) {
                scope.$watch("data", function () {
                    if (scope.data != null) {
                        renderTree();
                    }
                }, true)
            }
            else {
                renderTree();
            }

            scope.$watch("selectedNode", function() {
                console.log("Changed Selected Node!");
            });
            
            function renderTree(): void {
                $(element[0]).jstree("destroy");
                scope.selectedNode = null;

                $(element[0]).jstree({ 'core' : {
                        'multiple': false,
                        'data' : [
                            scope.data
                        ]
                    }
                }).on('loaded.jstree', function() {
                    $(element[0]).jstree('open_all');
                });



                $(element[0]).on('select_node.jstree', function (e, data) {
                    var selectedNode: data.IInstanceNode = data.instance.get_node(data.selected[0]).original;
                    selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));

                    scope.$apply(function() {
                        scope.selectedNode = selectedNode;
                    });
                });

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
}