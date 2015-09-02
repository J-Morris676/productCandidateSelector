/// <reference path="../../../../interfaces/data.ts" />
/// <reference path="../../../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../featureBuilderUtils.ts" />
/// <reference path="../../types.ts" />

module app.services.propertyTableServices {
    export class propertyTableService {

        static $inject = ["featureBuilderUtils"];
        constructor(public featureBuilderUtilities: featureBuilderUtils.featureBuilderUtils) { }

        public writePropertiesTable(tree: data.IInstanceNode, aliases: data.IAliases, rootElementName: string, tabs:string, propertyValues: featureTypes.IPropertyValues): string {
            var table: Array<Array<string>> = [];
            var properties = propertyValues.properties;

            var tableHeaders: Array<string> = ["Property", "Value"];

            table.push(tableHeaders);

            for (var propertyIdx = 0; propertyIdx < properties.length; propertyIdx++) {
                table = table.concat(this.generatePropertiesTableContent(tree, aliases, properties[propertyIdx]));
            }

            var propertyValueString: string = "";

            var tableString = this.featureBuilderUtilities.writeTableStringFromArray(table, tabs);
            if (tableString!="") {
                propertyValueString = "And that \"" + rootElementName + "\" has the following properties:\n";
                propertyValueString += tableString;
            }

            return propertyValueString;
        }

        private generatePropertiesTableContent(tree: data.IInstanceNode, aliases: data.IAliases, property: featureTypes.IProperty): Array<Array<string>> {
            var table: Array<Array<string>> = [];

            var aliasName: string = this.featureBuilderUtilities.getKeyByValue(aliases, tree[property.propertyName]);
            table.push([property.outputPropertyName, aliasName]);

            return table;
        }

    }
}