define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'models/settings.model/account.model',
  'text!templates/settings.template/popup.template.html',
], function ($, _, Backbone, translations, account, popupTemplate) {
    var popupView = Backbone.View.extend({
    	tagName: "div",
    	className: "appPopupWrapper",
        add_account_type: "",
    	
        events: {
        	"click .appPopupCloseBtn,#popupAddEmailCancelBtn": "closePopup",
        	"click .appPopup_button2": "closePopup",
        	"click .mi-reply-btn": "select_account_type",
        	"click .appPopup_button": "addAccount"
        },
        
        select_account_type: function(){
        	
        	$('.account_select_holder').toggle();
        	$('.account_holder_item').click($.proxy(function(e){
        		
        		this.add_account_type = $(e.target).html();
        		
        		var _hostVal = 'gmail';
        		
        		switch(this.add_account_type){
        		case "Gmail":
        			_hostVal = 'gmail';
        			break;
        		case "Yahoo! Mail":
        			_hostVal = 'yahoo';
        			break;
        		case "Windows Live Hotmail":
        			_hostVal = 'hotmail';
        			break;
        		case "Other":
        			_hostVal = 'other';
        			break;
            	};
        		
        		$('.selected_account_type').html(this.add_account_type);
        		$('#popupAddEmailFieldHost').val(_hostVal);
        		$('.account_select_holder').hide();
        		
        	},this));
        },
        
        closePopup: function() {
        	this.$el.remove();
        },
        
        validEmail: function(e) {
            var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
            return String(e).search (filter) != -1;
        },
        
        addAccount: function() {
        	
        	console.log("add account...");
        	
        	var _addressValid = false;
        	var _passwordValid = false;
        	var _hostNameValid = false;
        	
        	var _host = $('#popupAddEmailFieldHost').val();
        	var _address = $('#popupAddEmailFieldAddress').val();
        	var _password = $('#popupAddEmailFieldPassword').val();
        	var _serverType = $('#popupAddEmailFieldPopServerType').val();
        	var _port = $('#popupAddEmailFieldPopPort').val();
        	var _ssl = $('#popupAddEmailFieldPopSsl').val();
        	var _hostName = $('#popupAddEmailFieldPopHostName').val();
        	
        	if(_ssl == "on"){
        		_ssl = true;
        	}else{
        		_ssl= false;
        	} 
        	
        	var _emailRegValid = this.validEmail(_address);
        	
        	if(_address=='' || _emailRegValid==false) {
        		$('#appPop_validate_address').slideDown(450);
    		}else{
    			_addressValid = true;
    		};
        	
        	if(_password=='') {
        		$('#appPop_validate_password').slideDown(450);
    		}else{
    			_passwordValid = true;
    		};
    		
    		if(_hostName=='') {
        		$('#appPop_validate_hostname').slideDown(450);
    		}else{
    			_hostNameValid = true;
    		};
        	
    		if(_addressValid && _passwordValid && _hostNameValid){
    		
    			console.log("adding...");
    			
			window.fuse.fetcher.fetch({
	    		url: window.fuse.services.addAccount() + "?userName="+ 	_address +
	    												"&password="+ _password +
	    												"&hostName="+ _hostName +
	    												"&port="+ _port +
	    												"&serverType="+ _serverType +
	    												"&ssl="+ _ssl,
	    		success:$.proxy(function(data){
	    			
	    			//$.publish("/settings/render/");
	    			
	    			if (data.data && data.data == true){
	    				//fetch
	    				$.publish("renderSettings");
	    				
	    			}
	    			
	    		},this),
	    		error:function(){
	    			// todo : error handling
	    		}
	        		
	    		});       	
        	
        	
        	
        	
        	
        	this.closePopup();
        	
    		};
    		
    
        },
        
        render: function () {
        	this.$el.html(popupTemplate);
        	$("body").append(this.el);
        	translations.changeText(translations.popup.addNewMail);
        	$('#popupAddEmailFieldPopHostName').bind("keyup",function(){
        		$('#appPop_validate_hostname').slideUp();
        	});
        	$('#popupAddEmailFieldAddress').bind("keyup",function(){
        		$('#appPop_validate_address').slideUp();
        	});
        	$('#popupAddEmailFieldPassword').bind("keyup",function(){
        		$('#appPop_validate_password').slideUp();
        	});
        }
    });
    
    return popupView;
});
