/** 
 * @fileOverview OpenMarket Softphone SDK for web applications (public API)<br />
 * Copyright 2012 OpenMarket Limited<br />
 * Evaluation SDK -- all materials STRICTLY CONFIDENTIAL AND PROPRIETARY<br />
 * $Id: phone-manager.js 247 2012-07-24 13:08:16Z andreyf $
 * @version $SDKVersion web-0.7.8-556814$
 */

/** @private */
var OMSoftphoneSDKVersion = '$SDKVersion web-0.7.8-556814$';

/**
 * @class Interface for listening to OMPhoneManager login events.
 * @constructor
 * @this {OMPhoneLoginListener}
 */
var OMPhoneLoginListener = function() {
};

OMPhoneLoginListener.prototype = {
    /**
     * The user is logged into the OpenMarket Telephony Gateway and may now place and receive calls.
     * @event
     */
    onLoginSuccess : null,
    /**
     * A problem occurred while logging into the OpenMarket Telephony Gateway.
     * @param {OMPhoneManager.LoginError} error An error code.
     * @param {String} message A message indicating what failed.
     * @event
     */
    onLoginError : null
};

/**
 * @class Interface for listening to OMPhoneCall events.
 * @constructor
 * @this {OMPhoneCallListener}
 */
var OMPhoneCallListener = function() {
};

OMPhoneCallListener.prototype = {
    /**
     * A call placed to another phone starts ringing.
     * @event
     */
    onRemoteRinging : null,
    
    /**
     * A call placed to this phone starts ringing.
     * @param {OMUser} peer The user that caused this phone to ring.
     * @param {OMPhoneCall.CallType} type The type of call that caused this phone to ring.
     * @event
     */
    onLocalRinging : null,

    /**
     * A call placed to another phone is answered.
     * @event
     */
    onAnswered : null,
    
    /**
     * The other end of a call ended the call.
     * @param {OMPhoneCall.CallEndReason} reason The reason why the call ended.
     * @event
     */
    onRemoteEnded : null,
    
    /**
     * The local phone ended the call.
     * @event
     */
    onLocalEnded : null,
        
    /**
     * The call failed.
     * @param {OMPhoneCall.CallErrorCode} reason A code indicating why the call failed.
     * @param {String} errorMessage A description of why the call failed.
     * @event
     */
    onFailed : null,
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * This call is now being converted to a multi-party call.
     */
    onConferenceTransferStarted : null,
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * This call has now been converted to a multi-party call.
     * @event
     */
    onConferenceCallStarted : null,
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * The type of call has changed (either as a result of a local or remote request).
     *
     * If changing to a video call, outbound video will be muted by default in order to preserve user privacy.
     * @event
     */
    onCallTypeChanged : null,
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * The type of the call could not be changed.
     * @event
     */
    onCallTypeChangeFailed : null,
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * The other party is requesting to change the type of the call.
     * @param {OMPhoneCall.CallType} type The requested new call type.
     * @returns {Boolean} Whether to accept the call type change.
     * @event
     */
    onCallTypeChangeRequested : function(type) {
        return false;
    },
    
    /**
     * UNIMPLEMENTED API EVENT -- this event will never occur in this release.
     * The status of a user on a the conference call has changed.
     * @param {OMUser} user The user whose state has changed.
     * @event
     */
    onConferenceStateChanged : function(user) {
    },
    
    /**
     * The remote video stream was received for the first time during this call.
     * @event
     */
    onReceivingRemoteVideo : function() {
    },
    
    /**
     * The other phone changed orientation or switched to a different camera.
     * @param {OMPhoneCall.CameraType} cameraType What type of camera the other phone is using.
     * @param {OMPhoneCall.CameraOrientation} cameraOrientation The best orientation to view the remote video in.
     * @event
     */
    onRemoteCameraMetadata : function(cameraType, cameraOrientation) {
    }
};

/**
 * @class Represents a phone call.
 * @constructor OMPhoneCall Do not instantiate OMPhoneCalls directly.
 * @this {OMPhoneCall}
 */
var OMPhoneCall = function(phoneManager, backend, peer, listener) {
    this.backend = backend;
    this.peer = peer;
    this.listener = listener;
    this.phoneManager = phoneManager;
};

OMPhoneCall.prototype = {
    /**
     * Answers an incoming call.
     */
    accept : function() {
        // Check this object is still the current call, and that it's non-null.
        // This is to deal with the case that the call was ended before the application accepted it.
        if (this.phoneManager.currentCall === this) {
            this.backend.accept();
        }
    },

    /**
     * Ends a call.
     * If the call was an incoming call which had not been accepted, the call is rejected.
     * If the call was an outgoing call which has not started, the call is cancelled.
     * Otherwise, it is hung up.
     */
    end : function() {
        // Check this object is still the current call, and that it's non-null.
        // This is to deal with the case that the call was ended before the application ended it.
        if (this.phoneManager.currentCall === this) {
            this.backend.end();
            this.onLocalEnded();
        }
    },
        
    /**
     * Gets the type of this call.
     * @returns {OMPhoneCall.CallType} The type of call.
     */
    getType : function() {
        return this.backend.getCallType();
    },

    /**
     * Set the local device orientation.
     * @param {OMPhoneCall.CameraOrientation} cameraOrientation The local device's orientation.
     */
    setDeviceOrientation : function(cameraOrientation) {
        if (cameraOrientation === OMPhoneCall.CameraOrientation.PORTRAIT_LEFT) {
            this.backend.setSendVideoRotation(90);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.PORTRAIT_RIGHT) {
            this.backend.setSendVideoRotation(270);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.LANDSCAPE_UP) {
            this.backend.setSendVideoRotation(0);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.LANDSCAPE_DOWN) {
            this.backend.setSendVideoRotation(180);
        } // If it's unknown, don't change the send video rotation.
    },
    
    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Adds a user to this call, promoting it from peer-to-peer to conference if necessary.
     * @param {OMUser} user The user to add to this call.
     */
    addUser : function(user) {
    },
    
    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Put this call on hold or take it off hold.
     * When on hold, a call's audio is muted in both directions
     */
    setHeld : function(held) {
    },
    
    /**
     * Returns true if this call is currently on hold locally. Otherwise, returns false.
     */
    getHeld : function() {
        return false;
    },

    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Sets whether outbound audio on this call should be muted.
     */
    setOutboundAudioMuted : function() {
    },

    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Sets whether inbound audio on this call should be muted.
     */
    setInboundAudioMuted : function() {
    },

    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Sets whether outbound video on this call should be muted.
     */
    setOutboundVideoMuted : function() {
    },
    
    /**
     * UNIMPLEMENTED API METHOD -- this method has no effect in this release.
     * Begins an attempt to negotiate a change in the call type with the remote party.
     * Success or failure of this request will be communicated through OMPhoneCallListener.
     * @param {OMPhoneCall.CallType} type The requested new call type.
     */
    changeCallType : function(type) {
    },
    
    
    /** @private */
    onFailed : function() {
        this.listener.onFailed();
    },

    /** @private */
    onAnswered : function() {
        this.listener.onAnswered();
    },

    /** @private */
    onLocalEnded : function() {
        this.listener.onLocalEnded();
        
        this.phoneManager.currentCall = null;
    },
    
    /** @private */
    onRemoteRinging : function() {
        this.listener.onRemoteRinging();
    },
        
    /** @private */
    onLocalRinging : function(call) {
        this.listener.onLocalRinging(call);
    },

    /** @private */
    onRejected : function() {
        this.listener.onRemoteEnded(OMPhoneCall.CallEndReason.REMOTE_REJECTED);
        
        this.phoneManager.currentCall = null;
    },
        
    /** @private */
    onBusy : function() {
        this.listener.onRemoteEnded(OMPhoneCall.CallEndReason.REMOTE_BUSY);
        
        this.phoneManager.currentCall = null;
    },
    
    /** @private */
    onUnavailable : function() {
        this.listener.onRemoteEnded(OMPhoneCall.CallEndReason.REMOTE_UNAVAILABLE);
        
        this.phoneManager.currentCall = null;
    },
        
    /** @private */
    onCancel : function() {
        this.listener.onRemoteEnded(OMPhoneCall.CallEndReason.REMOTE_HUNGUP);
        
        this.phoneManager.currentCall = null;
    },
    
    /** @private */
    onReceivingRemoteVideo : function() {
        this.listener.onReceivingRemoteVideo();
    },
        
    /** @private */
    onHungUp : function() {
        this.listener.onRemoteEnded(OMPhoneCall.CallEndReason.REMOTE_HUNGUP);
        
        this.phoneManager.currentCall = null;
    },

    /** @private */
    onRemoteCameraMetadata : function(cameraOrientation, cameraType) {
        if (this.getType() === OMPhoneCall.CallType.VOICE) {
            return;
        }
            
        if (cameraOrientation === OMPhoneCall.CameraOrientation.PORTRAIT_RIGHT) {
            this.backend.setReceiveVideoRotation(0);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.PORTRAIT_LEFT) {
            this.backend.setReceiveVideoRotation(180);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.LANDSCAPE_UP) {
            this.backend.setReceiveVideoRotation(90);
        } else if (cameraOrientation === OMPhoneCall.CameraOrientation.LANDSCAPE_DOWN) {
            this.backend.setReceiveVideoRotation(270);
        }
            
        this.listener.onRemoteCameraMetadata(cameraType, cameraOrientation);
    }
};

/**
 * @class Represents a video source on this device.
 * @constructor Do not instantiate this class directly.
 * @this {OMCamera}
 * @name OMCamera
 */
var OMCamera = function(backend, name, isSelected, isDefault) {
    this.backend = backend;
    this.name = name;
    this.isSelected = isSelected;
    this.isDefault = isDefault;
    this.setListener({});
};

OMCamera.prototype = {
    /**
     * Get the name of this camera.
     */
    getName : function() {
        return this.name;
    },
    
    /** 
     * Selects this camera for voice/video calling.
     */
    select : function() {
        this.backend.selectCamera(this.name);
    },
    
    /**
     * Get whether this is the default device.
     */
    getIsDefault : function() {
        return this.isDefault;
    },
    
    /**
     * Get whether this is the selected device.
     * The selected device will be used until another device is selected.
     */
    getIsSelected : function() {
        return this.isSelected;
    },
    
    /**
     * Sets the listener for events pertaining to this device.
     * @param {OMCameraListener} listener An object to listen for events pertaining to this microphone.
     */
    setListener : function(listener) {
        this.listener = OMUtils.getListener(new OMCameraListener(), listener);
    }
};

/**
 * @class Represents a audio source on this device.
 * @constructor Do not instantiate this class directly.
 * @this {OMMicrophone}
 * @name OMMicrophone
 */
var OMMicrophone = function(backend, name, isSelected, isDefault) {
    this.backend = backend;
    this.name = name;
    this.isSelected = isSelected;
    this.isDefault = isDefault;
    this.setListener({});
};

OMMicrophone.prototype = {
    /**
     * Get the name of this microphone.
     */
    getName : function() {
        return this.name;
    },
    
    /** 
     * Selects this microphone for voice/video calling.
     * The selected device will be used until another device is selected.
     */
    select : function() {
        this.backend.selectMicrophone(this.name);
    },
    
    /**
     * Get whether this is the default device.
     */
    getIsDefault : function() {
        return this.isDefault;
    },
    
    /**
     * Get whether this is the selected device.
     */
    getIsSelected : function() {
        return this.isSelected;
    },
    
    /**
     * Sets the listener for events pertaining to this device.
     * @param {OMMicrophoneListener} listener An object to listen for events pertaining to this microphone.
     */
    setListener : function(listener) {
        this.listener = OMUtils.getListener(new OMMicrophoneListener(), listener);
    }
};

/**
 * @class Interface for listening to OMCamera events.
 * @constructor
 * @this {OMCameraListener}
 */
var OMCameraListener = function() {
};

OMCameraListener.prototype = {
    /**
     * A dialog requesting access to the device has been shown to the user.
     * @event
     */
    onPermissionDialogShown : function() {
    },
    
    /**
     * No permission was granted to access the device.
     * @event
     */
    onPermissionDenied : function() {
    },

    /**
     * A dialog requesting access to the device is no longer visible.
     * @event
     */
    onPermissionDialogClosed : function() {
    },
    
    /**
     * The device is available for use in calls.
     * @event
     */
    onAvailable : function() {
    }
};

/**
 * @class Interface for listening to OMMicrophone events.
 * @constructor
 * @this {OMMicrophoneListener}
 */
var OMMicrophoneListener = function() {
};

OMMicrophoneListener.prototype = {
    /**
     * A dialog requesting access to the device has been shown to the user.
     * @event
     */
    onPermissionDialogShown : function() {
    },
    
    /**
     * No permission was granted to access the device.
     * @event
     */
    onPermissionDenied : function() {
    },

    /**
     * A dialog requesting access to the device is no longer visible.
     * @event
     */
    onPermissionDialogClosed : function() {
    },
    
    /**
     * The device is available for use in calls.
     * @event
     */
    onAvailable : function() {
    }
};

/**
 * @class Represents a softphone session. Use this class to login, logout and place/receive calls.
 * @param {String} [loaderPath] The path prefix for loading dependencies. Defaults to 'openmarket-softphone/js/'.
 * @constructor Gets the singleton OMPhoneManager.
 * @this {OMPhoneManager}
 * @name OMPhoneManager
 */
var OMPhoneManager = function(loaderPath) {
    // Implement the singleton pattern.
    if (arguments.callee.omPhoneManagerInstance) {
        return arguments.callee.omPhoneManagerInstance;
    }
    var singletonContainer = arguments.callee;
    arguments.callee.omPhoneManagerInstance = this;
    /** @private */
    this.reset = function() {
        singletonContainer.omPhoneManagerInstance = undefined;
    };
    
    this.loginState = OMPhoneManager.LoginState.LOGGED_OUT;
    this.currentCall = null;
    this.phoneView = new Object();
    this.phoneView.haveContainer = new jQuery.Deferred();
    this.phoneViewUpdated = function() {};
    this.setFullScreenButton();
    this.setSoundsEnabled();
    this.setVideoLayout();
    this.setLocalDeviceOrientationEnabled(false);
    this.setInCallLocalVideoVisible();
    
    if (typeof loaderPath === 'undefined') {
        loaderPath = 'openmarket-softphone/js/';
    }
    
    this.backendLoading = new jQuery.Deferred();
    if (typeof OMSoftphoneBackend === 'undefined') {
        var backendPath = loaderPath + 'backend.js';
        $.ajax({
            url : backendPath, 
            dataType : 'script', 
            context : this, 
            cache : false
        }).fail(function() {
            this.backend = null;
            OMLogger.error('Couldn\'t load the softphone backend (' + backendPath + ').');
        }).done(function() {
            this.backend = new OMSoftphoneBackend(this, loaderPath);
            this.backendLoading.resolveWith(this);
        });
    } else {
        this.backend = new OMSoftphoneBackend(this, loaderPath);
        this.backendLoading.resolveWith(this);
    }
};

OMPhoneManager.prototype = {
    /** @private */
    populateDefaults : function(input, resultObject, defaults) {
        for (var name in defaults) {
            if (typeof input !== 'undefined' && name in input) {
                resultObject[name] = input[name];
            } else if (defaults[name] !== null) {
                resultObject[name] = defaults[name];
            }
        }
    },
    
    /**
     * Configure the softphone's bounding rectangle, based on an Object with top, left, width and height properties.
     * Offsets and dimensions are in pixels relative to the top-left of the containing document.
     * Pass in no parameters to position the softphone at the top-left of the document.
     * Note: OMPhoneManager.setPhonePositionFromPlaceholder() performs the same function but takes a DOM element rather than offsets/dimensions.
     * @param {Object} [bounds] Specify an Object with top, left, width and height properties to set the position and dimensions of the softphone.
     *                          Please note that minimum width/height requirements may be enforced by the softphone implementation, causing it to extend over the specified bounds.
     *                          Example: setPhonePosition({'left' : 50, 'top' : 50, 'width' : 640, 'height' : 480}); will position a 640 by 480 pixel canvas offset 50 pixels vertically and horizontally from the top-left of the document.
     */
    setPhonePosition : function(bounds) {
         // Set up this.phoneView with the passed-in values or defaults.
        this.phoneView.softphone = {};
        this.populateDefaults(bounds, this.phoneView.softphone, {'left' : 0, 'top' : 0, 'width' : 215, 'height' : 138});
        
        this.phoneViewUpdated();
    },
    
    /** @private */
    isDomElement : function(element) {
        return (typeof element !== 'undefined' && typeof HTMLElement === 'object' ? element instanceof HTMLElement : (typeof element === 'object' && element.nodeType === 1 && typeof element.nodeName === 'string'));
    },
    
    /**
     * Configure the softphone's bounding rectangle. The softphone's position and dimensions in the document will match those of the specified DOM element.
     * @param {DOMElement} placeholder Provide a DOM element or jQuery selector to configure the softphone's offset and dimensions based on an existing element in the DOM.
     */
    setPhonePositionFromPlaceholder : function(placeholder) {
        if (typeof placeholder === 'undefined' || placeholder === null) {
            placeholder = {};
        }
        
        // Get a selector if it's a DOM element.
        if (this.isDomElement(placeholder)) {
            placeholder = $(placeholder);
        }
        
        // Set up an object with the element's position and dimensions.
        if (typeof placeholder !== 'undefined' && 'offset' in placeholder && 'width' in placeholder && 'height' in placeholder) {
            placeholder = {'left' : placeholder.offset().left, 'top' : placeholder.offset().top, 'width' : placeholder.width(), 'height' : placeholder.height()};
        }

        this.setPhonePosition(placeholder);
    },
    
    /**
     * Specify a DOM element for the softphone. The phone will be embedded to replace the specified element.
     * Please note that the ID of the specified element may be changed during embedding.
     * Please note that this method must be called before 'login' is invoked, otherwise a new DOM element will be created to contain the softphone.
     * If this method is never called, or is called with element === null or undefined, a new element will be created to contain the softphone.
     * @param {DOMElement} [element]  Optionally embed the softphone inside a particular element in the DOM. If undefined, a new element is added to the DOM to contain the softphone.
     */
    setPhoneElement : function(element) {
         if (typeof element !== 'undefined' && element != null && this.isDomElement(element)) {
             element = $(element);
         } else if (typeof element === 'undefined') {
             // Delegate to setPhoneParent, which defaults to the body element.
             this.setPhoneParent();
             return;
         }
         
         // Check whether the selector matched anything.
         if (element.length === 0) {
             OMLogger.error('setPhoneElement could not find the specified element in the DOM.');
             return;
         }
         
         // If the position hasn't been set yet, set it based on the container.
         if (typeof this.phoneView.softphone === 'undefined') {
             this.setPhonePositionFromPlaceholder(element);
         }
         
         // Resolve the deferred on having a container.
         this.phoneView.softphoneContainer = element;
         this.phoneViewUpdated();
         if (!this.phoneView.haveContainer.isResolved()) {
             this.backendLoading.done(function() {
                 this.phoneView.haveContainer.resolveWith(this.backend, []);
             });
         }
    },
    
    /**
     * Specify a parent DOM element for the softphone. The phone will be embedded as a child of the specified element.
     * Please note that this method must be called before 'login' is invoked.
     * If setPhoneElement is not called and this method is either never called, or called only after 'login', the parent will be the body element.
     * If the parent parameter is ommitted, the parent will be the body element.
     * @param {DOMElement} [parent] Embed the softphone as the child of a particular element in the DOM.
     */
    setPhoneParent : function(parent) {
        if (typeof parent !== 'undefined' && this.phoneView.softphoneContainer !== null) {
            OMLogger.warn('setPhoneParent called when the embedding was already specified.');
        } else if (typeof parent === 'undefined' && (typeof this.phoneView.softphoneContainer !== 'undefined' && this.phoneView.softphoneContainer !== null)) {
            OMLogger.info('Skipping setPhoneParent as the embedding was already specified.');
            return;
        }
        
        // Create an element to contain the softphone.
        var element = $('<div></div>');
        element.css('position', 'relative');

        // Get a jQuery selector for the parent.
        if (typeof parent !== 'undefined' && parent != null && this.isDomElement(parent)) {
            parent = $(parent);
        } else if (typeof parent === 'undefined') {
            // Default behaviour:
            parent = $('body');
            element.css('position', 'absolute');
        }

        // If the position hasn't been set yet, set it based on the container.
        if (typeof this.phoneView.softphone === 'undefined') {
            this.setPhonePositionFromPlaceholder(parent);
        }
        
        parent.append(element);
        
        // Resolve the deferred on having a container.
        this.phoneView.softphoneContainer = element;
        this.phoneViewUpdated();
        if (!this.phoneView.haveContainer.isResolved()) {
            this.backendLoading.done(function() {
                this.phoneView.haveContainer.resolveWith(this.backend, []);
            });
        }
    },

    /**
     * To hide the full-screen button, call this method passing in 'false'. To show it, call this method passing in undefined (for default positioning) or an Object with 'left' and 'top' members specifying its position.
     * All dimensions and offsets are in pixels or string percentages (eg. '10%'), relative to the top-left of the softphone view.
     * For example, specify <code>setFullScreenButton({'left' : -64, 'top' : -64});</code> to show the full-screen button offset 64 pixels from the bottom-right corner of the softphone in each axis.
     * @param {Boolean|Object} [fullScreenButton] If the value is equal to boolean false, the full-screen button will not be displayed. Otherwise, it will be shown at the offset indicated by the specified object's 'left' and 'top' members.
     */
    setFullScreenButton : function(fullScreenButton) {
        if (fullScreenButton === false) {
            this.phoneView.fullScreenButton = null;
        } else {
            this.phoneView.fullScreenButton = {};
            this.populateDefaults(fullScreenButton, this.phoneView.fullScreenButton, {'left' : -64, 'top' : -64});
        }
        
        this.phoneViewUpdated();
    },
    
    /**
     * Sets whether the local video preview will be visible during video calls.
     * @param [visible] If the value is equal to boolean true or undefined, the local video preview will be shown. Otherwise, it will be hidden.
     */
    setInCallLocalVideoVisible : function(visible) {
        this.phoneView.inCallLocalVideoVisible = (typeof visible === 'undefined') || (visible === true);
        
        this.phoneViewUpdated();
    },
    
    /**
     * Configure the softphone UI by specifying rectangles for the local and remote video views.
     * All dimensions and offsets are in pixels or string percentages (eg. '10%'), relative to the top-left of the softphone view.
     * To specify an offset from the right/bottom of the softphone view, provide negative left/top values.
     * For example, specify
     *   <code>setVideoLayout({'left' : '5%', 'top' : '85%', 'width' : 100, 'height' : 100, OMPhoneManager.ViewMode.CROP}, {'left' : 100, 'top' : 100, 'right' : 100, 'bottom' : 100, 'mode' : OMPhoneManager.ViewMode.LETTERBOX});</code>
     * to show the local video 85% of the way down the canvas and 5% of the way from the left of the canvas, at the correct aspect ratio but cropped to fit in a rectangle that is 100 by 100 pixels, and the remote video letterboxed, filling the canvas with 100 pixels' margin at each edge.
     * @param {Object} [localVideo] The rectangle occupied by the local video preview on video calls will be set to the rectangle described by the specified object's 'left', 'top', 'width' and 'height' members.
     *                              Alternatively, specify 'right' and 'bottom' instead of 'width' and 'height'.
     *                              The mode used to display video within the rectangle can be specified as a 'mode' member, taking a value from OMPhoneManager.ViewMode.
     * @param {Object} [remoteVideo] The rectangle occupied by the remote video on video calls will be set to the rectangle described by the specified object's 'left', 'top', 'width' and 'height' members.
     *                               Alternatively, specify 'right' and 'bottom' instead of 'width' and 'height'.
     *                               The mode used to display video within the rectangle can be specified as a 'mode' member, taking a value from OMPhoneManager.ViewMode.
     */
    setVideoLayout : function(localVideo, remoteVideo) {
        this.phoneView.localVideo = {};
        this.phoneView.remoteVideo = {};
        
        var defaultLocal = {'left' : '5%', 'top' : '85%', 'width' : '10%', 'height' : '10%', 'right' : null, 'bottom' : null, 'mode' : OMPhoneManager.ViewMode.LETTERBOX};
        if (typeof localVideo !== 'undefined' && 'right' in localVideo) {
            delete defaultLocal['right'];
        }
        if (typeof localVideo !== 'undefined' && 'bottom' in localVideo) {
            delete defaultLocal['height'];
        }
        this.populateDefaults(localVideo, this.phoneView.localVideo, defaultLocal);
        
        var defaultRemote = {'left' : 0, 'top' : 0, 'width' : null, 'height' : null, 'right' : '100%', 'bottom' : '100%', 'mode' : OMPhoneManager.ViewMode.LETTERBOX};
        if (typeof remoteVideo !== 'undefined' && 'width' in remoteVideo) {
            delete defaultRemote['right'];
        }
        if (typeof remoteVideo !== 'undefined' && 'height' in remoteVideo) {
            delete defaultRemote['bottom'];
        }
        this.populateDefaults(remoteVideo, this.phoneView.remoteVideo, defaultRemote);

        this.phoneViewUpdated();
    },
    
    /**
     * Set a prefix for resource file URLs.
     * @param {String} [prefix] The specified string will be prepended to resource file names. The default is 'openmarket-softphone/resources/'.
     */
    setResourcePrefix : function(prefix) {
        if (typeof prefix === 'undefined') {
            prefix = 'openmarket-softphone/resources/';
        }
        
        // Make sure it ends with '/'.
        if (prefix.length > 0 && prefix.substring(prefix.length - 1) !== '/') {
            prefix += '/';
        }
        
        this.phoneView.resourcePrefix = prefix;
        this.phoneViewUpdated();
    },
    
    /**
     * Set whether sound effects (ringing, ringback and hung-up tones) are enabled or disabled.
     * @param {Boolean} [isSoundEnabled] Whether to play telephone sound effects. Defaults to true.
     */
    setSoundsEnabled : function(isSoundEnabled) {
        this.phoneView.sounds = (typeof isSoundEnabled === 'undefined' || isSoundEnabled === true);

        this.phoneViewUpdated();
    },
    
    /**
     * Set whether to use experimental hardware-accelerated video decoding support.
     * This method should not be called before the softphone is logged in.
     * Please note that this will disable support for compensating for the peer's device rotation.
     * Please note that this functionality is experimental and the API is likely to change or be removed in a later version.
     * @param {Boolean} [hardwareAccelerationEnabled] Whether to use experimental hardware-accelerated video decoding support. Defaults to true.
     */
    setHardwareAccelerationEnabled : function(hardwareAccelerationEnabled) {
        if (this.loginState !== OMPhoneManager.LoginState.LOGGED_IN) {
            OMLogger.error('Tried to set hardware acceleration when the user was not logged in.');
            return;
        }
        
        this.backend.setHardwareAccelerationEnabled(typeof hardwareAccelerationEnabled === 'undefined' || hardwareAccelerationEnabled);
    },
    
    /**
     * Get whether the softphone is using experimental hardware-accelerated video decoding support.
     * This method should not be called before the softphone is logged in.
     * Please note that this functionality is experimental and the API is likely to change or be removed in a later version.
     * @returns {Boolean} Whether hardware acceleration is in use.
     */
    getHardwareAccelerationEnabled : function() {
        return this.backend.getHardwareAccelerationEnabled();
    },
    
    /**
     * Request capturing video at the specified resolution (experimental).
     * The method should not be called before the softphone is logged in.
     * @param {Int} width The requested width for captured video in pixels.
     * @param {Int} height The requested height for captured video in pixels.
     */
    setRequestedCaptureResolution : function(width, height) {
        if (typeof width === 'undefined' || typeof height === 'undefined') {
            OMLogger.warn('Please specify a requested width and height for video when calling setRequestedCaptureResolution.');
            return;
        }
        
        this.backend.setRequestedCaptureResolution(width, height);
    },
    
    /**
     * Set whether local device orientation detection is enabled or disabled.
     * If this method is never called, local device orientation detection will never be enabled.
     * @param {Boolean} [isLocalDeviceOrientationEnabled] Whether to handle local device orientation. Defaults to true.
     */
    setLocalDeviceOrientationEnabled : function (isLocalDeviceOrientationEnabled) {
        this.phoneView.localDeviceOrientation = (typeof isLocalDeviceOrientationEnabled === 'undefined' || isLocalDeviceOrientationEnabled);
        
        this.phoneViewUpdated();
    },
    
    /**
     * Override the default behaviour that hides the softphone by providing a function to be invoked when the phone should be hidden.
     * @param {Function} hidePhoneFunction A function taking an element.
     *                   Example: The default implementation is function(container) { container.offset({'left' : -2000}); }
     */
    setHidePhoneFunction : function(hidePhoneFunction) {
        this.phoneView.hideSoftphoneFunction = hidePhoneFunction;
        
        this.phoneViewUpdated();
    },
    
    /**
     * Override the default behaviour that shows the softphone by providing a function to be invoked when the phone should be shown.
     * @param {Function} showPhoneFunction A function taking an element, suggested top offset in pixels, suggested left offset in pixels, and the width and height of the softphone in pixels.
     *                   Example: The default implementation is function(container, left, top, width, height) { container.width(width); container.height(height); container.offset({'left' : left, 'top' : top}); }
     */
    setShowPhoneFunction : function(showPhoneFunction) {
        this.phoneView.showSoftphoneFunction = showPhoneFunction;
        
        this.phoneViewUpdated();
    },
    
    /** @private */
    phoneView : null,
    
    /**
     * Show the local view preview, filling the softphone canvas.
     * Please note that this method will try to acquire media permissions if the media devices are currently muted.
     */
    showLocalVideoPreview : function() {
        this.backendLoading.done(function() {
            this.backend.showLocalVideoPreview();
        });
    },
    
    /**
     * Hide the local video preview, and hide the softphone.
     * Please note that this method mutes media devices, so media permissions will have to be reacquired next time the devices are unmuted.
     */
    hideLocalVideoPreview : function() {
        this.backendLoading.done(function() {
            this.backend.hideLocalVideoPreview();
        });
    },
    
    /**
     * Gets an array of OMCamera instances representing the video sources available on this device.
     * Please note that this method will return undefined until a login has succeeded.
     */
    getCameras : function() {
        if (typeof this.cameras === 'undefined') {
            OMLogger.warn('getCameras called before media enumeration.');
        }
        
        return this.cameras;
    },
    
    /**
     * Gets an array of OMMicrophone instances representing the audio sources available on this device.
     * Please note that this method will return undefined until a login has succeeded.
     */
    getMicrophones : function() {
        if (typeof this.microphones === 'undefined') {
            OMLogger.warn('getMicrophones called before media enumeration.');
        }

        return this.microphones;
    },
    
    /**
     * Gets the OMCamera instance representing the video source that will currently be used on this device.
     * Please note that this method will return undefined until a login has succeeded.
     */
    getSelectedCamera : function() {
        if (typeof this.cameras === 'undefined') {
            OMLogger.warn('getSelectedCamera called before media enumeration.');
            return undefined;
        }
        
        for (var i = 0; i < this.cameras.length; i++) {
            if (this.cameras[i].getIsSelected()) {
                return this.cameras[i];
            }
        }
        
        OMLogger.warn('No camera was selected.');
        
        return this.cameras[0];
    },
    
    /**
     * Gets the OMMicrophone instance representing the audio source that will currently be used on this device.
     * Please note that this method will return undefined until a login has succeeded.
     */
    getSelectedMicrophone : function() {
        if (typeof this.microphones === 'undefined') {
            OMLogger.warn('getSelectedMicrophone called before media enumeration.');
            return undefined;
        }
        
        for (var i = 0; i < this.microphones.length; i++) {
            if (this.microphones[i].getIsSelected()) {
                return this.microphones[i];
            }
        }
        
        OMLogger.warn('No microphone was selected.');
        
        return this.microphones[0];
    },
    
    /**
     * @description Log into the OpenMarket Telephony Gateway with the specified credentials, sending events to the specified listener.
     * @param {OMCredentials} credentials Credentials for logging into the OpenMarket Telephony Gateway.
     * @param {OMPhoneLoginListener} listener An object which will receive events pertaining to logging in.
     * @param {OMPhoneCallListener} listener An object which will receive events pertaining to calls.
     */
    login : function(credentials, phoneLoginListener, phoneCallListener) {
        this.backendLoading.done(function() {
            OMLogger.info('Logging in (softphone SDK version ' + OMSoftphoneSDKVersion + ')');
            // Default the phone element if it was never set.
            if (!this.phoneView.haveContainer.isResolved()) {
                OMLogger.info('Using default softphone embedding.');
                this.setPhoneElement();
            }
        
            this.currentCredentials = credentials;
            this.setListeners(phoneLoginListener, phoneCallListener);

            this.loginState = OMPhoneManager.LoginState.LOGGING_IN;
            this.backend.login(this.currentCredentials);
        });
    },
    
    /**
     * @description Logs this softphone out.
     */
    logout : function() {
        if (this.loginState !== OMPhoneManager.LoginState.LOGGED_IN) {
            OMLogger.error('Attempted to log out while not logged in.');
            return;
        }
        
        this.backend.logout();
        this.loginState = OMPhoneManager.LoginState.LOGGED_OUT;
        this.credentials = null;
    },
    
    /**
     * @description places a voice or video call to the specified user, notifying the specified listener with events.
     * @param {OMUser|OMUser[]} toCall The user to call.
     * @param {OMPhoneCall.CallType} type The type of call (voice/video).
     * @param {OMPhoneCallListener} listener An object which will receive events pertaining to this call.
     * @returns {OMPhoneCall} The phone call that was just placed.
     */
    placeCall : function(toCall, type) {
        if (this.loginState !== OMPhoneManager.LoginState.LOGGED_IN) {
            OMLogger.error('Attempted to place a call when not logged in.');
            return;
        }
        
        if (this.currentCall !== null) {
            this.currentCall.end();
        }
        
        this.currentCall = new OMPhoneCall(this, this.backend, toCall, this.callListener);
        this.currentCall.type = type;

        // Construct an array of AoRs to call.
        var aorsToCall = new Array();
        if (toCall instanceof OMUser) {
            this.currentCall.peer = toCall;
            aorsToCall.push(toCall.getSipAor());
        } else if (toCall instanceof Array) {
            this.currentCall.peer = toCall[0];
            for (var i = 0; i < toCall.length; i++) {
                aorsToCall.push(toCall[i].getSipAor());
            }
        } else {
            OMLogger.error('Invalid type for toCall parameter. placeCall requires an instance of OMUser or Array of OMUsers.');
            return undefined;
        }
        
        this.backend.placeCall(aorsToCall, type);
        
        return this.currentCall;
    },
    
    /**
     * Set the listeners for events pertaining to this phone manager and calls.
     * @param {OMPhoneLoginListener} phoneLoginListener An object implementing the events in OMPhoneLoginListener.
     * @param {OMPhoneCallListener} phoneCallListener An object implementing the events in OMPhoneCallListener.
     */
    setListeners : function(phoneLoginListener, phoneCallListener) {
        this.loginListener = OMUtils.getListener(new OMPhoneLoginListener(), phoneLoginListener);
        this.callListener = OMUtils.getListener(new OMPhoneCallListener(), phoneCallListener);
    },
    
    // Internal event handlers:
    /** @private */
    onIncomingCall : function (userName, displayName, receiveVideo, sendVideo) {
        // TODO: Handle generic SIP AoRs properly.
        var peer = new OMUser(userName, displayName), 
            incomingCall = new OMPhoneCall(this, this.backend, peer, this.callListener);
        incomingCall.peer = peer;
        incomingCall.type = (receiveVideo || sendVideo) ? OMPhoneCall.CallType.VIDEO : OMPhoneCall.CallType.VOICE;
        incomingCall.remoteReceiveVideo = receiveVideo;
        incomingCall.remoteSendVideo = sendVideo;
        
        this.currentCall = incomingCall;
        this.currentCall.onLocalRinging(this.currentCall);
    },
    
    /** @private */
    onLoggedIn : function () {
        this.loginState = OMPhoneManager.LoginState.LOGGED_IN;
        this.loginListener.onLoginSuccess();
    },
    
    /** @private */
    onLoginError : function(error, message) {
        this.loginState = OMPhoneManager.LoginState.LOGGED_OUT;
        this.loginListener.onLoginError(error, message);
    }
};

/**
 * @static
 * @class
 * Specifies a mode of scaling, cropping and positioning video to show it in a fixed rectangle.
 * @name ViewMode
 * @member OMPhoneManager
 */
OMPhoneManager.ViewMode = {
    /**
     * The video will be stretched/shrunk to match its container, even if the aspect ratios are different.
     * @member OMPhoneManager.ViewMode
     */
    STRETCH : 'STRETCH',
    /**
     * The video will be resized to fit its container whilst retaining its aspect ratio. It will be cropped to the bounds of its container.
     * @member OMPhoneManager.ViewMode
     */
    CROP : 'CROP',
    /**
     * The video will be resized to fit its container whilst retaining its aspect ratio. It may overflow the bounds of its container.
     * @member OMPhoneManager.ViewMode
     */
    OVERFLOW : 'OVERFLOW',
    /**
     * The input video will be shown within its container. The video will always be shown at the correct aspect ratio, which may require letter-boxing.
     * @member OMPhoneManager.ViewMode
     */
    LETTERBOX : 'LETTERBOX',
};

/**
 * @static
 * @class
 * The current login status of the softphone.
 * @name LoginState
 * @member OMPhoneManager
 */
OMPhoneManager.LoginState = {
    /** The softphone is logged out.
     * @member OMPhoneManager.LoginState
     */
    LOGGED_OUT : 'LOGGED_OUT',
    /** The softphone is logging in.
     * @member OMPhoneManager.LoginState
     */
    LOGGING_IN : 'LOGGING_IN',
    /** The softphone is logged in.
     * @member OMPhoneManager.LoginState
     */
    LOGGED_IN : 'LOGGED_IN'
};

/**
 * @static
 * @class
 * Login error types.
 * @name LoginError
 * @member OMPhoneManager
 */
OMPhoneManager.LoginError = {
    /** An unknown error occurred.
     * @member OMPhoneManager.LoginError
     */
    UNKNOWN : 'UNKNOWN',
    /** The provided password was invalid.
     * @member OMPhoneManager.LoginError
     */
    INVALID_PASSWORD_PROVIDED : 'INVALID_PASSWORD_PROVIDED',
    /** No connection to the OpenMarket Telephony Gateway could be established.
     * @member OMPhoneManager.LoginError
     */
    CONNECTION_ERROR : 'CONNECTION_ERROR',
    /** A non-fatal error occurred while trying to connect to the OpenMarket Telephony Gateway.
     * @member OMPhoneManager.LoginError
     */
    CONNECTION_WARNING : 'CONNECTION_WARNING',
    /** A local error prevented logging in to the OpenMarket Telephony Gateway.
     * @member OMPhoneManager.LoginError
     */
    LOCAL_ERROR : 'LOCAL_ERROR'
};

/**
 * @static
 * @class
 * Represents types of call errors.
 * @name CallErrorCode
 * @member OMPhoneCall
 */
OMPhoneCall.CallErrorCode = {
    /** An unspecified general error occurred.
     * @member OMPhoneCall.CallErrorCode
     */
    GENERAL_FAILURE : 'GENERAL_FAILURE'
};
    
/**
 * @static
 * @class
 * Types of call.
 * @name CallType
 * @member OMPhoneCall
 */
OMPhoneCall.CallType = {
    /** The call only has voice.
     * @member OMPhoneCall.CallType
     */
    VOICE : 'VOICE',
    /** The call has both voice and video.
     * @member OMPhoneCall.CallType
     */
    VIDEO : 'VIDEO'
};

/**
 * @static
 * @class
 * Represents which camera (front/back of device) is capturing video.
 * @name CameraType
 * @member OMPhoneCall
 */
OMPhoneCall.CameraType = {
    /** The camera is on the front of the device and faces the user.
     * @member OMPhoneCall.CameraType
     */
    FRONT_FACING : 'FRONT_FACING',
    /** The camera is on the back of the device and faces away from the user.
     * @member OMPhoneCall.CameraType
     */
    REAR_FACING : 'REAR_FACING'
};

/**
 * @static
 * @class
 * How best to rotate the video when displaying it.
 * @name CameraOrientation
 * @member OMPhoneCall
 */
OMPhoneCall.CameraOrientation = {
    /** The video is best viewed unchanged
     * @member OMPhoneCall.CameraOrientation
     */
    LANDSCAPE_UP : 'ORI_LANDSCAPE_UP',
    /** The video is best viewed rotated clockwise by 90 degrees.
     * @member OMPhoneCall.CameraOrientation
     */
    PORTRAIT_LEFT : 'ORI_PORTRAIT_LEFT',
    /** The video is best viewed rotated clockwise by 180 degrees.
     * @member OMPhoneCall.CameraOrientation
     */
    LANDSCAPE_DOWN : 'ORI_LANDSCAPE_DOWN',
    /** The video is best viewed rotated clockwise by 270 degrees.
     * @member OMPhoneCall.CameraOrientation
     */
    PORTRAIT_RIGHT : 'ORI_PORTRAIT_RIGHT',
    /** No orientation is known to be better than any other.
     * @member OMPhoneCall.CameraOrientation
     */
    UNKNOWN : 'ORI_UNKNOWN'
};

/**
 * @static
 * @class
 * Represents the reason a call terminated.
 * @name CallEndReason
 * @member OMPhoneCall
 */
OMPhoneCall.CallEndReason = {
    /** The remote phone is busy.
     * @member OMPhoneCall.CallEndReason
     */
    REMOTE_BUSY : 'REMOTE_BUSY',
    /** The remote user is unavailable.
     * @member OMPhoneCall.CallEndReason
     */
    REMOTE_UNAVAILABLE : 'REMOTE_UNAVAILABLE',
    /** The remote user rejected the call.
     * @member OMPhoneCall.CallEndReason
     */
    REMOTE_REJECTED : 'REMOTE_REJECTED',
    /** The remote user hung up the call.
     * @member OMPhoneCall.CallEndReason
     */
    REMOTE_HUNGUP : 'REMOTE_HUNGUP',
    /** The incoming call was answered by another phone.
     * Not yet implemented for the Web SDK.
     * @member OMPhoneCall.CallEndReason
     */
    ANSWERED_ELSEWHERE : 'ANSWERED_ELSEWHERE'
};

/**
 * Create a user with the given username and display name.
 * @class Represents a telephony user.
 * @param {String} username Identifies the user within the OpenMarket Telephony Gateway.
 * @param {String} [displayName] Display name for the user.
 * @param {String} [aor] An optional SIP AoR for this user. 
 *                       If omitted, the user is identified based on their SDK account. 
 *                       Otherwise, this indicates that the user represents a generic SIP AoR.
 * @constructor
 * @this {OMUser}
 */
var OMUser = function(username, displayName, aor) {
    this.username = username;
    this.displayName = (typeof displayName === 'undefined' ? username : displayName);
    this.sipAor = (typeof aor === 'undefined' ? null : aor);
};

OMUser.prototype = {
    /** @private */
    toString : function() {
        // Override toString so that equality comparisons check only userNames.
        return this.userName;
    },
        
    /**
     * @returns {String} Get a text description of this user.
     */
    getDescription : function() {
        return '<User: ' + this.displayName + ' (' + this.username + ')>';
    },
    
    /**
     * @returns {String} Get a SIP Address of Record for this user.
     */
    getSipAor : function() {
        if (this.sipAor !== null) {
            return this.sipAor;
        } else {
            var pm = new OMPhoneManager();
            if (pm.currentCredentials !== null) {
                return 'sip:' + this.username + '@' + (new OMPhoneManager()).currentCredentials.getSipDomain();
            } else {
                OMLogger.warn('Tried to get a SIP AoR before logging in.');
                return null;
            }
        }
    }
};

/**
 * Create credentials for a user, in an SDK account, with a password.
 * @class Stores credentials to login to the OpenMarket Telephony Gateway.
 * @param {OMUser} user The user to login as.
 * @param {String} sdkAccountName The SDK account name to authenticate in.
 * @param {String} password The password to authenticate the user.
 * @param {String} [instanceId] A unique identifier for the instance of the application that is being logged in.
 * @param {String} [userAgent] The user agent string to be associated with this session.
 * @param {String} [sipDomain] The SIP domain for users. If omitted, the SDK domain will be used.
 * @constructor
 * @this {OMCredentials}
 */
var OMCredentials = function(user, sdkAccountName, password, instanceId, userAgent, sipDomain) {
    this.user = user;
    this.sdkAccountName = sdkAccountName;
    this.password = password;
    this.userAgent = typeof userAgent === 'undefined' ? 'OMSoftphoneSDK/Web' : userAgent;
    this.instanceId = typeof instanceId === 'undefined' ? 'Undefined' : instanceId;
    this.sipDomain = typeof sipDomain === 'undefined' ? null : sipDomain;
    
    // We always append the version to the user agent.
    this.userAgent += ' (' + OMSoftphoneSDKVersion + ')';
};

OMCredentials.prototype = {
    getSipDomain : function() {
        if (this.sipDomain !== null) {
            return this.sipDomain;
        } else {
            return this.sdkAccountName + '.sip.softphonesdk.openmarket.com:443';
        }
    }
};
