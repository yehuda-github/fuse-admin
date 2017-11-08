define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/UMB.template/selectedFolderMessages.template/messageListItem.template.html',
  'objects/UMB.objects/messagesManager',
  'views/UMB.view/selectedFolderMessages.view/messageItem.view'
], function ($, _, Backbone, messageListItemTemplate, messagesManager, MessageItemView) {
    var messageListItemView = Backbone.View.extend({
    	tagName: "div",
    	className:"messageItem",
    	
    	events: {
    		"click .selectBoxUnselectedBak": "toggleSelectedBox",
    		"click .itemTopBorder": "showMessageItem"
        },
                
        onFlagSeenChanged: function() {
    		this.$el.find(".itemTopBorder").removeClass("itemRead");
    		this.$el.find(".itemTopBorder").removeClass("itemUnRead");
        	
        	if(!this.model.get("flags.seen") || this.model.get("flags.seen") == "false") {
        		this.$el.find(".itemTopBorder").addClass("itemUnRead");
        	}
        	else {
        		this.$el.find(".itemTopBorder").addClass("itemRead");
        	}
        },

        onFlagDeletedChanged: function() {
        	this.$el.slideUp('fast');
        },        
        
        unselectBox: function() {
        	$(this.el).find('.selectBoxUnselectedBak').removeClass("selectBoxSelected");
        	this.$el.removeClass("itemSelected");
        	$(this.el).find(".itemTopBorder").removeClass("itemTopBorderSel");
        	$.publish("/selectionsActions/messageItemWasUnSelected/", this.model);
        },
        
        selectBox : function() {
        	$(this.el).find('.selectBoxUnselectedBak').removeClass("selectBoxSelected").addClass("selectBoxSelected");
        	this.$el.addClass("itemSelected");
        	$(this.el).find(".itemTopBorder").addClass("itemTopBorderSel");
        	$.publish("/selectionsActions/messageItemWasSelected/", this.model);
        },
        
        // toggle selectBox action
        toggleSelectedBox: function(e) {
        	if($(this.el).find('.selectBoxUnselectedBak').hasClass("selectBoxSelected")) {
        		this.unselectBox();
        	}
        	else {
        		this.selectBox();
        	}
        	
        	return false;
        },
        
        showMessageItem: function() {
        	var id = this.model.get("id");
        	window.fuse.router.navigate("message/" + id, true);
        	return;
        },
        
        render: function () {
            this.$el.html(_.template(messageListItemTemplate, this.model.toJSON()));
            this.$el.attr('id', 'msg_'+this.model.cid);
            this.onFlagSeenChanged();
            return this;
        },
        
        initialize : function() {
        	$.subscribe("/messageListItem/selectAll/", $.proxy(this.selectBox, this));
        	$.subscribe("/messageListItem/unSelectAll/", $.proxy(this.unselectBox, this));
        	this.model.on("change:flags.seen", this.onFlagSeenChanged, this);
        	this.model.on("change:flags.deleted", this.onFlagDeletedChanged, this);
        },
        
        dispose: function() {
        }
    });
       
    return messageListItemView;
});
