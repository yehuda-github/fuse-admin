define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
	  var quota = Backbone.Model.extend({
	  		url: window.fuse.services.quota,
	  		
	  		defaults: {
                limit: 0,
                usage: 0
	  		},
	  		
	    	parse: function(rsponse) {		
	    		var _finalResponse = {};
	    		
	    		try {
	    			_finalResponse = { 
		    			limit: rsponse.folder.attributes.quotas[0].attributes.resources[0].limit,
		    			usage: rsponse.folder.attributes.quotas[0].attributes.resources[0].usage
		    		};
	    		}
	    		catch(err) {}
	    		
	    		return(_finalResponse);
	    	}
	  });
	  
	  return quota;
});
