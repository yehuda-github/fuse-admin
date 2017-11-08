define([
    'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	  var filter = Backbone.Model.extend({
		  url: window.fuse.services.filtter,
		  
		  calculateFilter: function(){
			  var emailArr = this.defaults.filterEmail,
			  imArr = this.defaults.filterIM,
			  smsFilterResult = this.defaults.filterSms ? "1":"0",
			  filterResult = [];
			  for (var i=0; i<emailArr.length; i++){
				  filterResult[emailArr[i].place] = emailArr[i].status ? "1": "0";
			  }
			  for (var i=0; i<imArr.length; i++){
				  filterResult[imArr[i].place] = imArr[i].status ? "1": "0";
			  }
			  
			  filterResult.push(smsFilterResult);
			  
			  return filterResult.join("");
		  },
		  defaults: {
			  filterSms : true,
	    	  filterEmail: [],
	    	  filterIM : []
		  },
		  parse: function(data){
			  var response={
					  filterSms: true,
					  filterEmail :[],
					  filterIM:[]
			  };
			  for(var i =0; i<data.length; i++){
				  if(data[i].type=="emailFilter"){
					  response.filterEmail.push({name:data[i].name, status: true, place: i});
				  }else{
					  response.filterIM.push({name:data[i].name, status: true, place: i});
				  }
				  
			  }
			  
			  return response;
		  },
		  initialize: function () {
			  
			  
		  }
	  });
	  
	  return filter;
});