define(
		[
				'jquery',
				'underscore',
				'backbone',
				'views/settings.view/popup.view',
				'text!templates/settings.template/accountSettings.template/emailAddressesAccountItem.template.html', ],
		function($, _, Backbone, popupView, emailAddressesTemplate) {
			var emailAddressesView = Backbone.View.extend({
				tagName : "li",

				events : {
					"click .makePrimary" : "makePrimary",
					"click .removeBtn" : "removeAccountPop"
				},

				makePrimary : function(e) {
					_id = e.target.id;
					window.fuse.fetcher.fetch({
						url : window.fuse.services.makePramiryAccount()
								+ "?accountName="
								+ $(e.target).attr("accountName"),
						success : $.proxy(function(data) {

							if (data.error == null) {
								// fetch
								$.publish("renderSettings");

							}

						}, this),
						error : function() {
							$.publish("renderSettings");
						}

					});

				},
				
				removeAccountPop : function(e) {
					
					console.log('are you sure you want to remove?');
					
					window.fuse.popup({
						title : "Are you sure?",
						body : "Are you sure you want to remove this account? this action is permanent",
						callback : "/settings/remove",
						params : e
					});
					
				},

				render : function() {
					this.$el.html(_.template(emailAddressesTemplate, this.model
							.toJSON()));
					return this;
				},

				initialize : function() {
					// this.model.bind("change", this.render, this);
					// this.model.bind("destroy", this.removeAccount, this);

					/*
					 * this.save({ success: $.proxy(function() { alert("add
					 * Seccuess"); }), error: $.proxy(function() { alert("add
					 * fail"); }) });
					 */
					//$.subscribe("/settings/remove",$.proxy(this.testFunc,this));
				}
			});

			return emailAddressesView;
		});
