define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	  var account = Backbone.Model.extend({	
		  url:	window.fuse.services.accounts,
	      defaults: {
	    	  name: "",
	    	  hostName: "",
	    	  port: 0,
	    	  serverType: "",
	    	  ssl: false,
	    	  username: "",
	    	  timeout: 60,
	    	  address: "",
	    	  password: "",
	    	  defaultAccount: false
	      }
	  });
	
	  return account;
});
