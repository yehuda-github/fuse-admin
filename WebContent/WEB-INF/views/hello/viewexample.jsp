<%@page import="com.realcommerce.springdemo.HelloWorldModel"%>
<%@page import="java.util.Map"%>
<%@ page language="java" contentType="text/html; charset=windows-1255"
    pageEncoding="windows-1255"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:url value="/resources" var="resourcesURL" />
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=windows-1255">
<title>Insert title here</title>
</head>
<style>
ul {
	list-style: none;
	padding: 0;
	margin: 0;
}
a {
	text-decoration: none;
}
.composeFormBox {
	width: 743px;
}
.compose-tabs {
	position: relative;
	float: left;
	width: 743;
}

.compose-tabs ul.tabs {
	height: 48px;
	z-index: 0;
	float: left;
	width: 743px;
	
	background-color: #FAFAFA;
}

.compose-tabs .tabs li.tab {
	float: left;
	font-size: 15px;
	padding: 10px 15px;
	height: 30px;
	cursor: pointer;
	position: relative;
	text-align: center;
	top: -1px;
	border-left: 1px solid #DADADA;
	border-top: 1px solid #DADADA;
}

.compose-tabs .tabs li.tab.last {
	border-right: 1px solid #DADADA;
}

.compose-tabs .tabs li.tab.selected {
background-color: #0393CF;
border-color: #0393CF;
}

.compose-tabs .tabs-content {
	float: left;
}

.tabs-content .tab-content {
	padding: 28px 28px 40px;
	background-color: #FAFAFA;
	border: 1px solid #DADADA;
	width: 743px;
	display: none;
	position: relative;
	float: left;
}

.tabs-content .tab-content.active {
	display: block;
}

</style>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js" type="text/javascript"></script>
<script type="text/javascript">
	$(document).ready(function() {

		$('.tab').click(function(){
			var actionId = $(this);
			$("#composeActionItems li").each(function(n){
				$(this).removeClass("selected");
			});
			//$(".composeActionItems").find(actionId)
			$(this).addClass("selected");
		});
		
	});

</script>			
<div class="composeFormBox">
	<div class="compose-tabs">
		<ul id="composeActionItems" class="tabs">
			<li id="replay" class="tab replay selected">
				<a href="#" class="blue">replay</a>
				<div class="border-line"></div>
			</li>
			<li id="replay_to_all" class="tab replay_to_all">
				<a href="#" class="blue">replay to all</a>
				<div class="border-line"></div>
			</li>
			<li id="forward" class="tab forward last">
				<a href="#" class="blue">forward</a>
				<div class="border-line"></div>
			</li>
		</ul>
	
	
		<div class="tabs-content">
			<div id="tabContent_replay" class="tab-content active">
				aaa
			</div>
			<div id="tabContent_replay_to_all" class="tab-content">
				bbb
			</div>
			<div id="tabContent_forward" class="tab-content">
				ccc
			</div>	
		</div>
		
	</div>
</div>
















