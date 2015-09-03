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
        BUID?: string;
        parentRelationship?: string;
        schemaElementGuid?: string;
        children: Array<IInstanceNode>;
        elementHierarchy: string;
        useArea?: string;
        cardinality: ICardinality;
        groupCardinality: ICardinality;
    }

    export interface ICardinality {
        min: string;
        max: string;
    }

    export interface ISelectableCharInstanceNode extends IInstanceNode{
        checked?: boolean;
    }

    export interface ISelectableUDCInstanceNode extends IInstanceNode{
        value?: string;
    }

    export interface ICandidateExportNode {
        _IsNewForCustomer: boolean;
        ID: string;
        EntityID: string;
        ChildEntity: ICandidateExportNode;
        CharacteristicUse?: any;
        ConfiguredValue?: any;
        text?: any;

        CharacteristicID?: string;
    }

    export interface IAliases {
        [name: string]: string;
    }

    export interface IFeature {
        storyNo: string;
        aliases: IAliases;
        specificationTree: IInstanceNode;
        candidateTree: IInstanceNode;

        description: string;
        dataPath: string;
        aliasPath: string;
        scenario: string;
        requestPath: string;
    }
}
