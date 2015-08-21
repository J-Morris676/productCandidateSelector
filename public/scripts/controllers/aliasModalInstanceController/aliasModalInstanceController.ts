/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />

module app.controllers.modalInstance {
    'use strict';

    interface IAliasModalScope extends ng.IScope {
        ok: () => void;
        cancel: () => void;
        downloadAliases: () => void;
        removeWhiteSpace: () => string;
        events: aliasModalInstanceController;
        exportService: any;

        changesMade:boolean;

        nodesInTree: Array<data.IInstanceNode>;
        aliases: data.IAliases;
    }

    export class aliasModalInstanceController {
        $scope:IAliasModalScope;
        $modalInstance: any;
        exportService: any;


        constructor($scope:IAliasModalScope, $modalInstance:any, rootNode:data.IInstanceNode, aliases: data.IAliases, exportService: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;

            $scope.nodesInTree = _.uniq(_.clone(InstanceTreeUtilities.flattenTreeIntoArray(rootNode), true), "guid");

            for (var nodeIdx = 0; nodeIdx < this.$scope.nodesInTree.length; nodeIdx++) {
                var node = this.$scope.nodesInTree[nodeIdx];

                var keyInAliases = this.getKeyByValue(aliases, node.guid);

                if (aliases != null && keyInAliases != null)
                    node.text = keyInAliases;
                else if (aliases != null && keyInAliases == null)
                    this.$scope.nodesInTree.splice(nodeIdx--, 1);
                else
                    node.text = node.text.replace(/ /g,'_');

            }

            $scope.events = this;
        }

        buildAliases(): data.IAliases {
            var aliases: data.IAliases = {};

            for (var nodeIdx = 0; nodeIdx < this.$scope.nodesInTree.length; nodeIdx++) {
                var node = this.$scope.nodesInTree[nodeIdx];

                if (aliases[node.text] == null)
                    aliases[node.text] = node.guid;
                else
                    aliases[node.text + "_" + nodeIdx] = node.guid;

                if (node.BUID != null)
                    aliases[node.text + "-BUID"] = node.BUID;
            }

            aliases["Commercial_SpecCharUse_SchemaElementGuid"] = "a736c895-2ea7-432b-b0cd-63409fd0b00f";
            aliases["Characteristic_CharValue_SchemaElementGuid"] = "665171c6-fbbe-43e0-bd30-5f07dcb51a0e";

            aliases["Commercial_UserDefinedChar_SchemaElementGuid"] = "739cec31-ff51-47b0-92ad-4e552d9ce566";

            return aliases;
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

        removeFromArray($index: number) {
            this.$scope.nodesInTree.splice($index, 1);
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