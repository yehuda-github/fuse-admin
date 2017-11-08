define([
  'jquery',
  'underscore',
  'backbone',
  'models/UMB.model/folder.model'
], function ($, _, Backbone, folder) {
    var foldersCollection = Backbone.Collection.extend({
		url: window.fuse.services.folders,
		
        model: folder,
        
        parse: function(response) {
        	return(response && response.data ? response.data : []);
        }
    });
    
    return foldersCollection;
});
