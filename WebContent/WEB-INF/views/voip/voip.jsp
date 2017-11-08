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
		<meta http-equiv="Access-Control-Allow-Origin" content="*"/>
		 
		<title>Voip Iframe</title>

		<meta name="description" content="">
		<meta name="viewport" content="width=device-width">
			
        <style type="text/css">
        
        	.voipHolderSmall{
        		width:192px;
        	}
        	
        	.voipHolder{
        	}
        
			.headerPanel {
				background: #505156;
			}
			.headerPanelSmall {
				background: url(/fuse/resources/img/icon.png) no-repeat -391px -80px; 
				height: 27px;
				width:213px;
				cursor: move;
			}
			.headerPanelSmall.ringing {
				background: red; 
			}
			.headerPanelSmall > div,
			.headerPanel > div {
				display: inline-block;
				width: 100%;
			}
			.headerPanelSmall button,
			.headerPanel button {
				color: #b7b8ba;
				background: transparent;
				float: right;
				/* margin: 0 0.5em; */
				border: none;
				cursor:pointer;
			}
			.headerPanelSmall #peeringPerson,
			.headerPanel #peeringPerson {
				color: #c2c2c2;
				float: left;
				margin: 3px 1em 0;
			}
			
			.footerPanel {
				height: 45px;
				color: #9e9ba2;
				background: #3d3743;
			}
			
			.contentPanel {
				height: 540px;
			}
			
			.contentPanelSmall .endButton{
				float: left;
				width:53px;
				height:29px;
				background: url(/fuse/resources/img/icon.png) no-repeat -264px -126px;
				margin-left:10px;
				font-family:Arial;
				font-size: 12px;
				line-height: 29px;
				text-align: center;
				font-weight: bold;
				cursor:pointer;
			}
			
			.contentPanelSmall .videoButton{
				float: right;
				width:30px;
				height:30px;
				background: url(/fuse/resources/img/icon.png) no-repeat -359px -3px;
				margin-left:2px;
				cursor:pointer;
			}
			
			.contentPanelSmall .voiceButton{
				float: right;
				width:30px;
				height:30px;
				background: url(/fuse/resources/img/icon.png) no-repeat -359px -109px;
				margin-left:10px;
				cursor:pointer;
			}
			
			.endButton{
				float: left;
				width:65px;
				height:35px;
				background: url(/fuse/resources/img/icon.png) no-repeat -263px -52px;
				margin-left:10px;
				font-family:Arial;
				font-size: 12px;
				line-height: 35px;
				text-align: center;
				font-weight: bold;
				cursor:pointer;
			}
			
			.videoButton, .videoButtonOff{
				float: right;
				width:35px;
				height:35px;
				margin-left:2px;
				cursor:pointer;
			}
			.videoButton {
				background: url(/fuse/resources/img/icon.png) no-repeat -118px -385px;
			}
			.videoButtonOff {
				background: url(/fuse/resources/img/icon.png) no-repeat -179px -424px;
			}
			
			.voiceButton, .voiceButtonOff {
				float: right;
				width:35px;
				height:35px;
				margin-left:10px;
				cursor:pointer;
			}
			.voiceButton {
				background: url(/fuse/resources/img/icon.png) no-repeat -118px -345px;
			}
			.voiceButtonOff {
				background: url(/fuse/resources/img/icon.png) no-repeat -180px -384px;
			}
			
			.voice .spPlaceholder, .voice .maximizeBtn {
				height: 0 !important;
			}
			.contentPanelSmall .spPlaceholder{
				XXXposition: absolute;
				width: 215px;
				height: 148px;
			}
			
			.spPlaceholder{
				width: 640px;
				height: 480px;
				margin-top:3px
			}
			
			.contentPanel .chatPanel {
				width: 160px;
				float: right;
				height: 100%;
			}
			.contentPanelSmall .chatPanel {
				width: 210px;
				height: 138px;
				border: 1px solid #B9B9B9;
			}
			.contentPanel .videoPanel {
				float: left;
				position: relative;
				background: #D3D3D3;
				height: 100%;
				width: 973px;
			}
			.contentPanelSmall .videoPanel {
				position: relative;
				background: #D3D3D3;
				XXXheight: 190px;
				width: 211px;
				border:1px solid #b9b9b9;
				border-bottm:0;
				
			}
			.contentPanel .videoPanel .controlPanel {
				XXXposition: absolute;
				bottom: 0;
				margin: 0.8em;
			}
			.contentPanelSmall .videoPanel .controlPanel {
				XXXposition: absolute;
				bottom: 0;
				padding: 5px 0 0;
				width: 200px;
				display: inline-block;
			}
			.contentPanel .videoPanel .controlPanel button {
				color: #6d6d6d;
				background: #f6f6f8;
				height: 30px;
				border: 1px solid #dadad8;
				border-radius: 3px;
				font-weight: bold;
				padding: 0 1em;
				-moz-box-shadow: 1px 1px 2px 1px #8F8E8C;
				-webkitbox-shadow: 1px 1px 2px 1px #8F8E8C;
				box-shadow: 1px 1px 2px 1px #8F8E8C;
			}
			.contentPanel .videoPanel .controlPanel button:active {
				color: #f6f6f8;
				background: #6d6d6d;
			}
			#closePanelBtn{
				background: url(/fuse/resources/img/icon.png) no-repeat -75px -219px;
				width:16px;
				height:16px;
				margin-top: 5px;
				margin-right: 6px;
			}
			#minimizePanelBtn{
				background: url(/fuse/resources/img/icon.png) no-repeat -75px -88px;
				width:16px;
				height:16px;
				margin-top:5px;
			}
			.footerPanelSmall{
				display:none;
			}
			.maximizeBtn{
				position: absolute;
				top: 25px;
				left: 25px;
				background: url(/fuse/resources/img/icon.png) no-repeat  -169px -298px;
				width: 50px;
				height: 47px;
				cursor:pointer;
				z-index:10000000;
				}
			.contentPanelSmall .maximizeBtn{
				position: absolute;
				top: 10px;
				left: 10px;
				background: url(/fuse/resources/img/icon.png) no-repeat -352px -169px;
				width: 36px;
				height: 26px;
				cursor:pointer;
				z-index:10000000;
			}
			.contentPanelSmall .voiceButtonOff {
			float: right;
			width: 30px;
			height: 30px;
			background: url(/fuse/resources/img/icon.png) no-repeat -359px -140px;
			margin-left: 10px;
			cursor: pointer;
			}
			.contentPanelSmall .videoButtonOff{
				float: right;
				width:30px;
				height:30px;
				background: url(/fuse/resources/img/icon.png) no-repeat -361px -231px;
				margin-left:2px;
				cursor:pointer;}
		</style>
		
		<script type="text/javascript" src="${resourcesURL}/js/libs/jquery-1.7.1.js"></script>
		<script type="text/javascript" src="${resourcesURL}/js/libs/flash_detect.js"></script>
		<script type="text/javascript">
			window.fuse = {
				isMainFrame: false
			};
	
			window.fuse.iframesData = { 
				fuseIframe: {
					iframeUrl: "/fuse/umb/index",
					proxyUrl: "/fuse/umb/fuseProxy",
					targetIframe: "parent",
					iframeId: "parent"
				},
				voipIframe: {
					
					iframeUrl: "/fuse/voip/index",
					proxyUrl: "/fuse/voip/voipProxy",					
					targetIframe: window.fuse.isMainFrame === true ? "frames['voipIframe']": "parent.frames['voipIframeFrame']",
					iframeId: "voipIframe"
				},
				rightIframe: {
					iframeUrl: "/fuse/rightIframe/index",
					proxyUrl: "/fuse/rightIframe/rightIframeProxy",
					targetIframe: window.fuse.isMainFrame === true ? "frames['rightIframe']": "parent.frames['rightIframe']",
					iframeId: "rightIframe"
				}
			};
			
			window.define = function(arr, moduleFunc) {
				moduleFunc($);
			};
		</script>
		<script type="text/javascript" src="${resourcesURL}/js/libs/pubSub.js"></script>
		
		<script type="text/javascript" src="${resourcesURL}/js/libs/openmarket-softphone/js/openmarket-softphone-0.7.8.js"></script>
		<script type="text/javascript" src="${resourcesURL}/js/iframesScripts/voipIframe.js"></script>		
		
		<script type="text/javascript">
			Fuse = {};

			$(function() {
				Fuse.VOIP = new VoipFrame("/fuse/resources/js/libs/openmarket-softphone/js/");
				Fuse.VOIP.initialize();
			});
			/*
			function OMSoftphoneBackendFlashCallbackOnFlashSecurityShown() {
			    _omSoftphoneBackendFlash.remotingIncomingCall('onFlashSecurityShown', []);
			    console.log("================================================================");
			}
*/
		</script>
		
	</head>

	
	<body>
	
		<!--button id="painterBtn">Paint the main fuse app in green</button-->
		
    <script type="text/javascript">
/*		$("#painterBtn").click(function() {
			$.publish("changeBackground", ["green"], window.fuse.iframesData.fuseIframe);
		});
		
		$.subscribe("writeMessageInBody", function(e, msg) {
			$("body").append("<div>" + msg + "</div>");
		});
*/
		$.subscribe("videoCallLoginMessage", function(e, credential) {
			console.log("video login message received from "+JSON.stringify(credential));
			Fuse.VOIP.login(credential);
		});
		
		$.subscribe("videoCallClickMessage", function(e, peerUserName) {
			console.log("video message received from "+peerUserName);
			Fuse.VOIP.placeVideoCall(peerUserName);
		});

		$.subscribe("voipCallClickMessage", function(e, peerUserName) {
			console.log("voip message received from "+peerUserName);
			Fuse.VOIP.placeVoipCall(peerUserName);
		});

		$.subscribe("videoPreviewClickMessage", function(e, isShow) {
			console.log("preview video message received");
			Fuse.VOIP.previewVideo(isShow);
		});

		$.subscribe("OMCancelClickMessage", function(e) {
			console.log("cancel openmanager message received");
			Fuse.VOIP.cancel();
		});

		$.subscribe("hangUpClickMessage", function(e) {
			console.log("hang up message received");
			Fuse.VOIP.cancel();
		});
		
  	  
		$.subscribe("OMLocalRingingMessage", $.proxy(function(type){
			console.log("---------Local Ringing Message from voip.jsp");
		}, this));
	</script>
		
		
		<!--
		<script>
			var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
			(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
			g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
			s.parentNode.insertBefore(g,s)}(document,'script'));
		</script>
		-->

	<div class="voipHolder">

		<div class="headerPanelSmall"><div>
			<div id="peeringPerson"></div>
			<button id="closePanelBtn"></button>
			<button id="minimizePanelBtn"></button>
		</div></div> 
		
		<div class="contentPanelSmall">
			<div class="videoPanel">
				<div id="softphone-placeholder" class="spPlaceholder" 
					XXXstyle="position: absolute; width: 600px; height: 475px;"></div>
				<div class="controlPanel">
					<div class="endButton" id="endPanelBtn">END</div>
					<div class="videoButton" id="videoPanelBtn"></div>
					<div class="voiceButton" id="voicePanelBtn"></div>
				</div>
				<div class="maximizeBtn">
				</div>
			</div>
			<div class="chatPanel">
				<div style="padding:18px; text-align: center; font-family:Arial; font-size:14px;">
				Comming Real Soon...
				</div>
			</div>
		</div>
		
		<div class="footerPanelSmall">
			2012 Realcommerce
		</div>

	</div>

	</body>
</html>
