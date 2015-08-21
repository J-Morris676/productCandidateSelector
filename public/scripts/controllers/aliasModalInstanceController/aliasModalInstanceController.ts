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

        nodesInTree: Array<data.IInstanceNode>;
        aliases: data.IAliases;
    }

    export class aliasModalInstanceController {
        $scope:IAliasModalScope;
        $modalInstance: any;
        exportService: any;


        constructor($scope:IAliasModalScope, $modalInstance:any, rootNode:data.IInstanceNode, exportService: any) {
            this.$modalInstance = $modalInstance;
            this.$scope = $scope;
            this.exportService = exportService;


            $scope.nodesInTree = _.uniq(_.clone(InstanceTreeUtilities.flattenTreeIntoArray(rootNode), true), "guid");
            console.log($scope.nodesInTree);
            for (var nodeIdx = 0; nodeIdx < this.$scope.nodesInTree.length; nodeIdx++) {
                var node = this.$scope.nodesInTree[nodeIdx];
                node.text = node.text.replace(/ /g,'_');
            }

            $scope.events = this;
        }

        downloadAliases(): void {
            var self = this;
            var aliases = {};

            for (var nodeIdx = 0; nodeIdx < this.$scope.nodesInTree.length; nodeIdx++) {
                var node = this.$scope.nodesInTree[nodeIdx];

                if (aliases[node.text] == null)
                    aliases[node.text] = node.guid;
                else
                    aliases[node.text + "_" + nodeIdx] = node.guid;

                if (node.BUID != null)
                    aliases[node.text + "-BUID"] = node.BUID;

            }

            self.exportService.postAliases(aliases).success(function (response) {
                self.exportService.downloadAliasesFile(response.ID);
            });
        }

        cancel() {
            this.$modalInstance.dismiss('cancel');
        }

        removeFromArrayAndAliases($index: number) {
            this.$scope.nodesInTree.splice($index, 1);
        }
    }
}