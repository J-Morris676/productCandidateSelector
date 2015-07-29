/**
 * Created by JamieM on 28/07/2015.
 */
/// <reference path="../interfaces/data.ts" />
var InstanceTreeUtilities;
(function (InstanceTreeUtilities) {
    function isOneToOneCardinality(treeNode) {
        if (treeNode.cardinality == null)
            return false;
        var minCardinality = parseInt(treeNode.cardinality.min);
        var maxCardinality = parseInt(treeNode.cardinality.max);
        if (minCardinality == 1 && maxCardinality == 1) {
            return true;
        }
        return false;
    }
    InstanceTreeUtilities.isOneToOneCardinality = isOneToOneCardinality;
    function isChildOfNode(treeNode, childGuid) {
        if (treeNode == null)
            return false;
        for (var childIndex = 0; childIndex < treeNode.children.length; childIndex++) {
            if (childGuid == treeNode.children[childIndex].guid) {
                return true;
            }
        }
        return false;
    }
    InstanceTreeUtilities.isChildOfNode = isChildOfNode;
    function isLowerThanMaxCardinality(candidateTreeNode) {
        var maxCardinality = parseInt(candidateTreeNode.cardinality.max);
        var childAmount = candidateTreeNode.children.length;
        if (childAmount < maxCardinality) {
            return true;
        }
        else {
            return false;
        }
    }
    InstanceTreeUtilities.isLowerThanMaxCardinality = isLowerThanMaxCardinality;
    function findNodeInTreeByGuid(treeNode, guid) {
        if (treeNode.guid == guid)
            return treeNode;
        else {
            var foundNode = null;
            for (var childIndex = 0; foundNode == null && childIndex < treeNode.children.length; childIndex++) {
                foundNode = findNodeInTreeByGuid(treeNode.children[childIndex], guid);
            }
            return foundNode;
        }
    }
    InstanceTreeUtilities.findNodeInTreeByGuid = findNodeInTreeByGuid;
    function isParentOfNode(parentNode, node) {
        var isChild = false;
        for (var childIndex = 0; childIndex < parentNode.children.length; childIndex++) {
            if (parentNode.children[childIndex].guid == node.guid) {
                isChild = true;
            }
        }
        return isChild;
    }
    InstanceTreeUtilities.isParentOfNode = isParentOfNode;
    /*
        Candidate Tree usage
     */
    function isBetweenCardinality(parentNode, childToAdd) {
        if (childToAdd.cardinality == null)
            return false;
        var minCardinality = parseInt(childToAdd.cardinality.min);
        var maxCardinality = parseInt(childToAdd.cardinality.max);
        var candidateChildCount = childrenWithGuidCount(parentNode, childToAdd.guid);
        if (candidateChildCount >= minCardinality && candidateChildCount < maxCardinality) {
            return true;
        }
        else {
            return false;
        }
    }
    InstanceTreeUtilities.isBetweenCardinality = isBetweenCardinality;
    function findNodeByNodeGuid(treeNode, nodeGuid) {
        if (treeNode.nodeGuid == nodeGuid)
            return treeNode;
        else {
            var foundNode = null;
            for (var childIndex = 0; foundNode == null && childIndex < treeNode.children.length; childIndex++) {
                foundNode = findNodeByNodeGuid(treeNode.children[childIndex], nodeGuid);
            }
            return foundNode;
        }
    }
    InstanceTreeUtilities.findNodeByNodeGuid = findNodeByNodeGuid;
    function generateRandomNodeId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    InstanceTreeUtilities.generateRandomNodeId = generateRandomNodeId;
    function childrenWithGuidCount(parentNode, guid) {
        var childrenAmountWithGivenGuid = 0;
        for (var childIndex = 0; childIndex < parentNode.children.length; childIndex++) {
            if (parentNode.children[childIndex].guid == guid)
                childrenAmountWithGivenGuid++;
        }
        return childrenAmountWithGivenGuid;
    }
})(InstanceTreeUtilities || (InstanceTreeUtilities = {}));
//# sourceMappingURL=InstanceTreeUtilities.js.map