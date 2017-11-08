define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/UMB.template/selectedFolderMessages.template/messagesPaginator.template.html'
], function ($, _, Backbone, messagesPaginatorTemplate) {
	
	var mode, currentId, currentModel, MODE_MESSAGE_ITEM, MODE_MESSAGE_LIST, currentIndex, nextMessageModel, prevMessageModel;
	
	MODE_MESSAGE_LIST = "messagesList";
	MODE_MESSAGE_ITEM = "messageItem";
	
	/*
	 * gets a model id and pass it to the router in order to render new message.
	 * */
	function navigate(modelID) {
		window.fuse.router.navigate("message/" + modelID, true);
	}
	
    var messagesPaginatorView = Backbone.View.extend({
    	el: ".paginator",
    	
        initialize: function() {
        	
        	mode = MODE_MESSAGE_LIST;
        	
        	$.subscribe('/messagesPaginator/onMessageItemChangePaginator', $.proxy(this.onMessageItemChangePaginator, this));
        },
        
        events: {
        	"click .prevPage": "paginatePrev",
        	"click .nextPage":  "paginateNext"
        },
        
        paginatePrev: function(e, isForce) {
        	
        	/*
        	 * we know the current page we are at.
        	 * we set this variable with the total number of items for previous pages only. 
        	 * 
        	 * */
        	var numOfItemsBeforeTheCurrentPage,
        		
        		// keep a reference for the current page number.
        		currentPage = this.collection.currentPage;
        	
        	
        	/*
        	 * we check which mode we are at, or we are force to 
        	 * fire the method the run the pager in the collection pages level. 
        	 * */
        	if (mode === MODE_MESSAGE_LIST || isForce === true) {
        			
        		this.collection.requestPreviousPage();
        	} 
        	else if (mode === MODE_MESSAGE_ITEM){
        		
        		// get the current index.
        		currentIndex = this.getModelIndex();
        		
        		// get the previous model, if exist.
        		prevMessageModel = this.getPrevMessageModel();
        		
        		/*
        		 * if we are at page num 2, we have 25 items from page 1, 
        		 * not including the current page.
        		 * if we at page 3 or more, we extract 1 from the current page
        		 * and multiple by 25.
        		 * */
        		if (currentPage === 2) {
        			numOfItemsBeforeTheCurrentPage = 25;
        		} 
        		else {
        			numOfItemsBeforeTheCurrentPage = (currentPage - 1) * 25;
        		}
        		
        		/*
        		 * if we rich the bottom limit which is the last item
        		 * from the previous page, we call the pagination method on the collection pages level.
        		 * */
        		if (currentIndex === numOfItemsBeforeTheCurrentPage ) {
        			this.paginatePrev(undefined, true);
        		}
        		
        		navigate(prevMessageModel.get('id'));
        		
        	}	 
    	},
        
        paginateNext: function(e, isForce) {
        
        	var currentPage;
        	
        	// keep a reference for the current page number.
    		currentPage = this.collection.currentPage;
        	
    		/*
        	 * we check which mode we are at, or we are force to 
        	 * fire the method the run the pager in the collection pages level. 
        	 * */
        	if (mode === MODE_MESSAGE_LIST || isForce === true) {
        		this.collection.requestNextPage();
        	} 
        	else if (mode === MODE_MESSAGE_ITEM){
        		
        		// get the current index.
        		currentIndex = this.getModelIndex();
        		
        		// get the previous model, if exist.
        		nextMessageModel = this.getNextMessageModel();
        		
        		// TODO: should check if bigger as well. 
        		if (currentIndex === currentPage * 25 || currentIndex === this.collection.length-1) {
        			this.paginateNext(undefined, true);
        		}
        		
        		navigate(nextMessageModel.get('id'));
        		
        	}
    	},
        
    	/*
    	 * when the user select a specific message, we run this code which
    	 * update the paginator mode and saves the current message model data.
    	 * */
        onMessageItemChangePaginator: function(e, model) {
        
        	currentModel = model;
        	currentId = model.get('id');
        	if (mode !== MODE_MESSAGE_ITEM) {
        		mode = MODE_MESSAGE_ITEM;
        	}
        },
        
        getModelIndex: function() {
        	return this.collection.indexOf(currentModel);
        },
        
        getNextMessageModel: function() {
        	if (currentIndex >= this.collection.length - 1) {
        		//console.log("collection out of bounds")
        	} else {
        		return this.collection.at(++currentIndex);
        	}
        }, 
        
        getPrevMessageModel: function() {
        	if (currentIndex <= 0) {
        		//console.log("collection out of bounds")
        	} else {
        		return this.collection.at(--currentIndex);
        	}
        },
        
        render: function () {
        	this.$el.html(_.template(messagesPaginatorTemplate, this.collection.info()));
        	return(this);
        }
    });
    
    return messagesPaginatorView;
});
