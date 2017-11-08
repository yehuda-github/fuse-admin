// Filename: app.js
define([
  'libs/modernizr-2.5.3.min',
  'libs/boilerplate-plugins',
  'libs/json2',
  'jquery',
  'libs/pubSub',
  'underscore',
  'backbone',
  'libs/backbone-nested',
  'libs/Backbone.dispose',
  'models/fetcher.model',
  'router'
], function(modernizr, boilerplatePlugins, json2, $, pubSub, _, Backbone, backboneNested, 
			backboneDispose, fetcher, Router) {
	
    var initialize = function () {
        // Pass in our Router module and call it's initialize function
        Router.initialize();
    };

    return {
        initialize: initialize
    };
});
