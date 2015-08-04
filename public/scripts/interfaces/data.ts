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

    export interface IInstanceObject
    {
        Data: any;
        Meta: {
            ElementKind: string;
            ElementHierarchy: string;
        };
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
        elementHierarchy: string;
        cardinality: {
            min: string;
            max: string;
        }
    }

    export interface ISelectableCharInstanceNode extends IInstanceNode{
        checked?: boolean;
    }

    export interface ICandidateExportNode {
        _IsNewForCustomer: boolean;
        ID: string;
        EntityID: string;
        CharacteristicUse?: any
        ChildEntity: ICandidateExportNode;
    }
}
