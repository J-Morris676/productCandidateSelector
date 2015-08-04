/// <reference path="../interfaces/data.ts" />

module app.services.dataGenerationServices {
    'use strict';

    export class specificationTreeDataGenerationService {
        private instances: data.IInstances;
        private relationships: data.IRelationships;

        constructor() {}

        public setInstances(instances: data.IInstances) {
            this.instances = instances;
        }
        public setRelationships(relationships: data.IRelationships) {
            this.relationships = relationships;
        }

        public generateSpecificationTreeData(guid: string): data.IInstanceNode {
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
                elementHierarchy: instanceMeta.ElementHierarchy
            };

            if (instanceMeta.ElementHierarchy.indexOf("Launch_Entity") != -1) {
                this.nameNodeForLaunchEntity(node, instanceData.Name);
            }
            else if(instanceMeta.ElementKind == "TSpecCharUse") {
                node.text = instanceData.Description;
                node.cardinality = {
                    max: instanceData.Max_Occurs,
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
                        var grandchild: data.IInstanceNode = this.generateSpecificationTreeData(grandchildGuid);
                        grandchild.cardinality = {
                            max: childInstanceData.Max_Occurs,
                            min: childInstanceData.Min_Occurs
                        };
                        grandchild.text = grandchild.text + " (" + grandchild.cardinality["min"] + ":" + grandchild.cardinality["max"] + ")";

                        node.children.push(grandchild);
                    }
                }
                else {
                    node.children.push(this.generateSpecificationTreeData(children[childIndex].Child));
                }

            }

            return node;

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