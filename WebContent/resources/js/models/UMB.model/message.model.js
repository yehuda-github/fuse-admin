define([
    'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	  var message = Backbone.NestedModel.extend({
		  url: window.fuse.services.messages

			  // temp solution. at the moment the account name is hard coded.
			  //return "/fuse/umb/messages/read?messageId=" + this.get("attributes").UID + "&accountName=SINGNET_2&folderPath=" + window.fuse.selectedFolder.get("name");
			  //return "/fuse/umb/messages/read?messageId=" + this.get("messageId") + "&accountName=" + this.get("accountName") +"&folderPath=" + this.get("folderPath");   
		  ,
	      defaults: {
	    	
			//"id": 1,
			"replyTo": [],
			"flags": {
			    "answered": false,
			    "deleted": false,
			    "draft": false,
			    "expunged": false,
			    "flagged": false,
			    "recent": false,
			    "seen": true,
			    "saveMail": false,
			    "sendMail": false
			    
			},
			"ccRecipients": [],
			"from": [],
			"attributes": {
			    "subject": "",
			    "UID": 1,
			    "hasAttachments": false,
			    "messageNumber": 1,
			    "receivedDate": 1341809748000,
			    "size": 21898
			},
			"bccRecipients": [],
			"allRecipients": [],
			"toRecipients": []
	      },
		  
	      initialize: function () {
	      }
	      
	  });
	  
	  return message;
});
