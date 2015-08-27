/// <reference path="../interfaces/data.ts" />
/// <reference path="../modules/InstanceTreeUtilities.ts" />

module app.services.dataGenerationServices {
    'use strict';

    export class dataGenerationService {
        private instances: data.IInstances;
        private relationships: data.IRelationships;

        constructor() {}

        public setInstances(instances: data.IInstances) {
            this.instances = instances;
        }
        public setRelationships(relationships: data.IRelationships) {
            this.relationships = relationships;
        }

        public generateSpecificationTreeData(parentToChildRelationship: data.IRelationship, guid: string): data.IInstanceNode {
            var instance: data.IInstance = this.instances[guid];
            var instanceAsObjects: data.IInstanceObject = this.convertInstanceObjectArraysToObjects(instance);

            var instanceMeta = instanceAsObjects.Meta;
            var instanceData = instanceAsObjects.Data;

            var children: data.IRelationship[] = this.relationships[guid] || [];

            var node: data.IInstanceNode = {
                type: instanceMeta.ElementKind,
                name: null,
                text: instanceMeta.ElementKind,
                guid: guid,
                children: Array<data.IInstanceNode>(),
                cardinality: null,
                groupCardinality: null,
                elementHierarchy: instanceMeta.ElementHierarchy
            };

            if (instanceData.Business_ID != null)
                node.BUID = instanceData.Business_ID;
            if (instanceData.SchemaElementGuid != null)
                node.schemaElementGuid = instanceData.SchemaElementGuid;

            if (instanceMeta.ElementHierarchy.indexOf("Launch_Entity") != -1) {
                this.nameNodeForLaunchEntity(node, instanceData.Name);
                node.groupCardinality = this.findGroupCardinality(children);
            }
            else if(instanceMeta.ElementKind == "TSpecCharUse") {
                node.text = instanceData.Description;
                node.useArea = parentToChildRelationship.Kind;
                node.cardinality = {
                    max: instanceData.Max_Occurs || "1",
                    min: instanceData.Min_Occurs
                };
            }
            else if (instanceMeta.ElementKind == "TOrderChar") {
                node.text = instanceData.Name;
            }
            else if (instanceMeta.ElementKind == "TSpecCharValue") {
                node.text = instanceData.Value;
            }
            else if (instanceMeta.ElementKind == "TUserDefinedCharacteristicValue") {
                node.text = instanceData.Name;
            }
            else if (instanceMeta.ElementKind == "TSpecChar") {
                node.text = instanceData.Name;
            }

            for (var childIndex = 0; childIndex < children.length; childIndex++) {
                var childInstance: data.IInstance = this.instances[children[childIndex].Child];
                var childInstanceAsObjects: data.IInstanceObject = this.convertInstanceObjectArraysToObjects(childInstance);

                var childInstanceMeta = childInstanceAsObjects.Meta;
                var childInstanceData = childInstanceAsObjects.Data;

                var childHierarchyPath:string = childInstanceMeta.ElementHierarchy;
                var childExplicitType:string = this.findHierarchyType(childHierarchyPath);

                if (childExplicitType  == "Relation_Entity") {
                    if (this.isInDate(new Date(childInstanceData.Association_Start_Date), new Date(childInstanceData.Association_End_Date))) {
                        var grandchildGuid: string = this.relationships[children[childIndex].Child][0].Child;
                        var grandchild: data.IInstanceNode = this.generateSpecificationTreeData(children[childIndex], grandchildGuid);
                        grandchild.parentRelationship = children[childIndex].Kind;

                        grandchild.cardinality = {
                            max: childInstanceData.Max_Occurs,
                            min: childInstanceData.Min_Occurs
                        };
                        grandchild.text = grandchild.text + " (" + grandchild.cardinality["min"] + ":" + grandchild.cardinality["max"] + ")";

                        node.children.push(grandchild);
                    }
                }
                else {
                    var builtChild: data.IInstanceNode = this.generateSpecificationTreeData(children[childIndex], children[childIndex].Child);
                    builtChild.parentRelationship = children[childIndex].Kind;
                    node.children.push(builtChild);
                }

            }

            return node;
        }


        public generateTransformedCandidateTree(treeNode: any, parentNode:data.ICandidateExportNode, ignoreErrors: boolean): data.ICandidateExportNode {
            if (InstanceTreeUtilities.isUDCNode(treeNode)) {
                if (treeNode.children.length == 0 ) {
                    return null;
                }
                else if (treeNode.children[0].value == null) {
                    if (!ignoreErrors)
                        throw new Error("Error: UDC '" + treeNode.text + "' has not been set a value\n");
                }
                else {
                    var useArea: string = "";

                    var specCharRelationships: [data.IRelationship] = this.relationships[parentNode.EntityID];

                    for (var relationship = 0; relationship < specCharRelationships.length; relationship++) {
                        if (specCharRelationships[relationship].Child == treeNode.guid) {
                            useArea = specCharRelationships[relationship].Kind;
                        }
                    }

                    var ConfiguredValue = {
                        UseArea: useArea,
                        CharacteristicID: treeNode.children[0].guid,
                        Value: [
                            {"Value": treeNode.children[0].value}
                        ]
                    };
                    if (parentNode.ConfiguredValue == null) {
                        parentNode.ConfiguredValue = [ConfiguredValue];
                    }
                    else {
                        parentNode.ConfiguredValue.push(ConfiguredValue);
                    }

                }
            }
            else if (InstanceTreeUtilities.isCharacteristicNode(treeNode)) {
                var useArea: string = "";

                var specCharRelationships: [data.IRelationship] = this.relationships[parentNode.EntityID];

                for (var relationship = 0; relationship < specCharRelationships.length; relationship++) {
                    if (specCharRelationships[relationship].Child == treeNode.guid) {
                        useArea = specCharRelationships[relationship].Kind;
                    }
                }

                var CharacteristicUse = {
                    "UseArea": useArea,
                    "CharacteristicID": this.relationships[treeNode.children[0].guid][0].Child,
                    "Value":  []
                };

                for (childIndex = 0; childIndex < treeNode.children.length; childIndex++) {
                    var child: data.ISelectableCharInstanceNode = treeNode.children[childIndex];

                    if (child.checked == true) {
                        CharacteristicUse.Value.push({ValueID: child.guid});
                    }
                }

                if (InstanceTreeUtilities.isCharacteristicUseBetweenCardinality(treeNode)) {
                    if (CharacteristicUse.Value.length > 0) {
                        if (parentNode.CharacteristicUse == null) {
                            parentNode.CharacteristicUse = [CharacteristicUse]
                        }
                        else {
                            parentNode.CharacteristicUse.push(CharacteristicUse);
                        }
                    }
                }
                else {
                    if (!ignoreErrors)
                        throw new Error("Error: '" + treeNode.text + "' is not between cardinality\n"
                            + "Cardinality: " + treeNode.cardinality.max + ":" + treeNode.cardinality.min + "\n"
                            + "Characteristic values: " + CharacteristicUse.Value.length);
                }

                return null;
            }
            else {
                var newNode: data.ICandidateExportNode = {
                    ID: treeNode.nodeGuid,
                    EntityID: treeNode.guid,
                    _IsNewForCustomer: true,
                    ChildEntity: treeNode.children
                };

                treeNode = newNode;

                for (var childIndex = 0; childIndex < treeNode.ChildEntity.length; childIndex++) {
                    var childNode = this.generateTransformedCandidateTree(treeNode.ChildEntity[childIndex], treeNode, ignoreErrors);

                    if (childNode != null) {
                        treeNode.ChildEntity[childIndex] = childNode;
                    }
                    else {
                        treeNode.ChildEntity.splice(childIndex, 1);
                        childIndex--;
                    }
                }

                return treeNode;
            }
        }

        private findGroupCardinality(entityRelationChildren: data.IRelationship[]): data.ICardinality {
            var cardinality: data.ICardinality = null;

            for (var childIndex = 0; childIndex < entityRelationChildren.length; childIndex++) {
                if (entityRelationChildren[childIndex].Kind == "TChild_Group_Cardinality_Rule") {
                    var instance = this.instances[entityRelationChildren[childIndex].Child];
                    var instanceAsObjects = this.convertInstanceObjectArraysToObjects(instance);

                    cardinality = {
                        "max": instanceAsObjects.Data.Maximum_Child_Elements,
                        "min": instanceAsObjects.Data.Minimum_Child_Elements
                    };

                    break;
                }
            }
            return cardinality;
        }


        private findHierarchyType(path: string): string {
            var finalSlashIndex: number = path.lastIndexOf("/");
            var explicitType: string = path.substring(finalSlashIndex + 1);
            return explicitType;
        }

        private isInDate(startDate: Date, endDate: Date): boolean {
            var todaysDate: Date = new Date();

            if (endDate.valueOf() == 0) {
                return true;
            }
            else if (todaysDate > startDate  && todaysDate < endDate) {
                return true
            }
            return false;
        }

        private convertInstanceObjectArraysToObjects(instance: data.IInstance): data.IInstanceObject {
            var meta = instance.Meta;
            var data = instance.Data;

            var instanceObject: data.IInstanceObject = {
                Meta: {
                    ElementKind: null,
                    ElementHierarchy: null
                },
                Data: {}
            };

            for (var metaIndex = 0; metaIndex < meta.length; metaIndex++) {
                instanceObject.Meta[meta[metaIndex].Name] = meta[metaIndex].Value;
            }

            for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
                instanceObject.Data[data[dataIndex].Name] = data[dataIndex].Value;
            }

            return instanceObject;
        }

        private nameNodeForLaunchEntity(node: data.IInstanceNode, name: string) {
            node.name = name;
            node.text = node.text + " - " + name;
        }
    }
}