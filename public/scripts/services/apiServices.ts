/**
 * Created by JamieM on 21/07/2015.
 */

/// <reference path="../../typings/angular/angular-resource.d.ts" />
/// <reference path="../interfaces/data.ts" />


module app.services.apiServices {
    'use strict';

    export class InstancesService
    {
        $http:ng.IHttpService;
        $q:ng.IQService;

        constructor($http:ng.IHttpService, $q:ng.IQService)
        {
            this.$http = $http;
            this.$q = $q;
        }

        getInstances = ():ng.IPromise<data.IInstances> =>
        {
            return this.$http.get("/api/data/59340/instances")
        };
    }

    export class RelationshipsService
    {
        $http:ng.IHttpService;
        $q:ng.IQService;

        constructor($http:ng.IHttpService, $q:ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }

        getRelationships = ():ng.IPromise<data.IRelationships> => {
            return this.$http.get("/api/data/59340/relationships")
        };
    }

    export class exportService
    {
        $http:ng.IHttpService;
        $q:ng.IQService;

        constructor($http:ng.IHttpService, $q:ng.IQService) {
            this.$http = $http;
            this.$q = $q;
        }

        postCandidate = (candidate: data.ICandidateExportNode):ng.IPromise<data.IRelationships> => {
            return this.$http.post("/api/candidateTrees", candidate)
        };

        downloadCandidateFile = (candidateId: number, format: string):void => {
            var downloadFrame = document.getElementById('download-frame');
            downloadFrame.setAttribute("src", "/api/candidateTrees/" + candidateId + "?format=" + format)
        };
    }
}