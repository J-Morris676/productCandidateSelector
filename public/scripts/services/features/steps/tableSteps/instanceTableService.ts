/// <reference path="../../../../interfaces/data.ts" />
/// <reference path="../../../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../featureBuilderUtils.ts" />
/// <reference path="../../types.ts" />


module app.services.instanceTableServices {
    export class instanceTableService {

        static $inject = ["featureBuilderUtils"];
        constructor(public featureBuilderUtilities: featureBuilderUtils.featureBuilderUtils) { }

        public writeInstancesTableFromRoot(tree: data.IInstanceNode, aliases: data.IAliases, tabs:string, propertyName: string, rootElementName: string, propertyValues: featureTypes.IPropertyValues): featureTypes.ITableAndContextNodes {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;
            var contextAndTableObject: featureTypes.ITableAndContextNodes;

            var tableHeaders: Array<string> = ["ParentContextName"];
            if (_.isUndefined(propertyValues.omitContextName) || propertyValues.omitContextName != true) {
                tableHeaders.push("ContextName");
            }

            var instanceTableString = "";

            for (var propertyValueIdx = (properties.length-1); propertyValueIdx >= 0; propertyValueIdx--) {
                tableHeaders.splice(1, 0, properties[propertyValueIdx].outputPropertyName);
            }

            if (!_.isUndefined(propertyValues.selector))
                tableHeaders.push("Selector");

            table.push(tableHeaders);

            contextAndTableObject = this.generateInstanceTableContent(tree, aliases, rootElementName, propertyValues, true);
            table = table.concat(contextAndTableObject.table.structured);

            if (table.length > 1) {
                var tableString = this.featureBuilderUtilities.writeTableStringFromArray(table, tabs);
                if (tableString != "") {
                    instanceTableString += "And the \"" + propertyName + "\" contains the following instances:\n";
                    instanceTableString += tableString;
                }
            }

            contextAndTableObject.table.string = instanceTableString;
            contextAndTableObject.table.structured = table;

            return contextAndTableObject;
        }

        public writeInstancesTableFromArray(contextNodes: Array<featureTypes.IContextNode>, aliases: data.IAliases, tabs: string, propertyName: string, propertyValues: featureTypes.IPropertyValues): featureTypes.ITableAndContextNodes {
            var properties = propertyValues.properties;
            var contextAndTableObject: featureTypes.ITableAndContextNodes = {
                contextNodes: [],
                table: {
                    structured: []
                }
            };

            var tableHeaders: Array<string> = ["ParentContextName"];
            if (_.isUndefined(propertyValues.omitContextName) || propertyValues.omitContextName!= true) {
                tableHeaders.push("ContextName");
            }

            var instanceTableString = "";

            for (var propertyValueIdx = (properties.length-1); propertyValueIdx >= 0; propertyValueIdx--) {
                tableHeaders.splice(1, 0, properties[propertyValueIdx].outputPropertyName);
            }

            if (!_.isUndefined(propertyValues.selector))
                tableHeaders.push("Selector");

            contextAndTableObject.table.structured.push(tableHeaders);

            for (var contextNodeIdx = 0; contextNodeIdx < contextNodes.length; contextNodeIdx++) {
                var currentContextAndTableObject = this.generateInstanceTableContent(contextNodes[contextNodeIdx].node, aliases, contextNodes[contextNodeIdx].contextName, propertyValues, false);

                contextAndTableObject.contextNodes = contextAndTableObject.contextNodes.concat(currentContextAndTableObject.contextNodes);
                contextAndTableObject.table.structured = contextAndTableObject.table.structured.concat(currentContextAndTableObject.table.structured);
            }

            if (contextAndTableObject.table.structured.length > 1) {
                var tableString = this.featureBuilderUtilities.writeTableStringFromArray(contextAndTableObject.table.structured, tabs);
                if (tableString != "") {
                    instanceTableString += "And the \"" + propertyName + "\" contains the following instances:\n";
                    instanceTableString += tableString;
                }
            }

            contextAndTableObject.table.string = instanceTableString;

            return contextAndTableObject;
        }

        private generateInstanceTableContent(tree: data.IInstanceNode, aliases: data.IAliases, parentContextName: string, propertyValues: featureTypes.IPropertyValues, performRecursively:boolean): featureTypes.ITableAndContextNodes {
            var subTable: Array<Array<string>> = [];
            var properties = propertyValues.properties;
            var mustEqualRule = propertyValues.mustEqualRule;
            var mustEvaluateTrueRule = propertyValues.evaluateTrueRule;

            var contextNodes: Array<featureTypes.IContextNode> = [];

            for (var childIdx = 0; childIdx < tree.children.length; childIdx++) {
                var child: data.IInstanceNode = tree.children[childIdx];

                if (!mustEvaluateTrueRule(child))
                    continue;

                if (!_.isUndefined(mustEqualRule) && _.get(child, mustEqualRule.property) != mustEqualRule.value)
                    continue;

                var childRow: Array<string> = [parentContextName];

                var contextName = parentContextName + "_child_" + (childIdx + 1);

                contextNodes.push({contextName: contextName, node: child});
                for (var propertyValue in properties) {
                    var value = <string> _.get(child, properties[propertyValue].propertyName);

                    if (properties[propertyValue].useAlias) {
                        value = this.featureBuilderUtilities.getKeyByValue(aliases, value);
                    }

                    childRow.push(value);
                }

                if (_.isUndefined(propertyValues.omitContextName) || propertyValues.omitContextName!= true)
                    childRow.push(contextName);

                if (!_.isUndefined(propertyValues.selector))
                    childRow.push(propertyValues.selector);

                subTable.push(childRow);

                if (performRecursively) {
                    var childSubTableAndContextName = this.generateInstanceTableContent(child, aliases, contextName, propertyValues, performRecursively);
                    subTable = subTable.concat(childSubTableAndContextName.table.structured);
                    contextNodes = contextNodes.concat(childSubTableAndContextName.contextNodes);
                }

            }

            var tableAndContextObject: featureTypes.ITableAndContextNodes = {
                table: {
                    structured: subTable
                },
                contextNodes: contextNodes
            };

            return tableAndContextObject;
        }
    }
}