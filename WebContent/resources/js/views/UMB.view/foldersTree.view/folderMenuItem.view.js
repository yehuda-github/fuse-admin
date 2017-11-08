define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/UMB.template/foldersTree.template/folderMenuItem.template.html',
], function ($, _, Backbone, folderMenuItemTemplate) {
    var folderMenuItemView = Backbone.View.extend({
        tagName: "li",
        
        events: {
        	"hover": "mouseHover",
        	"click .editBtn": "switchToEditMode",
        	"click .okBtn": "okBtnClick",
        	"click .deleteFolderBtn": "deleteFolderBtnClick"
        },
        
        mouseHover: function(e) {
        	//alert('');
        	if(this.$el.hasClass("editMode") || this.model.get("isSystem")) {
        		return;
        	}
        	
        	if(e.type == "mouseenter" &&  !this.$el.hasClass("hoverState")) {
    			clearTimeout(this.hoverTimer);
            	this.hoverTimer = setTimeout(
            		$.proxy(function() {
            			clearTimeout(this.hoverTimer);
            			this.hoverTimer = null;
            			this.$el.toggleClass("hoverState");
            		}, this)
            	, 500);
        	}
        	else if(e.type == "mouseout" || e.type == "mouseleave") {
    			clearTimeout(this.hoverTimer);
    			this.hoverTimer = null;
    			this.$el.removeClass("hoverState");
        	}
        },
        
        switchToEditMode: function() {
        	this.$el.toggleClass("editMode");
        },

        okBtnClick: function() {
        	var _answer = confirm("Are you sure you want to change name?");
        	if (_answer) {
        		this.model.set("oldName", this.model.get("name")); 
        		this.model.set("name", this.$(".folderNameInput", this.el).val());
        		
        		this.model.save(null, {
        			success: $.proxy(function() {
        				this.$el.toggleClass("editMode");
        				$.publish(
    						"/folders/fetchAndRenderFoldersTree/", 
    						[window.fuse.selectedFolder.get("alias"), arguments[1].data]
            			);
        				//alert("update/edit sccess");
        				console.log("update/edit arguments", arguments);  
        			}, this),
        			error: $.proxy(function() {
        				alert("edit Error !!!!!!");
        				console.log(arguments);
        			}, this)
        		});
        	}
        },
        
        deleteFolderBtnClick: function() {
        	var _answer = confirm("Are you sure you want to delete?");
        	if (_answer) {
        		
        		//console.log(this.model);
        		this.model.set("isDelete", true);
        		this.model.save(null, {
        			success: $.proxy(function() { 
        				this.$el.toggleClass("editMode");
        				//alert("delete success");
        				$.publish(
    						"/folders/fetchAndRenderFoldersTree/", 
    						[window.fuse.selectedFolder.get("alias"), arguments[1].data]
            			);
        				//console.log("delete arguments", arguments);
        			}, this),
        			error: $.proxy(function() {
        				alert("delete Error !!!!!!");
        				console.log(arguments);
        			}, this)
        		});
        	}
        },
        
        updateUnreadCount: function() {
        	var _val = this.model.get("unreadCount");
        	var $countElm = this.$(".count", this.el);
        	$countElm.removeClass("hidden");
        	$countElm.text(_val);
        	if(_val === 0) {
        		$countElm.addClass("hidden");
        	}
        },
        
        render: function () {
            this.$el.html(_.template(folderMenuItemTemplate, this.model.toJSON()));
            return this;
        },
        
        initialize: function() {
        	this.model.on("change:unreadCount", this.updateUnreadCount, this);
        }        
    });
    
    return folderMenuItemView;
});
