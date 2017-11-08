<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!doctype html>
	<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
	<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
	<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
	<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
	
	<head>
		<c:url value="/" var="baseURL" />
		<c:url value="/resources" var="resourcesURL" />
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta http-equiv="Access-Control-Allow-Origin" content="*"/> 
		<title>Fuse</title>

		<meta name="description" content="">
		<meta name="viewport" content="width=device-width">
		
		<script type="text/javascript">
			document.write("<link rel='stylesheet' type='text/css' href='${resourcesURL}/css/style.css?appVersion=" + (new Date()).getTime() + "' media='screen' />");
			
			window.fuse = {
				baseUrl: "${baseURL}",
				resourcesUrl: "${resourcesURL}"
			};
		</script> 
		
		<link rel="stylesheet" href="${resourcesURL}/css/jqx.base.css" type="text/css" />
		
		<style type="text/css">
			.emptyFolder, 
			.emptyTrashFolder
			{
				display: none;
			}
			
			.emptyFolderMode .emptyFolder 
			{
				display: block;
			}
			.emptyFolderMode .barSecondary,
			.emptyFolderMode .messageItemContainer,
			.emptyFolderMode .messagesListContainer,
			.emptyFolderMode .paginator
			{
				display: none;
			}
			
			.trashEmptyMode .emptyTrashFolder
			{
				display: block;
			}
			
			.emptyFolder
			{
				font-size: 14px;
				padding: 25px 0px 25px 11px;
				border-bottom: 1px solid #E4E8E9;
			}
		</style>
	</head>
	
	<body>
		<div id="wrapper">
			<div id="header"></div>
			<div id="main" class="table">
				<div class="leftMenu tableCell" style="width: 170px;"></div>
				<div class="spotlight tableCell" style="width: 743px;"></div>
				<div class="rightIframe tableCell" ></div>
			</div>
			<div id="footer"></div>
			<div id="voipIframe"></div>
		</div>

		<script data-main="${resourcesURL}/js/main" src="${resourcesURL}/js/libs/require.js"></script>
		
		<!--
		<script>
			var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
			(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
			g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
			s.parentNode.insertBefore(g,s)}(document,'script'));
		</script>
		-->
		
	</body>
</html>