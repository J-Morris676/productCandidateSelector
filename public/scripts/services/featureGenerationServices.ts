/// <reference path="../interfaces/data.ts" />
/// <reference path="../../typings/lodash/lodash.d.ts" />

/// <reference path="../modules/InstanceTreeUtilities.ts" />

module app.services.featureGenerationServices {
    'use strict';

    interface ITableHeaders {
        ProductToProduct: Array<string>;
        SigmaEntLinks: Array<string>;
        keyValue: Array<string>;
    }

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
        evaluateTrueRule?: (node: data.IInstanceNode) => boolean;
        selector?: string;
        properties: [IProperty];
    }

    export class featureGenerationService {

        private storyNo: string;
        private aliases: data.IAliases;
        private specificationTree: data.IInstanceNode;
        private candidateTree: data.IInstanceNode;

        private feature: string;
        private dataPath: string;
        private aliasPath: string;
        private scenario: string;
        private requestPath: string;

        private tableHeaders: ITableHeaders;

        static $inject = ["dataGenerationService"];
        constructor(public dataGenerationService: any) {
            this.tableHeaders = {
                "ProductToProduct": ["ParentContextName", "Product.Element_Guid", "Min_Occurs", "Max_Occurs", "ContextName", "Selector"],
                "SigmaEntLinks": ["_meta.ID", "Name", "IsUnique", "IsRequired", "IsMulti", "EvaluateInCommercialScope", "TargetIsDependent"],
                "keyValue": ["Property", "Value"]
            }
        }

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
            featureString = featureString + "And the datastore contains a product spec with ID \"" + productSpecAliasId + "\"\n\n\t\t";

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

            featureString += this.writeInstancesTable(this.specificationTree, "\t\t\t", "Product_To_Product", "ProductSpec", requestTableProductToProductInstances);

            //Request
            featureString += "\n\n\t\t#---------- Request ---------------------\n\t\t";
            featureString += "Scenario:\n\t\t\t";
            featureString += this.scenario + "\n\n\t\t\t";
            featureString += "Given a \"Product Candidate\" JSON request that is populated from \"" + this.requestPath + "\"\n\n\t\t\t";
            featureString += "And that \"request\" contains a \"ProductCandidate\"\n\n\t\t\t";

            var requestTableProperties: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID"},
                    {"propertyName": "guid", "outputPropertyName": "EntityID"}
                ]
            };

            featureString += this.writePropertiesTable(this.candidateTree, "ProductCandidate", requestTableProperties);
            featureString += "\n\n\t\t\t";

            var requestTableChildEntityInstances: IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID", useAlias: true},
                    {"propertyName": "guid", "outputPropertyName": "EntityID", useAlias: true}
                ]
            };

            featureString += this.writeInstancesTable(this.candidateTree, "\t\t\t\t", "ChildEntity", "ProductCandidate", requestTableChildEntityInstances);

            return featureString;
        }

        /*
            Properties table
         */
        writePropertiesTable(tree: data.IInstanceNode, rootElementName: string, propertyValues: IPropertyValues): string {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;

            var tableHeaders: Array<string> = this.tableHeaders.keyValue;

            table.push(tableHeaders);

            for (var propertyIdx = 0; propertyIdx < properties.length; propertyIdx++) {
                table = table.concat(this.generatePropertiesTableContent(tree, properties[propertyIdx]));
            }

            var propertyValueString: string = "";

            var tableString = this.writeTableStringFromArray(table, "\t\t\t\t");
            if (tableString!="") {
                propertyValueString = "And the \"" + rootElementName + "\" contains the following properties:\n";
                propertyValueString += tableString;
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
        private writeInstancesTable(tree: data.IInstanceNode, tabs:string, propertyName: string, rootElementName: string, propertyValues: IPropertyValues): string {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;

            var tableHeaders: Array<string> = ["ParentContextName", "ContextName"];

            var tableContent: Array<Array<string>> = [];

            var instanceTableString = "";

            for (var propertyValueIdx = (properties.length-1); propertyValueIdx >= 0; propertyValueIdx--) {
                tableHeaders.splice(1, 0, properties[propertyValueIdx].outputPropertyName);
            }

            if (!_.isUndefined(propertyValues.selector))
                tableHeaders.push("Selector");

            table.push(tableHeaders);

            tableContent = this.generateInstanceTableContent(tree, rootElementName, propertyValues);
            table = table.concat(tableContent);

            if (table.length > 1) {
                var tableString = this.writeTableStringFromArray(table, tabs);
                if (tableString != "") {
                    instanceTableString += "And the \"" + propertyName + "\" contains the following instances:\n";
                    instanceTableString += tableString;
                }
            }

            return instanceTableString;
        }

        generateInstanceTableContent(tree: data.IInstanceNode, parentContextName: string, propertyValues:IPropertyValues): Array<Array<string>> {
            var subTable: Array<Array<string>> = [];
            var properties = propertyValues.properties;
            var mustEqualRule = propertyValues.mustEqualRule;
            var mustEvaluateTrueRule = propertyValues.evaluateTrueRule;

            for (var childIdx = 0; childIdx < tree.children.length; childIdx++) {
                var child: data.IInstanceNode = tree.children[childIdx];

                //TODO: This prevents characteristic child entities getting in - This may need to be changed depending
                //TODO: on what type of instance table we're creating.. we may want a flag to say actually, we only want characteristic nodes for example.
                if (!mustEvaluateTrueRule(child))
                    continue;

                if (!_.isUndefined(mustEqualRule) && _.get(child, mustEqualRule.property) != mustEqualRule.value)
                    continue;

                var childRow: Array<string> = [parentContextName];
                var contextName = parentContextName + "_child_" + (childIdx+1);

                for (var propertyValue in properties) {
                    var value = <string> _.get(child, properties[propertyValue].propertyName);

                    if (properties[propertyValue].useAlias) {
                        value = this.getKeyByValue(this.aliases, value);
                    }

                    childRow.push(value);

                }
                childRow.push(contextName);

                if (!_.isUndefined(propertyValues.selector))
                    childRow.push(propertyValues.selector);

                subTable.push(childRow);

                var childSubTable = this.generateInstanceTableContent(child, contextName, propertyValues);
                subTable = subTable.concat(childSubTable);
            }

            return subTable;
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
                    if (stringAsArray[rowIdx] == null) stringAsArray[rowIdx] = tabs || "";
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