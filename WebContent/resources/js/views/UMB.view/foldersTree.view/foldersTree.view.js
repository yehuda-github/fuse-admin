define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'models/UMB.model/folder.model',
  'collections/UMB.collections/folders.collection',
  'views/UMB.view/foldersTree.view/folderMenuItem.view',
  'text!templates/UMB.template/foldersTree.template/folderTree.template.html'
], function ($, _, Backbone, translations, folder, foldersCollection, folderMenuItemView, folderTreeTemplate) {
    var foldersTreeView = Backbone.View.extend({
        el: ".leftMenu",
        
        create_folder_init_state: true,
        
        events: {
        	"click #createNewFolderBtn,#createNewFolderCancelBtn": "toggleCreateNewFolderForm",
        	"click #formCreateNewFolderBtn": "formCreateNewFolderBtnClick",
        	"click .folderTreeComposeBtn": "composeMail",
        	"click #formCreateNewFolderInput": "createFolderKeyup"
        },
        
        createFolderKeyup: function(){
        	//console.log("keyup on create folder input");
        	if(this.create_folder_init_state==true){
        		this.create_folder_init_state=false;
        		$('#formCreateNewFolderInput').val('');
        	};
        },
        
        toggleCreateNewFolderForm: function(e) {
        	$(e.target).parents("#createNewFolderBox").toggleClass("formMode");
        },
        
        formCreateNewFolderBtnClick: function(e) {
        	var _newFolderName = this.$('#formCreateNewFolderInput', this.el).val();
        	
        	if(_newFolderName.length === 0) {
        		return;
        	}
        	
        	var _folder = new folder({
				"name": _newFolderName				
        	});
        	
        	_folder.set("id",_newFolderName);
        	_folder.save(null, {
        		type: "POST",
    			success: $.proxy(function() {
    				$.publish(
						"/folders/fetchAndRenderFoldersTree/", 
						[window.fuse.selectedFolder.get("alias"), arguments[1].data]
    				);
    				
    				//console.log("create arguments", arguments);
    				
    			}, this),
    			error: $.proxy(function() { 
    				alert("create Error !!!!!!"); 
    				//console.log(arguments); 
    			}, this)
    		});
        },        
        
        composeMail: function(e) {
        	window.fuse.router.navigate("compose", true);
        },
        
        setSelectedFolder: function(folderAlias) {
        	this.$('.selected').removeClass('selected');
        	
    		var _selectedFolder = this.collection.where({ alias: folderAlias });
    		
    		console.log("foldersTreeView:",this.collection);
    		console.log("folderAlias:",folderAlias);
    		
    		if(_selectedFolder.length > 0) {
    			_selectedFolder = _selectedFolder[0];
    			window.fuse.selectedFolder = _selectedFolder;
    			window.fuse.selectedFolderAlias = folderAlias;
    			$.publish("selectedFolderChanged", _selectedFolder);
    			_selectedFolder = this.collection.indexOf(_selectedFolder);
    			this.$('ul#foldersTree').children().eq(_selectedFolder).addClass('selected');
    		}
        },
        
        render: function () {
            this.$el.html(_.template(folderTreeTemplate));
            var $foldersTreeUl = this.$('ul#foldersTree');
            
            for (var i = 0; i < this.collection.length; i++) {
            	$foldersTreeUl.append(
                	new folderMenuItemView({ model: this.collection.at(i) }).render().el
                );
            }
            
			translations.changeText(translations.view.umbFoldersTree);
			return this;
        },
        
        fetchAndRender: function(folderAlias, foldersJson) {
        	window.fuse.router.dispose("folders");
        	
        	//if(foldersJson) {
        	//}
        	//else {
        	this.collection.fetch({
				  success: $.proxy(function() {
					  this.render();
					  this.setSelectedFolder(folderAlias);
	    		  }, this),
	    		  error: $.proxy(function() {
	    		  }, this)
        	});
        	//}
		},
		
		subscribeFetchAndRender: function(e, folderAlias, foldersJson) {
			this.fetchAndRender(folderAlias, foldersJson);
		},
		
        initialize: function() {
        	window.fuse.foldersCollection = new foldersCollection();
        	this.collection = window.fuse.foldersCollection;
        	
        	$.subscribe("/folders/fetchAndRenderFoldersTree/", $.proxy(this.subscribeFetchAndRender, this));
        }
    });
    
    return foldersTreeView;
});
