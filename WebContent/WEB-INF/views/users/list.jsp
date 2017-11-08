<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

	<head>
	
		<title>LoopMe Admin</title> 
		<c:url value="/" var="baseURL" />
		<c:url value="/resources" var="resourcesURL" />
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/amdocs.css" />
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/jquery.ui.theme.css" />
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/jquery.ui.datepicker.css" />
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/usersModule_sh/css/TableTools/TableTools.css" />
	
	
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/fuse/constants.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/jquery-1.7.2.min.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/jquery-ui-1.8.21.custom.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/dataTables/jquery.dataTables.min.js" type="text/javascript"></script> 
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/TableTools/ZeroClipboard.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/TableTools/TableTools.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/json2.js" type="text/javascript"></script>
		<script src="${pageContext.request.contextPath}/resources/usersModule_sh/js/fuse/users-list.js" type="text/javascript"></script>
		<script>
			$(document).ready(function($) {
				usersList.BASE_URL = '${pageContext.request.contextPath}';
				usersList.init();
			});
			
			(function($) {
				  var o = $({});
				 
				  $.subscribe = function() {
				    o.on.apply(o, arguments);
				  };
				 
				  $.unsubscribe = function() {
				    o.off.apply(o, arguments);
				  };
				 
				  $.publish = function() {
				    o.trigger.apply(o, arguments);
				  };
			}(jQuery));	
		</script>
		
	</head>
	
	<body>
		<div class="main">
			<div class="container">
				<div class="full_width">
					<div class="header">
						<div class="logo">
							<img src="${pageContext.request.contextPath}/resources/usersModule_sh/images/admin-logo.png" />
						</div>
						<div class="clear"></div>
						<div class="title"><h1>User Management</h1></div>
					</div>
					<div class="filters">
						<div class="fields">
							<ul>
								<li>
									<label>Start Date:</label>
									<input type="text" name="fromDate" id="fromDate" class="searchInput" />
								</li>
								<li>
									<label>End Date:</label>
									<input type="text" name="toDate" id="toDate" class="searchInput" />
								</li>
								<li>
									<label>FUSE ID:</label>
									<input type="text" name="fuse_id" id="fuse_id" class="searchInput" />
								</li>
								<li>
									<label>MSISDN:</label>
									<input type="text" name="msisdn" id="msisdn" class="searchInput" />
								</li>
								
								<li>
									<label>CoS:</label>
									<input type="text" name="cos" id="cos" class="searchInput" />
								</li>
								
								<li>
									<label>Email:</label>
									<input type="text" name="email" id="email" class="searchInput" />
								</li>
								
								<li>
									<label>Type:</label>
									<br/>
									<select id="typeService" onchange="$('#type').val($('#typeService').val());">
										<option value=""> </option>
										<option value="1">STM</option>
										<option value="2">OTT</option>
										<option value="3">SNBB</option>
										<!--option value="4">STM+SNBB</option-->
									</select>
									<input type="text" name="type" id="type" class="searchInput" style="display:none;" />
								</li>
								 
							</ul>
						</div>
						<div class="actions">
							<a href="" name="clearAll" id="clearAll">Clear All</a>&nbsp;
							<input type="button" name="getUsers" id="getUsers" value="Go" style="width:70px; cursor:pointer" />
						</div>	
					</div>	
				</div>
				
				<div class="inner">	
					<table cellpadding="0" cellspacing="0" border="1" rules="rows" class="display dataTable" id="example" style="width:980px !important;" aria-describedby="example_info">
						<thead>
							<tr role="row" class="dataTable_headers">
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 40px; " aria-sort="ascending" aria-label="FUSE ID: activate to sort column descending">
									
										<div class="tableHeader">FUSE ID</div>
									
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 120px; " aria-label="SSO ID: activate to sort column ascending">							
										<div class="tableHeader">SSO ID</div>
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 120px; " aria-label="Onboarding date: activate to sort column ascending">
									<div class="DataTables_sort_wrapper">
										<div class="tableHeader">Onboarding date</div>								
										<span class="DataTables_sort_icon css_right ui-icon ui-icon-carat-2-n-s"></span>
									</div>
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 80px; " aria-label="Type: activate to sort column ascending">							
										<div class="tableHeader">Type</div>															
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 150px; " aria-label="Name: activate to sort column ascending">							
										<div class="tableHeader">Name</div>														
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 140px; " aria-label="MSISDN: activate to sort column ascending">							
										<div class="tableHeader">MSISDN</div>															
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 150px; " aria-label="Email: activate to sort column ascending">							
										<div class="tableHeader">Email</div>										
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 100px; " aria-label="CoS: activate to sort column ascending">
										<div class="tableHeader">CoS</div>
								</th>
								<th class="ui-state-default" role="columnheader" tabindex="0" aria-controls="example" rowspan="1" colspan="1" style="width: 100px; " aria-label="Activity Status: activate to sort column ascending">
										<div class="tableHeader">Activity Status</div>
								</th>
							</tr>
						</thead>
						
						<tbody id="user_list" role="alert" aria-live="polite" aria-relevant="all">	
						</tbody>
					</table>
				
					<div class="gray_statusBar">
					</div>
				</div>
			</div>
			<div class="footerNote"></div>
		</div>
		
	</body>
	
</html>