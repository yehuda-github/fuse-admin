// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'translations'
], function ($, _, Backbone, translations) {
    var appRouter = Backbone.Router.extend({
    	
    	initialize: function() {
    		this.addGlobalListeners();
    		this.on( "all", function(a,b) {
    			
    		});
        	
        	this.showRightIframe();
        	this.showVoipIframe();
    	},
    	
        routes: {
            '': 'handleMain',
            '/': 'handleMain',
            
            'folder/:alias': 'showMessages',
            'folder/:alias/pageNumber:page': 'showMessages',
            'compose': 'showCompose',
            //'filter-:filter' : 'showFolderMessagesFilters',
            
            'settings/accountSettings': 'showAccountSettings',
            'settings/privacySettings': 'showPrivacySettings',
            'settings/mailboxSettings': 'showMailboxSettings',
            'settings/profile': 'showProfile',
            
            'print/:data': 'displayPrintMode' ,
            'message/:mid': 'showSingleMessage'
        },
        change: function() {
        	//console.log("dog");
        },
        handleMain: function() {
        	this.navigate("folder/inbox", true);
        },
                
        showRightIframe: function() {
        	require(['views/iframes.view/rightIframe.view'],
        			function(rightIframeView) {
        		new rightIframeView().render();
        	});
        },

        showVoipIframe: function() {
        	require(['views/iframes.view/voipIframe.view'],
        			function(voipIframeView) {
        		new voipIframeView().render();
        	});        	
        },
        
        showFolders: function (folderAlias) {
        	if(!folderAlias) {
        		folderAlias = "";
        	}
        	
        	folderAlias = folderAlias.toLowerCase();
        	window.fuse.selectedFolderAlias = folderAlias; 
        	
        	if(!window.fuse.router.selectedFolderMessagesView) {
            	require(['views/UMB.view/foldersTree.view/foldersTree.view'], 
           	         function(foldersTreeView) {
            		window.fuse.router.foldersTreeView = new foldersTreeView();
            		window.fuse.router.foldersTreeView.fetchAndRender(folderAlias);
	           	});
        	}
        	else {
        		window.fuse.router.foldersTreeView.setSelectedFolder(folderAlias);
        	}
        },
                
        showMessages: function(folderAlias, pageNumber) {
        	this.showFolders(folderAlias);
        	
        	if(!window.fuse.router.selectedFolderMessagesView) {
            	require(['views/UMB.view/selectedFolderMessages.view/selectedFolderMessages.view'], 
           	         function(selectedFolderMessagesView) {
            		window.fuse.router.selectedFolderMessagesView = new selectedFolderMessagesView();
            		window.fuse.router.selectedFolderMessagesView.fetchNewMessagesAndRender(pageNumber);
	           	});
        	}
        	else {
        		this.dispose();
        		window.fuse.router.selectedFolderMessagesView.fetchNewMessagesAndRender(pageNumber);
        	}
        	
        	//this.showRightIframe();
        	//this.showVoipIframe();
        },
        
        // print //
        displayPrintMode: function(data) {
        	var objData;
        	if (!data) return;
        	objData = JSON.parse(data);
     
        	require(['models/UMB.model/message.model'], function(MessageModel) {
        		
        		// build the url with all releveant params.
        		var messageId   = objData.messageId;
        		var accountName = objData.accountName;
        		var folder      = objData.folderPath; 
        		var url         = window.fuse.baseUrl + "/umb/messages/read?messageId=" + messageId + "&accountName=" + accountName + "&folderPath=" + folder;
        
	
        		window.fuse.fetcher.fetch({
        			url: url,
        			success: function(response) {
        				
        				//console.log("response response: ", response);
        				try{
        					
        					if (response.message.content.html) {
        						$("#main").empty().html(response.message.content.html);
        					}
        					else if (response.message.content.plain) {
        						$("#main").empty().text(response.message.content.plain);
        					}
        					
        					
        					window.print();
        				}
        				catch(e) {}
    				},
        			error: function() {
        				//console.log("error");
        			}
        		});
        		
        		
        	});
        },        
        /*
    	 * each time a single message is being displayed, we need to make an http request
    	 * in order to get the full message body text. 
    	 * TODO: it should happen only once. we should update the model and set some flag.
    	 * */
        showSingleMessage: function(mid) {
        	
        	require(['views/UMB.view/selectedFolderMessages.view/messageItem.view'], function(MessageItemView) {
        		
        		var model, $messagesListContainer, _messagesCollection, messagesIds, messages;
        		
        		$messagesListContainer = $(".messagesListContainer");
        		// get reference to the collection.
        		_messagesCollection = window.fuse.messagesCollection; 
        		// get the relevant model.
        		model = _messagesCollection.get(mid);
        		
        		// this array holds all threads ids if exist, and the current message id as well at position 0.       		
        		messagesIds = [model.get("attributes").UID];
        		
        		// get all messages/threads of the current message.
        		messages    = model.get("messages");
        		
        		// get all ids and push to the array.
        		if (messages) {
	        		(function getMessagesIds(messages) {
	        			
	        			for (var i=0; i<messages.length; i++) {	        			
	        				var message = messages[i];
	        				messagesIds.push(message.attributes.UID);
	        				if (message.messages) {
	        					getMessagesIds(message.messages);
	        				}
	        			}
	        		})(messages);
        		}
        		        		       		
        		// build the url with all releveant params.
        		var messageId   = model.get("attributes").UID,
        			accountName = model.get("attributes").accountName,
        			folder      = model.get("attributes").folderName,
        			url         = window.fuse.baseUrl + "/umb/messages/read?messageId=" + JSON.stringify(messagesIds) + "&accountName=" + accountName + "&folderPath=" + folder;
        
        		// make request //.
        		window.fuse.fetcher.fetch({
        			url: url,
        			success: function(response) {
        			
        				// set the full text of the model.
        				if (response.success === "true" ) {
        					
        					// update the actual message it self before the threads.
        					var messageParent        = response.messages[0],
        						messageParentContent = messageParent.content,
        						messages             = response.messages.splice(1, response.messages.length-1);
        					
        					// set this property to hold the message body.
        					model.set({"content": {html: "", plain: ""}});
        					
        					// this property holds all threads with their body.
        					// this is the property the template will look for.
        					model.set({"messages": messages});
        					
        					// another reference for the messages/threads for the compose textarea.
        					model.set({"quotesList": messages});
        					
        					if (messageParentContent.html) {
        						model.get("content").html = messageParentContent.html;
        					}
        					else if(messageParentContent.plain) {
        						model.get("content").plain = messageParentContent.plain;
        					}
        				}
        				
        				// set the view and render it.
        				view = new MessageItemView({model: model});
                    	html = view.render().el;
                    	
                    	$messagesListContainer.empty();
                    	$messagesListContainer.append(html);
                    	
                    	// notify the filter view to change its state.
                    	$.publish("/filtersView/onMessageItemStateChanged", {action: "hide"});
                    	$.publish("/filtersView/showHideExpandBtn", {show: messages.length > 0});
                    	
                    	// the view is waiting for this notification in order to check for additional threads. (not best solution).
                    	$.publish("/messageItemView/onRenderComplete");
                    	
                    	// notify pager view change its state.
                    	$.publish('/messagesPaginator/onMessageItemChangePaginator', model);
        				
        			},
        			error: function() {
        				
        			}
        		});
        	});
        },
        
        showCompose: function () {
        	this.showFolders();
        	
        	require(['views/UMB.view/compose.view/compose.view'], function(composeView) {
        		var _composeView = new composeView({"fromRouter": true});
        	
        		
        		// when the compose is being called from the router
        		// we pass the .spotlight class elemnt and we make the append inside the view. 
        		// this prevent the multiple cliks events on the send mail event.
        		_composeView.render($(".spotlight")).el;
        	});
        },
        
        showAccountSettings: function () {
        	this.dispose("settings");
        	
        	require(['views/settings.view/settings.view'], function(settingsView) {
        		new settingsView().render();
        	});
        },
        
        addGlobalListeners: function() {
        	$(document).click(function(e) {
        		$('.onDocumentClick').hide();
        	});
        },
        
        dispose: function(type) {
        	$.unsubscribe("/selectionsActions/deleteItemsSuccess/");
        	
        	$.unsubscribe("/selectionsActions/messageItemWasUnSelected/");
        	$.unsubscribe("/selectionsActions/messageItemWasSelected/");
        	
        	//$.unsubscribe("/messages/removeItems/");
        	$.unsubscribe("/messageListItem/unSelectAll/");
        	$.unsubscribe("/messageListItem/selectAll/");
        	
        	$.unsubscribe("/messageItem/onPrintClick");
        	$.unsubscribe("/messageItem/expandAll");
        	//$.unsubscribe("/messages/getMessagesWithFilters/");
        	
        	$.unsubscribe("/messageItemView/onRenderComplete");
        	$.unsubscribe("/selectedFolderMessage/onMessageItemStateChanged");
        	$.unsubscribe("/messagesPaginator/onMessageItemChangePaginator");        	
        	
        	$.unsubscribe("renderSettings");
        	
        	switch(type) {
	        	case "settings":
		        	$.unsubscribe("/folders/addUnreadCount/");
		        	$.unsubscribe("/folders/subtractUnreadCount/");
		    		$.unsubscribe("selectedFolderChanged");
		    		$.unsubscribe("/folders/fetchAndRenderFoldersTree/");
		    		
		    		$.unsubscribe("/messages/fetchNewMessagesAndRender/");
		    		$.unsubscribe("/messages/getMessagesWithFilters/");
		    		$.unsubscribe("/messages/removeItems/");
	        		break;
	        	
	        	case "folders":
		        	$.unsubscribe("/folders/addUnreadCount/");
		        	$.unsubscribe("/folders/subtractUnreadCount/");
		        	//$.unsubscribe("/folders/fetchAndRenderFoldersTree/");
		    		//$.unsubscribe("selectedFolderChanged");
	        		break;
        	}
        }
    });
    
    var initialize = function () {
    	
    	window.fuse.router = new appRouter();
        Backbone.history.start();
    };

    return {
        initialize: initialize
    };
});
