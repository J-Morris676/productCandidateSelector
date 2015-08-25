/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />

module app.controllers.aliasModalInstance {
    'use strict';

    interface IAliasModalScope extends ng.IScope {
        ok: () => void;
        cancel: () => void;
        downloadAliases: () => void;
        removeWhiteSpace: () => string;
        events: aliasModalInstanceController;
        exportService: any;

        specNodesInTree: Array<data.IInstanceNode>;
        candidateNodesInTree: Array<data.ICandidateExportNode>;
        aliases: data.IAliases;

    }

    export class aliasModalInstanceController {
        $scope:IAliasModalScope;
        $modalInstance: any;
        exportService: any;

        constructor($scope:IAliasModalScope, $modalInstance:any, specificationTree:data.IInstanceNode, candidateTree:data.ICandidateExportNode, aliases: data.IAliases, exportService: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;

            this.buildSpecificationNodeArray(specificationTree, aliases);
            this.buildCandidateNodeArray(candidateTree, aliases);

            $scope.events = this;
        }

        buildAliases(): data.IAliases {
            var aliases:data.IAliases = {};

            for (var nodeIdx = 0; nodeIdx < this.$scope.specNodesInTree.length; nodeIdx++) {
                var node = this.$scope.specNodesInTree[nodeIdx];

                if (aliases[node.text] == null)
                    aliases[node.text] = node.guid;
                else
                    aliases[node.text + "_" + nodeIdx] = node.guid;

                if (node.BUID != null)
                    aliases[node.text + "-BUID"] = node.BUID;
            }

            for (var nodeIdx = 0; nodeIdx < this.$scope.candidateNodesInTree.length; nodeIdx++) {
                var candidateNode: data.ICandidateExportNode = this.$scope.candidateNodesInTree[nodeIdx];

                if (aliases[candidateNode.text] == null)
                    aliases[candidateNode.text] = candidateNode.ID;
                else
                    aliases[candidateNode.text + "_" + nodeIdx] = candidateNode.ID;
            }

            aliases["Commercial_SpecCharUse_SchemaElementGuid"] = "a736c895-2ea7-432b-b0cd-63409fd0b00f";
            aliases["Characteristic_CharValue_SchemaElementGuid"] = "665171c6-fbbe-43e0-bd30-5f07dcb51a0e";

            aliases["Commercial_UserDefinedChar_SchemaElementGuid"] = "739cec31-ff51-47b0-92ad-4e552d9ce566";

            return aliases;
        }

        buildSpecificationNodeArray(specificationTree:data.IInstanceNode, aliases: data.IAliases): void {
            this.$scope.specNodesInTree = _.uniq(_.clone(InstanceTreeUtilities.flattenTreeIntoArray(specificationTree, "children"), true), "guid");

            for (var nodeIdx = 0; nodeIdx < this.$scope.specNodesInTree.length; nodeIdx++) {
                var node = this.$scope.specNodesInTree[nodeIdx];

                var keyInAliases = this.getKeyByValue(aliases, node.guid);

                if (aliases != null && keyInAliases != null)
                    node.text = keyInAliases;
                else if (aliases != null && keyInAliases == null)
                    this.$scope.specNodesInTree.splice(nodeIdx--, 1);
                else
                    node.text = node.text.replace(/ /g,'_');
            }
        }

        buildCandidateNodeArray(candidateTree:data.ICandidateExportNode, aliases: data.IAliases): void {
            this.$scope.candidateNodesInTree = _.uniq(_.clone(InstanceTreeUtilities.flattenTreeIntoArray(candidateTree, "ChildEntity"), true), "ID")

            for (var nodeIdx = 0; nodeIdx < this.$scope.candidateNodesInTree.length; nodeIdx++) {
                var node = this.$scope.candidateNodesInTree[nodeIdx];

                var keyInAliases = this.getKeyByValue(aliases, node.ID);

                if (aliases != null && keyInAliases != null)
                    node.text = keyInAliases;
                else if (aliases != null && keyInAliases == null)
                    this.$scope.candidateNodesInTree.splice(nodeIdx--, 1);
                else
                    node.text = "oi_" + (nodeIdx+1);
            }
        }

        downloadAliases(): void {
            var self = this;
            var aliases: data.IAliases = this.buildAliases();

            self.exportService.postAliases(aliases).success(function (response) {
                self.exportService.downloadAliasesFile(response.ID);
            });
        }

        updateAliasesAndClose() {
            var aliases: data.IAliases = this.buildAliases();
            this.$modalInstance.close(aliases);
        }

        removeFromArray(array: Array<any>, $index: number) {
            array.splice($index, 1);
        }

        getKeyByValue(object, value): string {
            for( var prop in object ) {
                if( object.hasOwnProperty( prop ) ) {
                    if( object[ prop ] === value )
                        return prop;
                }
            }
        }
    }
}