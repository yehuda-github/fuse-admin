define([
    'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	  var contact = Backbone.Model.extend({
	      defaults: {
			//"id": "vancl@edm4.vancl.com",
			"type": "rfc822",
			"address": "vancl@edm4.vancl.com",
			"personal": "Vancl ????"
	      },
	      
	      initialize: function () {
	      }
	  });
	  
	  return contact;
});
