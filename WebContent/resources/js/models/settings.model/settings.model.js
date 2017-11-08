define([
    'jquery',
	'underscore',
	'backbone',
	'collections/settings.collection/accounts.collection'
], function ($, _, Backbone, accountsCollection) {
	  var settings = Backbone.Model.extend({
		  url: window.fuse.services.settings,
		  
	      defaults: {
	    	  shouldSendMailFromPrimary: true,
	    	  accounts: null
	      }
	  });
	  
	  return settings;
});

