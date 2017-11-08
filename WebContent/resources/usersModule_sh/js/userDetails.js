
//clear fields
clearFields = function(){
	
};

makeDate = function(dateNumber){
	var date;
	var retVal;
	
	if(dateNumber == 0){
		retVal = 'N/A';
	}
	else if (dateNumber == -1){
		retVal = 'N/A';
	}
	else{
		date = dateNumber ? (new Date(dateNumber)) : '';
		retVal = dateNumber ? date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() : '';
	}
	
	return retVal;
};

//fill fields with data
fillFields = function(data){
	console.log('data is:' + data);
	var name = data.displayName ? data.displayName : '';
	
	$('#udFuseIdVal').text(data.fuseId ? data.fuseId : '');
	$('#udFuseNameVal').text(name);
	$('#udFuseIdLineVal').text(data.fuseId).attr('title', data.fuseId);
	$('#udExternalIdLineVal').text(data.externalId).attr('title', data.externalId);
	$('#udStatusLineVal').text(data.userState).attr('title', data.userState);
	
	var isOnline = "UNAVAILABLE";
	if(Array.isArray(data.presencesList)){
		for(var i=0; i<data.presencesList.length; i++){
			if(data.presencesList[i].socialNetworkAccount && data.presencesList[i].socialNetworkAccount.socialNetworkId === 'FUSE_NETWORK'){
				/*isOnline = data.presencesList[i].myPresenceStatus && data.presencesList[i].myPresenceStatus.toUpperCase() === 'AVAILABLE' ? true : false;*/
				isOnline = data.presencesList[i].myPresenceStatus && data.presencesList[i].myPresenceStatus.toUpperCase();
				
				switch (isOnline) {
			    case "AVAILABLE":
			    	$('#udPresenceImg').removeClass('busy','away','offline').addClass('online');
			        break;
			    case "UNAVAILABLE","BUSY","ON_A_CALL":
			    	$('#udPresenceImg').removeClass('online','away','offline').addClass('busy');
			        break;
				case "AWAY":
					$('#udPresenceImg').removeClass('online','busy','offline').addClass('away');        
					break;
				case "UNKNOWN","OFFLINE":
					$('#udPresenceImg').removeClass('online','busy','away').addClass('offline');
				    break;
				default:
					$('#udPresenceImg').removeClass('online','busy','away').addClass('offline');
				    break;
				}
			}
		}
	}

	
	//image
	if(data.imageBuffer && data.imageBuffer.empty === false){
		var imageByteArr = data.imageBuffer.byteArr ? data.imageBuffer.byteArr : "";
		var imageByteArrStr = imageByteArr.toString();
		
		$('#udProfileImg').html('<img class="imageProfile" src="data:image/png;base64,' + imageByteArrStr +'" />');
		$('#udProfileImg').removeClass('userImageDefault');
	}
	else{
		$('#udProfileImg').html();
		$('#udProfileImg').addClass('userImageDefault');
	}
	
	
	
	
	
	
	//cos
	if(data.classOfService){
		var serviceLevel = data.classOfService.serviceLevel ? data.classOfService.serviceLevel : '';
		var source = data.classOfService.source ? data.classOfService.source : '';
		
		
		$('#udTypeLineVal').text(serviceLevel).attr('title',serviceLevel);
		$('#udSourceLineVal').text(source).attr('title', source);
		$('#udStartDateLineVal').text(data.classOfService.serviceStartDateTime !== ''? makeDate(data.classOfService.serviceStartDateTime) : '');
		$('#udEndDateLineVal').text(data.classOfService.serviceEndTDateime !== ''? makeDate(data.classOfService.serviceEndTDateime) : '');
	}
	
	//customers
	if(data.customersList){
		var customersList = data.customersList;
		var customer;
		var type, id, status, template;
		
		$('#udAccountsBody').html('');
		
		for(var i=0; i<customersList.length; i++){
			customer = customersList[i];
			type = customer.custOperator ? customer.custOperator : '';
			id = customer.custID ? customer.custID : '';
			status = customer.custStatus ? customer.custStatus : '';
			
			template = "<div class='udAccountsLine'>" +
						  "<div class='udAccountsTypeVal heavyBlueBorder floatLeft udAccountLineLeft smallMarginTop textVal' title='"+type+"'>"+type+"</div>"+
										"<div class='udAccountsIdVal heavyBlueBorder floatLeft udAccountLineCenter smallMarginTop textVal' title='"+id+"'>"+id+"</div>"+
										"<div class='udAccountsActiveVal heavyBlueBorder floatLeft udAccountLineRight smallMarginTop textVal' title='"+status+"'>"+status+"</div>"+
									"</div>";
			$('#udAccountsBody').append(template);
		}
	}
	
	//devices
	if(data.devicesList){
		var devicesList = data.devicesList;
		var device;
		var type, os, status, ver;
		
		$('#udClientsBody').html('');
		
		for(var i=0; i<devicesList.length; i++){
			device = devicesList[i];
			type = device.deviceType ? device.deviceType : '';
			os = device.osType ? device.osType : '';
			ver = device.appVersion ? device.appVersion : '';
			status = device.deviceConnectionStatus ? device.deviceConnectionStatus : '';
			
			template = "<div class='udClientsLine'>"+
							"<div class='udClientsTypeVal heavyBlueBorder textVal floatLeft smallMarginTop udClientLineLeft' title='"+type+"'>"+type+"</div>"+
									"<div class='udClientsOSVal heavyBlueBorder textVal floatLeft smallMarginTop udClientLineLeftCenter' title='"+os+"'>"+os+"</div>"+
									"<div class='udClientsStatusVal heavyBlueBorder textVal floatLeft smallMarginTop udClientLineCenter' title='"+status+"'>"+status+"</div>"+
									"<div class='udClientsAppVerVal heavyBlueBorder textVal floatLeft smallMarginTop udClientLineRight' title='"+ver+"'>"+ver+"</div>"+
					    "</div>";
			$('#udClientsBody').append(template);
		}
	}
	
	//activity
	
	$('#udRegDateLineVal').text(makeDate(data.registrationDate));
	$('#udLastLoginLineVal').text(makeDate(data.lastLogin));
	$('#udLastActiveLineVal').text(makeDate(data.lastActivityDate));
	$('#udActiveStatusLineVal').text(data.activityStatus);
	
	$('#udActiveStatusChangeLineVal').text(makeDate(data.activityStatusDateChange));
	
};

//get data from server
getUserDetails = function(){
	var contactId = $('#udBody').attr('class');
	clearFields();
	$.getJSON(BASE_URL + '/users/userDetailsData', {userId: contactId}, function(data) {
		if(data){
			fillFields(data);
			console.log(data);
		}
		});
};

init = function(){
	$('#udPrint').click(function(){
		window.print();
	});
	
	$('#udReload').click(function(){
		getUserDetails();
	});
};

$(document).ready(function(){
	
	init();
	getUserDetails();
	

});