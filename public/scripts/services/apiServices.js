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
            var InstancesService = (function () {
                function InstancesService($http, $q) {
                    var _this = this;
                    this.getInstances = function () {
                        return _this.$http.get("/api/data/instances");
                    };
                    this.$http = $http;
                    this.$q = $q;
                }
                return InstancesService;
            })();
            apiServices.InstancesService = InstancesService;
            var RelationshipsService = (function () {
                function RelationshipsService($http, $q) {
                    var _this = this;
                    this.getRelationships = function () {
                        return _this.$http.get("/api/data/relationships");
                    };
                    this.$http = $http;
                    this.$q = $q;
                }
                return RelationshipsService;
            })();
            apiServices.RelationshipsService = RelationshipsService;
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