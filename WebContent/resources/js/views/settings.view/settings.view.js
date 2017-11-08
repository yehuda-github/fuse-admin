define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'models/settings.model/settings.model',
  'collections/settings.collection/accounts.collection',
  'views/settings.view/settingsLeftMenu.view',
  'views/settings.view/accountSettings.view/accountSettings.view'
], function ($, _, Backbone, translations, settings, accountsCollection, 
			 settingsLeftMenuView, accountSettingsView) {
    var settingsView = Backbone.View.extend({
        render: function () {
        	//console.log("rendering settings");
        	new settingsLeftMenuView().render();
        	
        	var _settings = new settings({ id: 1 });
        	_settings.fetch({
        		  success: $.proxy(function() {
        			 
        			  var _accounts = new accountsCollection(); 
        			  _settings.set("accounts", _accounts);
        			  _accounts.fetch({
        	    		  success: $.proxy(function() {
        	        		new accountSettingsView({ model: _settings }).render();
        	        		translations.changeText(translations.view.settings);
        	        		
        	        		for(x in _accounts.pluck("name")){
        	        			if(_accounts.pluck("defaultAccount")[x]=="true"){
        	        				_primeAccountName = _accounts.pluck("name")[x]; 
        	        			};
        	        		};
        	        		
        	        		var reply_from_text = $('.EMAIL_ADDRESSES_REPLY_FROM_PRIMARY_EMAIL_OPTION').html();
        	        		var _n=reply_from_text.replace("{0}",_primeAccountName);
        	        		$('.EMAIL_ADDRESSES_REPLY_FROM_PRIMARY_EMAIL_OPTION').html(_n);
        	        		
        	    		  }, this)
        	    	  });
        			  
        		  }, this)
        	});
        },
        initialize: function() {
        	$.unsubscribe("renderSettings");
        	$.subscribe("renderSettings",this.render);
        }
    });
    
    return settingsView;
});
