define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
	
	  // options for commands:
	  // url: the url to make request to: string/function
	  // success: callback on success
	  // error: callback on error
	
	  var fetcher = Backbone.Model.extend({});
	  
	  fetcher.prototype._fetch = fetcher.prototype.fetch;
	  fetcher.prototype._save = fetcher.prototype.save;
	  fetcher.prototype._destroy = fetcher.prototype.destroy;
	  
	  fetcher.prototype._doCommand = function (command, options) {
		  if(_.isFunction(options.url)) {
			  options.url = options.url();
		  }
		  
		  if(!options || !_.isString(options.url) || options.url.length === 0) {
			  if(options.error) {
				  console.error("Fetcher Error: No Url was attached to command");
				  options.error("Fetcher: No Url");
			  }
			  return;
		  }
		  
		  this.url = options.url;
		  
		  this._fetch({
			  url: options.url,
			  success: $.proxy(function() {
				  this.clear();
				  
				  if(options.success) {
					  if(arguments.length > 0) {
						  options.success(arguments[1], arguments[0]);
					  }
					  else {
						  options.success(arguments[0]);
					  }
				  }
			  }, this),
			  error: $.proxy(function() {
				  this.clear();
				  
				  if(options.error) {
					  options.error(arguments);
				  }
			  }, this)
		  });
	  };
	  
	  fetcher.prototype.fetch = function (options) {
		  this._doCommand(this._fetch, options);
	  };

	  fetcher.prototype.save = function (options) {
		  //this._doCommand($.proxy(this._save), options);
		  this._doCommand(this._save, options);
	  };
	  
	  fetcher.prototype.destroy = function (options) {
		  //this._doCommand($.proxy(this._destroy), options);		  
		  this._doCommand(this._destroy, options);
	  };
	  
	  fetcher.prototype.isNew = function () {
		  return (true);
	  };	  
	  
	  window.fuse.fetcher = new fetcher();
	  
	  return window.fuse.fetcher;
});
