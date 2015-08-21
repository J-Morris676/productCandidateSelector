/**
 * Created by JamieM on 21/07/2015.
 */

/// <reference path="../../typings/angular/angular-resource.d.ts" />
/// <reference path="../interfaces/data.ts" />


module app.services.apiServices {
    'use strict';

    export class GetService
    {
        $http:ng.IHttpService;
        $q:ng.IQService;

        constructor($http:ng.IHttpService, $q:ng.IQService)
        {
            this.$http = $http;
            this.$q = $q;
        }

        datasets = (): ng.IPromise<string[]> => {
            return this.$http.get("/api/data");
        }

        instances = (storyNo: string):ng.IPromise<data.IInstances> =>
        {
            return this.$http.get("/api/data/" + storyNo + "/instances")
        };

        relationships = (storyNo: string):ng.IPromise<data.IRelationships> => {
            return this.$http.get("/api/data/" + storyNo + "/relationships")
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
            var downloadFrame = document.getElementById('candidate-download-frame');
            downloadFrame.setAttribute("src", "/api/candidateTrees/" + candidateId + "?format=" + format)
        };

        postAliases = (aliases: data.IAliases):ng.IPromise<any> => {
            return this.$http.post("/api/aliases", aliases)
        };

        downloadAliasesFile = (aliasId: number):void => {
            var downloadFrame = document.getElementById('aliases-download-frame');
            downloadFrame.setAttribute("src", "/api/aliases/" + aliasId)
        };
    }
}