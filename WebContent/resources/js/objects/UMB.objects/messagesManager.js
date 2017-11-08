define(['objects/http'],function(http) {
	function selectAction(action, messagesList) {
		 var data;
		 data = prrepareData(messagesList);
		 var objToSend;
		 
		 if(action !== "markAsUnread" && action !== "markAsRead") {
			 objToSend = {
					 moveFrom: window.fuse.selectedFolder.get("alias"),
					 moveTo : action
			 };
		 }
		 else {
			 objToSend = {
					 folder: window.fuse.selectedFolder.get("alias")
			 };
		 }
	
		 objToSend.data = data;
		 //console.log("dataHolder: ", objToSend);
		 
		 http.doAjax(objToSend, action);
	}
	
	function prrepareData(messagesList) { 
		var dataHolder;
		dataHolder = [];
		//console.log("prrepareData");
		for (var i=0; i<messagesList.length; i++) {
			var message = messagesList[i].attributes;
			if (dataHolder.length > 0) {
				for (var j=0; j<dataHolder.length; j++) {
					var currObj = dataHolder[j];
					if (message.attributes.accountName === currObj.account) {
						currObj.messages.push(message.attributes.UID);
						break;
					}
					
					dataHolder.push({account: message.attributes.accountName, messages: [message.attributes.UID]});
				}
			} else {
				dataHolder.push({account: message.attributes.accountName, messages: [message.attributes.UID]});
			}
		}
		return dataHolder;
	}
	
	return {
		selectAction: selectAction
	};
});