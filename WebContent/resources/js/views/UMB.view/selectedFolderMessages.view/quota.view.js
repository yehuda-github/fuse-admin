define([
  'jquery',
  'underscore',
  'backbone',
  'translations',
  'models/UMB.model/quota.model',
  'text!templates/UMB.template/selectedFolderMessages.template/quota.template.html'
], function ($, _, Backbone, translations, quota, quotaTemplate) {
    var quotaView = Backbone.View.extend({
    	el: ".quotaRubric",
    	
        render: function () {
        	var _quota = new quota();
        	
        	_quota.fetch({
        		success: $.proxy(function() {
        			this.$el.html(_.template(quotaTemplate));
        		
        			var _usage = _quota.get("usage");
        			
        			
        			var _limit = _quota.get("limit");
        			
        			this.$(".usageDataUsed", this.el).text(_usage);
        			this.$(".usageDataAvailable", this.el).text(_limit);
        			
        			var _usagePercentNumber = Math.round(_usage * 100 / _limit);
        			if (isNaN(_usagePercentNumber)) {
        				_usagePercentNumber = 0;
        			}
        			
        			
        			
        			var _progressLeftWidth = this.$(".progressLeft", this.el).width();
        			var $progressCenter = this.$(".progressCenter", this.el);
        			var $progressRight = this.$(".progressRight", this.el);
        			
        			$progressCenter.text(_usagePercentNumber + "%");
        			
        			var _minWidth = parseInt($progressCenter.css("min-width"), 10);
        			var _maxWidth = parseInt($progressCenter.css("max-width"), 10);
        			
        			var _smallestPercentThatCanBeVisible = Math.round(_minWidth * 100 / _maxWidth);
        			
        			//_usagePercentNumber = 64;
        			//$progressCenter.text(_usagePercentNumber + "%");
        			if(_usagePercentNumber > _smallestPercentThatCanBeVisible) {
        				$progressCenter.width(Math.round(_usagePercentNumber * _maxWidth / 100));
        				$progressRight.css("left", (_progressLeftWidth + $progressCenter.width()) + "px");
        			}
        			else {
        				$progressCenter.width(_minWidth);
        				$progressRight.css("left", (_progressLeftWidth + _minWidth) + "px");
        			}
        			
        			translations.changeText(translations.view.umbQuota);
        		}, this)
        	});
        	
        	return(this);
        }
    });
    
    return quotaView;
});
