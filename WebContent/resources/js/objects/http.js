define(function(messagesManager) {

	var dataToSend = null;
			
	function markAsUnread() {
		options = {};
		options.type    = "POST";
		options.url     = window.fuse.services.markAsUnRead();
		options.data    = "data=" + JSON.stringify(dataToSend);
		options.success = function(respose) {
			
			if (respose && !respose.error) {
				// notify router.
			} 
		};
		options.error = function(error){
			
		};
		makeRequest(options);
	}

	function markAsRead() {
		options = {};
		options.type    = "POST";
		options.url     = window.fuse.services.markAsRead();
		options.data    = "data=" + JSON.stringify(dataToSend);
		options.success = function(respose) {
			if (respose && !respose.error) {
				// notify router.
			} 
		};
		
		options.error = function(error) {
		};
		
		makeRequest(options);
	}
	
	function saveMail(data){	
		//console.log(data);
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: window.fuse.baseUrl+'umb/messages/save',
			data: {to: data.to, cc: data.cc, bcc: data.bcc, subject:data.subject, content:data.content, attachments: data.attachments},
			success:function(data){
				window.fuse.router.navigate("folder/inbox",true)
			},
			error:function(){
				alert('There is a problem, please try again...');
			},
			complete:function(){
			}
		});
	}
	
	function sendMail(data){	
		//console.log(data);
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: window.fuse.baseUrl+'umb/messages/send',
			data: {to: data.to, cc: data.cc, bcc: data.bcc, subject:data.subject, content:data.content, attachments: data.attachments},
			success:function(data){
				window.fuse.router.navigate("folder/inbox",true)
			},
			error:function(){
				alert('There is a problem, please try again...');
			},
			complete:function(){
			}
		});
		
	}
		
	function getBodyMessage(data) {
		var options;

		options = {};
		options.type    = "GET";
		options.dataType = "json";
		options.url     = window.fuse.services.getBody();
		options.data    = {messageId: data.id, accountName: data.accountName, folderPath: data.folderPath};
		options.success = function(response) {
			if (response && response.message && response.message.content) {
				//console.log(typeof data.onSuccess);
				data.onSuccess(response.message.content);
			} 
			else {
				//console.log(response);
			}
		};
		options.error = function(error) {
			data.onError(error);
		};
		
		makeRequest(options);
	}
	
	function makeRequest(options) {
		//console.log("options: ", options);
		$.ajax(options);
	}
	
	function doPut(data, action) {
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: '',
			data: {to: data.to, cc: data.cc, bcc: data.bcc, subject:data.subject, content:data.content, attachments: data.attachments},
			success:function(data){
				
			},
			error:function(){
				alert('There is a problem, please try again...');
			},
			complete:function(){
			}
		});
	}

	function deleteItems() {
		
		console.log("deleteItems");
		var options;
		
		options = {};
		options.type    = "POST";
		options.url     = window.fuse.services.moveToFolder();
		options.data    = "data=" + JSON.stringify(dataToSend);
		options.success = function(respose) {
			if (respose && !respose.error) {
				
				$.publish("/selectionsActions/deleteItemsSuccess/");
			} 
		};
		
		options.error = function(error){};
		
		//$.publish("/selectionsActions/deleteItemsSuccess/");
		makeRequest(options);
	}
	
	function spam() {
		
		//console.log("spam");
		var options;
		
		options = {};
		options.type    = "POST";
		options.url     = window.fuse.services.moveToFolder();
		options.data    = "data=" + JSON.stringify(dataToSend);
		options.success = function(respose) {
			if (respose && !respose.error) {
				$.publish("/selectionsActions/moveToSpamSuccess/");
			} 
		};
		
		options.error = function(error){};
		
    	//$.publish("/selectionsActions/moveToSpamSuccess/");
		makeRequest(options);
	}
	
	function moveToFolder() {
		
		//console.log("moveToFolder");
		var options;
		
		options = {};
		options.type    = "POST";
		options.url     = window.fuse.services.moveToFolder();
		options.data    = "data=" + JSON.stringify(dataToSend);
		options.success = function(respose) {
			if (respose && !respose.error) {
				$.publish("/selectionsActions/moveToFolderSuccess/");
			} 
		};
		
		options.error = function(error){};
		
		//$.publish("/selectionsActions/moveToFolderSuccess/");
		makeRequest(options);
	}
	
	
	function doAjax(data, action) {
		dataToSend = data;
		
		switch(action) {
		
			case "trash":
			  deleteItems();
			  break;
			  
			case "getBodyMessage":
				getBodyMessage(data);
				break;

			case "spam":
				spam(data);
				break;

			case "moveToFolder":
				moveToFolder(data);
				break;
				
			case "markAsUnread":
				markAsUnread();
				break;
				
			case "markAsRead":
				markAsRead();
				break;
					
			case "saveMail":
				saveMail(data);
				break;
				
			case "sendMail":
				sendMail(data);
				break;
				
			default:
				moveToFolder(data);
			    // do something.
				break;
		}
	}
	
	return {
		doAjax: doAjax
	};
});