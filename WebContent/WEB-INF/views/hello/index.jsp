<%@ page language="java" contentType="text/html; charset=windows-1255"
    pageEncoding="windows-1255"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:url value="/resources" var="resourcesURL" />
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<link rel="stylesheet" type="text/css" href="${resourcesURL}/css/style.css" />
<meta http-equiv="Content-Type" content="text/html; charset=windows-1255">
<title>Hello World Basic View</title>
<style type="text/css">
	.opositFloat{
		float:right;
	}
	.umbContainer{
		width:743px;
		background-color: #FAF9F7;
	}
	
	.folderName{
		padding:0 10px;
		height:54px;
	}
	.filterUMB{
		padding:10px 18px 0;
	}
	.SMSumbFilter{
		margin-left:8px;
		background: url(${resourcesURL}/img/icon.png) no-repeat  -117px -45px;
		width:37px;
		height:37px;
	}
	.emailUmbFilter{
		margin-left:8px;
		background: url(${resourcesURL}/img/icon.png) no-repeat  -117px -130px;
		width:37px;
		height:37px;
	}
	.IMumbFilter{
		margin-left:8px;
		background: url(${resourcesURL}/img/icon.png) no-repeat  -117px -2px;
		width:37px;
		height:37px;
	}
	.folderTitle{
		border-bottom:1px solid #E0E4E4;
	}
	.selectionAndActions{
		height:66px;
		border-top:1px solid white;
		border-bottom:1px solid #E0E4E4;
	
	}
	.noSelectionPanel{
		padding: 26px 10px;
	}
	.itemActions{
		padding:12px 0 0;
		text-align: center;
	}
	.unselectAllBtn{
		width:50px;
		height:37px;
	}
	.unselectAllIcon{
	background: url(${resourcesURL}/img/icon.png) no-repeat -34px -237px;
	width: 17px;
	height: 16px;
	margin-left: 16px;
	}
	.deleteBtn{
		width:50px;
		height:37px;
	}
	.deleteIcon{
		background: url(${resourcesURL}/img/icon.png) no-repeat -34px -193px;
	width: 17px;
	height: 16px;
	margin-left: 16px;
	}
	.spamBtn{
		width:50px;
		height:37px;
	}
	.spamIcon{
		background: url(${resourcesURL}/img/icon.png) no-repeat -12px -85px;
		width: 17px;
		height: 16px;
		margin-left: 16px;
	}
	.moveToBtn{
		width:50px;
		height:37px;
	}
	.moveToIcon{
		background: url(${resourcesURL}/img/icon.png) no-repeat -13px -47px;
		width: 17px;
		height: 16px;
		margin-left: 16px;
	}
	.markUnreadBtn{
		width:50px;
		height:37px;
	}
	.markUnreadIcon{
		background: url(${resourcesURL}/img/icon.png) no-repeat -11px -125px;
		width: 17px;
		height: 16px;
		margin-left: 16px;
	}
	.markReadBtn{
		width:50px;
		height:37px;
	}
	.markReadIcon{
		background: url(${resourcesURL}/img/icon.png) no-repeat -11px -64px;
		width: 17px;
		height: 16px;
		margin-left: 16px;
	}
	.prevPage{
		background: url(${resourcesURL}/img/icon.png) no-repeat -78px -36px;
		width: 10px;
		height: 15px;
	}
	.nextPage{
		background: url(${resourcesURL}/img/icon.png) no-repeat -81px -59px;
		width: 7px;
		height: 15px;
		margin-left: 10px;
	}
	.pagger{
		padding:0 18px;
	}
	.messageListFotter{
		height:35px;
		border-top:1px solid white;
		border-bottom:1px solid #E0E4E4;
		padding: 20px 0px 0 10px;
	}
	.quota{
		width:173px;
		height:18px;
		border:1px solid #D6D9D8;
		padding:2px;
		background-color: white;
		border-radius:20px;
	}
	.acuallQuata{
		height: 16px;
		color: #fff;
		padding: 2px 6px 0;
		background:url(${resourcesURL}/img/background/progress_bar_M.png) repeat-x 0px -1px;
		background-color: #454545;
		border-radius: 13px;
	}
	.textQuota{
		margin-top: 4px;
		margin-left: 10px;
	}
</style>
</head>
<body>
<div class="umbContainer">
<div class="folderTitle">
<div class="folderName float"><h1><span class="totalMessagesInFolder"> (<span class="totalNumberOfItems"></span>) </span></h1></div>
<div class="numberOfSelectedItems float" ><span class="totalItemsSelected" style="display:none"></span><span style="display:none;" class="lng_umb_itemsSelected">items selected</span> </div>
<div class="filterUMB opositFloat">
	<div class="SMSumbFilter float" title=""></div>
	<div class="emailUmbFilter float" title=""></div>
	<div class="IMumbFilter float" title=""></div>
	<div class="clear"></div>
</div>
<div class="clear"></div>
</div>

<div class="selectionAndActions">
<div class="noSelectionPanel float">
	<span class="lng_UMB_noItemSelected">there are no items selected</span>
	<a href="javascript:(return false;)" class="lng_UMB_sellectAll">Sellect All</a>
</div>
<div class="itemActions float" style="dispaly:none">
	<div class="unselectAllBtn float lng_umb_unselectAll" title="unselect All">
		<div class="unselectAllIcon"></div>
		<span class="lng_umb_unselectAll">unselect all</span>
	</div>
	<div class="deleteBtn float lng_umb_delete" title="delete">
		<div class="deleteIcon"></div>
		<span class="lng_umb_delete">delete</span>
	</div>
	<div class="spamBtn float lng_umb_spam" title="spam">
		<div class="spamIcon"></div>
		<span class="lng_umb_spam">spam</span>
	</div>
	<div class="moveToBtn float lng_umb_moveTo" title="move to folder">
		<div class="moveToIcon"></div>
		<span class="lng_umb_moveTo">move to folder</span>
	</div>
	<div class="markUnreadBtn float lng_umb_markUnread" title="mark as unread">
		<div class="markUnreadIcon"></div>
		<span class="lng_umb_markUnreado">mark as unread</span>
	</div>
	<div class="markReadBtn float lng_umb_markRead" title="mark as read">
		<div class="markReadIcon"></div>
		<span class="lng_umb_markReado">mark as read</span>
	</div>
	<div class="clear"></div>
</div>
<div class="pagger opositFloat">
	<div class="float">
	<span class="fromItem"></span>
	-
	<span class="toItem"></span>
	<span class="lng_umb_outOf">out of</span>
	<span class="totalMessagesPagger"></span>
	</div>
	<div class="paggerBtnContainer float">
		<div class="prevPage lng_UMB_prev float" title="previos"></div>
		<div class="nextPage lng_UMB_next float" title="next"></div>
		<div class="clear"></div>
	</div>
	<div class="clear"></div>
</div>
<div class="clear"></div>
</div>

<div class="messageListContainer">

</div>
<div class="messageListFotter">
	<div class="quota float">
		<div class="acuallQuata" style="width:;">
			<span class="presentage"></span>%
		</div>
		
	</div>
	<div class="textQuota flaot">
		
	</div>
	<div class="pagger opositFloat">
	<div class="float">
	<span class="fromItem"></span>
	-
	<span class="toItem"></span>
	<span class="lng_umb_outOf">out of</span>
	<span class="totalMessagesPagger"></span>
	</div>
	<div class="paggerBtnContainer float">
		<div class="prevPage lng_UMB_prev float" title="previos"></div>
		<div class="nextPage lng_UMB_next float" title="next"></div>
		<div class="clear"></div>
	</div>
	<div class="clear"></div>
</div>
<div class="clear"></div>

</div>
</div>
</body>
</html>