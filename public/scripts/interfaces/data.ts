module data {
    'use strict';

    export interface IInstance
    {
        Data: [ {
            Name: string;
            SchemaElementGuid: string;
            Type: string;
            Value: string;
        }];
        Meta: [{
            Name: string;
            Value: string;
        }]
    }

    export interface IInstances
    {
        [guid: string]: IInstance
    }

    export interface IRelationship
    {
        Child: string;
        Kind: string;
        SchemaElementGuid: string;
    }


    export interface IRelationships {
        [guid: string]: [IRelationship];
    }

    export interface IInstanceNode {
        type: string;
        text: string;
        name: string;
        guid: string;
        nodeGuid?: string;
        children: Array<IInstanceNode>;
        cardinality: {
            min: string;
            max: string;
        }
    }
}
