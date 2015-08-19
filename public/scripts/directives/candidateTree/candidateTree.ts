/// <reference path="../../../typings/angular/angular.d.ts" />
/// <reference path="../../../typings/jstree/jstree.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="../../modules/InstanceTreeUtilities.ts" />

module app.directives.candidateTree {
    'use strict';

    interface ICandidateTreeScope extends ng.IScope {
        data: data.IInstanceNode;
        selectedNode: data.IInstanceNode;
        relationships: data.IRelationships;
        downloadFile: any;
        exportService: any;
        dataWithCharacteristicSelections: data.IInstanceNode
    }

    export class CandidateTree implements ng.IDirective {

        static $inject = ["exportService"];
        constructor(public exportService: any) {}

        public restrict = 'E';
        public scope = {
            data: "=",
            selectedNode: "=?",
            relationships: "=",
            dataWithCharacteristicSelections: "@"
        };
        public templateUrl = "scripts/directives/candidateTree/candidateTree.html";

        link = (scope:ICandidateTreeScope, element:JQuery, attributes:ng.IAttributes) => {
            var self = this;
            var jsTree: JSTree;

            var candidateTreeElement = $(element).find("#candidate-tree");

            if (scope.data == null) {
                addDataWatcher();
            }
            else {
                renderTreeAndRegisterEvents();
            }

            function addDataWatcher() {
                var unwatch = scope.$watch("data", function (newData, oldData) {
                    if (scope.data != null) {
                        if(!angular.equals(newData, oldData) && oldData != null) {
                            if (newData.guid == oldData.guid) {
                                //Merges the new data source with the data source with characteristics
                                //All characteristics that are 'checked' take the characteristicSelection object value
                                scope.data = <data.IInstanceNode> _.merge(scope.dataWithCharacteristicSelections, newData, function(objectValue, sourceValue, key) {
                                    if (key == "checked") {
                                        return objectValue;
                                    }
                                });
                                unwatch();
                                addDataWatcher();
                            }
                        }
                        renderTreeAndRegisterEvents();
                    }
                }, true)
            }

            function renderTreeAndRegisterEvents(): void {
                scope.dataWithCharacteristicSelections = _.clone(scope.data, true);
                scope.selectedNode = null;

                candidateTreeElement.jstree("destroy");

                candidateTreeElement.jstree({ 'core' : {
                        'multiple': false,
                        'data' : [
                            scope.data
                        ]
                    }
                }).on('loaded.jstree', function() {
                    candidateTreeElement.jstree('open_all');

                    candidateTreeElement.find(".jstree-leaf").each(function(){
                        initCharacteristicNode($(this).closest("li"));
                        initCharacteristicParentNode($(this).closest("li"));

                        initUDCNode($(this).closest("li"));
                        initUDCParentNode($(this).closest("li"));
                    });
                }).on('select_node.jstree', function(event, data) {
                    setSelectedNode(event, data);
                    toggleSelectedCharacteristic($(data.event.target).closest("li"));
                    promptForUDCInput($(data.event.target).closest("li"));
                });

                jsTree = candidateTreeElement.jstree(true);
            }

            function setSelectedNode(event, treeData) {
                var selectedNode: data.IInstanceNode = treeData.instance.get_node(treeData.selected[0]).original;

                selectedNode.children = getJsTreeNodeChildren(treeData.instance, treeData.instance.get_node(treeData.selected[0]));

                scope.$apply(function() {
                    scope.selectedNode = selectedNode;
                });
            }

            function initCharacteristicNode(node: JQuery): void {
                var nodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;
                var selectedNodeInCharTree: data.ISelectableCharInstanceNode = InstanceTreeUtilities.findNodeByNodeGuid(scope.dataWithCharacteristicSelections, nodeData.nodeGuid);

                if (InstanceTreeUtilities.isSelectableCharacteristicNode(nodeData)) {
                    if (!selectedNodeInCharTree.checked) {
                        jsTree.set_icon(node, "characteristic-leaf-unselected");
                    }
                    else {
                        jsTree.set_icon(node, "characteristic-leaf-selected");
                    }
                }
            }

            function initCharacteristicParentNode(node: JQuery): void {
                var nodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;
                var parentNodeData: data.IInstanceNode = InstanceTreeUtilities.findParent(scope.dataWithCharacteristicSelections, nodeData);

                if (InstanceTreeUtilities.isCharacteristicUseNode(parentNodeData)) {
                    var nodeParentNearestListItemId = candidateTreeElement.jstree(true).get_parent(node[0]);
                    var nodeParentNearestListItem = $("#" + nodeParentNearestListItemId);

                    jsTree.set_icon(nodeParentNearestListItem, "characteristic-leaf-parent");
                }
            }

            function initUDCNode(node: JQuery): void {
                var nodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;

                if (InstanceTreeUtilities.isSelectableUDCNode(nodeData)) {
                    jsTree.set_icon(node, "udc-leaf");
                }
            }

            function initUDCParentNode(node: JQuery): void {
                var nodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;
                var parentNodeData: data.IInstanceNode = InstanceTreeUtilities.findParent(scope.dataWithCharacteristicSelections, nodeData);

                if (InstanceTreeUtilities.isUDCNode(parentNodeData)) {
                    var nodeParentNearestListItemId = candidateTreeElement.jstree(true).get_parent(node[0]);
                    var nodeParentNearestListItem = $("#" + nodeParentNearestListItemId);

                    jsTree.set_icon(nodeParentNearestListItem, "udc-leaf-parent");
                }
            }

            function toggleSelectedCharacteristic(node: JQuery) {
                var selectedNodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;

                if (InstanceTreeUtilities.isSelectableCharacteristicNode(selectedNodeData)) {

                    var selectedNodeInCharTree: data.ISelectableCharInstanceNode = InstanceTreeUtilities.findNodeByNodeGuid(scope.dataWithCharacteristicSelections, selectedNodeData.nodeGuid);
                    var selectedNodeParentInCharTree: data.IInstanceNode = InstanceTreeUtilities.findParent(scope.dataWithCharacteristicSelections, selectedNodeData);

                    if (selectedNodeInCharTree.checked != null && selectedNodeInCharTree.checked == true) {
                        jsTree.set_icon(node, "characteristic-leaf-unselected");
                        selectedNodeInCharTree.checked = false;
                    }
                    else {
                        if (InstanceTreeUtilities.canAddCharacteristic(selectedNodeParentInCharTree)) {
                            jsTree.set_icon(node, "characteristic-leaf-selected");
                            selectedNodeInCharTree.checked = true;
                        }
                    }
                 }
            }

            function promptForUDCInput(node: JQuery) {
                var selectedNodeData: data.ISelectableCharInstanceNode = jsTree.get_node(node[0]).original;


                if (InstanceTreeUtilities.isSelectableUDCNode(selectedNodeData)) {
                    var selectedNodeInCharTree: data.ISelectableUDCInstanceNode = InstanceTreeUtilities.findNodeByNodeGuid(scope.dataWithCharacteristicSelections, selectedNodeData.nodeGuid);
                    var currentValue = selectedNodeInCharTree.value || "";
                    var newValue = prompt("Enter User Defined Characteristic:", currentValue);

                    selectedNodeInCharTree.value = newValue || currentValue;
                }
            }

            function getJsTreeNodeChildren(instance, node): data.IInstanceNode[] {
                var children: data.IInstanceNode[] = [];
                for (var childIndex = 0; childIndex < node.children.length; childIndex++) {
                    children.push(instance.get_node(node.children[childIndex]).original);
                }
                return children;
            }

            scope.downloadFile = function(fileType) {
                var treeRoot: data.IInstanceNode = _.clone(scope.dataWithCharacteristicSelections, true);
                try {
                    var exportTree: data.ICandidateExportNode = generateTransformedTreeForExport(treeRoot, null);
                    var exportCandidateTree = {
                        "CreationDate": new Date().toISOString().substring(0, 10),
                        "ProductCandidate": exportTree
                    };
                    self.exportService.postCandidate(exportCandidateTree).success(function (response) {
                        self.exportService.downloadCandidateFile(response.ID, fileType)
                    });
                }
                catch(error) {
                    alert(error);
                }
            };

            function generateTransformedTreeForExport(treeNode: any, parentNode:data.ICandidateExportNode): data.ICandidateExportNode {

                if (InstanceTreeUtilities.isUDCNode(treeNode)) {
                    if (treeNode.children.length == 0 ) {
                        return null;
                    }
                    else if (treeNode.children[0].value == null) {
                        throw new Error("Error: UDC '" + treeNode.text + "' has not been set a value\n");
                    }
                    else {
                        var useArea: string = "";

                        var specCharRelationships: [data.IRelationship] = scope.relationships[parentNode.EntityID];

                        for (var relationship = 0; relationship < specCharRelationships.length; relationship++) {
                            if (specCharRelationships[relationship].Child == treeNode.guid) {
                                useArea = specCharRelationships[relationship].Kind;
                            }
                        }

                        var ConfiguredValue = {
                            UseArea: useArea,
                            CharacteristicID: treeNode.children[0].guid,
                            Value: [
                                {"Value": treeNode.children[0].value}
                            ]
                        };
                        if (parentNode.ConfiguredValue == null) {
                            parentNode.ConfiguredValue = [ConfiguredValue];
                        }
                        else {
                            parentNode.ConfiguredValue.push(ConfiguredValue);
                        }

                    }
                }
                else if (InstanceTreeUtilities.isCharacteristicNode(treeNode)) {
                    var useArea: string = "";

                    var specCharRelationships: [data.IRelationship] = scope.relationships[parentNode.EntityID];

                    for (var relationship = 0; relationship < specCharRelationships.length; relationship++) {
                        if (specCharRelationships[relationship].Child == treeNode.guid) {
                            useArea = specCharRelationships[relationship].Kind;
                        }
                    }

                    var CharacteristicUse = {
                        "UseArea": useArea,
                        "CharacteristicID": scope.relationships[treeNode.children[0].guid][0].Child,
                        "Value":  []
                    };

                    for (childIndex = 0; childIndex < treeNode.children.length; childIndex++) {
                        var child: data.ISelectableCharInstanceNode = treeNode.children[childIndex];

                        if (child.checked == true) {
                            CharacteristicUse.Value.push({ValueID: child.guid});
                        }
                    }

                    if (InstanceTreeUtilities.isCharacteristicUseBetweenCardinality(treeNode)) {
                        if (CharacteristicUse.Value.length > 0) {
                            if (parentNode.CharacteristicUse == null) {
                                parentNode.CharacteristicUse = [CharacteristicUse]
                            }
                            else {
                                parentNode.CharacteristicUse.push(CharacteristicUse);
                            }
                        }
                    }
                    else {
                        throw new Error("Error: '" + treeNode.text + "' is not between cardinality\n"
                            + "Cardinality: " + treeNode.cardinality.max + ":" + treeNode.cardinality.min + "\n"
                            + "Characteristic values: " + CharacteristicUse.Value.length);
                    }

                    return null;
                }
                else {
                    var newNode: data.ICandidateExportNode = {
                        ID: treeNode.nodeGuid,
                        EntityID: treeNode.guid,
                        _IsNewForCustomer: true,
                        ChildEntity: treeNode.children
                    };

                    treeNode = newNode;

                    for (var childIndex = 0; childIndex < treeNode.ChildEntity.length; childIndex++) {
                        var childNode = generateTransformedTreeForExport(treeNode.ChildEntity[childIndex], treeNode);

                        if (childNode != null) {
                            treeNode.ChildEntity[childIndex] = childNode;
                        }
                        else {
                            treeNode.ChildEntity.splice(childIndex, 1);
                            childIndex--;
                        }
                    }

                    return treeNode;
                }
            }
        }
    }
}