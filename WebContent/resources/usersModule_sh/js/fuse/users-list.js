var usersList = 
{
	BASE_URL: null,
	
	init: function()
	{
		usersList.events.init();
		usersList.handlers.createDataTable();
	},
	
	events: 
	{
		init: function()
		{
			usersList.events.datePickers();
			usersList.events.getUsers();
			usersList.events.clearAll();
		},
		
		datePickers: function()
		{
			$('#fromDate').datepicker();
			$('#toDate').datepicker();
		},
		
		getUsers: function()
		{
			$('#getUsers').click(function()
			{
				oDataTable = $('#example').dataTable();
				oDataTable.fnDraw();
			});
		},
		
		clearAll: function() 
		{
			$('#clearAll').click(function(event)
			{
				event.preventDefault();
				$(".searchInput").val("");
				$('#typeService').val('0');
			});
		}
	},
	
	createExcelData : function(){
		
		aoData = [];
		
    	//get params from search
		var fromDate = $('#fromDate').val();
		var toDate = $('#toDate').val();
		var fuse_id = $('#fuse_id').val();
		var msisdn = $('#msisdn').val();
		var name = $('#name').val();
		var cos = $('#cos').val();
		var email = $('#email').val();
		var type = $('#type').val();
		var activityStatus = $('#activityStatus').val();
		
		//insert them into the request object
		aoData.push({ "name": "fromDate", "value": fromDate });
		aoData.push({ "name": "toDate", "value": toDate });
		aoData.push({ "name": "fuse_id", "value": fuse_id });
		aoData.push({ "name": "msisdn", "value": msisdn });
		aoData.push({ "name": "email", "value": email });
		aoData.push({ "name": "type", "value": type });
		aoData.push({ "name": "clientName", "value": name });
		aoData.push({ "name": "cos", "value": cos });
		aoData.push({ "name": "activityStatus", "value": activityStatus });
		
		aoData.push({ "name": "iDisplayLength", "value": "-1" });
		aoData.push({ "name": "iDisplayStart", "value": "0" });
		
		aoData.push({ "name": "sSortDir_0", "value": 'asc' });
		
		sSource =  usersList.BASE_URL + "/users/listJSON";		
		
		$.getJSON( sSource, aoData, function (jsonData) 
		{ 
			var userArr = [];
			if(jsonData.aaData){
				for(var i=0;i<jsonData.aaData.length;i++)
				{
					u = jsonData.aaData[i];
					creationDate = new Date(u.creationDate);
					u.onBoard = creationDate.getDate()+"/"+(creationDate.getMonth()+1)+"/"+creationDate.getFullYear();
					u.MSISDN = "";
					
					u.type = jsonData.types[i];
					u.email = "";
					u.name = "";
					
					for(var j=0;j<jsonData.emails[i].length;j++){
						u.email += jsonData.emails[i][j];
						if(j<jsonData.emails[i].length -1){
							u.email += "<br />";
						}
					}
					
					for(var j=0;j<jsonData.msisdns[i].length;j++){
						u.MSISDN += jsonData.msisdns[i][j];
						if(j<jsonData.msisdns[i].length -1){
							u.MSISDN += "<br />";
						}
					}
					
					
					if(u.userContact)
					{
						u.name = u.userContact.firstName + " " + u.userContact.lastName;
					}
					
					userArr.push([
					    u.fuseId,
					    jsonData.ssoIds[i],
						u.onBoard,
						u.type,
						u.name,
						u.MSISDN,
						u.email,
						u.classOfSevice,
						u.activityStatus
					]);
				}
				
				usersList.createExcel(userArr);
			}
			
		} );
	},
	createExcel: function(userArr){
		postData = [{style: EXCEL_HEADER_STYLE, values: []}];
		$(".tableHeader").each(function(index, element){
			postData[0].values.push($(element).html());
		});
			
		for(var i=0; i<userArr.length; i++){
			postData.push({style: EXCEL_NORMAL_STYLE, values: []});
			postData[i+1].values = userArr[i];
		}
		
		$.ajax({
	        type: "POST",
	        url: usersList.BASE_URL + '/excel/export',
	        contentType: "application/json",
	        data: JSON.stringify(postData),
	        success: function (data) {
	        	location.href= usersList.BASE_URL + '/' + data;
	        }
		});
	},
	
	handlers: 
	{
		exportToExcel: function()
		{
			userArr = usersList.createExcelData();
		},
		
		createDataTable: function()
		{
			debugger;
			$('#example').dataTable( 
			{
				"sDom": 'T<"clear"> rtip',
		        "oTableTools": 
		        {
					"aButtons": 
					[
						{
							"sExtends": "text",
							"fnClick": usersList.handlers.exportToExcel,
							"sButtonText": "Excel"
						},
						{
							"sExtends": "print",
							"sButtonText": "Print",
							"bShowAll" : true 
						}
					]
		        },
		        "sScrollY": "550px",
				"iDisplayLength": 9,
				"sAjaxSource": usersList.BASE_URL + "/users/listJSON",
				"bProcessing": true,
				"bServerSide": true,
				"bPaginate": true,
				"bFilter ": false,
				"bSort": true,
				"bAutoWidth": false,
			    "fnServerData": function ( sSource, aoData, fnCallback ) 
			    {
			    	debugger;
			    	//get params from search
					var fromDate = $('#fromDate').val();
					var toDate = $('#toDate').val();
					var fuse_id = $('#fuse_id').val();
					var msisdn = $('#msisdn').val();
					var name = $('#name').val();
					var cos = $('#cos').val();
					var email = $('#email').val();
					var type = $('#type').val();
					var activityStatus = $('#activityStatus').val();
					
					//insert them into the request object
					aoData.push({ "name": "fromDate", "value": fromDate });
					aoData.push({ "name": "toDate", "value": toDate });
					aoData.push({ "name": "fuse_id", "value": fuse_id });
					aoData.push({ "name": "msisdn", "value": msisdn });
					aoData.push({ "name": "clientName", "value": name });
					aoData.push({ "name": "cos", "value": cos });
					aoData.push({ "name": "email", "value": email });
					aoData.push({ "name": "type", "value": type });
					aoData.push({ "name": "activityStatus", "value": activityStatus });
					
					$.getJSON( sSource, aoData, function (jsonData) 
					{ 
						debugger;
						if(jsonData.aaData){

							for(var i=0;i<jsonData.aaData.length;i++)
							{
								u = jsonData.aaData[i];
								creationDate = new Date(u.creationDate);
								u.onBoard = creationDate.getDate()+"/"+(creationDate.getMonth()+1)+"/"+creationDate.getFullYear();
								u.MSISDN = "";
								
								u.type = jsonData.types[i];
								u.email = "";
								u.name = "";
								
								if(jsonData.emails[i]){
									for(var j=0;j<jsonData.emails[i].length;j++){
										u.email += jsonData.emails[i][j];
										if(j<jsonData.emails[i].length -1){
											u.email += "<br />";
										}
									}
								}

								if(jsonData.msisdns[i]){
									for(var j=0;j<jsonData.msisdns[i].length;j++){
										u.MSISDN += jsonData.msisdns[i][j];
										if(j<jsonData.msisdns[i].length -1){
											u.MSISDN += "<br />";
										}
									}
								}

								
								if(u.userContact)
								{
									u.name = u.userContact.firstName + " " + u.userContact.lastName;
								}
								
								if(jsonData.ssoIds[i]){
									u.ssoId =  jsonData.ssoIds[i];
								}
							}
						}
						
						//manipulate data to fit to table.							
						fnCallback(jsonData);
						$('.dataTables_scroll').css('overflow','visible');
						$('.dataTables_scrollBody').css("width", "auto");
						$('.dataTables_scrollBody').css("height", "auto");
						$('#user_list tr').css("cursor", "pointer");
						
			    		$('#user_list tr').click(function(e){
			    			var contactId = $(e.target).parent()[0].firstChild.firstChild.data;//$(e.target).parent()[0].children[0].innerText;
			    			window.open(usersList.BASE_URL + '/users/userDetails?id=' + contactId);
			    			//location.href=  ;
			    		});
					} );
				},
				
				"aoColumns": [
		  			{ "mDataProp": "fuseId"		, "bSortable": false,'sWidth':'10px' },
		  			{ "mDataProp": "ssoId"	, "bSortable": false },
		  			{ "mDataProp": "onBoard" },
		  			{ "mDataProp": "type" 		, "bSortable": false},
		  			{ "mDataProp": "name" 		, "bSortable": false},
		  			{ "mDataProp": "MSISDN" 	, "bSortable": false},
		  			{ "mDataProp": "email" 		, "bSortable": false},
		  			{ "mDataProp": "classOfSevice" , "bSortable": false},
		  			{ "mDataProp": "activityStatus" , "bSortable": false}
		  		],
		  		
				"sPaginationType": "full_numbers",
				"oLanguage": {
					"sSearch": "Search all columns:",
					"sLengthMenu": "Display _MENU_ subscribers per page",
					"sInfo": "Displaying subscribers _START_ - _END_ of _TOTAL_ "
				}
		    });
		}
	}
};