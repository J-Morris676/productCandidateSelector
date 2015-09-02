/// <reference path="../../interfaces/data.ts" />

module featureTypes {
    export interface IProperty {
        propertyName: string;
        outputPropertyName:string;
        useAlias?: boolean;
    }

    export interface IPropertyValues {
        mustEqualRule?: {
            property: string;
            value: string;
        };
        omitContextName?: boolean;
        evaluateTrueRule?: (node: data.IInstanceNode) => boolean;
        selector?: string;
        properties: [IProperty];
    }

    export interface IContextNode {
        contextName: string;
        node: data.IInstanceNode;
    }

    export interface ITableAndContextNodes {
        table: {
            structured: Array<Array<string>>;
            string?: string;
        }
        contextNodes: Array<IContextNode>;
    }

    export interface IAliasFileLocation {
        fullPath: string;
        fileName: string;
        pathToFile: string;
    }

    export interface steps {steps: string;}
}
