/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../interfaces/data.ts" />
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
                    this.templateUrl = "scripts/directives/candidateTree/candidateTree.html";
                }
                CandidateTree.prototype.link = function (scope, element, attributes) {
                    if (scope.data == null) {
                        scope.$watch("data", function () {
                            if (scope.data != null) {
                                renderTreeAndRegisterEvents();
                            }
                        }, true);
                    }
                    else {
                        renderTreeAndRegisterEvents();
                    }
                    function renderTreeAndRegisterEvents() {
                        $($(element)).find("#candidate-tree").jstree("destroy");
                        scope.selectedNode = null;
                        $($(element)).find("#candidate-tree").jstree({ 'core': {
                            'multiple': false,
                            'data': [
                                scope.data
                            ]
                        } }).on('loaded.jstree', function () {
                            $($(element)).find("#candidate-tree").jstree('open_all');
                        }).on('select_node.jstree', setSelectedNode);
                    }
                    function setSelectedNode(event, data) {
                        var selectedNode = data.instance.get_node(data.selected[0]).original;
                        selectedNode.children = getNodeChildren(data.instance, data.instance.get_node(data.selected[0]));
                        scope.$apply(function () {
                            scope.selectedNode = selectedNode;
                        });
                    }
                    function getNodeChildren(instance, node) {
                        var children = [];
                        for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                            children.push(instance.get_node(node.children[childIndex]).original);
                        }
                        return children;
                    }
                };
                return CandidateTree;
            })();
            candidateTree.CandidateTree = CandidateTree;
        })(candidateTree = directives.candidateTree || (directives.candidateTree = {}));
    })(directives = app.directives || (app.directives = {}));
})(app || (app = {}));
//# sourceMappingURL=candidateTree.js.map