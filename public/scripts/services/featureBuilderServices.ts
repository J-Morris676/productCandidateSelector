/// <reference path="../interfaces/data.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />

/// <reference path="../modules/InstanceTreeUtilities.ts" />

module app.services.featureBuilderServices {
    'use strict';

    interface IProperty {
        propertyName: string;
        outputPropertyName:string;
        useAlias?: boolean;
    }

    interface IPropertyValues {
        mustEqualRule?: {
            property: string;
            value: string;
        };
        omitContextName?: boolean;
        evaluateTrueRule?: (node: data.IInstanceNode) => boolean;
        selector?: string;
        properties: [IProperty];
    }

    interface IContextNode {
        contextName: string;
        node: data.IInstanceNode;
    }

    interface ITableAndContextNodes {
        table: {
            structured: Array<Array<string>>;
            string?: string;
        }
        contextNodes: Array<IContextNode>;
    }

    export class featureBuilderService {

        private storyNo: string;
        private aliases: data.IAliases;
        private specificationTree: data.IInstanceNode;
        private candidateTree: data.IInstanceNode;

        private feature: string;
        private dataPath: string;
        private aliasPath: string;
        private scenario: string;
        private requestPath: string;

        static $inject = ["dataGenerationService"];
        constructor(public dataGenerationService: any) { }

        public setStoryNo(storyNo: string): void {
            this.storyNo = storyNo;
        }

        public setAliases(aliases: data.IAliases): void {
            this.aliases = aliases;
        }

        public setSpecificationTree(specificationTree: data.IInstanceNode): void {
            this.specificationTree = specificationTree;
        }

        public setCandidateTree(candidateTree: data.IInstanceNode): void {
            this.candidateTree = candidateTree;
        }

        public setFeature(feature: string): void {
            this.feature = feature;
        }

        public setDataPath(dataPath: string): void {
            this.dataPath = dataPath;
        }

        public setAliasPath(aliasPath: string): void {
            this.aliasPath = aliasPath;
        }

        public setScenario(scenario: string): void {
            this.scenario = scenario;
        }
        public setRequestPath(requestPath: string): void {
            this.requestPath = requestPath;
        }

        /*
            Feature string builder
         */
        public generateFeature(): string {
            var featureString = "#" + this.storyNo + "\n@:CommonSteps\n\n";

            //Feature description:
            featureString = featureString + "Feature:\n\t" + this.feature + "\n\n";

            //Background:
            featureString = featureString + "\tBackground:\n\t\t";

            //Data path:
            featureString = featureString + "Given a running server populated from \"" + this.dataPath + "\"\n\t\t";

            //Alias path:
            var fileNameIndex = this.aliasPath.split("/").length-1;
            var fileName = this.aliasPath.split("/")[fileNameIndex];
            var filePath = this.aliasPath.split("/").slice(0, fileNameIndex).join("/");

            featureString = featureString + "And the aliases for Feature \"" + fileName + "\" loaded from \"" + filePath + "\"\n\t\t";

            //Spec:
            var productSpecAliasId = this.getKeyByValue(this.aliases, this.specificationTree.guid);
            if (productSpecAliasId == null) {
                //Throw a paddy.. (has been removed from aliases file)
            }
            featureString = featureString + "And the datastore contains a product spec with ID \"" + productSpecAliasId + "\"\n\n";

            var requestTableProductToProductInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                mustEqualRule: {
                    "property": "parentRelationship",
                    "value": "Product_To_Product"
                },
                selector: "Product",
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "Product.ElementGuid", useAlias: true},
                    {"propertyName": "cardinality.min", "outputPropertyName": "MinOccurs", useAlias: false},
                    {"propertyName": "cardinality.max", "outputPropertyName": "MaxOccurs", useAlias: false}
                ]
            };

            var productToProductTableAndContext: ITableAndContextNodes = this.writeInstancesTableFromRoot(this.specificationTree, "\t\t", "Product_To_Product", "ProductSpec", requestTableProductToProductInstances);
            featureString += productToProductTableAndContext.table.string;

            //Request
            featureString += "\n\n\t\t#---------- Request ---------------------\n\t\t";
            featureString += "Scenario:\n\t\t\t";
            featureString += this.scenario + "\n\n\t\t\t";
            featureString += "Given a \"Product Candidate\" JSON request that is populated from \"" + this.requestPath + "\"\n\n\t\t\t";
            featureString += "And that \"request\" contains a \"ProductCandidate\"\n\n";

            var requestTableProperties: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID"},
                    {"propertyName": "guid", "outputPropertyName": "EntityID"}
                ]
            };

            featureString += this.writePropertiesTable(this.candidateTree, "ProductCandidate", "\t\t\t", requestTableProperties);

            var requestTableChildEntityInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID", useAlias: true},
                    {"propertyName": "guid", "outputPropertyName": "EntityID", useAlias: true}
                ]
            };

            var childEntityTableAndContext: ITableAndContextNodes = this.writeInstancesTableFromRoot(this.candidateTree, "\t\t\t", "ChildEntity", "ProductCandidate", requestTableChildEntityInstances);
            childEntityTableAndContext.contextNodes.unshift({"contextName": "ProductCandidate", node: this.candidateTree});

            featureString += childEntityTableAndContext.table.string;

            var requestTableCharacteristicUseInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.hasAddedCharacteristics,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "CharacteristicID", useAlias: true},
                    {"propertyName": "useArea", "outputPropertyName": "UseArea", useAlias: false}
                ]
            };

            var characteristicUseTableAndContext = this.writeInstancesTableFromArray(childEntityTableAndContext.contextNodes, "\t\t\t", "CharacteristicUse", requestTableCharacteristicUseInstances);

            featureString += characteristicUseTableAndContext.table.string;

            var requestTableValueInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isAnAddedCharacteristic,
                omitContextName: true,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "ValueID", useAlias: true},
                ]
            };

            var characteristicValueTableAndContext = this.writeInstancesTableFromArray(characteristicUseTableAndContext.contextNodes, "\t\t\t", "Value", requestTableValueInstances);
            featureString += characteristicValueTableAndContext.table.string;


            var requestTableConfiguredValueInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isEnteredUDCNode,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "CharacteristicID", useAlias: true},
                    {"propertyName": "useArea", "outputPropertyName": "UseArea", useAlias: false}
                ]
            };

            var configuredValueTableAndContext = this.writeInstancesTableFromArray(childEntityTableAndContext.contextNodes, "\t\t\t", "ConfiguredValue", requestTableConfiguredValueInstances);
            featureString += configuredValueTableAndContext.table.string;


            var requestTableValueInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isEnteredUDCNode,
                omitContextName: true,
                properties: [
                    {"propertyName": "value", "outputPropertyName": "Value", useAlias: false},
                ]
            };

            var characteristicValueTableAndContext = this.writeInstancesTableFromArray(configuredValueTableAndContext.contextNodes, "\t\t\t", "Value", requestTableValueInstances);
            featureString += characteristicValueTableAndContext.table.string;

            return featureString;
        }

        /*
            Properties table
         */
        writePropertiesTable(tree: data.IInstanceNode, rootElementName: string, tabs:string, propertyValues: IPropertyValues): string {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;

            var tableHeaders: Array<string> = ["Property", "Value"];

            table.push(tableHeaders);

            for (var propertyIdx = 0; propertyIdx < properties.length; propertyIdx++) {
                table = table.concat(this.generatePropertiesTableContent(tree, properties[propertyIdx]));
            }

            var propertyValueString: string = "";

            var tableString = this.writeTableStringFromArray(table, tabs);
            if (tableString!="") {
                propertyValueString = tabs+"And the \"" + rootElementName + "\" contains the following properties:\n";
                propertyValueString += tableString + "\n\n";
            }

            return propertyValueString;
        }

        private generatePropertiesTableContent(tree: data.IInstanceNode, property: IProperty): Array<Array<string>> {
            var self = this;
            var table: Array<Array<string>> = [];

            var aliasName: string = this.getKeyByValue(self.aliases, tree[property.propertyName]);
            table.push([property.outputPropertyName, aliasName]);

            return table;
        }

        /*
            Instances table
         */
        private writeInstancesTableFromRoot(tree: data.IInstanceNode, tabs:string, propertyName: string, rootElementName: string, propertyValues: IPropertyValues): ITableAndContextNodes {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;
            var contextAndTableObject: ITableAndContextNodes;

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

            contextAndTableObject = this.generateInstanceTableContent(tree, rootElementName, propertyValues, true);
            table = table.concat(contextAndTableObject.table.structured);

            if (table.length > 1) {
                var tableString = this.writeTableStringFromArray(table, tabs);
                if (tableString != "") {
                    instanceTableString += tabs + "And the \"" + propertyName + "\" contains the following instances:\n";
                    instanceTableString += tableString + "\n\n\n";
                }
            }

            contextAndTableObject.table.string = instanceTableString;
            contextAndTableObject.table.structured = table;

            return contextAndTableObject;
        }

        private writeInstancesTableFromArray(contextNodes: Array<IContextNode>, tabs: string, propertyName: string, propertyValues: IPropertyValues): ITableAndContextNodes {
            var properties = propertyValues.properties;
            var contextAndTableObject: ITableAndContextNodes = {
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
                var currentContextAndTableObject = this.generateInstanceTableContent(contextNodes[contextNodeIdx].node, contextNodes[contextNodeIdx].contextName, propertyValues, false);

                contextAndTableObject.contextNodes = contextAndTableObject.contextNodes.concat(currentContextAndTableObject.contextNodes);
                contextAndTableObject.table.structured = contextAndTableObject.table.structured.concat(currentContextAndTableObject.table.structured);
            }

            if (contextAndTableObject.table.structured.length > 1) {
                var tableString = this.writeTableStringFromArray(contextAndTableObject.table.structured, tabs);
                if (tableString != "") {
                    instanceTableString += tabs + "And the \"" + propertyName + "\" contains the following instances:\n";
                    instanceTableString += tableString + "\n\n\n";
                }
            }

            contextAndTableObject.table.string = instanceTableString;

            return contextAndTableObject;
        }

        generateInstanceTableContent(tree: data.IInstanceNode, parentContextName: string, propertyValues:IPropertyValues, performRecursively:boolean): ITableAndContextNodes {
            var subTable: Array<Array<string>> = [];
            var properties = propertyValues.properties;
            var mustEqualRule = propertyValues.mustEqualRule;
            var mustEvaluateTrueRule = propertyValues.evaluateTrueRule;

            var contextNodes: Array<IContextNode> = [];

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
                        value = this.getKeyByValue(this.aliases, value);
                    }

                    childRow.push(value);

                }

                if (_.isUndefined(propertyValues.omitContextName) || propertyValues.omitContextName!= true)
                    childRow.push(contextName);

                if (!_.isUndefined(propertyValues.selector))
                    childRow.push(propertyValues.selector);

                subTable.push(childRow);

                if (performRecursively) {
                    var childSubTableAndContextName = this.generateInstanceTableContent(child, contextName, propertyValues, performRecursively);
                    subTable = subTable.concat(childSubTableAndContextName.table.structured);
                    contextNodes = contextNodes.concat(childSubTableAndContextName.contextNodes);
                }

            }

            var tableAndContextObject: ITableAndContextNodes = {
                table: {
                    structured: subTable
                },
                contextNodes: contextNodes
            };

            return tableAndContextObject;
        }





        private writeTableStringFromArray(table: Array<Array<string>>, tabs: string): string {
            var columnLength = table[0].length;
            var rowLength = table.length;

            if (rowLength == 1) return "";

            var stringAsArray: Array<string> = new Array(rowLength);

            for (var colIdx = 0; colIdx < columnLength; colIdx++) {
                var maxLength = 0;
                for (var rowIdx = 0; rowIdx < rowLength; rowIdx++) {
                    if (table[rowIdx][colIdx].length > maxLength)
                        maxLength = table[rowIdx][colIdx].length ;
                }

                for (var rowIdx = 0; rowIdx < rowLength; rowIdx++) {
                    if (stringAsArray[rowIdx] == null) stringAsArray[rowIdx] = tabs+"\t" || "";
                    stringAsArray[rowIdx] = stringAsArray[rowIdx].concat("| " + table[rowIdx][colIdx] + " ");

                    for (var spaces = maxLength-table[rowIdx][colIdx].length; spaces>0; spaces--)
                        stringAsArray[rowIdx] = stringAsArray[rowIdx].concat(" ");

                    if (colIdx == (columnLength-1))
                        stringAsArray[rowIdx] +="|";
                }
            }
            return stringAsArray.join("\n");
        }


        private getKeyByValue(object, value): string {
            for( var prop in object ) {
                if( object.hasOwnProperty( prop ) ) {
                    if( object[ prop ] === value )
                        return prop;
                }
            }
        }
    }
}