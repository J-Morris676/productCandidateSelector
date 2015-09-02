/// <reference path="../../../typings/lodash/lodash.d.ts" />

/// <reference path="../../interfaces/data.ts" />
/// <reference path="types.ts" />

/// <reference path="steps/stepBuilderService.ts"/>
/// <reference path="steps/tableSteps/instanceTableService.ts"/>
/// <reference path="steps/tableSteps/propertyTableService.ts"/>
/// <reference path="featureBuilderUtils.ts"/>

/// <reference path="../../modules/InstanceTreeUtilities.ts" />

module app.services.featureBuilderServices {
    'use strict';

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

        static $inject = ["dataGenerationService", "stepBuilderService", "instanceTableService", "propertyTableService", "featureBuilderUtils"];
        constructor(public dataGenerationService: any,
                    public stepBuilderService: stepBuilderServices.stepBuilderService,
                    public instanceTableService: instanceTableServices.instanceTableService,
                    public propertyTableService: propertyTableServices.propertyTableService,
                    public featureBuilderUtils: featureBuilderUtils.featureBuilderUtils) { }

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
            var stepBuilderService: stepBuilderServices.stepBuilderService = this.stepBuilderService;
            var featureBuilderUtils: featureBuilderUtils.featureBuilderUtils = this.featureBuilderUtils;

            var aliasFile: featureTypes.IAliasFileLocation = featureBuilderUtils.splitAliasPath(this.aliasPath);
            var productSpecAliasId = featureBuilderUtils.getKeyByValue(this.aliases, this.specificationTree.guid);
            if (productSpecAliasId == null) {
                alert("Error: Product specification alias couldn't be found.");
            }

            stepBuilderService.resetSteps();

            //Single line steps:
            var storyNoAndDependencies = "#" + this.storyNo + "\n@:CommonSteps";
            var featureDescriptionStep = "Feature:\n\t" + featureBuilderUtils.wrapString(this.feature, 110, "\t");
            var featureBackgroundStep = "Background:";
            var runningServerStep = "Given a running server populated from \"" + this.dataPath;
            var aliasFileStep = "And the aliases for Feature \"" + aliasFile.fileName + "\" loaded from \"" + aliasFile.pathToFile + "\"\n\t\t";
            var dataStoreStep = "And the datastore contains a product spec with ID \"" + productSpecAliasId + "\"";

            var requestComment = "#---------- Request ---------------------\t\t";
            var scenarioStep = "Scenario:\n\t\t\t" + featureBuilderUtils.wrapString(this.scenario, 110, "\t\t\t");
            var jsonRequestLoadStep = "Given a \"ProductCandidate\" JSON request that is populated from \"" + this.requestPath + "\"";
            var requestContainsStep = "And that \"request\" contains a \"ProductCandidate\""

            //Table (and their resulting context) steps:
            var product_To_ProductTableAndContext: featureTypes.ITableAndContextNodes = this.getProduct_To_ProductTableAndContext();
            var requestPropertiesTable: string = this.getRequestPropertiesTable();
            var childEntityTableAndContext: featureTypes.ITableAndContextNodes = this.getRequestChildEntitiesTable();
            var characteristicUseTableAndContext: featureTypes.ITableAndContextNodes = this.getRequestCharactertisticUseTable(childEntityTableAndContext.contextNodes);
            var characteristicValueTableAndContext: featureTypes.ITableAndContextNodes = this.getRequestCharacteristicUseValueTable(characteristicUseTableAndContext.contextNodes);
            var configuredValueTableAndContext: featureTypes.ITableAndContextNodes = this.getRequestConfiguredValueTable(childEntityTableAndContext.contextNodes);
            var configuredValueValuesTableAndContext: featureTypes.ITableAndContextNodes = this.getRequestConfiguredValueValuesTable(configuredValueTableAndContext.contextNodes);

            //Specification:
            stepBuilderService
                .addStep(0, storyNoAndDependencies, 2)
                .addStep(0, featureDescriptionStep, 2)
                .addStep(1, featureBackgroundStep, 1)
                .addStep(2, runningServerStep, 1)
                .addStep(2, aliasFileStep, 1)
                .addStep(2, dataStoreStep, 2)
                .addStep(2, product_To_ProductTableAndContext.table.string, 2);

            //Request:
            stepBuilderService
                .addStep(2, requestComment, 1)
                .addStep(2, scenarioStep, 2)
                .addStep(3, jsonRequestLoadStep, 2)
                .addStep(3, requestContainsStep, 2)
                .addStep(3, requestPropertiesTable, 2)
                .addStep(3, childEntityTableAndContext.table.string, 2)
                .addStep(3, characteristicUseTableAndContext.table.string, 2)
                .addStep(3, characteristicValueTableAndContext.table.string, 2)
                .addStep(3, configuredValueTableAndContext.table.string, 2)
                .addStep(3, configuredValueValuesTableAndContext.table.string, 0);

            return stepBuilderService.getSteps();
        }


        private getProduct_To_ProductTableAndContext(): featureTypes.ITableAndContextNodes {
            var requestTableProductToProductInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                mustEqualRule: {
                    "property": "parentRelationship",
                    "value": "Product_To_Product"
                },
                selector: "Product",
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "Product.Element_Guid", useAlias: true},
                    {"propertyName": "cardinality.min", "outputPropertyName": "Min_Occurs", useAlias: false},
                    {"propertyName": "cardinality.max", "outputPropertyName": "Max_Occurs", useAlias: false}
                ]
            };

            return this.instanceTableService.writeInstancesTableFromRoot(this.specificationTree, this.aliases, "\t\t", "Product_To_Product", "ProductSpec", requestTableProductToProductInstances);
        }

        private getRequestPropertiesTable(): string {
            var requestTableProperties: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID"},
                    {"propertyName": "guid", "outputPropertyName": "EntityID"}
                ]
            };

            return this.propertyTableService.writePropertiesTable(this.candidateTree, this.aliases, "ProductCandidate", "\t\t\t", requestTableProperties);
        }

        private getRequestChildEntitiesTable(): featureTypes.ITableAndContextNodes {
            var requestTableChildEntityInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isLaunchEntity,
                properties: [
                    {"propertyName": "nodeGuid", "outputPropertyName": "ID", useAlias: true},
                    {"propertyName": "guid", "outputPropertyName": "EntityID", useAlias: true}
                ]
            };

            var childEntityTableAndContext: featureTypes.ITableAndContextNodes = this.instanceTableService.writeInstancesTableFromRoot(this.candidateTree, this.aliases, "\t\t\t", "ChildEntity", "ProductCandidate", requestTableChildEntityInstances);
            childEntityTableAndContext.contextNodes.unshift({"contextName": "ProductCandidate", node: this.candidateTree});

            return childEntityTableAndContext;
        }

        private getRequestCharactertisticUseTable(contextNodes: Array<featureTypes.IContextNode>): featureTypes.ITableAndContextNodes {
            var requestTableCharacteristicUseInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.hasAddedCharacteristics,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "CharacteristicID", useAlias: true},
                    {"propertyName": "useArea", "outputPropertyName": "UseArea", useAlias: false}
                ]
            };

            return this.instanceTableService.writeInstancesTableFromArray(contextNodes, this.aliases, "\t\t\t", "CharacteristicUse", requestTableCharacteristicUseInstances);
        }

        private getRequestCharacteristicUseValueTable(contextNodes: Array<featureTypes.IContextNode>): featureTypes.ITableAndContextNodes {
            var requestTableValueInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isAnAddedCharacteristic,
                omitContextName: true,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "ValueID", useAlias: true},
                    ]
            };

            return this.instanceTableService.writeInstancesTableFromArray(contextNodes, this.aliases, "\t\t\t", "Value", requestTableValueInstances);
        }

        private getRequestConfiguredValueTable(contextNodes: Array<featureTypes.IContextNode>): featureTypes.ITableAndContextNodes {
            var requestTableConfiguredValueInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isEnteredUDCNode,
                properties: [
                    {"propertyName": "guid", "outputPropertyName": "CharacteristicID", useAlias: true},
                    {"propertyName": "useArea", "outputPropertyName": "UseArea", useAlias: false}
                ]
            };

            return this.instanceTableService.writeInstancesTableFromArray(contextNodes, this.aliases, "\t\t\t", "ConfiguredValue", requestTableConfiguredValueInstances);
        }

        private getRequestConfiguredValueValuesTable(contextNodes: Array<featureTypes.IContextNode>): featureTypes.ITableAndContextNodes {
            var requestTableValueInstances: featureTypes.IPropertyValues = {
                evaluateTrueRule: InstanceTreeUtilities.isEnteredUDCNode,
                omitContextName: true,
                properties: [
                    {"propertyName": "value", "outputPropertyName": "Value", useAlias: false},
                ]
            };

            return this.instanceTableService.writeInstancesTableFromArray(contextNodes, this.aliases, "\t\t\t", "Value", requestTableValueInstances);
        }
    }
}