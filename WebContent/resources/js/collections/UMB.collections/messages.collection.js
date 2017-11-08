define([
	  'jquery',
	  'underscore',
	  'backbone',
	  'paginator',
	  'models/UMB.model/message.model',
	], function ($, _, Backbone, paginator, message) {
    var messagesCollection = paginator.extend({
    	model: message,
    	router: window.fuse.router,  
    	routePageNumberFragment: "pageNumber",
    		
        paginator_core: {
            // the type of the request (GET by default)
            type: 'GET',

            // the type of reply (jsonp by default)
            dataType: 'json',

            // the URL (or base URL) for the service
            //url: "http://www.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=4ba2631bf6f32fa59067d3aacac5ce93&nojsoncallback=1"            	
            url: window.fuse.services.messages
        },
        
        paginator_ui: {
            // the lowest page index your API allows to be accessed
            firstPage: 1,

            // which page should the paginator start from 
            // (also, the actual page the paginator is on)
            currentPage: 1,

            // how many items per page should be shown
            perPage: 25,

            // a default number of total pages to query in case the API or 
            // service you are using does not support providing the total 
            // number of pages for us.
            // 10 as a default in case your service doesn't return the total
            totalPages: 1
        },
        
        server_api: {
            // the query field in the request
            //'$filter': '',

            // number of items to return per request/page
            //'$top': function() { return this.perPage; },

            // how many results the request should skip ahead to
            // customize as needed. For the Netflix API, skipping ahead based on
            // page * number of results per page was necessary.
            //'$skip': function() { return this.currentPage * this.perPage; },

            // field to sort by
            //'$orderby': 'ReleaseYear',

            // what format would you like to request results in?
            //'$format': 'json',
            
            // custom parameters
            //'$inlinecount': 'allpages',
            //'$callback': 'callback'
        	
           
            "per_page": function() { return this.perPage; },
        	"page": function() { return this.currentPage; },
            
            //"accountName": "SINGNET_2",
            //"folderPath": "INBOX"
            
            /*
            @RequestParam(value = "accountName", required=false) String pName,
			@RequestParam(value ="folderPath", required=false) String pFolderPath,
			@RequestParam(value ="sortCriteria", required=false) String pSortCriteria,
			@RequestParam(value ="sortReverse", required=false) Boolean pSortReverse,
			@RequestParam(value ="startRange", required=false) String pStartRange,
			@RequestParam(value ="endRange", required=false) String pEndRange,
			@RequestParam(value ="select", required=false) String pSelect,
			@RequestParam(value ="detailLevel", required=false)
			*/
        },
        
	    parse: function(response) {
	    	
	    	//console.log("response: ", response);
	    	if(response.photos) {
	    		response.messages = {};
	    		response.total = response.photos.total;
	    	}
	    	
	    	this.totalRecords = response.total;
	    	this.totalPages = Math.floor(response.total / this.perPage);
	    	
	    	return(response.messages);
	    }
    });
    
    return messagesCollection;
});
