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
		 
		<title>rightIframe</title>

		<meta name="description" content="">
		<meta name="viewport" content="width=device-width">
		<script type="text/javascript">
			
			window.fuse = {
					isMainFrame: false,
				baseUrl: "${baseURL}",
				resourcesUrl: "${resourcesURL}"
			};
		</script> 
		<style type="text/css">
			
		</style>
		
		<script type="text/javascript" src="${resourcesURL}/js/libs/jquery-1.7.1.js"></script>
		<script type="text/javascript">
			
			
			window.fuse.iframesData = { 
				fuseIframe: {
					iframeUrl: window.fuse.baseUrl + "umb/index",
					proxyUrl:  window.fuse.baseUrl + "umb/fuseProxy",
					targetIframe: "parent",
					iframeId: "parent"
				},
				voipIframe: {
					//iframeUrl: "/voipTest/voipTest.html",
					//proxyUrl: "/voipTest/voipProxy.html",
					iframeUrl:  window.fuse.baseUrl + "voip/index",
					proxyUrl:  window.fuse.baseUrl + "voip/voipProxy",					
					targetIframe: window.fuse.isMainFrame === true ? "frames['voipIframe']": "parent.frames['voipIframeFrame']",
					iframeId: "voipIframe"
				},
				rightIframe: {
					iframeUrl:  window.fuse.baseUrl + "rightIframe/index",
					proxyUrl:  window.fuse.baseUrl + "rightIframe/rightIframeProxy",
					targetIframe: window.fuse.isMainFrame === true ? "frames['rightIframe']": "parent.frames['rightIframe']",
					iframeId: "rightIframe"
				}
			};
			
			window.define = function(arr, moduleFunc) {
				moduleFunc($);
			};
		</script>
		<script type="text/javascript" src="${resourcesURL}/js/libs/pubSub.js"></script>
		
		<script type="text/javascript" src="${resourcesURL}/js/iframesScripts/rightIframe.js"></script>	
	</head>
	
	<body>
       	<!-- UI displayed to logged-out users -->
   		<div id="logged-out-ui">
            <table>
                <tr><td><label for="sdk-account-name">API account</label></td><td><input name="sdk-account-name" type="text" value="fuse"/></td></tr>
                <tr><td><label for="videoCall_userName">Login</label></td><td><input type="text" id="videoCall_userName" placeholder="User Name"/></td></tr>
                <tr><td><label for="videoCall_password">Password</label></td><td><input type="text" id="videoCall_password" placeholder="Password"/></td></tr>
                <tr><td></td><td><button id="videoCallLoginBtn">Login</button></td></tr>
            </table>
        </div>
		        	
       	<!-- UI displayed to logged-in users -->
        <div id="logged-in-ui">
            <table>
                <tr><td><label for="peerUserName">Call peer</label></td><td><input type="text" id="peerUserName" placeholder="Peer User Name"/></td></tr>
                <tr><td></td><td><button id="videoCallBtn">Video Call</button>
                <button id="voipCallBtn">Voice Call</button>
                <button id="videoPreviewBtn">Preview Video</button>
                <button id="hideVideoPreviewBtn">Hide Preview Video</button>
                <!-- <input id="logout-button" type="submit" value="Logout"></input></td></tr> -->
            </table>
        </div>
		
       	<!-- UI displayed when the remote phone is ringing -->
        <div id="remote-ringing-ui">
            <table>
                <tr><td></td><td><button id="OMCancelBtn">Cancel</button></td></tr>
            </table>
        </div>
		
		<!-- UI displayed when the call is in progress -->
        <div id="in-call-ui">
            <table>
                <tr><td><button id="hangUpBtn">Hang Up</button></td></tr>
            </table>
        </div>
		
		<script type="text/javascript">
			(function() {
		    	function showLoggedOutUI() {
		    	    $('#logged-in-ui').hide();
		    	    $('#remote-ringing-ui').hide();
		    	    $('#in-call-ui').hide();
		    	    
		    	    $('#logged-out-ui').show();
		    	}
		
		    	function showLoggedInUI() {
		    	    $('#logged-out-ui').hide();
		    	    $('#remote-ringing-ui').hide();
		    	    $('#in-call-ui').hide();
		    	    
		    	    $('#logged-in-ui').show();
		    	}
		
		    	function showRemoteRingingUI() {
		    	    $('#logged-out-ui').hide();
		    	    $('#logged-in-ui').hide();
		    	    $('#in-call-ui').hide();
		    	    
		    	    $('#remote-ringing-ui').show();
		    	}
		
		    	function showInCallUI() {
		    	    $('#logged-out-ui').hide();
		    	    $('#logged-in-ui').hide();
		    	    $('#remote-ringing-ui').hide();
		    	    
		    	    $('#in-call-ui').show();
		    	}
				
		    	
		    	
				var eventHandlers = {
			        videoCallLoginBtnClick: function() {
			        	
			        	$.publish(
			        		"videoCallLoginMessage", 
			        		{
				        		sdkAccountName : "fuse", 
				        		userName : $("#videoCall_userName").val(), 
				        		displayName : $("#videoCall_userName").val(), 
				        		password : $("#videoCall_password").val()
			        		}, 
			        		window.fuse.iframesData.voipIframe);
			        },
			        
			        videoCallBtnClick: function() {
			        	showRemoteRingingUI();
			        	$.publish("videoCallClickMessage", $("#peerUserName").val(), window.fuse.iframesData.voipIframe);
			        },
			        
			        voipCallBtnClick: function() {
			        	showRemoteRingingUI();
			        	$.publish("voipCallClickMessage", $("#peerUserName").val(), window.fuse.iframesData.voipIframe);
			        },
			        
			        videoPreviewBtnClick: function() {
			        	$.publish("videoPreviewClickMessage", true, window.fuse.iframesData.voipIframe);
			        },
			        
			        hideVideoPreviewBtnClick: function() {
			        	$.publish("videoPreviewClickMessage", false, window.fuse.iframesData.voipIframe);
			        },
			        
			        OMCancelBtnClick: function() {
			        	$.publish("OMCancelClickMessage", null, window.fuse.iframesData.voipIframe);
			        },
			        
			        hangUpBtnClick: function() {
			        	$.publish("hangUpClickMessage", null, window.fuse.iframesData.voipIframe);
			        }
		        };
				
	    		$("#videoCallLoginBtn").click(eventHandlers.videoCallLoginBtnClick);
	    		$("#videoCallBtn").click(eventHandlers.videoCallBtnClick);
	    		$("#voipCallBtn").click(eventHandlers.voipCallBtnClick);
	    		
	    		$("#videoPreviewBtn").click(eventHandlers.videoPreviewBtnClick);
	    		$("#hideVideoPreviewBtn").click(eventHandlers.hideVideoPreviewBtnClick);
	    		$("#OMCancelBtn").click(eventHandlers.OMCancelBtnClick);
	    		$("#hangUpBtn").click(eventHandlers.hangUpBtnClick);
	
	    		showLoggedOutUI();
			
		    	$.subscribe("OMLoginErrorMessage", function(e) {
		    		showLoggedOutUI();
		    	});
		
		    	$.subscribe("OMLoginSuccessMessage", function(e) {
		    		showLoggedInUI();
		    	});
		
		    	$.subscribe("OMStatusMessage", function(e) {
		    	});
		
		    	$.subscribe("OMLayoutMessage", function(e) {
		    	});
		
		    	$.subscribe("OMRemoteEndedMessage", function(e, reason) {
		    		//{reason: reason, description: this.softphone.getTerminatedReasonString()}
		    		showLoggedInUI();
		    	});
		
		    	$.subscribe("OMLocalEndedMessage", function(e) {
		    		showLoggedInUI();
		    	});
		
		    	$.subscribe("OMFailedMessage", function(e) {
		    		showLoggedInUI();
		    	});
		
		    	$.subscribe("OMRemoteRingingMessage", function(e) {
		    	});
		
		    	$.subscribe("OMLocalRingingMessage", function(e) {
		    	});
		
		    	$.subscribe("OMAnsweredMessage", function(e) {
		    		showInCallUI();
		    	});
		
		    	$.subscribe("OMReceivingRemoteVideoMessage", function(e) {
		    		showInCallUI();
		    	});
				
		    	$.subscribe("VoipIframeCloseMessage", function(e) {
		    		//TO DO: close voip iframe from main 
		    		console.log("Need close voip ifarme");
		    	});
				
		    	$.subscribe("VoipIframeMinimizeMessage", function(e) {
		    		//TO DO: minimize voip iframe from main 
		    		console.log("Need minimize voip ifarme");
		    	});
				
		    	$.subscribe("OMSettingsChanged", function(e, settings) {
		    		//TO DO: minimize voip iframe from main 
		    		console.log("OMSettingsChanged hasVoice="+settings.after.hasVoice+"; hasVideo="+settings.after.hasVideo);
		    		if (settings.after.canStartVoice && settings.after.hasVoice) {
		    			$("#voipCallBtn").show();
		    		} else {
		    			$("#voipCallBtn").hide();
		    		}
		    		
		    		if (settings.after.canStartVideo && settings.after.hasVideo) {
		    			$("#videoCallBtn").show();
		    			$("#videoPreviewBtn").show();
		    			$("#hideVideoPreviewBtn").show();
		    		} else {
		    			$("#videoCallBtn").hide();
		    			$("#videoPreviewBtn").hide();
		    			$("#hideVideoPreviewBtn").hide();
		    		}

		    	});
		    })();
		</script>
		
	</body>
</html>
