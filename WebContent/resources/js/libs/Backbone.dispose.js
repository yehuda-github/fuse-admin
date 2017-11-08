/**
 * A small Backbone extensions that allows to dispose a view, therefore to 
 * release used resources. Useful when you have a view that bound to some
 * events of a model and you want to remove this view and unbind it from the
 * model.
 */
define(['underscore', 'backbone'], function (_, Backbone) {
	Backbone.View.prototype._configure = (function(_configure){
	    return function(options) {
	        options = options || {};
	        // if this view passed a parent, bind view's dispose on parent's dispose
	        if('parent' in options && 'dispose' in this){
	            options.parent.on('dispose', this.dispose, this);
	        }
	        _configure.apply(this, arguments)
	    }
	})(Backbone.View.prototype._configure);
	
	Backbone.View.prototype.dispose = function(){
	    // trigger all child view to dispose too
	    this.trigger('dispose');
	    // unbind all events, so we don't have references to child views
	    this.unbind();
	    // remove this.el, this will also delete all DOM events of this el
	    this.remove();
	    // if we have a collection - unbind all events bound to this context
	    this.collection && this.collection.off(null, null, this);
	    // do the same with a model
	    this.model      && this.model.off(null, null, this);
	};
});

/*
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
	  "use strict";
	  
	  $("#wrapper").addClass("structureElement");
	  
	  var _cleanData = $.cleanData;
	  var _html = $.html;
	  var _ensureElement = Backbone.View.prototype._ensureElement;
	
	  // attach the view instance on the DOM
	  Backbone.View.prototype._ensureElement = function(){
	    _ensureElement.call(this);
	    this.$el.attr('data-view-cid', this.cid);
	    this.$el.data('view', this);
	  };
	
	  // private method, please use `dispose` in your View
	  Backbone.View.prototype._dispose = function(){
	    if(this.dispose) this.dispose();
	    
		  // trigger all child view to dispose too
		  //this.trigger('dispose');
		  // unbind all events, so we don't have references to child views
		  this.unbind();
		  // remove this.el, this will also delete all DOM events of this el
		  
		  //if(!this.$el.hasClass("structureElement")) {
			  //if(this.el) {
				  //this.el.innerHTML = "";
				  //this.el.parentNode.removeChild(this.el);
			  //}
		  //}
		  //else {
			  //if(this.el) {
				  //this.el.innerHTML = "";
			  //}
		  //}
		  
		  // if we have a collection - unbind all events bound to this context
		  this.collection && this.collection.off(null, null, this);
		  // do the same with a model
		  this.model && this.model.off(null, null, this);
	  };
	
	  // monkey patch clean data to call view._dispose before removing the DOM
	  $.cleanData = function(elems){
	    function dispose($el){
	      if(!$el) $el = $(this);
	      $el.data('view')._dispose();
	      $el.removeAttr('data-view-cid');
	    }
	
	    for(var i=0; i < elems.length; i++){
	      var elem = elems[i];
	      var $elem = $(elem);
	      $elem.find('[data-view-cid]').each(dispose);
	      if ($elem.is('[data-view-cid]')) dispose($elem);
	    }
	    _cleanData.apply(this, arguments);
	  };
	
	  $.html = function(){
	    if(arguments.length >= 1){
	      this.remove();
	    }
	    _html.apply(this, arguments);
	  };
});
*/