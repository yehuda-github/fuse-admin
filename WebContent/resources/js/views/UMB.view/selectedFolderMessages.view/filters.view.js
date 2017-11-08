define([
  'jquery',
  'underscore',
  'backbone',
  'collections/settings.collection/accounts.collection',
  'text!templates/UMB.template/selectedFolderMessages.template/filters.template.html'
], function ($, _, Backbone, accountsCollection, filterTemplate) {
	var filterView = Backbone.View.extend({
		 el: '.filtersView',
		
		 _accounts : "",
		 _sms : "1",
		 _filters : "0",
		 
         initialize: function() {
        	 this.addGlobalEvents();
        	 $.subscribe("/filtersView/onMessageItemStateChanged", $.proxy(this.onMessageItemStateChanged, this));
        	 $.subscribe("/filtersView/showHideExpandBtn", $.proxy(this.showHideExpandBtn, this))
         },
		 
		 render: function () {   
			 this.$el.html(filterTemplate);
			 return(this);
         },
         
         events: {
        	
         	"click .barTop-sms" : "onSmsFilterClick",
         	"click .barTop-im" : "onImFilterClick",
        	"click .barTop-print": "barTopPrintClick",
        	"click .expand-btn" : "onExpandClick"
         },
                  
         barTopPrintClick: function() {
         	$.publish("/messageItem/onPrintClick");
         },
         
         onExpandClick: function() {
         	$.publish("/messageItem/expandAll");
         },
         
         
		onSmsFilterClick: function(){
			if($('.barTop-sms-icon').hasClass('sms-icon-sel')){
				this.topSmsFilterClose();}else{this.topSmsFilterOpen();
			}
		},
		
		onImFilterClick: function(){
			if($('.barTop-im-icon').hasClass('im-icon-sel')){
				this.topImFilterClose();}else{this.topImFilterOpen();
			}
		},
		
		topImFilterOpen: function(){
    		// Getting folders list
			//console.log("Reading Filters : ",this._filters);
        	var _accountsCollection = new accountsCollection();
        	_accountsCollection.fetch({
        		  success: $.proxy(function() {
        			  //console.log(_accountsCollection);
        			  /*
        			  var myAccounts=new Array();
        			  myAccounts[0]="my_cool@google.com";
        			  myAccounts[1]="another@yahoo.com";
        			  myAccounts[2]="and_yet_another@hotmail.com";
        			  */
        			  //console.log("accounts collection : ",_accountsCollection);
        			  
        			  $('.barTop-im-popup-inner').append("<table class='accounts_popup_table'></table>");
        			  
        			  if(this._accounts != ''){
        			  
	        			  var selected_accounts=this._accounts.split("");
	        			  
	        			  for (var i in _accountsCollection.pluck("name")){
	      	        		var _n = _accountsCollection.pluck("name")[i];
	      	        		if(selected_accounts[i]!='1'){
	      	        			//console.log(selected_accounts[i]);
	      	        			$('.accounts_popup_table').append("<tr style='color:#000; margin-bottom:5px;'><td><input type='checkbox' class='accounts_checkbox' /></td><td style='padding-left:5px; padding-bottom:5px;'>"+_n+"</td></tr>");
	      	        		}else{
	      	        			$('.accounts_popup_table').append("<tr style='color:#000; margin-bottom:5px;'><td><input type='checkbox' class='accounts_checkbox' checked='checked' /></td><td style='padding-left:5px; padding-bottom:5px;'>"+_n+"</td></tr>");
	      	        		};
	      	        	  };
      	        	  
        			  }else{
        				  
        				  for (var i in _accountsCollection.pluck("name")){
  	      	        		var _n = _accountsCollection.pluck("name")[i];
  	      	        		$('.accounts_popup_table').append("<tr style='color:#000; margin-bottom:5px;'><td><input type='checkbox' class='accounts_checkbox' checked='checked' /></td><td style='padding-left:5px; padding-bottom:5px;'>"+_n+"</td></tr>");
  	      	        	  };
        				  
        			  };
        			  
      	        	  $('.barTop-im-popup-bottom').append("<div style='color:#000; float:right; margin:7px;'><a class='im-popup-close' style='color:#A51014; text-decoration:none;' href='javascript:void(0);'>Close</a></div>");
      	        	  
      	        	  $('.accounts_popup_table').click(function(){
      	        		  //return false;
      	        	  });
      	        	  
      	        	  $('.im-popup-close').click($.proxy(function(){
      	        		  
      	        		//submit changes
	          	  		var sList = "";
		          	  	$('.barTop-im-popup :checkbox').each(function () {
		          	  		sList += this.checked ? "1" : "0";
		          	  	});
		          	  	
          	  			this._accounts = String(sList);
          	  			this._filters = String(this._sms)+String(this._accounts); 
          	  			
          	  			//console.log("publishing",this._filters);
          	  			
          	  			//publish new filters list
          	  			$.publish("/messages/getMessagesWithFilters/",this._filters);
          	  			
	          	  		$('.barTop-im').removeClass('barTop-im-selected');
	    	  			$('.barTop-im-icon').removeClass('im-icon-sel');
	    	  			$('.barTop-im-popup').hide();
	    	  			$('.barTop-im-popup-inner').html('');
	    	  			$('.barTop-im-popup-bottom').html('');
          	  			
      	        	  },this));
      	        	  
        		  }, this),
        		  
        		  error: function(e)  {
        			  alert(e);
        		  }
        	});
			
			$('.barTop-im').addClass('barTop-im-selected');
			$('.barTop-im-icon').addClass('im-icon-sel');
			$('.barTop-im-popup').show();
		},
		
		topImFilterClose: function(){
			alert("topImFilterClose");
			$('.barTop-im').removeClass('barTop-im-selected');
			$('.barTop-im-icon').removeClass('im-icon-sel');
			$('.barTop-im-popup').hide();
			$('.barTop-im-popup-inner').html('');
			$('.barTop-im-popup-bottom').html('');
		},
		
		topSmsFilterOpen: function(){
			$('.barTop-sms-icon').addClass('sms-icon-sel');
			this._sms = 0;
			this._filters = this._sms+this._accounts;
			//console.log("publishing",this._filters);
			$.publish("/messages/getMessagesWithFilters/",this._filters);
		},
		
		topSmsFilterClose: function(){
			$('.barTop-sms-icon').removeClass('sms-icon-sel');
			this._sms = 1;
			this._filters = this._sms+this._accounts;
			//console.log("publishing",this._filters);
			$.publish("/messages/getMessagesWithFilters/",this._filters);
		},
		
        onMessageItemStateChanged: function(e, data) {
        	
        	//console.log("onMessageItemStateChanged : ",action);
        	
        	if (data.action == "hide") {
        		$(".backBtn").show();
        		$(".itemActions").show();
        		$(".selectionAndActions").hide();
        		
        		$(".unselectAllBtn").hide();
        		$(".markReadBtn").hide();
        		
        		$('.barTop-icons-wrapper').show();
        		$('.barTop-im').hide();
        		$('.barTop-sms').hide();
        		
        		$('.quotaRubric').hide();
        		
        	}
        	else {
        		$(".backBtn").hide();
        		$(".itemActions").hide();
        		$(".selectionAndActions").show();
        		
        		$(".unselectAllBtn").show();
        		$(".markReadBtn").show();
        		
        		$('.barTop-icons-wrapper').hide();
        		$('.barTop-im').show();
        		$('.barTop-sms').show();
        		
        		$('.quotaRubric').show();
        	}
        },
        showHideExpandBtn: function(e, data) {
        	var $expandBtn = this.$el.find(".expand-btn");
        	data.show ? $expandBtn.show() : $expandBtn.hide();
        },
        addGlobalEvents: function() {
        	$(document).click(function(e) {
        		var evn = typeof e.srcElement === 'undefined' ? e.target : e.srcElement; 
        		if(!$(evn).hasClass("barTop-im") && !$(evn).parents(".barTop-im").length>0){
	        		if(!($(evn).hasClass("barTop-im-popup") || $(e.srcElement).parents(".barTop-im-popup").length>0)){
	        			$('.im-popup-close').click();
	        		}
        		}
        		
        	});
        }
	});
	
	return filterView;
});