/**
 * Created by JamieM on 21/07/2015.
 */
/// <reference path="../../typings/angular/angular-resource.d.ts" />
/// <reference path="../interfaces/data.ts" />
var app;
(function (app) {
    var services;
    (function (services) {
        'use strict';
        var InstancesService = (function () {
            function InstancesService($http, $q) {
                var _this = this;
                this.getInstances = function () {
                    return _this.$http.get("/api/docs/instances");
                };
                this.$http = $http;
                this.$q = $q;
            }
            return InstancesService;
        })();
        services.InstancesService = InstancesService;
        var RelationshipsService = (function () {
            function RelationshipsService($http, $q) {
                var _this = this;
                this.getRelationships = function () {
                    return _this.$http.get("/api/docs/relationships");
                };
                this.$http = $http;
                this.$q = $q;
            }
            return RelationshipsService;
        })();
        services.RelationshipsService = RelationshipsService;
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
        services.exportService = exportService;
    })(services = app.services || (app.services = {}));
})(app || (app = {}));
//# sourceMappingURL=apiServices.js.map