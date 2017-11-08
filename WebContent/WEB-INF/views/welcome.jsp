<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!doctype html>

	<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
	<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
	<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
	<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
	 
	<head>
		<c:url value="/resources" var="resourcesURL" />
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

		<title>Fuse</title>

		<meta name="description" content="">
		<meta name="viewport" content="width=device-width">

		<style type="text/css">
								
		</style>

	</head>
	
	<body>
	
		<script type="text/javascript" src="${resourcesURL}/js/libs/jquery-1.7.1.js"></script>
		<script type="text/javascript">
			function define(argsT, func) {
				if(func) {
					var res = func($);
					res.changeText(res.view.settings);
				}
			}
		</script>
		<script type="text/javascript" src="${resourcesURL}/js/translations.js"></script>
		
	</body>
</html>
