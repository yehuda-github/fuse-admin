define([
  'jquery',
  'underscore',
  'backbone',
  'models/settings.model/account.model',
], function ($, _, Backbone, account) {
    var accountsCollection = Backbone.Collection.extend({
    	url: window.fuse.services.accounts,
    	
        model: account
    });

    return accountsCollection;
});
