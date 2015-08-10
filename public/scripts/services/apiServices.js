/**
 * Created by JamieM on 21/07/2015.
 */
/// <reference path="../../typings/angular/angular-resource.d.ts" />
/// <reference path="../interfaces/data.ts" />
var app;
(function (app) {
    var services;
    (function (services) {
        var apiServices;
        (function (apiServices) {
            'use strict';
            var GetService = (function () {
                function GetService($http, $q) {
                    var _this = this;
                    this.datasets = function () {
                        return _this.$http.get("/api/data");
                    };
                    this.instances = function (storyNo) {
                        return _this.$http.get("/api/data/" + storyNo + "/instances");
                    };
                    this.relationships = function (storyNo) {
                        return _this.$http.get("/api/data/" + storyNo + "/relationships");
                    };
                    this.$http = $http;
                    this.$q = $q;
                }
                return GetService;
            })();
            apiServices.GetService = GetService;
            var exportService = (function () {
                function exportService($http, $q) {
                    var _this = this;
                    this.postCandidate = function (candidate) {
                        return _this.$http.post("/api/candidateTrees", candidate);
                    };
                    this.downloadCandidateFile = function (candidateId, format) {
                        var downloadFrame = document.getElementById('download-frame');
                        downloadFrame.setAttribute("src", "/api/candidateTrees/" + candidateId + "?format=" + format);
                    };
                    this.$http = $http;
                    this.$q = $q;
                }
                return exportService;
            })();
            apiServices.exportService = exportService;
        })(apiServices = services.apiServices || (services.apiServices = {}));
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=apiServices.js.map