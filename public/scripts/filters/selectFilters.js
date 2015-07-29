/// <reference path="../interfaces/data.ts" />
var app;
(function (app) {
    var filters;
    (function (filters) {
        'use strict';
        function insertUnique(uniqueList, element) {
            for (var i = 0; i < uniqueList.length; i++) {
                if (uniqueList[i].value == element.value) {
                    return;
                }
            }
            uniqueList.push(element);
        }
        function elementKindUniqueFilter() {
            return function (instances) {
                var uniqueElementKind = [];
                for (var instance in instances) {
                    var metaValue = instances[instance]["Meta"][0].Value;
                    insertUnique(uniqueElementKind, { guid: instance, value: metaValue });
                }
                return uniqueElementKind;
            };
        }
        filters.elementKindUniqueFilter = elementKindUniqueFilter;
        function nameByElementKindFilter() {
            return function (instances, element) {
                var uniqueElementNames = [];
                for (var instance in instances) {
                    var metaValue = instances[instance]["Meta"][0].Value;
                    if (metaValue == element.value) {
                        for (var dataIndex = 0; dataIndex < instances[instance]["Data"].length; dataIndex++) {
                            var dataName = instances[instance]["Data"][dataIndex].Name;
                            var dataValue = instances[instance]["Data"][dataIndex].Value;
                            if (dataName == "Name") {
                                insertUnique(uniqueElementNames, { guid: instance, value: dataValue });
                            }
                        }
                    }
                }
                return uniqueElementNames;
            };
        }
        filters.nameByElementKindFilter = nameByElementKindFilter;
    })(filters = app.filters || (app.filters = {}));
})(app || (app = {}));
//# sourceMappingURL=selectFilters.js.map