define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'views/settings.view/accountSettings.view/emailAddresses.view',
  'views/settings.view/accountSettings.view/snimAccounts.view',
  'text!templates/settings.template/accountSettings.template/accountSettings.template.html',
], function ($, _, Backbone, translations, emailAddressesView, snimAccountsView, accountSettingsTemplate) {
    var accountSettingsView = Backbone.View.extend({
        el: ".spotlight",
        render: function () {
            this.$el.html(accountSettingsTemplate);
            new emailAddressesView({ model: this.model }).render();
        	new snimAccountsView({ model: this.model }).render();
        },
	    events: {
	    	"click #GtalkSideTab": "tabSwitch",
	    	"click #YahooSideTab": "tabSwitch",
	    	"click #FacebookSideTab": "tabSwitch",
	    	"click #MessangerSideTab": "tabSwitch",
	    	"click .makePrimary": "setSendingAcount"
	    },
	    setSendingAcount : function(e){
	    	console.log(e.target);
	    	
	    	/*
	    	window.fuse.fetcher.fetch({
        		//url: this.model.url,
        		url: ""+ "?accountName="+,
        		
				success:function(){  },
				error:function(){}
			});*/
	    },
	    tabSwitch: function(e){
	    	/*
	    	 * tabGtalk,tabYahoo,tabFacebook,tabMessenger
	    	 * GtalkSideTab,YahooSideTab,FacebookSideTab,MessangerSideTab
	    	 */
	    	if($(e.target).hasClass('SNIM_ACCOUNTS_GTALK_TAB_BTN')){
	    		console.log("switch tab google");
	    		this.hideAllTabs();
	    		$('#tabGtalk').show();
	    		$('#GtalkSideTab').addClass('selected');
	    	};
	    	if($(e.target).hasClass('SNIM_ACCOUNTS_YAHOO_CHAT_TAB_BTN')){
	    		console.log("switch tab yahoo");
	    		this.hideAllTabs();
	    		$('#tabYahoo').show();
	    		$('#YahooSideTab').addClass('selected');
	    	};
	    	if($(e.target).hasClass('SNIM_ACCOUNTS_FACEBOOK_CHAT_TAB_BTN')){
	    		console.log("switch tab facebook");
	    		this.hideAllTabs();
	    		$('#tabFacebook').show();
	    		$('#FacebookSideTab').addClass('selected');
	    		$('#tabFacebook').find('.tabContentInner').html('');
	    		$('#tabFacebook').find('.tabContentInner').append("<h3 class='SNIM_ACCOUNTS_FACEBOOK_TAB_TITLE'></h3>");
	    		$('#tabFacebook').find('.tabContentInner').append("<div id='fb-root'></div>");
	    		$('#tabFacebook').find('.tabContentInner').append("<script src='//connect.facebook.net/en_US/all.js' async='true' id='facebook-jssdk'></script>");
	    		$('#tabFacebook').find('.tabContentInner').append("<div class='fb-login-button' scope='xmpp_login'>Login with Facebook</div>");
	    		translations.changeText(translations.view.settings);
	    		
	    		_addFacebookUrl = window.fuse.services.addIMFacebookAccount();
	    		
	    		//console.log("INIT URL :",_addFacebookUrl+"?facebookToken=t7h4i65s43i87s9877s324o24m7655e");
	    		
	    		$.ajax({
    			  url: _addFacebookUrl+"?facebookToken=t7h4i65s43i87s9877s324o24m7655e",
    			  success: function(data) {
    			    console.log("AJAX DATA SUCCESS :",data);
    			  }
    			});
	    		
	    		//facebook stuff
	    		window.fbAsyncInit = function() {
	    			
				    FB.init({
				      appId      : '266280996820589', // App ID
				      channelUrl : 'www.realcommerce.co.il/channel.html', // Channel File
				      status     : true, // check login status
				      cookie     : true, // enable cookies to allow the server to access the session
				      xfbml      : true  // parse XFBML
				    });
				    /*
					FB.login(function(response) {
						if (response.authResponse) {
						   console.log('Welcome! Fetching your information.... ');
						   FB.api('/me', function(response) {
						   console.log('Good to see you, ' + response.name + '.');
						   });
					    }else{
					       console.log('User cancelled login or did not fully authorize.');
					    }
					});
					*/
				    
				 // listen for and handle auth.statusChange events
			        FB.Event.subscribe('auth.statusChange', function(response) {
			          if (response.authResponse) {
			        	  token = response.authResponse.accessToken;
			        	  console.log("ACCESS TOKEN :",token);
			          }
			        });
				  };
	    	};
	    	if($(e.target).hasClass('SNIM_ACCOUNTS_MESSENGER_TAB_BTN')){
	    		console.log("switch tab messanger");
	    		this.hideAllTabs();
	    		$('#tabMessenger').show();
	    		$('#MessangerSideTab').addClass('selected');
	    	};
	    },
	    hideAllTabs: function(){
	    	$('#tabGtalk').hide();
	    	$('#tabYahoo').hide();
	    	$('#tabFacebook').hide();
	    	$('#tabMessenger').hide();
	    	$('#GtalkSideTab').removeClass('selected');
	    	$('#YahooSideTab').removeClass('selected');
	    	$('#FacebookSideTab').removeClass('selected');
	    	$('#MessangerSideTab').removeClass('selected');
	    },
	    initialize: function() {
	    	$.subscribe("/settings/render/", $.proxy(function() {
	    		console.log("settings render");
    			this.render();
    		},this));
	    }
    });
    
    return accountSettingsView;
});
