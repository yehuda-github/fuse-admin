(function() {
	VoipFrame = function(loaderPath) {
		this.loaderPath = loaderPath;
		this.softphone;
		
		this.Settings = {
				hasVoice : false,
				hasVideo : false,
				canStartVoice : true,
				canStartVideo : true,
				canAddParticipants : true
		};
		this.State = {
				isActive : false,
				isInCall : false,
				isDialing : false,
				isRinging : false,
				callPanel : false,
				callType : null
		};
		
/*		this.loggedInUI = $("#logged-in-ui");
		this.remoteRingingUI = $("#remote-ringing-ui");
		this.inCallUI = $("#in-call-ui");*/
	};
	
	VoipFrame.prototype = {
			Controller : {
				//Event handler called by RC when local call is downGraded to voice call
				//Displays the fuse-frame-void as a voice call at the bottom of the screen. Also update FUSE.VOIP.State
					onDowngradeVideoCall: function(){
						//this.softphone.setOutboundVideoMuted(true);
						//onReceivingRemoteVideo 
						//this.changeState(OMPhoneCall.CallType.VOICE);
					},
					//Event handler called by RC when local call is upgraded to voice call
					//Displays the fuse-frame-void as a video call at the bottom of the screen. Also update FUSE.VOIP.State
					onUpgradeVideoCall: function(){
						//this.softphone.setOutboundVideoMuted(false);
						//OMPhoneCall.changeCallType(OMPhoneCall.CallType.VIDEO); 
						//this.changeState(OMPhoneCall.CallType.VIDEO);
					},
					//Event handler called by OM when local call is ringing
					//Displays the fuse-frame-void as a notification at the bottom of the screen. Also update FUSE.VOIP.State
					onLocalRinging : function(call) { //input call OM object
						//console.log("onLocalRinging");
						
						var type = (call.type === OMPhoneCall.CallType.VIDEO ? 'video' : 'voice');
						
						$.publish("OMLocalRingingMessage", type, window.fuse.iframesData.rightIframe);
						$.publish("OMLocalRingingMessage", type, window.fuse.iframesData.fuseIframe);
						
						//$(".headerPanelSmall").addClass("ringing");
						//$("#peeringPerson").text( (call.peer !== null ? call.peer.displayName : '') );
						
					    // Called when there is an incoming call.
					    // This handler must return true to accept the call, or false to reject it.
					    return confirm('Answer incoming ' + type + ' call' + 
					                   (call.peer !== null ? ' from ' + call.peer.displayName : '') + '?');
					},
					//Event handler called by UI when the user accepts the call in the UI
					//Displays the call window and starts the call on OM based on the type passed. Also update FUSE.VOIP.State
					onUserAcceptCall : function(callType) { // input string (VIDEO/VOICE)
						//console.log("onUserAcceptCall");
						$.publish("OMRemoteEndedMessage",null,window.fuse.iframesData.fuseIframe);
						
					},
					//Event handler called by OM when other side hangs up
					//Notifies the user that the call was ended by the remote side. Also update FUSE.VOIP.State
					onRemoteEnded : function(reason, softphone) {
						//console.log("onRemoteEnded reason "+reason);
						$.publish("OMRemoteEndedMessage", 
								{reason: reason, description: softphone.getTerminatedReasonString()},
								window.fuse.iframesData.rightIframe);
						//this.showLoggedInUI();
						$.publish("OMRemoteEndedMessage", null, window.fuse.iframesData.fuseIframe);
					    // Show a dialog then temporarily display the reason the call was terminated.
					    //console.log(this.softphone.getTerminatedReasonString());
					},
					// Event handler called by UI when the user want to initiate a call
					// Displays the call window (ringing remote) and starts the call on OM. 
					// If the call was voice and “video” is requested, upgrade that call to video. 
					// If the call was video and “voice” is requested, downgrade the call voice. 
					// If the current user has MSISDN (phone) number, then pass it to the call (voip-out) so that the voip-out can send the recipient a caller id.
					// Also update FUSE.VOIP.State.
					onUserStartsCall : function(peers, callType) { // peers – comma separated list of peer to call
																	// callType – String (VIDEO/VOICE)
						//console.log("onUserStartsCall");
					},
					// Event handler called by OM when remote side answered the call
					// Displays the call in the UI. Also update FUSE.VOIP.State
					onRemoteAnswered : function(type) {
						//console.log("onRemoteAnswered type = "+type);
						
						type = (type === OMPhoneCall.CallType.VOICE) ? "voice" : "video";
						$.publish("OMAnsweredMessage", type, window.fuse.iframesData.rightIframe);
						$.publish("OMAnsweredMessage", type, window.fuse.iframesData.fuseIframe);
						//this.showInCallUI();
					},
					// Event handler called by UI when local user ended the call
					// Notified OM that the call ended and closes the call UI. Also update FUSE.VOIP.State
					onLocalEnded : function() {
						//console.log("onLocalEnded");
						$.publish("OMLocalEndedMessage", null, window.fuse.iframesData.rightIframe);
						$.publish("OMLocalEndedMessage", null, window.fuse.iframesData.fuseIframe);
						
						//this.showLoggedInUI();
					},
					// Event handler called by UI when user wants to show/hide local video preview
					// Calls OM setInCallLocalVideoVisible
					onToggleLocalVideo : function() {
						//console.log("onToggleLocalVideo");
						
					},
					// Event handler called by UI when user wants to add more participants to the current call
					// There is currently no API in OM to do this
					onAddPeersToCall : function(peers) { // peers – comma separated list of peers to add to the call
						//console.log("onAddPeersToCall");
						
					}
			},
			
			getSettings : function() {
				return this.Settings;
			},
			
			changeSettings : function(settings) {
				var before = $.extend({}, this.Settings);
				$.extend(this.Settings, settings);
				$.publish("OMSettingsChanged", {before: before, after:this.Settings}, window.fuse.iframesData.rightIframe);
			},
			
			updateSettings : function() {
				//console.log("updateSettings "+JSON.stringify(this.Settings));
				var cameras = this.softphone.phoneManager.getCameras();
				//this.Settings.hasVideo = (typeof(cameras) != undefined && $.isArray(cameras) && cameras.length > 0);
				
				var microphones = this.softphone.phoneManager.getMicrophones();
				//this.Settings.hasVoice = (typeof(microphones) != undefined && $.isArray(microphones) && microphones.length > 0);
				
				this.changeSettings({
					hasVideo : (typeof(cameras) != undefined && $.isArray(cameras) && cameras.length > 0),
					hasVoice : (typeof(microphones) != undefined && $.isArray(microphones) && microphones.length > 0)
				});
				//console.log("updateSettings "+JSON.stringify(this.Settings));
			},
			 
			getState : function() {
				return this.State;
			},
			
			changeState : function(state) {
				var before = $.extend({}, this.State);
				$.extend(this.State, state);
				$.publish("OMStateChanged", {before: before, after:this.State}, window.fuse.iframesData.fuseIframe);
			},
			
			loginError : function() {
				console.log("loginError");
				this.updateSettings();
				this.changeState({
					isActive : false,
					isInCall : false,
					isDialing : false,
					isRinging : false,
					callPanel : false
				});

				$.publish("OMLoginErrorMessage", null, window.fuse.iframesData.rightIframe);
			},
			
			loginSuccess : function() {
				//console.log("loginSuccess");
				this.updateSettings();
				this.changeState({isActive : true});

				$.publish("OMLoginSuccessMessage", null, window.fuse.iframesData.rightIframe);

				// override OMSoftphoneBackendFlashCallbackOnFlashSecurityShown function (backend-flash.js)
				// for pick up Adobe Flash Player Privacy Settings Screen (allow/deny) 
				if (typeof(original_voipIframe_OMSoftphoneBackendFlashCallbackOnFlashSecurityShown) == "undefined" &&
						typeof(OMSoftphoneBackendFlashCallbackOnFlashSecurityShown) == "function") {

					var original_voipIframe_OMSoftphoneBackendFlashCallbackOnFlashSecurityShown = OMSoftphoneBackendFlashCallbackOnFlashSecurityShown;

					OMSoftphoneBackendFlashCallbackOnFlashSecurityShown = function(args) {
						console.log("ADOBE FLASH PLAYER SECURITY SHOW");
						$.publish("VoipIframeMaximazeVideoCall", null, window.fuse.iframesData.fuseIframe);
						$(".headerPanelSmall").addClass("headerPanel").removeClass("headerPanelSmall");
						$(".contentPanelSmall").addClass("contentPanel").removeClass("contentPanelSmall");

						return original_voipIframe_OMSoftphoneBackendFlashCallbackOnFlashSecurityShown(args);
					}
					//console.log("loginSuccess OMSoftphoneBackendFlashCallbackOnFlashSecurityShown "+OMSoftphoneBackendFlashCallbackOnFlashSecurityShown);
				}
			},

			failed : function() {
				//console.log("failed");
				this.updateSettings();
				this.changeState({isInCall : false});

				$.publish("OMFailedMessage", null, window.fuse.iframesData.rightIframe);
			},
			
			remoteRinging : function() {
				//console.log("remoteRinging");
				this.changeState({isRinging : true});
				$.publish("OMRemoteRingingMessage", null, window.fuse.iframesData.rightIframe);
			},

			receivingRemoteVideo : function() {
				//console.log("receivingRemoteVideo");
				this.changeState({isInCall : true});
				$.publish("OMReceivingRemoteVideoMessage", null, window.fuse.iframesData.rightIframe);
				this.setToDefaultUiView();
			},
			
			onEventSubscribe : function() {
				//console.log("onEventSubscribe");
			/* Assign a custom handler to onLayoutCallback to configure the layout of local/remote video and choose how the softphone should be displayed in the DOM.
			 * Assign custom handlers to 
			 * 		onRemoteEndedCallback, onLocalEndedCallback, onFailedCallback, onRemoteRingingCallback,
			 * 		onLocalRingingCallback, onAnsweredCallback and onReceivingRemoteVideoCallback 
			 * to handle these events.
			 */
	
				this.softphone.onLoginErrorCallback = $.proxy(this.loginError, this);

				this.softphone.onLoginSuccessCallback = $.proxy(this.loginSuccess, this);

				this.softphone.onStatusMessageCallback = function(message) {
					//console.log("onStatusMessageCallback "+message);
				    // Called when the softphone's status changes. 'message' is a human-readable description of the softphone's status.
					$.publish("OMStatusMessage", message, window.fuse.iframesData.rightIframe);
				    //$('#status-indicator').html(message);
				};

				// Provides a layout for the local/remote video views, and specifies how the phone is shown in the DOM.
				this.softphone.onLayoutCallback = $.proxy(function() {
					//console.log("onLayoutCallback");
					//set the frame to small view (default)
					
					$.publish("OMLayoutMessage", null, window.fuse.iframesData.rightIframe);
				    // Configure the layout of local/remote video in the softphone.
					
                    this.softphone.phoneManager.setVideoLayout(
				    		//the windows height width and positions
				    	{'left' : '65%', 'top' : '65%', 'width' : '30%', 'height' : '30%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX},
				    	{'left' : '0', 'top' : '0', 'width' : '100%', 'height' : '100%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX}
				    );
				    
				    // Set the softphone's position to cover the softphone-placeholder element.
				    if ($('#softphone-placeholder').length > 0) {
						this.softphone.phoneManager.setHidePhoneFunction(function() {
	                    //	console.log("setHidePhoneFunction");
	                        $('#softphone-placeholder').children().css('left', '-10000px');
	                    });
	                    
	                    // When showing UI, position the softphone in the softphone-placeholder and set its dimensions.
						this.softphone.phoneManager.setShowPhoneFunction(function() {
	                    //	console.log("setShowPhoneFunction");
	                        $('#softphone-placeholder').children().css('position', 'relative');
	                        $('.contentPanelSmall #softphone-placeholder').children().css('left', '-3px');
	                        $('.contentPanel #softphone-placeholder').children().css('left', '3px');
	                        $('#softphone-placeholder').children().height($('#softphone-placeholder').height());
	                        $('#softphone-placeholder').children().width($('#softphone-placeholder').width());
	                    });
						
	                    // Put the softphone inside softphone-placeholder.
						this.softphone.phoneManager.setPhoneParent($('#softphone-placeholder'));

	                    // Fill the softphone-placeholder.
						this.softphone.phoneManager.setPhonePosition({'top' : 0, 'left' : 0, 'width' : $('#softphone-placeholder').width(), 'height' : $('#softphone-placeholder').height()});

						//this.softphone.phoneManager.setPhonePositionFromPlaceholder($('#softphone-placeholder'));
				    }
				}, this);

				this.softphone.onRemoteEndedCallback = $.proxy(function(reason) {
					this.Controller.onRemoteEnded(reason, this.softphone);

					this.callEnded();
				}, this);

				this.softphone.onLocalEndedCallback = $.proxy(function() {
					this.Controller.onLocalEnded();

					this.callEnded();
				}, this);

				this.softphone.onFailedCallback =  $.proxy(function() {
					this.failed();

					this.callEnded();
				}, this);

				this.softphone.onRemoteRingingCallback = $.proxy(this.remoteRinging, this);

				this.softphone.onLocalRingingCallback = $.proxy(function(call) {
					this.callStarted( (call.peer !== null ? call.peer.displayName : ''), call.type);

				    return this.Controller.onLocalRinging(call);
				}, this);

				// Called when a call is accepted locally or remotely.
				this.softphone.onAnsweredCallback = $.proxy(function() {
					this.Controller.onRemoteAnswered(this.State.callType);
				}, this);

				// Called when video first arrives on this call.
				this.softphone.onReceivingRemoteVideoCallback = $.proxy(this.receivingRemoteVideo, this);
			},
			
			addEventHandler : function() {
				$("#videoPanelBtn").on("click",$.proxy(function() {
					if($("#videoPanelBtn").hasClass("videoButton")){
						$("#videoPanelBtn").addClass("videoButtonOff").removeClass("videoButton");
						this.Controller.onDowngradeVideoCall();
					}else{
						$("#videoPanelBtn").addClass("videoButton").removeClass("videoButtonOff");
						this.Controller.onUpgradeVideoCall();
					}
					
					
				},this) );
				
				$("#voicePanelBtn").on("click",$.proxy(function() {
					if($("#voicePanelBtn").hasClass("voiceButton")){
						$("#voicePanelBtn").addClass("voiceButtonOff").removeClass("voiceButton");
					}else{
						$("#voicePanelBtn").addClass("voiceButton").removeClass("voiceButtonOff");
					}
					//OMPhoneCall.setOutboundAudioMuted();
					
				},this)); 
				
				$("#closePanelBtn").click($.proxy(function() {
					
					$.publish("VoipIframeCloseMessage", null, window.fuse.iframesData.rightIframe);
					$.publish("VoipIframeCloseMessage", null, window.fuse.iframesData.fuseIframe);
					this.setToDefaultUiView();
					this.cancel();
				}, this));
				
				$("#minimizePanelBtn").click($.proxy(function() {
					
					$.publish("VoipIframeMinimizeMessage", null, window.fuse.iframesData.rightIframe);
					$.publish("VoipIframeMinimizeMessage", null, window.fuse.iframesData.fuseIframe);
					
					this.setToDefaultUiView();
				}, this));
				
				$("#endPanelBtn").click($.proxy(function() {
					this.setToDefaultUiView();

					this.cancel();
				}, this));
				
				$(".maximizeBtn").on('click', $.proxy(function() {
					
					if($(".headerPanelSmall").length > 0){
						//remove the small css
						$.publish("VoipIframeMaximazeVideoCall", null, window.fuse.iframesData.fuseIframe);
						$(".headerPanelSmall").addClass("headerPanel").removeClass("headerPanelSmall");
						$(".contentPanelSmall").addClass("contentPanel").removeClass("contentPanelSmall");
					}else{
						$.publish("VoipIframeNormalVideoCall", null, window.fuse.iframesData.fuseIframe);
						this.setToDefaultUiView();
					}
					//todo change the video objects
		    		//this.softphone.phoneManager.showLocalVideoPreview();
				}, this));
			},
			setToDefaultUiView: function(){
				//set the layout to small - default
				if($(".headerPanelSmall").length == 0){
					$(".headerPanel").addClass("headerPanelSmall").removeClass("headerPanel");
					$(".contentPanel").addClass("contentPanelSmall").removeClass("contentPanel");
				}
			},
			initialize : function() {
			    //this.showLoggedOutUI();
				this.setToDefaultUiView();
				
			    this.softphone = new OMSoftphone("REALCOMMERCE", null, this.loaderPath);
				//console.log("VoipFrame initialize");
				
				this.onEventSubscribe();
				
				this.addEventHandler();
				
				/*
				 * flash detect
				 * http://www.featureblend.com/javascript-flash-detection-library.html
				 * included in voip.jsp
				 */
				
				if(!FlashDetect.installed){
		        	// !flash
					$('#softphone-placeholder').html('<div style="padding:20px; text-align:center; padding-top:54px; font-family:arial; font-size:14px;"><b>No Flash Support</b><br />Flash support is required to use this feature</div>');
			    }else{
			    	// flash
			    	//$('#softphone-placeholder').html('<div style="padding:20px; text-align:center; padding-top:54px; font-family:arial; font-size:14px;"><b>No Flash Support</b><br />Flash support is required to use this feature</div>');
			    }
				
			},
			
			login : function(credential) {
				//credential = {sdkAccountName, userName, displayName, password}
		        //this.softphone.setCredentials($('#sdk-account-name-text-box').val(), $('#user-name-text-box').val(), $('#user-name-text-box').val(), $('#password-text-box').val());
				if (credential) {
			        this.softphone.setCredentials(credential.sdkAccountName, credential.userName, credential.displayName, credential.password);
			        this.softphone.login();
				} else {
					this.loginError();
				}
			},
			
			placeVideoCall : function(userName) {
		        //this.showRemoteRingingUI();
		        this.softphone.placeCall(userName, OMPhoneCall.CallType.VIDEO);
		        
		        this.callStarted(userName, OMPhoneCall.CallType.VIDEO);
			},
			
			placeVoipCall : function(userName) {
		        //this.showRemoteRingingUI();
		        this.softphone.placeCall(userName, OMPhoneCall.CallType.VOICE);
		        
		        this.callStarted(userName, OMPhoneCall.CallType.VOICE);
			},
			
			previewVideo : function(isShow) {
		        var camera = this.softphone.phoneManager.getSelectedCamera();
		        if (typeof camera !== 'undefined' && 'setListener' in camera) {
		            camera.setListener({
		                onPermissionDialogShown : $.proxy(function() {
		                //	console.log('Requesting media permissions');
		                	this.softphone.updateStatusMessage('Requesting media permissions');
		                }, this),
		                onPermissionDenied :  $.proxy(function() {
		                //	console.log('Media permissions denied');
		                	this.softphone.updateStatusMessage('Media permissions denied');
		                }, this),
		                onPermissionDialogClosed :  $.proxy(function() {
		                //	console.log('Media permissions dialog closed');
		                	this.softphone.updateStatusMessage('Media permissions dialog closed')
		                }, this),
		                onAvailable :  $.proxy(function() {
		                //	console.log('Media permissions granted');
		                	this.softphone.updateStatusMessage('Media permissions granted');
		                }, this)
		            });
		        }

		        // To force selection of a particular media device call, for example, softphone.phoneManager.getMicrophones()[0].select();
		        
		        // Showing the local video preview will force the softphone to try to acquire media permissions.
		    	//console.log("previewVideo");
		    	if (isShow)
		    		this.softphone.phoneManager.showLocalVideoPreview();
		    	else
		    		this.softphone.phoneManager.hideLocalVideoPreview();
			},
			
			cancel : function() {
		    	//console.log("cancel");
				
				this.callEnded();
				
				this.softphone.end();
			},
			
			callStarted : function(person, type) {
		    	//console.log("callStarted");
		    	
				this.changeState({callType : type});
				
				$(".headerPanelSmall").addClass("ringing");
				if (type === OMPhoneCall.CallType.VOICE) $(".videoPanel").addClass("voice");
				$("#peeringPerson").text( person );
			},
			
			callEnded : function() {
		    //	console.log("callEnded");
				this.changeState({isInCall : false, callType : null});
				
				$(".headerPanel,.headerPanelSmall").removeClass("ringing");
				$(".videoPanel").removeClass("voice");
				$("#peeringPerson").text("");
			}
	};
	
	window.VoipFrame = VoipFrame;
})();