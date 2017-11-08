/** 
 * @fileOverview OpenMarket Softphone SDK for web applications (public softphone API)<br />
 * Copyright 2012 OpenMarket Limited<br />
 * Evaluation SDK -- all materials STRICTLY CONFIDENTIAL AND PROPRIETARY
 * $Id: openmarket-softphone-0.7.8.js 247 2012-07-24 13:08:16Z andreyf $
 * @version $SDKVersion web-0.7.8-556814$
 */

/**
 * @class Instantiate this object to set up a softphone on the page.
 * Applications using the softphone should first instantiate an OMSoftphone, then call setCredentials and login.
 * Assign custom handlers to onLoginSuccessCallback and onLoginErrorCallback to update the user interface to reflect the login success/failure.
 * After a successful login, place calls via the placeCall method.
 * Once in a call, use the end method to hang-up.
 * Assign a custom handler to onLayoutCallback to configure the layout of local/remote video and choose how the softphone should be displayed in the DOM.
 * Assign custom handlers to onRemoteEndedCallback, onLocalEndedCallback, onFailedCallback, onRemoteRingingCallback, onLocalRingingCallback, onAnsweredCallback and onReceivingRemoteVideoCallback to handle these events.
 * Methods on OMPhoneManager are available via the phoneManager field (@see OMPhoneManager). For example, call phoneManager.showLocalPreview method to show a local preview to the user.
 * @param {String} [instanceId] Optional identifier for this instance of the softphone, used for logging.
 * @param {String} [userAgent] Optional user agent for this type of browser/device, used for logging.
 * @param {String} [loaderPath] Optional path prefix for loading resources. Defaults to 'openmarket-softphone/js'.
 * @constructor OMSoftphone 
 * @this {OMPhoneCall}
 */
function OMSoftphone(instanceId, userAgent, loaderPath) {
    // Implement the singleton pattern.
    if (arguments.callee.omSoftphoneInstance) {
        return arguments.callee.omSoftphoneInstance;
    }
    var singletonContainer = arguments.callee;
    arguments.callee.omSoftphoneInstance = this;
    /** @private */
    this.reset = function() {
        singletonContainer.omSoftphoneInstance = undefined;
    };
    
    this.callTerminatedReason = null;
    this.callState = OMSoftphone.CallState.NO_CALL;
    this.currentCall = null;
    this.isLoggedIn = false;
    
    this.instanceId = instanceId;
    this.userAgent = userAgent;
    
    this.phoneManager = null;
    
    this.loaderPath = (typeof loaderPath === 'undefined') ? 'openmarket-softphone/js/' : loaderPath;
    
    this.loading = new jQuery.Deferred();
    if (typeof OMPhoneManager === 'undefined') {
        var backendPath = this.loaderPath + 'phone-manager.js';
        $.ajax({
            url : backendPath, 
            dataType : 'script', 
            context : this, 
            cache : false
        }).fail(function() {
            OMLogger.error('Couldn\'t load the softphone SDK (' + backendPath + ').');
        }).done(function() {
            this.loading.resolveWith(this);
        });
    } else {
        this.loading.resolveWith(this);
    }
}

OMSoftphone.prototype = {
    /**
     * Set the credentials to use when logging in to the telephony gateway.
     * Please see the API documentation for details on associating users with your API account.
     * @param {String} sdkAccountName The name of the Softphone SDK account.
     * @param {String} userName The username for the user of this web application.
     * @param {String} displayName A human-readable name for the user.
     * @param {String} password The password for this user.
     */
    setCredentials : function(sdkAccountName, userName, displayName, password) {
        this.sdkAccountName = sdkAccountName;
        this.userName = userName;
        this.displayName = displayName;
        this.password = password;
    },
    
    /**
     * Log into the telephony gateway using credentials previously supplied via setCredentials().
     * After a successful login (notified via onLoginSuccessCallback), the user will be able to receive calls.
     */
    login : function() {
        this.isLoggedIn = false;
        this.updateStatusMessage('Logging in &hellip;');
        
        this.loading.done(function() {
            var user = new OMUser(this.userName, this.displayName, this.userName.indexOf('@') == -1 ? undefined : this.userName),
                credentials = new OMCredentials(user, this.sdkAccountName, this.password, this.instanceId, this.userAgent);

            this.phoneManager = new OMPhoneManager(this.loaderPath);
            
            // Allow the application to override the default layout.
            if (typeof this.onLayoutCallback === 'function') {
                this.onLayoutCallback(this.phoneManager);
            } else {
                this.phoneManager.setVideoLayout({'left' : '5%', 'top' : '5%', 'width' : '20%', 'height' : '20%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX}, {'left' : '0', 'top' : '0', 'width' : 760, 'height' : 580, 'mode' : OMPhoneManager.ViewMode.LETTERBOX});
                if ($('#softphone-placeholder').length > 0) {
                    this.phoneManager.setPhonePositionFromPlaceholder($('#softphone-placeholder'));
                }
            }
            
            // This object listens for both login and call events.
            this.phoneManager.login(credentials, this, this);
        });
    },
    
    /**
     * Invoked when the softphone needs a layout.
     * The default implementation displays the softphone covering $('#softphone-placeholder') if it exists.
     * Video is letterboxed with a small picture-in-picture local video preview on top of remote video.
     * @see OMPhoneManager.setVideoLayout
     * @see OMPhoneManager.setPhonePositionFromPlaceholder
     * @event
     */
    onLayoutCallback : null,
    
    /**
     * Log out from the telephony gateway. The user will no longer be able to receive calls.
     */
    logout : function() {
        this.updateStatusMessage('');

        if (!this.isLoggedIn) {
            OMLogger.warn('Tried to log out while not logged in.');
            return;
        }
        
        this.phoneManager.logout();
        this.isLoggedIn = false;
    },
    
    /**
     * Place a video/voice call to the user(s) specified by name.
     * @param {String} toCall One or more usernames to call. To place a conference call, provide usernames separated by ',' (without additional whitespace).
     * @param {OMPhoneCall.CallType} callType The type of call (video or voice).
     */
    placeCall : function(toCall, callType) {
        if (!this.isLoggedIn) {
            OMLogger.error('Not placing call as the softphone is not logged in.');
            return;
        }
        
        this.updateStatusMessage('Placing call &hellip;');
        
        var peerUserNames = toCall.split(',')
        var peers = new Array();
        for (var index = 0; index < peerUserNames.length; index++) {
            var peerUserName = peerUserNames[index];
            peers.push(peerUserName.indexOf('@') != -1 ? new OMUser(peerUserName, undefined, peerUserName) : new OMUser(peerUserName));
        }
        
        this.currentCall = this.phoneManager.placeCall(peers, callType);
    },
    
    /**
     * Gets the call currently in progress, or null if there is none.
     * @returns {OMPhoneCall} The call currently in progress, or null if there is none.
     */
    getCurrentCall : function() {
        return this.currentCall;
    },
    
    /**
     * Ends the current call by hanging up or rejecting it.
     */
    end : function() {
        if (this.currentCall != null) {
            this.currentCall.end();
        }
        
        this.currentCall = null;
    },
    
    /**
     * Update the human-readable status of the softphone.
     * @param {String} message A human-readable status message describing the state of the softphone.
     */
    updateStatusMessage : function(message) {
        if (typeof this.onStatusMessageCallback === 'function') {
            this.onStatusMessageCallback(message);
        }
    },
    
    // OMPhoneLoginListener events.
    /** @private */
    onLoginSuccess : function() {
        OMLogger.info('Login successful.');
        
        this.isLoggedIn = true;
        this.setCallState(OMSoftphone.CallState.NO_CALL);
        
        if (typeof this.onLoginSuccessCallback === 'function') {
            this.onLoginSuccessCallback();
        }
    },
    
    /**
     * Invoked when the user is logged into the OpenMarket Telephony Gateway and may now place and receive calls.
     * @event
     */
    onLoginSuccessCallback : null,
    
    /** @private */
    onLoginError : function(error, message) {
        this.updateStatusMessage(message);

        if (error === OMPhoneManager.LoginError.CONNECTION_WARNING) {
            return;
        }
        
        OMLogger.warn('Login error (' + error + ').');

        this.currentCall = null;
        this.isLoggedIn = false;

        if (typeof this.onLoginErrorCallback === 'function') {
            this.onLoginErrorCallback(error, message);
        }
    },

    /**
     * Invoked when there was an error logging into the OpenMarket Telephony Gateway.
     * @event
     */
     onLoginErrorCallback : null,
    
    // OMPhoneCallListener events.
    /** @private */
    onRemoteRinging : function() {
        this.callWasAnswered = false;
        this.setCallState(OMSoftphone.CallState.RINGING_REMOTE);
        
        if (typeof this.onRemoteRingingCallback === 'function') {
            this.onRemoteRingingCallback();
        }
    },

    /**
     * Invoked when the remote softphone is ringing.
     * @event
     */
    onRemoteRingingCallback : null,
    
    /** @private */
    onLocalRinging : function(call) {
        this.callWasAnswered = false;
        this.setCallState(OMSoftphone.CallState.RINGING);
        this.phoneManager.showLocalVideoPreview();
        
        var shouldAnswer;
        if (typeof this.onLocalRingingCallback === 'function') {
            shouldAnswer = this.onLocalRingingCallback(call);
        } else {
            shouldAnswer = confirm('Answer incoming ' + (call.type === OMPhoneCall.CallType.VIDEO ? 'video' : 'voice') + 
                           ' call' + (call.peer !== null ? ' from ' + call.peer.displayName : '') + '?');
        }
        
        if (!shouldAnswer) {
            // Not accepting the call:
            call.end();
            this.currentCall = null;
            this.onLocalEnded();
        }
        
        if (shouldAnswer && this.callState === OMSoftphone.CallState.RINGING) {
            call.accept();
            if (this.callState === OMSoftphone.CallState.RINGING) {
                this.currentCall = call;
                this.onAnswered();
                return;
            }
        }
    },
    
    /**
     * Invoked when the local softphone is ringing.
     * The default implementation shows a dialog asking the user whether to answer the incoming call.
     * @param {OMPhoneCall} [call] An OMPhoneCall instance representing the incoming call.
     * @returns {Boolean} The callback must return 'true' to accept the call, or 'false' to reject the call.
     * @event
     */
    onLocalRingingCallback : null,
    
    /** @private */
    onAnswered : function() {
        this.callWasAnswered = true;
        this.setCallState(OMSoftphone.CallState.IN_PROGRESS);
        
        if (typeof this.onAnsweredCallback === 'function') {
            this.onAnsweredCallback();
        }
    },
    
    /**
     * Invoked when a call was answered either locally or remotely. Use this to transition your application to an 'in-call' state.
     * @event
     */
    onAnsweredCallback : null,
    
    /** @private */
    onRemoteEnded : function(reason) {
        this.currentCall = null;
        switch (reason) {
            case OMPhoneCall.CallEndReason.REMOTE_BUSY:
                this.callTerminatedReason = OMSoftphone.CallTerminatedReason.REMOTE_BUSY;
                break;
            case OMPhoneCall.CallEndReason.REMOTE_REJECTED:
                this.callTerminatedReason = OMSoftphone.CallTerminatedReason.REMOTE_REJECTED;
                break;
            case OMPhoneCall.CallEndReason.REMOTE_UNAVAILABLE:
                this.callTerminatedReason = OMSoftphone.CallTerminatedReason.REMOTE_UNAVAILABLE;
                break;
            case OMPhoneCall.CallEndReason.REMOTE_HUNGUP:
                this.callTerminatedReason = OMSoftphone.CallTerminatedReason.REMOTE_HUNGUP;
                break;
            case OMPhoneCall.CallEndReason.ANSWERED_ELSEWHERE:
                this.callTerminatedReason = OMSoftphone.CallTerminatedReason.ANSWERED_ELSEWHERE;
                break;
        }
        
        this.setCallState(OMSoftphone.CallState.TERMINATED);
        
        if (typeof this.onRemoteEndedCallback === 'function') {
            this.onRemoteEndedCallback(reason);
        } else {
            alert(this.getTerminatedReasonString());
        }
    },
    
    /**
     * Invoked when the call was terminated due to a remote action.
     * Use this method to notify the user that the call was terminated.
     * Use the getTerminatedReasonString method to get a human-readable description of why the call ended.
     * The default implementation shows an alert dialog describing why the call ended.
     * @event
     */
    onRemoteEndedCallback : null,
    
    /** @private */
    onLocalEnded : function() {
        this.currentCall = null;
        
        if (this.callState === OMSoftphone.CallState.IN_PROGRESS) {
            this.callTerminatedReason = OMSoftphone.CallTerminatedReason.LOCAL_HUNGUP;
        } else if (this.callState === OMSoftphone.CallState.RINGING_REMOTE || this.callState == OMSoftphone.CallState.NO_CALL) {
            this.callTerminatedReason = OMSoftphone.CallTerminatedReason.LOCAL_HUNGUP;
        } else if (this.callState === OMSoftphone.CallState.RINGING) {
            this.callTerminatedReason = OMSoftphone.CallTerminatedReason.LOCAL_REJECTED;
        } else {
            this.callTerminatedReason = OMSoftphone.CallTerminatedReason.UNSPECIFIED;
        }
        
        this.setCallState(OMSoftphone.CallState.TERMINATED);
        
        if (typeof this.onLocalEndedCallback === 'function') {
            this.onLocalEndedCallback();
        }
    },
    
    /**
     * Invoked when the call was terminated due to a local action.
     * @event
     */
    onLocalEndedCallback : null,
    
    /** @private */
    onFailed : function(reason, errorMessage) {
        this.callTerminatedReason = OMSoftphone.CallTerminatedReason.ERROR;
        this.setCallState(OMSoftphone.CallState.FAILED);
        
        if (typeof this.onFailedCallback === 'function') {
            this.onFailedCallback(reason, errorMessage);
        }
    },
    
    /**
     * Invoked when the call failed due to a communication error.
     * @param {OMPhoneCall.CallErrorCode} [code] A code representing the type of error.
     * @param {String} [message] A human-readable error message.
     * @event
     */
    onFailedCallback : null,
    
    /** @private */
    onRemoteCameraMetadata : function(cameraType, cameraOrientation) {
        if (typeof this.onRemoteCameraMetadataCallback === 'function') {
            this.onRemoteCameraMetadataCallback(cameraType, cameraOrientation);
        }
    },
    
    /**
     * Invoked when the other phone changed orientation or switched to a different camera.
     * @param {OMPhoneCall.CameraType} cameraType What type of camera the other phone is using.
     * @param {OMPhoneCall.CameraOrientation} cameraOrientation The best orientation to view the remote video in.
     * @event
     */
    onRemoteCameraMetadataCallback : null,
    
    /** @private */
    onReceivingRemoteVideo : function() {
        if (typeof this.onReceivingRemoteVideoCallback === 'function') {
            this.onReceivingRemoteVideoCallback();
        }
        
        this.updateStatusMessage('In a call with ' + this.currentCall.peer.displayName + ' and receiving remote video.');
    },
    
    /**
     * Invoked when this softphone begins to receive video from the remote phone.
     * @event
     */
    onReceivingRemoteVideoCallback : null,
    
    /**
     * Get the reason the previous call was terminated, as a string.
     * @returns {String} A human readable description for why the call was terminated or 'null'.
     */
    getTerminatedReasonString : function() {
        switch (this.callTerminatedReason) {
            case OMSoftphone.CallTerminatedReason.UNSPECIFIED:
                return null;
            case OMSoftphone.CallTerminatedReason.ERROR:
                return 'Call error';
            case OMSoftphone.CallTerminatedReason.LOCAL_HUNGUP:
                return 'Call ended';
            case OMSoftphone.CallTerminatedReason.LOCAL_REJECTED:
                return 'Call rejected';
            case OMSoftphone.CallTerminatedReason.REMOTE_HUNGUP:
                if (!this.callWasAnswered) {
                    return 'Missed call';
                } else {
                    return 'Call ended';
                }
            case OMSoftphone.CallTerminatedReason.ANSWERED_ELSEWHERE:
                return 'Call ended';
            case OMSoftphone.CallTerminatedReason.REMOTE_BUSY:
                return 'User busy';
            case OMSoftphone.CallTerminatedReason.REMOTE_REJECTED:
                return 'Call rejected';
            case OMSoftphone.CallTerminatedReason.REMOTE_UNAVAILABLE:
                return 'User unavailable';
            case OMSoftphone.CallTerminatedReason.POOR_QUALITY:
                return 'Link lost';
        }
        
        return null;
    },
    
    /** @private */
    setCallState : function(callState) {
        this.callState = callState;
        
        if (callState === OMSoftphone.CallState.TERMINATED) {
            var self = this;
            window.setTimeout(function() {
                if (self.callState === OMSoftphone.CallState.TERMINATED) {
                    self.setCallState(OMSoftphone.CallState.NO_CALL);
                }
            }, 2000);
        }
        
        this.updateStatusMessage(this.getCallStateDescription(callState));
    },
    
    /** @private */
    getCallStateDescription : function() {
        switch (this.callState) {
            case OMSoftphone.CallState.NO_CALL:
                return 'Logged in as ' + this.phoneManager.currentCredentials.user.displayName + '.';
            case OMSoftphone.CallState.CONNECTING:
                return 'Connecting &hellip;';
            case OMSoftphone.CallState.RINGING:
                return 'Ringing';
            case OMSoftphone.CallState.RINGING_REMOTE:
                return 'Remote ringing';
            case OMSoftphone.CallState.IN_PROGRESS:
                return 'In a call with ' + this.currentCall.peer.displayName + '.';
            case OMSoftphone.CallState.TERMINATED:
                return 'Call terminated: ' + this.getTerminatedReasonString();
            case OMSoftphone.CallState.FAILED:
                return 'Call failed';
        }
        
        return 'Unknown call state';
    }
};

/** @private */
OMSoftphone.CallTerminatedReason = {
    UNSPECIFIED : 'UNSPECIFIED',
    LOCAL_REJECTED : 'LOCAL_REJECTED',
    LOCAL_HUNGUP : 'LOCAL_HUNGUP',
    REMOTE_BUSY : 'REMOTE_BUSY',
    REMOTE_UNAVAILABLE : 'REMOTE_UNAVAILABLE',
    REMOTE_REJECTED : 'REMOTE_REJECTED',
    REMOTE_HUNGUP : 'REMOTE_HUNGUP',
    ANSWERED_ELSEWHERE : 'ANSWERED_ELSEWHERE',
    ERROR : 'ERROR',
    POOR_QUALITY : 'POOR_QUALITY'
};

/** @private */
OMSoftphone.CallState = {
    NO_CALL : 'NO_CALL',
    CONNECTING : 'CONNECTING',
    RINGING : 'RINGING',
    RINGING_REMOTE : 'RINGING_REMOTE',
    IN_PROGRESS : 'IN_PROGRESS',
    TERMINATED : 'TERMINATED',
    FAILED : 'FAILED'
};

/** @private */
var OMLogger = {
    /** @private */
    log : function(message) {
        if (typeof console === 'undefined') {
            return;
        } else {
            console.log(message);
        }
    },
    
    /** @private */
    info : function(message) {
        if (this.logLevel > 2) {
            this.log('INFO: ' + message);
        }
    },
        
    /** @private */
    warn : function(message) {
        if (this.logLevel > 1) {
            this.log('WARN: ' + message);
        }
    },
        
    /** @private */
    error : function(message) {
        if (this.logLevel > 0) {
            this.log('ERROR: ' + message);
        }
    },
    
    logLevel : 3
};
