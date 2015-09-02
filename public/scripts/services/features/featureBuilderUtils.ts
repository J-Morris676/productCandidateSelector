/// <reference path="types.ts" />

module app.services.featureBuilderUtils {
    export class featureBuilderUtils {
        public writeTableStringFromArray(table: Array<Array<string>>, tabs: string): string {
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

        public getKeyByValue(object, value): string {
            for( var property in object ) {
                if( object.hasOwnProperty( property ) ) {
                    if( object[ property ] === value )
                        return property;
                }
            }
        }

        public wrapString(paragraph:string, lineLength: number, tabs: string): string {
            var newLineMatcher = new RegExp(".{" + lineLength + "}\\s","g");
            return paragraph.replace(newLineMatcher, "$&" + "\n" + tabs);
        }

        public splitAliasPath(aliasPath: string): featureTypes.IAliasFileLocation {
            var fileNameIndex = aliasPath.split("/").length-1;
            var fileName = aliasPath.split("/")[fileNameIndex];
            var filePath = aliasPath.split("/").slice(0, fileNameIndex).join("/");

            return {fullPath: aliasPath, fileName: fileName, pathToFile: filePath};
        }
    }
}