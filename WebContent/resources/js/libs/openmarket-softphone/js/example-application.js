/** 
 * @fileOverview OpenMarket Softphone SDK example web application.<br />
 * Copyright 2012 OpenMarket Limited<br />
 * Evaluation SDK -- all materials STRICTLY CONFIDENTIAL AND PROPRIETARY
 */

/**
 * The example application's telephony functionality comes from calling methods and handling callbacks on this OMSoftphone instance.
 * To access documented customisation features of the API on OMPhoneManager, use softphone.phoneManager.
 */
var softphone = new OMSoftphone("OPENMARKET-SOFTPHONE", null, window.fuse.baseUrl+"resources/js/libs/openmarket-softphone/js/");

softphone.onLoginErrorCallback = function() {
    showLoggedOutUI();
};

softphone.onLoginSuccessCallback = function() {
    showLoggedInUI();
};

softphone.onStatusMessageCallback = function(message) {
    // Called when the softphone's status changes. 'message' is a human-readable description of the softphone's status.
    $('#status-indicator').html(message);
};

// Provides a layout for the local/remote video views, and specifies how the phone is shown in the DOM.
softphone.onLayoutCallback = function() {
    // Configure the layout of local/remote video in the softphone.
    softphone.phoneManager.setVideoLayout({'left' : '5%', 'top' : '5%', 'width' : '20%', 'height' : '20%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX},
                                          {'left' : '0', 'top' : '0', 'width' : '100%', 'height' : '100%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX});
    
    // Set the softphone's position to cover the softphone-placeholder element.
    if ($('#softphone-placeholder').length > 0) {
        softphone.phoneManager.setPhonePositionFromPlaceholder($('#softphone-placeholder'));
    }
}

softphone.onRemoteEndedCallback = function(reason) {
    showLoggedInUI();
    
    // Show a dialog then temporarily display the reason the call was terminated.
    alert(softphone.getTerminatedReasonString());
    $('#status-message').html(softphone.getTerminatedReasonString());
    $('#status-message').show();
    $('#status-message').css('opacity', 1).fadeTo(1500, 0, function() {
        $('#status-message').hide();
    });
};

softphone.onLocalEndedCallback = function() {
    showLoggedInUI();
};

softphone.onFailedCallback = function() {
    showLoggedInUI();
};

softphone.onRemoteRingingCallback = function() {
};

softphone.onLocalRingingCallback = function(call) {
    // Called when there is an incoming call.
    // This handler must return true to accept the call, or false to reject it.
    return confirm('Answer incoming ' + (call.type === OMPhoneCall.CallType.VIDEO ? 'video' : 'voice') + ' call' + 
                   (call.peer !== null ? ' from ' + call.peer.displayName : '') + '?');
};

// Called when a call is accepted locally or remotely.
softphone.onAnsweredCallback = function() {
    showInCallUI();
};

// Called when video first arrives on this call.
softphone.onReceivingRemoteVideoCallback = function() {
    showInCallUI();
};

// Set up the user interface after the page has finished loading.
$(document).ready(function() {
	console.log("openphone ready");
    var loginButton = $('#login-button'),
        placeVideoCallButton = $('#place-video-call-button'),
        placeVoiceCallButton = $('#place-voice-call-button'),
        previewVideoButton = $('#preview-video-button'),
        cancelButton = $('#cancel-button'),
        hangUpButton = $('#hang-up-button'),
        logoutButton = $('#logout-button');
    
    loginButton.click(function(e) {
    	console.log("openphone login click");
        e.preventDefault();
        
        softphone.setCredentials($('#sdk-account-name-text-box').val(), $('#user-name-text-box').val(), $('#user-name-text-box').val(), $('#password-text-box').val());
        softphone.login();
    });
    
    placeVideoCallButton.click(function(e) {
        e.preventDefault();
        
        showRemoteRingingUI();
        softphone.placeCall($('#peer-user-name-text-box').val(), OMPhoneCall.CallType.VIDEO);
    });

    placeVoiceCallButton.click(function(e) {
        e.preventDefault();
        
        showRemoteRingingUI();
        softphone.placeCall($('#peer-user-name-text-box').val(), OMPhoneCall.CallType.VOICE);
    });
    
    previewVideoButton.click(function(e) {
        e.preventDefault();
        
        // The user interface will sometimes need to be updated when requesting access to a camera.
        // Attach event handlers to the media permission status via the setListener method on the OMCamera object:
        var camera = softphone.phoneManager.getSelectedCamera();
        if (typeof camera !== 'undefined' && 'setListener' in camera) {
            camera.setListener({
                onPermissionDialogShown : function() {
                    softphone.updateStatusMessage('Requesting media permissions');
                },
                onPermissionDenied : function() {
                    softphone.updateStatusMessage('Media permissions denied');
                },
                onPermissionDialogClosed : function() {
                    softphone.updateStatusMessage('Media permissions dialog closed')
                },
                onAvailable : function() {
                    softphone.updateStatusMessage('Media permissions granted');
                }
            });
        }

        // To force selection of a particular media device call, for example, softphone.phoneManager.getMicrophones()[0].select();
        
        // Showing the local video preview will force the softphone to try to acquire media permissions.
    	console.log("openphone ready 1");
        softphone.phoneManager.showLocalVideoPreview();
    	console.log("openphone ready 2");
    });
    
    logoutButton.click(function(e) {
        e.preventDefault();
        
        softphone.logout();
        showLoggedOutUI();
    });
    
    cancelButton.click(function(e) {
        e.preventDefault();
        
        softphone.end();
    });
    
    hangUpButton.click(function(e) {
        e.preventDefault();
        
        softphone.end();
    });
    
    // Logout when the window is closed.
    $(window).unload(function() {
        softphone.logout();
    });
    
    showLoggedOutUI();
});

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
