/**
 * Created by JamieM on 28/07/2015.
 */

/// <reference path="../interfaces/data.ts" />


module InstanceTreeUtilities {
    export function isOneToOneCardinality(treeNode: data.IInstanceNode): boolean {
        if (treeNode.cardinality == null) return false;

        var minCardinality: number = parseInt(treeNode.cardinality.min);
        var maxCardinality: number = parseInt(treeNode.cardinality.max);

        if (minCardinality == 1 && maxCardinality == 1) {
            return true;
        }

        return false;
    }

    export function isChildOfNode(treeNode: data.IInstanceNode, childGuid: string): boolean {
        if (treeNode == null) return false;

        for (var childIndex = 0; childIndex < treeNode.children.length; childIndex++) {
            if (childGuid == treeNode.children[childIndex].guid) {
                return true;
            }
        }
        return false;
    }

    export function isLowerThanMaxCardinality(candidateTreeNode: data.IInstanceNode): boolean {
        var maxCardinality: number = parseInt(candidateTreeNode.cardinality.max);
        var childAmount: number = candidateTreeNode.children.length;

        if (childAmount < maxCardinality) {
            return true;
        }
        else {
            return false;
        }
    }

    export function findNodeInTreeByGuid(treeNode: data.IInstanceNode, guid: string): data.IInstanceNode {
        if (treeNode.guid == guid) return treeNode;
        else {
            var foundNode: data.IInstanceNode = null;

            for (var childIndex: number = 0; foundNode == null && childIndex < treeNode.children.length; childIndex++) {
                foundNode = findNodeInTreeByGuid(treeNode.children[childIndex], guid);
            }
            return foundNode;
        }
    }

    export function isParentOfNode(parentNode: data.IInstanceNode, node: data.IInstanceNode): boolean {
        var isChild = false;
        for (var childIndex = 0; childIndex < parentNode.children.length; childIndex++) {
            if (parentNode.children[childIndex].guid == node.guid) {
                isChild = true;
            }
        }
        return isChild;
    }

    /*
        Candidate Tree usage
     */
    export function isBetweenCardinality(parentNode: data.IInstanceNode, childToAdd: data.IInstanceNode): boolean {
        if (childToAdd.cardinality == null) return false;

        var minCardinality: number = parseInt(childToAdd.cardinality.min);
        var maxCardinality: number = parseInt(childToAdd.cardinality.max);

        var candidateChildCount = childrenWithGuidCount(parentNode, childToAdd.guid);

        if (candidateChildCount >= minCardinality && candidateChildCount < maxCardinality) {
            return true;
        }
        else {
            return false;
        }
    }

    export function findNodeByNodeGuid(treeNode: data.IInstanceNode, nodeGuid: string): data.IInstanceNode {
        if (treeNode.nodeGuid == nodeGuid) return treeNode;
        else {
            var foundNode: data.IInstanceNode = null;

            for (var childIndex: number = 0; foundNode == null && childIndex < treeNode.children.length; childIndex++) {
                foundNode = findNodeByNodeGuid(treeNode.children[childIndex], nodeGuid);
            }
            return foundNode;
        }
    }

    export function generateRandomNodeId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function childrenWithGuidCount(parentNode: data.IInstanceNode, guid: string): number {
        var childrenAmountWithGivenGuid = 0;
        for (var childIndex = 0; childIndex < parentNode.children.length; childIndex++) {
            if (parentNode.children[childIndex].guid == guid) childrenAmountWithGivenGuid++;
        }

        return childrenAmountWithGivenGuid;
    }
}