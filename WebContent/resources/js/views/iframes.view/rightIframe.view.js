define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {
    var rightIframeView = Backbone.View.extend({
        el: ".rightIframe",
        
        events: {
        },
        
        iframeData: window.fuse.iframesData.rightIframe,
        
        render: function () {
        	this.$el.html("<iframe width='252px' height='500px' id='" + this.iframeData.iframeId + "' name='" + this.iframeData.iframeId + "' src='" + this.iframeData.iframeUrl + "' frameborder='0'></iframe>");
        },
        
    });
    
    return rightIframeView;
});
