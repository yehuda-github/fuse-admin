define([
  'jquery',
  'underscore',
  'backbone',
  'views/settings.view/popup.view',
  'views/settings.view/accountSettings.view/emailAddressesAccountItem.view',
  'text!templates/settings.template/accountSettings.template/emailAddresses.template.html',
], function ($, _, Backbone, popupView, emailAddressesAccountItemView, emailAddressesTemplate) {
    var emailAddressesView = Backbone.View.extend({
        el: "#emailAddresses",
        
        events: {
        	"click #addEmailAddressBtn": "addNewMail",
        	"click .SettingsReplyFrom" : "SettingsReplyFrom"
        },
 
        render: function () {
        	
        	
            this.$el.html(_.template(emailAddressesTemplate, this.model.attributes));
        	var _accounts = this.model.get("accounts");
        	var _accountsListUl = this.$('ul.accountsList');
        	
        	
            for (var i = 0; i < _accounts.length; i++) {
            	
            	_accountsListUl.append(
                	new emailAddressesAccountItemView({model: _accounts.at(i)}).render().el
                );
            }
            
        },
        
        addNewMail: function() {
        	
        	new popupView({model: this.model.get("accounts")}).render();
        },
        
        SettingsReplyFrom : function(e){
        	var _in = $(e.target).attr('id');
        	
        	if(_in=="a4") {this.model.set("shouldSendMailFromPrimary", false); }
        		
        	
        	if(_in=="a5") { this.model.set("shouldSendMailFromPrimary", true); }
        	
    
        	//window.fuse.fetcher.save({
        	window.fuse.fetcher.fetch({
        		//url: this.model.url,
        		url: this.model.url() + "/" + this.model.get("shouldSendMailFromPrimary"),
        		
				success:function(){ },
				error:function(){}
			});
        	
        },
		
		removeAccount : function(e, data) {

			_id = data.target.id;
			window.fuse.fetcher.fetch({
				url : window.fuse.services.removeAccount()
						+ "?accountName="
						+ $(data.target).attr("accountName"),
				success : $.proxy(function(data) {

					// $.publish("/settings/render/");

					if (data.data && data.data == true) {
						// fetch
						$.publish("renderSettings");

					}

				}, this),
				error : function() {
					$.publish("renderSettings");
				}

			});
		},
        
        initialize : function() {
			// this.model.bind("change", this.render, this);
			// this.model.bind("destroy", this.removeAccount, this);

			/*
			 * this.save({ success: $.proxy(function() { alert("add
			 * Seccuess"); }), error: $.proxy(function() { alert("add
			 * fail"); }) });
			 */
			$.subscribe("/settings/remove",$.proxy(this.removeAccount,this));
		}
    });
    
    return emailAddressesView;
});
