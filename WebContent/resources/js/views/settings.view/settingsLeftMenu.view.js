define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/settings.template/settingsLeftMenu.template.html'
], function ($, _, Backbone, settingsLeftMenuTemplate) {
    var settingsLeftMenuView = Backbone.View.extend({
        el: ".leftMenu",
        render: function () {
            this.$el.html(settingsLeftMenuTemplate);
        }
    });
    
    return settingsLeftMenuView;
});
