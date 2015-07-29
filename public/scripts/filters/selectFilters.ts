/// <reference path="../interfaces/data.ts" />

module app.filters {
    'use strict';

    interface IElement
    {
        guid: string;
        value: string;
    }

    function insertUnique(uniqueList: Array<IElement>, element: IElement): void
    {
        for (var i = 0; i < uniqueList.length; i++) {
            if (uniqueList[i].value == element.value) {
                return;
            }
        }
        uniqueList.push(element);
    }

    export function elementKindUniqueFilter()
    {
        return function(instances: data.IInstances): IElement[]
        {
            var uniqueElementKind: Array<IElement> = [];
            for (var instance in instances) {
                var metaValue: string = instances[instance]["Meta"][0].Value;

                insertUnique(uniqueElementKind, {guid: instance, value: metaValue});
            }
            return uniqueElementKind;
        }
    }

    export function nameByElementKindFilter()
    {
        return function(instances: data.IInstances, element: IElement): IElement[]
        {
            var uniqueElementNames: Array<IElement> = [];

            for (var instance in instances) {
                var metaValue: string = instances[instance]["Meta"][0].Value;

                if (metaValue == element.value) {
                    for (var dataIndex = 0; dataIndex < instances[instance]["Data"].length; dataIndex++) {
                        var dataName: string = instances[instance]["Data"][dataIndex].Name;
                        var dataValue: string = instances[instance]["Data"][dataIndex].Value;

                        if (dataName == "Name") {
                            insertUnique(uniqueElementNames, {guid: instance, value: dataValue});
                        }
                    }
                }
            }
            return uniqueElementNames;
        }
    }
}