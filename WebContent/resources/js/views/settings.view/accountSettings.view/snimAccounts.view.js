define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/settings.template/accountSettings.template/snimAccounts.template.html',
], function ($, _, Backbone, snimAccountsTemplate) {
    var snimAccountsView = Backbone.View.extend({
        el: "#snimAccounts",
        render: function () {
            this.$el.html(snimAccountsTemplate);
        },
    events: {
    	"click .connectGtalkBtn": "newImAcount"
    },
    validateEmail: function (email) { 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } ,
    newImAcount: function(e){
    	var strBaseUrl = null,passVal, userName;
    	if($("#MessangerSideTab").hasClass("selected")){
    		strBaseUrl = window.fuse.services.addIMSNAccount();
    		strBaseUrl += "?username={0}&password={1}";
    		passVal = $("#msnPassword").val();
    		userName = $("#msnUsername").val();
    		if(userName != "" && this.validateEmail(userName) && passVal != "" ){
    		strBaseUrl = strBaseUrl.format(userName, passVal );
    		}else{
    			strBaseUrl = null
    		}
    	}else if( $("#FacebookSideTab").hasClass("selected")){
    		strBaseUrl = window.fuse.services.addIMFacebookAccount();
    		strBaseUrl += "facebookToken={0}";
    		
    	}
    	if(strBaseUrl != null){
	    	window.fuse.fetcher.fetch({
	    		url: strBaseUrl,
	    		success:$.proxy(function(data){
	    			
	    			//$.publish("/settings/render/");
	    			
	    			if (data.data && data.data == true){
	    				//fetch
	    				//$.publish("renderSettings");
	    				
	    			}
	    			
	    		},this),
	    		error:function(){
	    			$.publish("renderSettings");
	    		}
	        		
	    		});
    	};
    }
    });
    
    return snimAccountsView;
});
