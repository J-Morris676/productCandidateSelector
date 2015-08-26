/// <reference path="../typings/angular/angular.d.ts" />

/// <reference path="ModuleBuilder.ts" />


var appModule = angular.module("app", ['ngResource', 'ngAnimate', 'ui.bootstrap']);

new moduleBuilder.ModuleBuilder(appModule)
    .initServices()
    .initFilters()
    .initControllers()
    .initDirectives();