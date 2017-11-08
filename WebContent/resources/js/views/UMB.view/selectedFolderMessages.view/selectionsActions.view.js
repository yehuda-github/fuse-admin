define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'jqxcore',
  'text!templates/UMB.template/selectedFolderMessages.template/selectionsActions.template.html',
   'objects/UMB.objects/messagesManager'
], function ($, _, Backbone, translations, jqx, selectionsActionsTemplate, messagesManager) {
	
	var selectionsActionsView = Backbone.View.extend({
    	el: ".selectionsActions",
        selectedMessages: null,
                
        events : {
        	"click .backBtn" : "backToMessagesItemList",
        	"click .selectAllAncor": "selectAllAncorClick", //select all
    		"click .deleteBtn": "deleteBtnClick", 			//delete all
        	"click .spamBtn": "spamBtnClick", 				//move to spam
        	"click .barSecondary .moveToBtn":  "moveToBtnClick", //move to folder
        	"click .markUnreadBtn":  "markUnreadBtnClick", 	//mark unread
        	"click .markReadBtn" :  "markReadBtnClick", 	//mark read
    		"click .unselectAllBtn": "unselectAllBtnClick"	//unSelect all
        },
        clear: function() {
        	this.selectedMessages = [];
        },
    	showSelectionAction: function() {
    		this.$el.find(".itemActions").show();
    		this.$el.find(".selectionAndActions").hide();
    	},
    	
    	hideSelectionAction: function(view) {
    		this.$el.find(".itemActions").hide();
    		this.$el.find(".selectionAndActions").show();
    	},
        
    	backToMessagesItemList: function() {
    		this.selectedMessages = [];
        	window.fuse.router.navigate("folder/inbox", true);
        },
        
        deleteBtnClick: function() {
        
        	messagesManager.selectAction("trash", this.selectedMessages);
        	
        },
        
        onDeleteItemsSuccess: function() {
        	
        	$('.messagesListContainer').find('.itemSelected').removeClass("itemSelected");
        	
        	var _message = null;
        	var _unreadCount = 0;
        	
        	for(var i = 0; i < this.selectedMessages.length; i++) {
        		_message = this.selectedMessages[i];
        		
        		_message.set("flags.deleted", "true");
        		
        		if(_message.get("flags.seen") == false || 
        		   _message.get("flags.seen") == "false") {
        			_unreadCount++;
        		}
        		//this.clear();
        	}
        	
        	if(_unreadCount > 0) {
        		//$.publish("/folders/subtractUnreadCount/", [currentFolderAlias, _unreadCount]);
        		$.publish("/folders/addUnreadCount/", ["trash", _unreadCount]);
				$.publish(
					"/folders/fetchAndRenderFoldersTree/",
					[window.fuse.selectedFolder.get("alias"), {}]
        		);
        	}
        	
        	if(!this.selectedMessages) {
        		return;
        	}        	
        	
        	$.publish("/messages/removeItems/", this.selectedMessages);
        	
        	//this.selectedMessages = [];
        },

        onMoveToSpamSuccess: function() {
        	$('.messagesListContainer').find('.itemSelected').removeClass("itemSelected");
        	
        	var _message = null;
        	var _unreadCount = 0;
        	
        	for(var i = 0; i < this.selectedMessages.length; i++) {
        		_message = this.selectedMessages[i];
        		
        		// to do: make it pubSub with the topic messageWasMoved
        		_message.set("flags.deleted", "true");
        		
        		if(_message.get("flags.seen") == false || 
        		   _message.get("flags.seen") == "false") {
        			_unreadCount++;
        		}
        	}
        	
        	if(_unreadCount > 0) {
        		//$.publish("/folders/subtractUnreadCount/", [currentFolderAlias, _unreadCount]);        		
        		$.publish("/folders/addUnreadCount/", ["spam", _unreadCount]);
				$.publish(
						"/folders/fetchAndRenderFoldersTree/", 
						[window.fuse.selectedFolder.get("alias"), {}]
	        	);
        	}
        	
        	if(!this.selectedMessages) {
        		return;
        	}        	
        	
        	$.publish("/messages/removeItems/", this.selectedMessages);
        	
        	//this.selectedMessages = [];
        },
        
        onMoveToFolderSuccess: function(e, folderToMoveAlias) {
        	$('.messagesListContainer').find('.itemSelected').removeClass("itemSelected");
        	
        	var _message = null;
        	var _unreadCount = 0;
        	
        	for(var i = 0; i < this.selectedMessages.length; i++) {
        		_message = this.selectedMessages[i];
        		
        		// to do: make it pubSub with the topic messageWasMoved
        		_message.set("flags.deleted", "true");
        		
        		if(_message.get("flags.seen") == false || 
        		   _message.get("flags.seen") == "false") {
        			_unreadCount++;
        		}
        	}
        	
        	if(_unreadCount > 0) {
        		//$.publish("/folders/subtractUnreadCount/", [currentFolderAlias, _unreadCount]);        		
        		$.publish("/folders/addUnreadCount/", [folderToMoveAlias, _unreadCount]);
				$.publish(
						"/folders/fetchAndRenderFoldersTree/", 
						[window.fuse.selectedFolder.get("alias"), {}]
	        	);
        	}
        	
        	if(!this.selectedMessages) {
        		return;
        	}
        	
        	$.publish("/messages/removeItems/", this.selectedMessages);
        	
        	//this.selectedMessages = [];
        },
        
        spamBtnClick: function() {
        	messagesManager.selectAction("spam", this.selectedMessages);
        	
        },
                
        markUnreadBtnClick: function() {
        	messagesManager.selectAction("markAsUnread", this.selectedMessages);
        	for(var i = 0; i < this.selectedMessages.length; i++ ) {
        		this.selectedMessages[i].set("flags.seen", false);
        	}
        	this.backToMessagesItemList();
        },
        
        markReadBtnClick: function() {
        	messagesManager.selectAction("markAsRead", this.selectedMessages);
        	for(var i = 0; i < this.selectedMessages.length; i++ ) {
        		this.selectedMessages[i].set("flags.seen", true);
        	}
        },
        
        unselectAllBtnClick: function() {
        	$.publish("/messageListItem/unSelectAll/");
        },
        
        selectAllAncorClick: function() {
        	$.publish("/messageListItem/selectAll/");
        },        
        
        moveToBtnClick: function(e) {
        	
        	if(window.fuse.foldersCollection != undefined){
	        	$('.moveToBtn').addClass('moveToBtnSel');
	        	$(".moveToFolderPop").show();
	        	$('.moveToFolderPopTop').html('');
	        	$('.moveToFolderPopTop').append("<div id='jqxscrollbar' style='float:right; margin-right:4px; position:absolute; right:0px; top:0px;'></div>");
	        	$("#jqxscrollbar").jqxScrollBar({ width: 12, height: 137, vertical: true, min: 0, max: (window.fuse.foldersCollection.length*20),showButtons:false });
	        	$("#jqxscrollbar").bind('valuechanged', function (event) {
	        		$('.moveToFolderPopTop').scrollTop(event.currentValue);
	            });
	        	
	        	$('.moveToFolderPopTop').bind('mousewheel', function(event, delta) {
	                
	        		var _ln;
	        		
	        		if(delta > 0){
	        			_ln = $("#jqxscrollbar").jqxScrollBar('value');
	        			$("#jqxscrollbar").jqxScrollBar('setPosition', _ln-20);
	        		}else{
	        			_ln = $("#jqxscrollbar").jqxScrollBar('value');
	        			$("#jqxscrollbar").jqxScrollBar('setPosition', _ln+20);
	        		}
	                return false;
	            });
	        	
	        	$('.moveToFolderPopBottom').html('');
	        	$('.moveToFolderPopBottom').append("<a id='closeFolderMove' style='text-decoration:none;color:#A51014;' href='javascript:void(0);'>Close</a>");
	        	$('.moveToFolderPopTop').append("<div style='height:5px'></div>");
	        	
	        	for (var i = 0; i < window.fuse.foldersCollection.length; i++) {
	        		//var _n = window.fuse.foldersCollection.pluck("name")[i];
	        		var _folder = window.fuse.foldersCollection.at(i);
	        		$('.moveToFolderPopTop').append("<div class='moveToFolderItem' style='color:#000' alias='" + _folder.get("alias") + "'>" + _folder.get("name") + "</div>");
	        	};
	        	
	        	//move to folder - CLOSE
	        	$('#closeFolderMove').click(function(){
	        		$(this).parent().parent().hide();
	        		$('.moveToBtn').removeClass('moveToBtnSel');
	        	});
	        	
	        	//move to folder - ACTION
	        	$('.moveToFolderItem').click($.proxy(function(e) {
	        		var $elm = $(e.target);
	        		var action = $elm.html();
	        		//console.log("e.target ... ",e.target);
	        		//console.log("moving to folder ... ",action);
	        		//console.log("this.selectedMessages ... ",this.selectedMessages);
	            	messagesManager.selectAction(action, this.selectedMessages);
	            	$('#closeFolderMove').click();
        		},this));
        	}
        },
        
        subscribeDeleteItemsSuccess: function(e, messageItemView) {
    		var _index = _.indexOf(this.selectedMessages, messageItemView);
    		this.selectedMessages.splice(_index, 1);
    		
    		if(this.selectedMessages.length === 0) {
    			this.hideSelectionAction();
    		}
        },
        
        subscribeMessageItemWasSelected: function(e, messageItemView) {
    		this.selectedMessages.push(messageItemView);
    		this.showSelectionAction(this);
        },
        onChangeToSingleMessageMode: function(e, view) {
        	if (view) {
        		this.clear();
        		this.selectedMessages.push(view);
        	}	
    	},
        render: function () {
        	var spam = {spam: false};
        	if(window.location.hash && window.location.hash.indexOf("spam")>-1){
        		spam.spam = true;
        	}        		
            this.$el.html(_.template(selectionsActionsTemplate, spam));
        	
            return this;
        },
        
        initialize: function() {
        	this.selectedMessages = [];
        	this.addGlobalEvents();
        	
        	// to do: combine these functons into 1
        	$.subscribe("/selectionsActions/deleteItemsSuccess/", $.proxy(this.onDeleteItemsSuccess, this));
        	$.subscribe("/selectionsActions/moveToSpamSuccess/", $.proxy(this.onMoveToSpamSuccess, this));
        	$.subscribe("/selectionsActions/moveToFolderSuccess/", $.proxy(this.onMoveToFolderSuccess, this));
        	
        	$.subscribe("/selectionsActions/messageItemWasUnSelected/", $.proxy(this.subscribeDeleteItemsSuccess, this));
        	$.subscribe("/selectionsActions/messageItemWasSelected/", $.proxy(this.subscribeMessageItemWasSelected, this));
        	
        	$.subscribe("/selectionsActions/onChangeToSingleMessageMode/", $.proxy(this.onChangeToSingleMessageMode, this));
        	
        	//console.log(this.cid);
        },
        
        addGlobalEvents: function() {
        	$(document).click(function(e) {
        		var evn = typeof e.srcElement === 'undefined' ? e.target : e.srcElement; 
        		
        		if(!$(evn).hasClass("moveToBtn") && !$(evn).parents(".moveToBtn").length>0){
	        		if(!($(evn).hasClass("moveToFolderPop") || $(evn).parents(".moveToFolderPop").length>0)){
	        			$('#closeFolderMove').click();
	        		}
        		}
        		
        	});
        },
        
        dispose: function() {
        	/*
        	this.selectedMessages = null;
        	
        	$.unsubscribe("/selectionsActions/deleteItemsSuccess/");
        	$.unsubscribe("/selectionsActions/messageItemWasUnSelected/");
        	$.unsubscribe("/selectionsActions/messageItemWasSelected/");
        	
        	console.log("selectionsActionsView disposed");
        	*/
        }
    });
    
    return selectionsActionsView;
});
