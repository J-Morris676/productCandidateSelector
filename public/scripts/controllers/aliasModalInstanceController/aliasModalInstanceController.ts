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

        orderItemNodes:  Array<data.ICandidateExportNode>;
        charUseNodes: Array<data.ICandidateExportNode>;
        charValueNodes: Array<data.ICandidateExportNode>;

        aliases: data.IAliases;
        candidateTable: {
            selected: string;
        }
    }

    export class aliasModalInstanceController {
        $scope:IAliasModalScope;
        $modalInstance: any;
        exportService: any;

        constructor($scope:IAliasModalScope, $modalInstance:any, specificationTree:data.IInstanceNode, candidateTree:data.ICandidateExportNode, aliases: data.IAliases, exportService: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;

            $scope.candidateTable = {selected: "orderItems"};

            this.$scope.specNodesInTree = [];
            this.$scope.orderItemNodes = [];
            this.$scope.charUseNodes = [];
            this.$scope.charValueNodes = [];

            this.buildSpecificationNodeArray(specificationTree, aliases);
            if (aliases == null) aliases = this.buildAliases();
            this.buildCandidateNodeArray(candidateTree, aliases);

            this.$scope.aliases = null;

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

            for (var nodeIdx = 0; nodeIdx < this.$scope.orderItemNodes.length; nodeIdx++) {
                var orderItemNode: data.ICandidateExportNode = this.$scope.orderItemNodes[nodeIdx];

                if (aliases[orderItemNode.text] == null)
                    aliases[orderItemNode.text] = orderItemNode.ID;
                else
                    aliases[orderItemNode.text + "_" + nodeIdx] = orderItemNode.ID;
            }

            for (var nodeIdx = 0; nodeIdx < this.$scope.charUseNodes.length; nodeIdx++) {
                var charUseNode: data.ICandidateExportNode = this.$scope.charUseNodes[nodeIdx];

                if (aliases[charUseNode.text] == null)
                    aliases[charUseNode.text] = charUseNode.CharacteristicID;
                else
                    aliases[charUseNode.text + "_" + nodeIdx] = charUseNode.CharacteristicID;

            }

            aliases["Commercial_SpecCharUse_SchemaElementGuid"] = "a736c895-2ea7-432b-b0cd-63409fd0b00f";
            aliases["Characteristic_CharValue_SchemaElementGuid"] = "665171c6-fbbe-43e0-bd30-5f07dcb51a0e";

            aliases["Commercial_UserDefinedChar_SchemaElementGuid"] = "739cec31-ff51-47b0-92ad-4e552d9ce566";

            return aliases;
        }

        buildSpecificationNodeArray(specificationTree:data.IInstanceNode, aliases: data.IAliases): void {
            this.$scope.specNodesInTree = _.uniq(_.clone(InstanceTreeUtilities.flattenTreeIntoArray(specificationTree, ["children"]), true), "guid");

            for (var nodeIdx = 0; nodeIdx < this.$scope.specNodesInTree.length; nodeIdx++) {
                var node = this.$scope.specNodesInTree[nodeIdx];

                var keyInAliases = this.getKeyByValue(aliases, node.guid);

                if (aliases != null && keyInAliases != null)
                    node.text = keyInAliases;
                else
                    node.text = node.text.replace(/ /g,'_');
            }
        }

        buildCandidateNodeArray(candidateTree:data.ICandidateExportNode, aliases: data.IAliases): void {
            var candidateNodesInTree = _.clone(InstanceTreeUtilities.flattenTreeIntoArray(candidateTree, ["ChildEntity", "CharacteristicUse", "ConfiguredValue"]), true)

            var charUses: number = 0;
            var orderItems: number = 0;
            var charValues: number = 0;

            for (var nodeIdx = 0; nodeIdx < candidateNodesInTree.length; nodeIdx++) {
                var node = candidateNodesInTree[nodeIdx];

                var keyInAliases = this.getKeyByValue(aliases, node.ID || node.CharacteristicID || node.ValueID);

                if (aliases != null && keyInAliases != null)
                    node.text = keyInAliases;

                if (node.CharacteristicID) {
                    node.text = node.text || ("char_" + (++charUses));
                    this.$scope.charUseNodes.push(node);
                }
                else if (node.ValueID) {
                    node.text = node.text || ("charValue_" + (++charValues));
                    this.$scope.charValueNodes.push(node);
                }
                else {
                    if (node.text != null) {
                        node.text = node.text
                    }
                    else {
                        node.text = "oi_" + (++orderItems);
                    }

                    this.$scope.orderItemNodes.push(node);
                }
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