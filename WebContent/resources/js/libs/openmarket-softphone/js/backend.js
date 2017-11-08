/** 
 * @fileOverview OpenMarket Softphone SDK for web applications (backend)<br />
 * Copyright 2012 OpenMarket Limited<br />
 * Evaluation SDK -- all materials STRICTLY CONFIDENTIAL AND PROPRIETARY<br />
 * $Id: backend.js 157 2012-07-22 14:25:31Z andreyf $
 */

var OMUtils = {
    yieldThenExecute : function(context, fn) {
        var args = arguments, self = context;
        
        // TODO: Find a nicer way to yield the event loop to Flash.
        window.setTimeout(function() {
            fn.call(self, args);
        }, 50);
    },
    
    getListener : function(defaultHandlers, handlers) {
        // Copy methods from defaultHandlers.
        for (var methodName in defaultHandlers) {
            if (!(methodName in handlers)) {
                if (defaultHandlers[methodName] === null) {
                    OMLogger.error('No implementation was supplied for event ' + methodName);
                } else {
                    handlers[methodName] = defaultHandlers[methodName];
                }
            }
        }
    
        return handlers;
    }
};

var OMSoftphoneBackend = function(phoneManager, loaderPath) {
    this.phoneManager = phoneManager;
    this.flashBackend = null;
    this.flashBackendDeferred = new jQuery.Deferred();
    
    // Store the call's state so we know what to do when the application calls 'end'.
    this.outgoingRinging = false;
    this.incomingRinging = true;
    this.inCall = false;
    
    // Load and initialise the backend.
    if (typeof OMSoftphoneBackendFlash === 'undefined') {
        $.ajax({
            url : loaderPath + 'backend-flash.js', 
            dataType : 'script', 
            context : this, 
            cache : false
        }).done(function() {
            this.setupBackend(loaderPath);
        }).fail(function() {
            OMLogger.error('Unable to load Flash backend.');
            this.phoneManager.onLoginError(OMPhoneManager.LoginError.LOCAL_ERROR, 'Unable to load the Flash softphone backend.');
        });
    } else {
        this.setupBackend(loaderPath);
    }
    
    this.soundUrls = {
        RINGING : 'ring.mp3',
        HUNG_UP : 'hungup.mp3',
        RING_BACK : 'ringback.mp3',
        ALERTING : 'alerting.mp3'
    };
};

OMSoftphoneBackend.prototype = {
    // Initialisation:
    setupBackend : function(loaderPath) {
        this.flashBackend = new OMSoftphoneBackendFlash(this, loaderPath);
        
        // Pass through phone view updates to the backend.
        var self = this;
        this.phoneManager.phoneViewUpdated = function() {
            if (self.phoneManager.phoneView.localDeviceOrientation === true) {
                // Handle local device orientation.
                if (window.DeviceOrientationEvent && typeof this.deviceOrientationEventListener === 'undefined') {
                    this.deviceOrientationEventListener = function(event) {
                        if (self.phoneManager.currentCall != null) {
                            var angle = Math.round(event.gamma / 90) * 90;
                            if (angle < 0) {
                                angle += 360;
                            }
            
                            var orientation = OMPhoneCall.CameraOrientation.UNKNOWN;
                            if (angle == 0) {
                                orientation = OMPhoneCall.CameraOrientation.LANDSCAPE_UP;
                            } else if (angle == 90) {
                                orientation = OMPhoneCall.CameraOrientation.PORTRAIT_RIGHT;
                            } else if (angle == 180) {
                                orientation = OMPhoneCall.CameraOrientation.LANDSCAPE_DOWN;
                            } else if (angle == 270) {
                                orientation = OMPhoneCall.CameraOrientation.PORTRAIT_LEFT;
                            }
            
                            self.phoneManager.currentCall.setDeviceOrientation(orientation);
                        }
                    };
                    
                    window.addEventListener('deviceorientation', this.deviceOrientationEventListener);
                } else if (typeof this.deviceOrientationEventListener === 'undefined') {
                    OMLogger.warn('Local device orientation is unavailable on this device.');
                }
            } else if (typeof this.deviceOrientationListener !== 'undefined') {
                window.removeEventListener('deviceorientation', this.deviceOrientationEventListener);
            }

            self.flashBackend.phoneViewUpdated(self.phoneManager.phoneView);
        };
        
        // When we get a phone view, initialise Flash.
        this.phoneManager.phoneView.haveContainer.done(function() {
            var flashElement = this.phoneManager.phoneView.softphoneContainer, 
              flashElementId = 'omSoftphoneBackendFlashContainer';
            
            if (flashElement.attr('id') != flashElementId) {
                if ($('#' + flashElementId).length > 0) {
                    OMLogger.warn('One or more existing, different elements have the flashElementId. They will be removed.')
                    $('#' + flashElementId).empty();
                    $('#' + flashElementId).remove();
                    
                    // Restore the backed up identifier.
                    //if ($('#' + flashElementId).data('idBeforeFlash') !== undefined) {
                    //    $('#' + flashElementId).attr('id', $('#' + flashElementId).data('oldId'));
                    //}
                    //if (window._omRestorePreFlashId) {
                    //    $('#' + flashElementId).attr('id', window._omRestorePreFlashId);
                    //}
                }
                
                // Store the old identifier in case we want to restore it.
                //flashElement.data('idBeforeFlash', flashElement.attr('id'));
                window._omRestorePreFlashId = flashElement.attr('id');
                OMLogger.warn('The supplied softphone container\'s ID will be set to \'' + flashElementId + '\'.');
                flashElement.attr('id', flashElementId);
            }
            
            this.flashInitialisation = this.flashBackend.initialise(flashElement);
            this.flashBackendDeferred.resolveWith(this);
            
            // Make sure the phone view update gets handled after Flash is initialised.
            this.flashInitialisation.done(function() {
                self.phoneManager.phoneViewUpdated();
            });
        });
    },
    
    // Utility function to invoke a method on every media listener.
    invokeOnAllMediaListeners : function(f, onlySelected) {
        onlySelected = typeof onlySelected === 'undefined' ? false : onlySelected;
        
        for (var i = 0; i < this.phoneManager.cameras.length; i++) {
            if (onlySelected !== true || this.phoneManager.cameras[i].getIsSelected()) {
                f(this.phoneManager.cameras[i].listener);
            }
        }
            
        for (var i = 0; i < this.phoneManager.microphones.length; i++) {
            if (onlySelected !== true || this.phoneManager.microphones[i].getIsSelected()) {
                f(this.phoneManager.microphones[i].listener);
            }
        }
    },
    
    // Non-telephony methods:
    getAcquireCaptureDevicesDeferred : function(requireCamera) {
        var self = this,
            acquireCaptureDevices = new jQuery.Deferred(),
            unmuted = this.flashBackend.getUnmutedDeferred(),
            dialogShown = this.flashBackend.getPermissionsShownDeferred(),
            dialogHidden = this.flashBackend.getPermissionsHiddenDeferred();
        
        // The permissions dialog was shown:
        dialogShown.done(function() {
            self.invokeOnAllMediaListeners(function(listener) {
                listener.onPermissionDialogShown();
            }, true);
        });
        
        // For the case when the dialog was shown:
        dialogHidden.done(function() {
            self.invokeOnAllMediaListeners(function(listener) {
                listener.onPermissionDialogClosed();
            }, true);
            
            if (unmuted.isResolved()) {
                acquireCaptureDevices.resolveWith(self);
            } else {
                acquireCaptureDevices.rejectWith(self);
                self.invokeOnAllMediaListeners(function(listener) {
                    listener.onPermissionDenied();
                }, true);
            }
        });
        
        // For the case when the dialog was not shown but media unmuted immediately.
        unmuted.done(function() {
            if (!dialogShown.isResolved()) {
                // The dialog was never shown, but we have access to the capture devices.
                acquireCaptureDevices.resolveWith(self);
            }

            self.invokeOnAllMediaListeners(function(listener) {
                listener.onAvailable();
            }, true);
        });
        
        // Trigger showing the dialog.
        this.flashBackend.initialiseMedia(true, requireCamera);
        
        return acquireCaptureDevices;
    },
    
    getCallType : function() {
        return this.callType;
    },
    
    showLocalVideoPreview : function() {
        this.getAcquireCaptureDevicesDeferred(true).done(function() {
            this.flashBackend.showLocalVideoPreview();
        }).fail(function() {
            OMLogger.warn('Unable to acquire capture devices for local preview.');
            this.flashBackend.hideLocalVideoPreview();
        });
    },
    
    hideLocalVideoPreview : function() {
        this.flashBackend.hideLocalVideoPreview();
    },
    
    reenumerateMediaDevices : function() {
        var cameras = this.flashBackend.getCameras();
        var microphones = this.flashBackend.getMicrophones();
        var defaultCameraIndex = this.flashBackend.getDefaultCamera();
        var defaultMicrophoneIndex = this.flashBackend.getDefaultMicrophone();
        
        // Update the phone manager's cameras and microphones arrays.
        var newCameras = []
        var newMicrophones = [];
        
        for (var i = 0; i < cameras.length; i++) {
            var isSelected = cameras[i].selected;
            var isDefault = (i == defaultCameraIndex);
            var thisCamera = new OMCamera(this, cameras[i].device, isSelected, isDefault);
            
            if (typeof this.phoneManager.cameras !== 'undefined') {
                // Update the old one instead of making a new one.
                for (var j = 0; j < this.phoneManager.cameras.length; j++) {
                    if (this.phoneManager.cameras[j].name === cameras[i].device) {
                        thisCamera = this.phoneManager.cameras[j];
                        thisCamera.isSelected = isSelected;
                        thisCamera.isDefault = isDefault;
                    }
                }
            }
            
            newCameras.push(thisCamera);
        }
        
        for (var i = 0; i < microphones.length; i++) {
            var isSelected = microphones[i].selected;
            var isDefault = (i == defaultMicrophoneIndex);
            var thisMicrophone = new OMMicrophone(this, microphones[i].device, isSelected, isDefault);
            
            if (typeof this.phoneManager.microphones !== 'undefined') {
                // Update the old one instead of making a new one.
                for (var j = 0; j < this.phoneManager.microphones.length; j++) {
                    if (this.phoneManager.microphones[j].name === microphones[i].device) {
                        thisMicrophone = this.phoneManager.microphones[j];
                        thisMicrophone.isSelected = isSelected;
                        thisMicrophone.isDefault = isDefault;
                    }
                }
            }
            
            newMicrophones.push(thisMicrophone);
        }
        
        this.phoneManager.cameras = newCameras;
        this.phoneManager.microphones = newMicrophones;
    },
    
    selectCamera : function(name) {
        // TODO: Put selectCamera and selectMicrophone together.
        this.flashBackend.selectCamera(name);
        
        // Update our local arrays temporarily.
        for (var i = 0; i < this.phoneManager.cameras.length; i++) {
            if (this.phoneManager.cameras[i].device === name) {
                this.phoneManager.cameras[i].isSelected = true;
            } else {
                this.phoneManager.cameras[i].isSelected = false;
            }
        }
        
        this.reenumerateMediaDevices();
    },
    
    selectMicrophone : function(name) {
        this.flashBackend.selectMicrophone(name);
        
        // Update our local arrays temporarily.
        for (var i = 0; i < this.phoneManager.microphones.length; i++) {
            if (this.phoneManager.microphones[i].device === name) {
                this.phoneManager.microphones[i].isSelected = true;
            } else {
                this.phoneManager.microphones[i].isSelected = false;
            }
        }
        
        this.reenumerateMediaDevices();
    },
    
    // Telephony methods invoked from the app and their corresponding result methods:
    login : function(credentials) {
        var self = this;
        
        this.flashBackendDeferred.done(function() {
            var flashBackend = this.flashBackend;
            this.flashInitialisation.done(function() {
                OMUtils.yieldThenExecute(this, function() {
                    self.reenumerateMediaDevices();
                    
                    flashBackend.login(credentials);
                });
            });
        });
    },
    
    loginResult : function() {
        this.phoneManager.onLoggedIn();
    },
    
    logout : function() {
        this.flashBackend.logout();
    },
    
    placeCall : function(aors, type) {
        this.getAcquireCaptureDevicesDeferred(type == OMPhoneCall.CallType.VIDEO).done(function() {
            this.outgoingRinging = true;
            this.incomingRinging = false;
            this.inCall = false;
            
            var localReceiveVideo = (type == OMPhoneCall.CallType.VIDEO);
            var localSendVideo = (type == OMPhoneCall.CallType.VIDEO) && this.flashBackend.getCanCaptureVideo();
            this.callType = type;
            this.flashBackend.placeCall(aors, localReceiveVideo, localSendVideo);
        }).fail(function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onLocalEnded();
            }
        });
    },
    
    end : function() {
        if (this.outgoingRinging) {
            this.cancel();
        } else if (this.incomingRinging) {
            this.reject();
        } else if (this.inCall) {
            this.hangUp();
        } else {
            OMLogger.warn('Unable to end call. Its state was unknown.');
        }
    },
    
    cancel : function() {
        this.flashBackend.stopSound();
        OMUtils.yieldThenExecute(this, function() {
            this.flashBackend.cancel();
        });
    },
    
    cancelResult : function() {
        
    },
    
    accept : function() {
        this.flashBackend.stopSound();
        OMUtils.yieldThenExecute(this, function() {
            this.flashBackend.accept()
        });
    },
    
    acceptResult : function() {
        this.outgoingRinging = false;
        this.incomingRinging = false;
        this.inCall = true;
    },
    
    reject : function() {
        this.flashBackend.stopSound();
        OMUtils.yieldThenExecute(this, function() {
            this.flashBackend.reject();
        });
    },
    
    rejectResult : function() {
        
    },
    
    hangUp : function() {
        this.flashBackend.hangUp();
    },
    
    hangUpResult : function() {
        if (this.phoneManager.currentCall !== null) {
            this.phoneManager.currentCall.onLocalEnded();
        }
    },
    
    setReceiveVideoRotation : function(angleDegrees) {
        this.flashBackend.setReceiveVideoRotation(angleDegrees);
    },
    
    setSendVideoRotation : function(angleDegrees) {
        this.flashBackend.setSendVideoRotation(angleDegrees);
    },
    
    setHardwareAccelerationEnabled : function(hardwareAccelerationEnabled) {
        this.flashBackend.setHardwareAccelerationEnabled(hardwareAccelerationEnabled);
    },
    
    getHardwareAccelerationEnabled : function() {
        return this.flashBackend.getHardwareAccelerationEnabled();
    },
    
    setRequestedCaptureResolution : function(width, height) {
        return this.flashBackend.setRequestedCaptureResolution(width, height);
    },
    
    // Events raised by the Flash backend:
    onAllLoginEndpointsFailed : function() {
        this.phoneManager.onLoginError(OMPhoneManager.LoginError.CONNECTION_ERROR, 'Unable to connect.');
    },
    
    onSwitchLoginEndpoints : function() {
        this.phoneManager.onLoginError(OMPhoneManager.LoginError.CONNECTION_WARNING, 'Retrying with an alternative endpoint &hellip;')
    },
    
    onLoginFail : function(error, message) {
        if (this.phoneManager.currentCall !== null) {
            this.phoneManager.currentCall.onFailed(OMPhoneCall.CallErrorCode.GENERAL_FAILURE, "Lost connection.");
        }
        
        this.phoneManager.onLoginError(error, message);
    },
    
    onIncomingCall : function(userName, displayName, callId, receiveVideo, sendVideo) {
        this.outgoingRinging = false;
        this.incomingRinging = true;
        this.inCall = false;
        this.callType = (receiveVideo || sendVideo) ? OMPhoneCall.CallType.VIDEO : OMPhoneCall.CallType.VOICE;

        // Unmute media.
        this.getAcquireCaptureDevicesDeferred(this.getCallType() == OMPhoneCall.CallType.VIDEO).done(function() {
            // Play the ringing sound.
            this.flashBackend.playSound(this.soundUrls.RINGING, true).done(function() {
                this.phoneManager.onIncomingCall(userName, displayName, receiveVideo, sendVideo);
            });
        }).fail(function() {
           this.flashBackend.reject()
        });
    },
    
    onRemoteRinging : function() {
        this.flashBackend.playSound(this.soundUrls.RING_BACK, true).done(function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onRemoteRinging();
            }
        });
    },
    
    onCancel : function() {
        // Check for the current call because this may get called twice: (1) acceptResult == false and (2) onCancel.
        if (this.phoneManager.currentCall !== null) {
            this.flashBackend.stopSound();
            this.flashBackend.playSound(this.soundUrls.HUNG_UP, false).done(function() {
                if (this.phoneManager.currentCall !== null) {
                    this.phoneManager.currentCall.onCancel();
                }
            });
        }
    },
    
    onAccept : function() {
        this.outgoingRinging = false;
        this.incomingRinging = false;
        this.inCall = true;
        
        this.flashBackend.stopSound();
        
        OMUtils.yieldThenExecute(this, function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onAnswered();
            }
        });
    },
    
    onReject : function() {
        this.flashBackend.playSound(this.soundUrls.HUNG_UP, false).done(function () {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onRejected();
            }
        });
    },
    
    onBusy : function() {
        this.flashBackend.playSound(this.soundUrls.HUNG_UP, false).done(function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onBusy();
            }
        });
    },
    
    onUnavailable : function() {
        this.flashBackend.playSound(this.soundUrls.HUNG_UP, false).done(function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onUnavailable();
            }
        });
    },
    
    onReceivingRemoteVideo : function() {
        if (this.phoneManager.currentCall != null) {
            this.phoneManager.currentCall.onReceivingRemoteVideo();
        }
    },
    
    onRemoteHangUp : function() {
        this.flashBackend.playSound(this.soundUrls.HUNG_UP, false).done(function() {
            if (this.phoneManager.currentCall !== null) {
                this.phoneManager.currentCall.onHungUp();
            }
        });
    },
    
    onRemoteCameraMetadata : function(cameraOrientation, cameraType) {
        if (this.phoneManager.currentCall !== null) {
            this.phoneManager.currentCall.onRemoteCameraMetadata(cameraOrientation, cameraType);
        }
    }
};
