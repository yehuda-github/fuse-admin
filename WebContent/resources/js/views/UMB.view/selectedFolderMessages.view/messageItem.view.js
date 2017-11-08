define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/UMB.template/selectedFolderMessages.template/messageItem.template.html',
  'objects/UMB.objects/messagesManager',
  'libs/timeago',
  'objects/http',
  'views/UMB.view/compose.view/compose.view',
  'text!templates/UMB.template/selectedFolderMessages.template/messagesThreads.template.html'
], function ($, _, Backbone, messageItemTemplate, messagesManager, timeago, http, ComposeView, messagesThreads) {
	
	var isOlderMessagesTitleExist = false, isAfterExpand = false, $span, isAfterExpand;	
	
	function customEllipses(string){
		if (string.length > 70) {
			string = string.substring(0, 70);
		}
		return string + "...";
	}
	
	function getTimeFormat() {
		var milliSec, d, finalFormat;
		
		milliSec = +new Date();
		d = new Date(milliSec);
		
		d = String(d);
		finalFormat = d.match(/\d{2}:\d{2}/);

		return finalFormat + "";
	}
	
    var messageItemView = Backbone.View.extend({
    	
    	tagName  : "div",
    	className: "messageItem",
    	
    	events: {
    		"click .mi-textarea"               : "onTextareaClick",
    		"click #mi-reply-dropdown"         : "onDropBoxClick",
    		"click .mi-option-item"            : "onOptionSelect",
    		"click .mi-thread"                 : "onThreadClick",
    		"click #mi-bottom-section-reply"   : "onTextareaActionClick",
    		"click #mi-bottom-section-forward" : "onTextareaActionClick",
    		"click .mi-option-item"            : "onDropBoxItemClick",
    		"click .btnCenter"                 : "onReplay"  
        },
        
        initialize : function() {
        	$.subscribe("/messageItem/expandAll", $.proxy(this.expandAllThreads, this));       	
        	$.subscribe("/messageItem/onPrintClick", $.proxy(this.onPrintClick, this));        	
        	$.subscribe("/messageItemView/onRenderComplete", $.proxy(this.onRenderComplete, this));
        	
        	$.unsubscribe("/messageItem/onPrintClick");
        },
        onPrintClick: function() {
        	var data = {
    			messageId  : this.model.get("attributes").UID,
        		accountName: this.model.get("attributes").accountName,
        		folderPath : this.model.get("attributes").folderName
        	};
        	window.open(window.fuse.baseUrl + "umb/index#print/" + JSON.stringify(data));
        },
        changeToSingleMessageAndUpdate: function() {
        	$.publish("/selectionsActions/onChangeToSingleMessageMode/", this.model);
        },
        checkAttachments: function() {	
        	var attachments = $(".attachment-container");
        	
        	if (attachments.length > 1) {
        		$(".attachment-count").show();
        		$(".attachment-number").text(attachments.length + " attachments");
        	}
        },
        
        /*
         * this view is being rendered by the router.
         * when its done, the router notifies the view.
         * the view starts checking its threads - messages.
         * */
        onRenderComplete: function() {
        	var $threads, numOfTrhreads, $messageTopContainer; 
        	
        	$threads             = $(".mi-thread");
        	numOfTrhreads        = $threads.length;
        	$messageTopContainer = $('.mi-thread-top-container');
        	
        	// we no longer need to be notified about this view instance,
        	// so we unsubscribe in order to prevent duplication when the next view will be rendered.
        	$.unsubscribe("/messageItemView/onRenderComplete");  	
        	
        	// notify to selectionsActions view that we are in single message mode.
        	this.changeToSingleMessageAndUpdate();
        	
        	// if we have more than 5 threads,
        	// we collapse the older messages. 
        	if(numOfTrhreads > 5) 
        	{
        		isOlderMessagesTitleExist = true;
        		for (var i=0; i<numOfTrhreads; i++) 
        		{	
        			// we don't touch the first and the last thread.
        			if (i !== 0 && i !== numOfTrhreads-1) {
        				if (i < 4) {
        					$messageTopContainer.eq(i).css("height", "0px");
        				} 
        				else {
        					$messageTopContainer.eq(i).parent().hide();
        				}
        			}
        		} 
        		
        		// ... old messages span.
        		$span = $("<span></span>", {
            		css: {
            			"position": "absolute",
            			"top": "54px",
            			"left": "318px",
            			"padding": "6px",
            			"z-index": "10",
            			"background": "#F1F1F1"
            		}
            	}).text(numOfTrhreads + " old messages");
                
        		$threads.eq(0).append($span);
        	} 
        },
        onTextareaClick: function() {
        	
        },
        onDropBoxClick: function() {
        	var posX, posY, $dropBox;
        	
        	$dropBox = $('.mi-reply-btn');
        	posX     = $dropBox.offset().left;
        	posY     = $dropBox.offset().top;
        	
        	this.$el.find(".replyDropDownBox").css({'left': posX + 1, 'top': posY + 28}).show();
        	return false;
        },
        onOptionSelect: function(e) {
        	var action;
        	
        	action = $(e.target).attr("id").replace("mi-option-", "");
        	this.$el.find(".replyDropDownBox").hide();
        },
        /*
         * when clicking on a thred, we check if we are at 
         * collapse mode with older messages or simple collapse without hidden messages.
         * */
        onThreadClick: function(e, $thread) {
        	var $threadContent, $messageTopContainer, bg, $currThread;
       
        	$messageTopContainer = $('.mi-thread-top-container');
        	
        	if (isOlderMessagesTitleExist) {
        		
        		$messageTopContainer.parent().show();
        		$messageTopContainer.css("height", "40px").show();
        		
        		isOlderMessagesTitleExist = false;
        		$span.remove();
        	}
        	else {
        		$currThread = $thread ? $thread : $(e.target).closest(".mi-thread");
            	$threadContent = $currThread.find(".mi-thread-content");
            	
            	$threadContent.toggle();
            	
            	// thread was just opened by the toggle.
            	if ($threadContent.css("display") === "block") {
            		
            		// adjust style.
            		bg = "#ffffff";
            		
            		
            		$currThread.addClass('.mi-thread-collapse-false');
            		$currThread.find(".mi-thread-top-container").addClass('.mi-thread-collapse-false');
            		$currThread.find(".mi-thread-summary").addClass('mi-thread-summary-collapse-false');
            		$currThread.find(".mi-thread-content").addClass('.mi-thread-content-collapse-false');
            		   	
                	$currThread.find(".mi-thread-summary").hide();
            	}
            	// thread was closed by the toggle.
            	else {
            		
            		// adjust style.
            		bg = "#f1f1f1";
            		
            		$currThread.removeClass('.mi-thread-collapse-false');
            		$currThread.find(".mi-thread-top-container").removeClass('.mi-thread-collapse-false');
            		$currThread.find(".mi-thread-summary").removeClass('mi-thread-summary-collapse-false');
            		$currThread.find(".mi-thread-content").removeClass('.mi-thread-content-collapse-false');
            		
                	$currThread.find(".mi-thread-summary").show();
            	}
            	$currThread.css("background", bg);
        	}
        },
        expandAllThreads: function() {
        	var $threads, self;
        	
        	self     = this;
        	$threads = $(".mi-thread");
        	
        	if($threads.length > 0 && isAfterExpand === false) {
        		
        		if ($span && $span.length > 0){
        			$span.remove();
        		}
        		
        		isOlderMessagesTitleExist = false;
            	isAfterExpand             = true;
            	
            	$threads.each(function() {
            		var $thread;
            		
            		$thread = $(this);
            		self.onThreadClick(undefined, $thread);  		
            	});
        	}
        },
        showCompose: function(action) {
        	
        	var replyToStr = "";
        	
        	this.model.set({'mode': action});
        	
        
        	var composeView = new ComposeView({model: this.model});
        	composeView.setElement('.mi-bottom-section-compose');
        	
        	$('.mi-bottom-section-compose').show();
        	$('.mi-bottom-section').hide();
        	composeView.setReplayMailProp(this.model.get('replyTo'));
        	
    		composeView.render();
    		
    		    		
    		// if reply, get the people to reply.
        	if (action === "reply" || action === "reply_to_all") {
        		var replyToArr = this.model.get('replyTo');
        	
        		for (var i=0; i<replyToArr.length; i++) {
        			var replyTo = replyToArr[i];
        			var address = replyTo.attributes.address;
        			replyToStr += address;
        			replyToStr += ", ";
        		}
        	}
        	
        	// populate the compose input field.
    		$("#to").val(replyToStr);
        	
        },
        onDropBoxItemClick: function(e) { 
        	var $selectedItem, action; 
        	
        	$selectedItem = $(e.target);
        	action        = $selectedItem.attr("id").replace("mi-option-", "");
        	
        	this.showCompose(action);
        	
        	// close the dropdown popup.
        	$selectedItem.closest(".replyDropDownBox").hide();
        },
        onReplay: function(e) { 
        	this.showCompose('reply');
        },
        onTextareaActionClick: function(e) {
        	var action;
        	
        	action = $(e.target).attr("id").replace("mi-bottom-section-", "");
        	this.showCompose(action);
        },
        render: function (i) {
       
        	// TODO: check if needed.
        	 $(".mi-thread").eq(0).find('span').remove();
        	 
        	 // for testint only!
        	 var attachments = [{
                 "id": "0",
                 "attributes": [{
                     "size": "31412"
                 }, {
                     "fileName": "528781_10151038051947418_1038428648_n.jpg"
                 }, {
                     "downloadUrl": "/applink/mail/Downloader?dhid=attachmentDownloader&messageId=14&accountName=SINGNET_3&folderPath=Draft&contentDisposition=attachment&attachmentIndex=0"
                 }, {
                     "contentType": "APPLICATION/OCTET-STREAM; \r\n\tname=528781_10151038051947418_1038428648_n.jpg"
                 }, {
                     "mimeType": "APPLICATION/OCTET-STREAM"
                 }]
             },
             {
                 "id": "0",
                 "attributes": [{
                     "size": "31412"
                 }, {
                     "fileName": "528781_10151038051947418_1038428648_n.jpg"
                 }, {
                     "downloadUrl": "/applink/mail/Downloader?dhid=attachmentDownloader&messageId=14&accountName=SINGNET_3&folderPath=Draft&contentDisposition=attachment&attachmentIndex=0"
                 }, {
                     "contentType": "APPLICATION/OCTET-STREAM; \r\n\tname=528781_10151038051947418_1038428648_n.jpg"
                 }, {
                     "mimeType": "APPLICATION/OCTET-STREAM"
                 }]
             }]
        	 
        	 // attach some functions to the object that is being passed to 
        	 // the template.
        	 this.model.set({"customEllipses": customEllipses});
        	 this.model.set({"getTimeFormat": getTimeFormat});
        	 
        	 // render template.
        	 this.$el.html( _.template(messageItemTemplate, this.model.toJSON()));
        	 return this;
        },
        
    });
       
    return messageItemView;
});
