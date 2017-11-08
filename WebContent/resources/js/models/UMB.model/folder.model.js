define([
    'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	  var folder = Backbone.Model.extend({
		  //urlRoot: window.fuse.services.folders,
		  url: function() {
			 //var base = this.urlRoot() || (this.collection && this.collection.url()) || "/";
			  
			  
			  if(this.get("isDelete")) 
				  return window.fuse.services.deleteFolder();
			  
			 var base = window.fuse.services.folders();
			 if (this.isNew()) return base;
			 return base + "?alias=" + encodeURIComponent(this.get("alias"));
		  },
		  
		  
	      defaults: {
	          "alias": "",
	          "name": "",
	          "color": null,
	          "unreadCount": 0,
	          "account": null,
	          "isSystem": false,
	          "id":null
	      },
	      
	      initialize: function() {
	    	  
	    	  this.set("id", this.get("alias"));
	    	  this.on("change:alias", function() {
	    		  this.set("id", this.get("alias"));
	    	  }, this);
	    	  
	    	  
	    	  $.subscribe("/folders/addUnreadCount/", $.proxy(function(e, alias, unreadCount) {
    			if(this.get("alias") === alias) {
    				var _val = this.get("unreadCount") + unreadCount;
    				this.set("unreadCount", _val);
    			}
	    	  }, this));
	    	  
	    	  /*
	    	  $.subscribe("/folders/subtractUnreadCount/", $.proxy(function(e, alias, unreadCount) {
	    			if(this.get("alias") === alias) {
	    				var _val = this.get("unreadCount") + unreadCount;
	    				this.set("unreadCount", _val);
	    			}
		      }, this));
		      */
	      }	      
	  });
	  	  
	  return folder;
});
