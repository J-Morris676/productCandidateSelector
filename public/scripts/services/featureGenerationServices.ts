/// <reference path="../interfaces/data.ts" />

module app.services.featureGenerationServices {
    'use strict';

    interface ITableHeaders {
        ProductToProduct: Array<string>;
        SigmaEntLinks: Array<string>;
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
                "SigmaEntLinks": ["_meta.ID", "Name", "IsUnique", "IsRequired", "IsMulti", "EvaluateInCommercialScope", "TargetIsDependent"]
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

        public generateFeature(): string {
            var featureString = "#" + this.storyNo + "\n@:CommonSteps\n\n";

            //Feature description:
            featureString = featureString + "Feature:\n\t" + this.feature + "\n\n";

            //Background:
            featureString = featureString + "  Background:\n\t";

            //Data path:
            featureString = featureString + "Given a running server populated from \"" + this.dataPath + "\"\n\t";

            //Alias path:
            var fileNameIndex = this.aliasPath.split("/").length-1
            var fileName = this.aliasPath.split("/")[fileNameIndex];
            var filePath = this.aliasPath.split("/").slice(0, fileNameIndex).join("/");

            featureString = featureString + "And the aliases for Feature \"" + fileName + "\" loaded from \"" + filePath + "\"\n\t";

            //Spec:
            var productSpecAliasId = this.getKeyByValue(this.aliases, this.specificationTree.guid);
            if (productSpecAliasId == null) {
                //Throw a paddy.. (has been removed from aliases file)
            }
            featureString = featureString + "And the datastore contains a product spec with ID \"" + productSpecAliasId + "\"\n\n\t";

            featureString += this.writeProductToProductTable(this.specificationTree);


            //Request
            featureString += "\n\n\t#---------- Request ---------------------\n\t";
            featureString += "Scenario:\n\t\t";
            featureString += this.scenario + "\n\n\t\t";
            featureString += "Given an \"Product Candidate\" JSON request that is populated from \"" + this.requestPath + "\n\t\t";
            featureString += "And that \"request\" contains a \"ProductCandidate\"\n\n\t\t";
            featureString += "And that \"request\" contains an \"ProductCandidate\"\n\t\t";
            featureString += "And that \"ProductCandidate\" has the following properties:\n\t\t";
            //Need aliases for candidate
            //console.log(this.dataGenerationService.generateTransformedCandidateTree(this.candidateTree, null, true));

            console.log(this.candidateTree);

            console.log(featureString);
            return featureString;
        }

        private writeProductToProductTable(specificationTree: data.IInstanceNode): string {
            var table: Array<Array<string>> = [];

            var tableHeaders: Array<string> = this.tableHeaders.ProductToProduct;
            var tableContent = this.generateTableContent(specificationTree, "ProductSpec");

            table.push(tableHeaders);
            table = table.concat(tableContent);

            var productToProductString: string = "";

            var tableString = this.writeTableStringFromArray(table, "\t\t");
            if (tableString != "") {
                productToProductString += "And the \"Product_To_Product\" contains the following instances:\n";
                productToProductString += tableString
            }

            return productToProductString;
        }

        private generateTableContent(specificationTree: data.IInstanceNode, parentContextName: string): Array<Array<string>> {
            var self = this;
            var table: Array<Array<string>> = [];

            for (var childIdx = 0; childIdx < specificationTree.children.length; childIdx++) {
                var child: data.IInstanceNode = specificationTree.children[childIdx];

                var aliasName: string = this.getKeyByValue(self.aliases, child.guid);

                if (child.parentRelationship == "Product_To_Product") {
                    var row: Array<string> = [parentContextName, aliasName, child.cardinality.min, child.cardinality.max, aliasName.concat("Item"), "Product"];
                    table.push(row);

                    var childRows: Array<Array<string>> = this.generateTableContent(child, aliasName.concat("Item"));
                    for (var i = 0; i < childRows.length; i++) table.push(childRows[i]);
                }
            }

            return table;
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
                        stringAsArray[rowIdx] = stringAsArray[rowIdx].concat("\xa0");

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