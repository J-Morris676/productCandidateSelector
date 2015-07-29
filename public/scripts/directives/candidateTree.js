/// <reference path="../../typings/angular/angular.d.ts" />
/// <reference path="../../typings/jstree/jstree.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../interfaces/data.ts" />
var app;
(function (app) {
    var directives;
    (function (directives) {
        var candidateTree;
        (function (candidateTree) {
            'use strict';
            var CandidateTree = (function () {
                function CandidateTree() {
                    this.restrict = 'E';
                    this.scope = {
                        data: "=",
                        selectedNode: "=?"
                    };
                }
                CandidateTree.prototype.link = function (scope, element, attributes) {
                    if (scope.data == null) {
                        scope.$watch("data", function () {
                            if (scope.data != null) {
                                renderTree();
                            }
                        }, true);
                    }
                    else {
                        renderTree();
                    }
                    scope.$watch("selectedNode", function () {
                        console.log("Changed Selected Node!");
                    });
                    function renderTree() {
                        $(element[0]).jstree("destroy");
                        scope.selectedNode = null;
                        $(element[0]).jstree({ 'core': {
                            'multiple': false,
                            'data': [
                                scope.data
                            ]
                        } }).on('loaded.jstree', function () {
                            $(element[0]).jstree('open_all');
                        });
                        $(element[0]).on('select_node.jstree', function (e, data) {
                            var selectedNode = data.instance.get_node(data.selected[0]).original;
                            selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));
                            scope.$apply(function () {
                                scope.selectedNode = selectedNode;
                            });
                        });
                        function getNodeChildren(instance, node) {
                            var children = [];
                            for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                                children.push(instance.get_node(node.children[childIndex]).original);
                            }
                            return children;
                        }
                    }
                };
                return CandidateTree;
            })();
            candidateTree.CandidateTree = CandidateTree;
        })(candidateTree = directives.candidateTree || (directives.candidateTree = {}));
    })(directives = app.directives || (app.directives = {}));
})(app || (app = {}));
//# sourceMappingURL=candidateTree.js.map