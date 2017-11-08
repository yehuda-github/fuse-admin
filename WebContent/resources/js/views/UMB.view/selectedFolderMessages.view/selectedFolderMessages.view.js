define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'collections/UMB.collections/messages.collection',
  'views/UMB.view/selectedFolderMessages.view/messageListItem.view',
  'views/UMB.view/selectedFolderMessages.view/messagesPaginator.view',
  'views/UMB.view/selectedFolderMessages.view/selectionsActions.view',
  'views/UMB.view/selectedFolderMessages.view/quota.view',
  'views/UMB.view/selectedFolderMessages.view/filters.view',
  'text!templates/UMB.template/selectedFolderMessages.template/selectedFolderMessages.template.html'
], function ($, _, Backbone, translations, messagesCollections, messageListItemView, messagesPaginator, 
			 selectionsActionsView, quotaView, filtersView, selectedFolderMessagesTemplate) {
   	
	var selectedFolderMessagesView = Backbone.View.extend({
        el : ".spotlight",
        
        events: {
        	"click .empty_trash_prt1" : "onEmptyTrash"
        },
        
        onEmptyTrash:function() {
        	//publish the event to the 
        	//$.publish("emptyTrash",this.model);
        	//set the ui
        	this.$el.find(".messageItem").slideUp(500, function(){
        	});
        },
        
        fetchNewMessagesAndRender: function(pageNumber) {
        	
        	window.fuse.router.dispose("folders");
        	
        	if(!pageNumber) {
        		pageNumber = 0;
        	}
        	
        	//this.dispose(true);
        	
        	this.collection.goTo(
    			  pageNumber,
    			  {
    				  success: $.proxy(function() {
    					  this.render();
	        		  }, this),
	        		  error: $.proxy(function() {
	        			  setTimeout($.proxy(this.fetchNewMessages, this), 10000);
	        		  }, this)
    			  }
    		);
		},
        
        render: function () {
        	//$.publish("/dispose/deleteItemsSuccess/", $.proxy(this.deleteItems, this));
        	
        	var _folder = window.fuse.selectedFolder ? window.fuse.selectedFolder.toJSON() : {};
        	
            this.$el.html(_.template(selectedFolderMessagesTemplate, { folder: _folder , messages : this.collection}));
            var $messagesListContainer = this.$('div.messagesListContainer');
                        
            for (var i = 0; i < this.collection.length; i++) {
            	$messagesListContainer.append(
                	new messageListItemView({ model: this.collection.at(i), parent: this }).render().el
                );
            }
            
            new selectionsActionsView({ collection: this.collection, parent: this }).render();
            new messagesPaginator({ collection: this.collection, parent: this }).render();
            new quotaView({ parent: this }).render();
            new filtersView({ parent: this }).render();
            
            translations.changeText(translations.view.umbSelectedFolderMessages);
        },
                
        subscribeSelectedFolderChanged: function(e, folder) {
			this.$(".folderName", this.el).html(folder.get("name"));
    		
			if(parseInt(folder.get("unreadCount")>0)){
				this.$(".unreadCount", this.el).text("(" + folder.get("unreadCount") +")");
			}
			else {
				this.$(".unreadCount", this.el).text("");
			}
    	},
        
        subscribeFetchNewMessagesAndRender: function(e, folder) {
			this.fetchNewMessagesAndRender();
			//this.render();
    	},
    	
    	subscribeGetMessagesWithFilters: function(e, filters) {
    		//alert(filters);
    		console.log("filters :",filters);
    		console.log("window.fuse.messagesCollection :",window.fuse.messagesCollection);
    	},

    	subscribeRemoveItems: function(e, items) {
			//this.collection.models = _.difference(this.collection.models, items);
			
    		if(!items || items.length == 0) {
    			return;
    		}
    		
			if(this.collection.length - items.length <= 0) {
				this.$(".umbContainer", this.el).removeClass("emptyFolderMode").addClass("emptyFolderMode");
			}
			
			this.fetchNewMessagesAndRender();
    	},
    	
        initialize: function() {
        	window.fuse.messagesCollection = new messagesCollections();
        	this.collection = window.fuse.messagesCollection;
        	//this.collection.on('reset', this.render, this);
        	        	
        	$.subscribe("selectedFolderChanged", $.proxy(this.subscribeSelectedFolderChanged, this));
    		$.subscribe("/messages/fetchNewMessagesAndRender/", $.proxy(this.subscribeFetchNewMessagesAndRender, this));
    		$.subscribe("/messages/getMessagesWithFilters/", $.proxy(this.subscribeGetMessagesWithFilters, this));
    		$.subscribe("/messages/removeItems/", $.proxy(this.subscribeRemoveItems, this));
        },
        
        dispose: function(isInternalDispose) {
        	/*
        	if(!isInternalDispose) {
        		$.unsubscribe("selectedFolderChanged");
        		$.unsubscribe("/messages/fetchNewMessagesAndRender/");
        		$.unsubscribe("/messages/getMessagesWithFilters/");
        		$.unsubscribe("/messages/removeItems/");
        	}
        	
        	console.log("selectedFolderMessagesView dispose");
        	*/
        }
    });
    
    return selectedFolderMessagesView;
});
