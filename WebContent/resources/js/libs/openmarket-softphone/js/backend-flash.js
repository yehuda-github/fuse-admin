/** 
 * @fileOverview OpenMarket Softphone SDK for web applications (Adobe Flash backend)<br />
 * Copyright 2012 OpenMarket Limited<br />
 * Evaluation SDK -- all materials STRICTLY CONFIDENTIAL AND PROPRIETARY<br />
 * $Id: backend-flash.js 510 2012-07-31 09:29:34Z andreyf $
 */

var _omSoftphoneBackendFlash = null;

(function (window, document, undefined) {
    function OMSoftphoneBackendFlash(backend, loaderPath) {
        this.backend = backend;
        
        this.containerElement = null;
        this.containerElementId = null;
        this.containerElementForegroundRectangle = null;
        this.endpoints = null;
        this.endpointFailureCount = null;
        this.chosenEndpoint = null;
        
        this.flashFile = loaderPath + 'backend-flash.swf?' + new Date().getTime();
        this.canCaptureVideo = false;
        this.dependencies = [loaderPath + 'swfobject-min.js', loaderPath + 'json2-min.js', loaderPath + 'backend-flash-remoting-min.js'];
        this.flashInstallerPath = loaderPath + 'backend-flash-express-install.swf';
        
        this.defaultReceiveVideoRotation = 90;
        this.receiveVideoRotation = this.defaultReceiveVideoRotation;
        this.captureVideoRotation = 0;
        this.remoteRotationEnabled = true;
        this.minimumFlashWidth = 215;
        this.minimumFlashHeight = 138;
        this.visibleCanvas = null;
        this.lastVisibleCanvas = null;
        this.uiLayout = null;
        
        this.shouldLogout = false;
        this.isConnected = false;
        this.flashRemotingDeferred = null; // Resolved when Flash has set up its remoting interface.
        this.permissionsShownDeferred = null;
        this.permissionsHiddenDeferred = null;
        this.unmutedDeferred = null;
        this.forceShowAlwaysAllow = false;
        this.shouldPollVideoState = false;
        
        this.flashCameraSetupDeferred = null; // Resolved when we set up the camera.
        this.flashMicrophoneSetupDeferred = null; // Resolved when we set up the microphone.
        this.cameras = null;
        this.microphones = null;
        
        // Initially there is no sound playing.
        this.soundUrl = '';
        this.soundShouldRepeat = false;
        this.updateSoundDoneDeferred = null;
        this.updateSoundDoneTimeout = null;
        
        // We keep track of the credentials so we can re-login.
        this.credentials = null;
        
        // Set a prefix for resource loading.
        this.resourcePrefix = 'openmarket-softphone/resources/';
        
        this.diagnosticData = {};
    };

    OMSoftphoneBackendFlash.prototype = {
        // Public backend methods:
        initialise : function(containerElement) {
            this.containerElement = containerElement;
            this.containerElementId = this.containerElement.attr('id');
            
            _omSoftphoneBackendFlash = this;
            
            this.endpoints = ['rtmp://rtmp.mxtelecom.com/sip2rtmpgw/', 'rtmpt://rtmp.mxtelecom.com/sip2rtmpgw/'];
            this.endpointFailureCount = [];
            for (var i = 0; i < this.endpoints.length; i++) {
                this.endpointFailureCount[i] = 0;
            }
            
            var allDependenciesLoaded = new jQuery.Deferred();
            var loadDependency = function(remainingDependencies) {
                if (remainingDependencies.length == 0) {
                    allDependenciesLoaded.resolveWith(this);
                    return;
                }
                
                var thisDependency = remainingDependencies.shift();
                $.ajax({
                    url : thisDependency,
                    dataType : 'script',
                    context : this,
                    cache : false
                }).done(function() {
                    OMLogger.info('Loaded ' + thisDependency + '.');
                    loadDependency.call(this, remainingDependencies);
                }).fail(function() {
                    OMLogger.error('Missing dependency for Flash backend ' + thisDependency + '.');
                });
            };
            loadDependency.call(this, this.dependencies);

            // Invoke setupSoftphone once we have the dependencies.
            var loader = allDependenciesLoaded.pipe(function() {
                return this.setupSoftphone();
            });
            
            return loader;
        },
        
        setupSoftphone : function() {
            // Remove any current Flash instance.
            this.containerElement.empty();
            
            // Set up a delay before embedding so Flash can get destroyed if necessary.
            var flashLoading = new jQuery.Deferred();
            this.flashRemotingDeferred = flashLoading;
            OMUtils.yieldThenExecute(this, function() {
                var thisFlashVersion = swfobject.getFlashPlayerVersion();
                var requiredFlashVersion = '11.0';
                var requiredExpressInstallDimensions = [310, 137];
                this.diagnosticData['thisFlashVersion'] = thisFlashVersion;
                this.diagnosticData['requiredFlashVersion'] = requiredFlashVersion;
                this.diagnosticData['ua'] = swfobject.ua;
                if (!swfobject.hasFlashPlayerVersion(requiredFlashVersion)) {
                    if (swfobject.hasFlashPlayerVersion('6.0.65')) {
                        // Do an express installer embedding.
                        swfobject.embedSWF(this.flashFile, this.containerElementId, requiredExpressInstallDimensions[0], requiredExpressInstallDimensions[1], requiredFlashVersion, this.flashInstallerPath, {}, {});
                    }
                    flashLoading.rejectWith(this, [{flashVersion : swfobject.getFlashPlayerVersion()}]);
                } else {
                    if ($('#' + this.containerElementId).css('position') === 'static') {
                        OMLogger.warn('Container element had \'position: static;\'. Overriding to \'position: relative;\'.');
                        $('#' + this.containerElementId).css('position', 'relative');
                    }
                    var position = $('#' + this.containerElementId).css('position');
                    swfobject.embedSWF(this.flashFile, this.containerElementId, this.minimumFlashWidth, this.minimumFlashHeight, requiredFlashVersion, this.flashInstallerPath, {}, {allowFullScreen : true, bgcolor: '#FFFFFF', wmode : 'transparent'});
                    this.containerElement = $('#' + this.containerElementId);
                    this.containerElement.css('position', position);
                    OMSoftphoneBackendFlashRemoting.setupFlash();
                    
                    // Set the default resource prefix for now.
                    this.setResourcePrefix(this.resourcePrefix);
                }
            });
            
            return flashLoading;
        },
        
        setResourcePrefix : function(prefix) {
            // We have to keep track of the resource prefix for both JS and Flash.
            this.resourcePrefix = prefix;
            this.remotingCall('setResourcePrefix', [prefix], true);
        },
        
        getResourceUrl : function(resourceFileName) {
            return this.resourcePrefix + resourceFileName;
        },
        
        isRemotingActive : function() {
            return (this.flashRemotingDeferred !== null && this.flashRemotingDeferred.isResolved());
        },
        
        remotingCall : function(functionName, parameters, getDeferred) {
            if (this.flashRemotingDeferred === null) {
                return null;
            }
            
            if (functionName === undefined) {
                return this.flashRemotingDeferred;
            }
            
            // All Flash remoting calls are proxied through here so we can log them.
            if (getDeferred === undefined || getDeferred == false) {
                OMLogger.info('JS -> Flash: ' + functionName + ' ' + parameters);
                
                return OMSoftphoneBackendFlashRemoting[functionName].apply(OMSoftphoneBackendFlashRemoting, parameters);
            } else {
                var callDeferred = new jQuery.Deferred();
                this.flashRemotingDeferred.done(function() {
                    var result = null;
                    try {
                        result = this.remotingCall(functionName, parameters, false);
                    } catch (err) {
                        if (err == 'Call failure : ExternalConnection is not initialized in Flash') {
                            OMLogger.error('Unable to use Flash remoting.');
                        }
                    }
                    callDeferred.resolveWith(this, [result]);
                });
                return callDeferred;
            }
        },
        
        remotingIncomingCall : function(functionName, parameters) {
            OMLogger.info('Flash -> JS: ' + functionName + ' ' + parameters);
            
            return this[functionName].apply(this, parameters);
        },
        
        initialiseMedia : function(promptForAlwaysAllow, requireCamera) {
            if (typeof requireCamera === 'undefined') {
                requireCamera = true;
            }
            this.forceShowAlwaysAllow = promptForAlwaysAllow;
            
            this.flashCameraSetupDeferred = null;
            this.flashMicrophoneSetupDeferred = new jQuery.Deferred();
            this.getCameras();
            this.getMicrophones();
            var getMedia = this.remotingCall('initialiseMicrophone', [], true);
            if (requireCamera) {
                this.flashCameraSetupDeferred = new jQuery.Deferred();
                getMedia = getMedia.pipe(function() {
                    return this.remotingCall('initialiseCamera', [], true);
                });
            }
        },
        
        getPermissionsShownDeferred : function() {
            if (this.permissionsShownDeferred == null) {
                this.permissionsShownDeferred = new jQuery.Deferred();
            }
            
            return this.permissionsShownDeferred;
        },
        
        getPermissionsHiddenDeferred : function() {
            if (this.permissionsHiddenDeferred == null) {
                this.permissionsHiddenDeferred = new jQuery.Deferred();
                this.permissionsHiddenDeferred.done(function() {
                    this.permissionsShownDeferred = null;
                    this.permissionsHiddenDeferred = null;
                });
            }
            
            return this.permissionsHiddenDeferred;
        },
        
        getUnmutedDeferred : function() {
            this.unmutedDeferred = new jQuery.Deferred();
            return this.unmutedDeferred;
        },
        
        placeCall : function(addresses, receiveVideo, sendVideo) {
            this.hasVideo = receiveVideo || sendVideo;
            
            this.remotingCall('placeCall', [addresses, receiveVideo, sendVideo]);
        },
        
        showLocalVideoPreview : function() {
            this.showUI(this.UILayouts.LOCAL_PREVIEW);
        },
        
        hideLocalVideoPreview : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
        },
        
        login : function(credentials) {
            this.credentials = credentials;
            this.relogin();
        },
        
        getBestEndpointFailureCount : function() {
            return Math.min.apply(Math, this.endpointFailureCount);
        },
        
        getEndpoint : function() {
            var minimum = this.getBestEndpointFailureCount();
            
            // Choose the endpoint with the fewest failures.
            for (var i = 0; i < this.endpoints.length; i++) {
                if (this.endpointFailureCount[i] == minimum) {
                    this.chosenEndpoint = this.endpoints[i];
                    return this.chosenEndpoint;
                }
            }
        },
        
        getChosenEndpoint : function() {
            return (this.chosenEndpoint == null ? 'unknown' : this.chosenEndpoint);
        },
        
        relogin : function() {
            this.remotingCall('connect', [this.getEndpoint(), this.credentials.user.getSipAor(), this.credentials.password, this.credentials.user.displayName]);
        },

        logout : function() {
            if (this.isConnected) {
                this.shouldLogout = true;
                this.remotingCall('disconnect', []);
            }
        },

        accept : function() {
            this.receiveVideoRotation = this.defaultReceiveVideoRotation;
            
            this.remotingCall('accept', [this.canCaptureVideo], true);
        },
        
        reject : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            this.remotingCall('reject', [], true);
        },
        
        cancel : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            this.remotingCall('cancel', [], true);
        },
        
        hangUp : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            this.remotingCall('hangUp', [], true);
        },
        
        UILayouts : {
            OFFSCREEN_RELEASE_MEDIA : 'OFFSCREEN_RELEASE_MEDIA',
            OFFSCREEN : 'OFFSCREEN',
            ACQUIRE_MEDIA : 'ACQUIRE_MEDIA',
            LOCAL_PREVIEW : 'LOCAL_PREVIEW',
            VOICE_CALL : 'VOICE_CALL',
            VIDEO_CALL : 'VIDEO_CALL',
            IN_CALL : 'IN_CALL',
            FULL_SCREEN : 'FULLSCREEN'
        },
        
        phoneViewUpdated : function(phoneView) {
            if (typeof phoneView.softphone !== 'undefined' && phoneView.softphone.width < this.minimumFlashWidth) {
                OMLogger.warn('Phone view width was too small for Flash');
                phoneView.softphone.width = this.minimumFlashWidth;
            } 
            
            if (typeof phoneView.softphone !== 'undefined' && phoneView.softphone.height < this.minimumFlashHeight) {
                OMLogger.warn('Phone view height was too small for Flash');
                phoneView.softphone.height = this.minimumFlashHeight;
            }
            
            this.phoneView = phoneView;
            
            this.visibleCanvas = {
                'fullScreen' : {},
                'window' : phoneView.softphone
            };
            
            if (this.phoneView.sounds === false) {
                this.stopSound();
            }
            
            if (this.uiLayout === this.UILayouts.VIDEO_CALL || this.uiLayout === this.UILayouts.FULL_SCREEN) {
                // Update the layout now.
                this.layoutSoftphone();
            }
            
            // TODO: Move this out of the phone view.
            if (typeof this.phoneView.resourcePrefix !== 'undefined') {
                this.setResourcePrefix(this.phoneView.resourcePrefix);
            }
            
            // Move the softphone off-screen just after loading.
            if (this.uiLayout === null) {
                this.showUI(this.UILayouts.OFFSCREEN);
            }
        },
        
        showUI : function(uiLayout) {
            this.uiLayout = uiLayout;
            
            if (this.uiLayout != this.UILayouts.OFFSCREEN && typeof this.phoneView === 'undefined') {
                // When the phone view is specified, we will re-show the UI.
                return;
            }
            
            // Release media and move the phone off-screen.
            if (this.uiLayout === this.UILayouts.OFFSCREEN_RELEASE_MEDIA) {
                this.remotingCall('releaseVideo', [], true);
                this.remotingCall('releaseAudio', [], true);
                
                this.showUI(this.UILayouts.OFFSCREEN);
                
                return;
            }
            
            // IN_CALL gets translated to a video/voice-specific layout.
            if (this.uiLayout === this.UILayouts.IN_CALL) {
                if (this.backend.getCallType() === OMPhoneCall.CallType.VOICE) {
                    this.uiLayout = this.UILayouts.VOICE_CALL;
                } else {
                    this.uiLayout = this.UILayouts.VIDEO_CALL;
                }
            }
            
            // For now, voice calls just show the OFFSCREEN layout.
            if (this.uiLayout == this.UILayouts.VOICE_CALL) {
                this.uiLayout = this.UILayouts.OFFSCREEN;
                this.remotingCall('releaseVideo', [], true);
            }
            
            // Layout the softphone and move the element into place.
            if (this.uiLayout === this.UILayouts.OFFSCREEN) {
                // Hide any UI when off-screen.
                this.remotingCall('hideFullScreenButton', [], true);
                this.remotingCall('setReceiveVideoVisible', [false], true);
                this.remotingCall('setCaptureVideoVisible', [false], true);
                
                // Hide the softphone using the default method if none was specified.
                if (typeof this.phoneView.hideSoftphoneFunction !== 'function') {
                    this.phoneView.hideSoftphoneFunction = this.hideSoftphoneFunctionDefault;
                }
                
                var self = this;
                this.phoneView.haveContainer.done(function() {
                    self.phoneView.hideSoftphoneFunction(self.containerElement);
                });
            } else {
                if (this.uiLayout === this.UILayouts.FULL_SCREEN) {
                    this.layoutSoftphone(this.visibleCanvas.fullScreen);
                } else {
                    this.layoutSoftphone(this.visibleCanvas.window);
                }
                
                // Show the softphone using the default method if none was specified.
                if (typeof this.phoneView.showSoftphoneFunction !== 'function') {
                    this.phoneView.showSoftphoneFunction = this.showSoftphoneFunctionDefault;
                }
                
                this.phoneView.showSoftphoneFunction(this.containerElement, 
                                                     this.phoneView.softphone['left'], 
                                                     this.phoneView.softphone['top'], 
                                                     this.phoneView.softphone['width'], 
                                                     this.phoneView.softphone['height']);
            }
        },
        
        hideSoftphoneFunctionDefault : function(container) {
            container.offset({'left' : -2000});
        },
        
        showSoftphoneFunctionDefault : function(container, left, top, width, height) {
            container.width(width);
            container.height(height);
            container.offset({'left' : left, 'top' : top});
        },
        
        setHardwareAccelerationEnabled : function(hardwareAccelerationEnabled) {
            this.remotingCall('setHardwareAccelerationEnabled', [hardwareAccelerationEnabled], true);
        },
        
        getHardwareAccelerationEnabled : function() {
            return this.remotingCall('getHardwareAccelerationEnabled', []);
        },
        
        setRequestedCaptureResolution : function(width, height) {
            this.remotingCall('setRequestedCaptureResolution', [width, height], true);
        },
        
        enterFullScreen : function(width, height) {
            this.visibleCanvas.fullScreen.width = width;
            this.visibleCanvas.fullScreen.height = height;
            this.showUI(this.UILayouts.FULL_SCREEN);
        },
        
        exitFullScreen : function() {
            this.showUI(this.UILayouts.IN_CALL);
        },
        
        setRemoteRotationEnabled : function(isRemoteRotationEnabled) {
            OMLogger.warn('Remote rotation is ' + (isRemoteRotationEnabled ? 'enabled' : 'disabled'));
            this.remoteRotationEnabled = isRemoteRotationEnabled;
            this.layoutSoftphone();
        },

        setReceiveVideoRotation : function(angle) {
            this.receiveVideoRotation = angle;
            this.layoutSoftphone();
        },

        setSendVideoRotation : function(angle) {
            if (this.captureVideoRotation != angle) {
                this.captureVideoRotation = angle;
                this.layoutSoftphone();
                
                if (angle == 0) {
                    orientation = 'ORI_LANDSCAPE_UP';
                } else if (angle == 90) {
                    orientation = 'ORI_PORTRAIT_LEFT';
                } else if (angle == 180) {
                    orientation = 'ORI_LANDSCAPE_DOWN';
                } else if (angle == 270) {
                    orientation = 'ORI_PORTRAIT_RIGHT';
                }
            
                this.remotingCall('onLocalCameraMetadata', [orientation], true);
            }
        },
        
        layoutSoftphone : function(visibleCanvas) {
            if (visibleCanvas === undefined) {
                visibleCanvas = this.lastVisibleCanvas;
            }
            this.lastVisibleCanvas = visibleCanvas;
            
            // Utility function that returns a pixel dimension given a value which may be a percentage of the maximum, and may be negative to indicate an offset below the maximum.
            var getPixelDimension = function(value, maximum) {
                if (typeof value === 'string' && value[value.length - 1] === '%') {
                    value = value.slice(0, -1);
                    value *= maximum / 100.0;
                    value = Math.round(value);
                }
                
                // Handle negative values as an offset from the maximum.
                return (value < 0) ? value + maximum + 1 : value;
            };
            
            // Utility function to calculate rendering bounds based on a destination rectangle and mode.
            var getRenderParameters = function(destinationRectangle, sourceDimensions, sourceRotation, mode) {
                var makeRectangle = function(left, top, width, height) {
                    return {'left' : left, 'top' : top, 'right' : left + width, 'bottom' : top + height, 'width' : width, 'height' : height};
                };
                
                // Convert percentages and negative offsets into real pixel values.
                var newDestinationRectangle = {
                    'left' : getPixelDimension(destinationRectangle['left'], visibleCanvas.width),
                    'top' : getPixelDimension(destinationRectangle['top'], visibleCanvas.height)
                };
                
                // Handle specifying 'right' and 'bottom' instead of 'width' and 'height'.
                if ('right' in destinationRectangle && !('width' in destinationRectangle)) {
                    newDestinationRectangle['width'] = getPixelDimension(destinationRectangle['right'], visibleCanvas.width) - newDestinationRectangle['left'];
                } else {
                    newDestinationRectangle['width'] = getPixelDimension(destinationRectangle['width'], visibleCanvas.width);
                }
                if ('bottom' in destinationRectangle && !('height' in destinationRectangle)) {
                    newDestinationRectangle['height'] = getPixelDimension(destinationRectangle['bottom'], visibleCanvas.height) - newDestinationRectangle['top'];
                } else {
                    newDestinationRectangle['height'] = getPixelDimension(destinationRectangle['height'], visibleCanvas.height);
                }
                destinationRectangle = newDestinationRectangle;
                OMLogger.info("new destination rectangle " + destinationRectangle.left + ' ' + destinationRectangle.top + ' ' + destinationRectangle.width + ' ' + destinationRectangle.height);
                
                var flashRotation = sourceRotation;
                var renderRectangle;
                var maskRectangle = null;
                if (mode === OMPhoneManager.ViewMode.STRETCH) {
                    if (sourceRotation == 0 || sourceRotation == 180) {
                        renderRectangle = makeRectangle(destinationRectangle.left, destinationRectangle.top, destinationRectangle.width, destinationRectangle.height);
                    } else {
                        renderRectangle = makeRectangle(destinationRectangle.left, destinationRectangle.top, destinationRectangle.width, destinationRectangle.height);
                    }
                } else if (mode === OMPhoneManager.ViewMode.CROP || mode === OMPhoneManager.ViewMode.OVERFLOW || mode === OMPhoneManager.ViewMode.LETTERBOX) {
                    var rotated = !(sourceRotation == 0 || sourceRotation == 180);
                    var sourceAspectRatio = rotated ? sourceDimensions.height / sourceDimensions.width : sourceDimensions.width / sourceDimensions.height;
                    var destinationAspectRatio = destinationRectangle.width / destinationRectangle.height;
                    var sourceFlatter = sourceAspectRatio > destinationAspectRatio;
                    var letterbox = mode === OMPhoneManager.ViewMode.LETTERBOX;
                    var renderWidth, renderHeight;
                    
                    if (letterbox == sourceFlatter) {
                        // Source should touch the left/right of the destination.
                        renderWidth = destinationRectangle.width;
                        renderHeight = Math.round(destinationRectangle.width / sourceAspectRatio);
                    } else {
                        // Source should touch the top/bottom of the destination.
                        renderWidth = Math.round(destinationRectangle.height * sourceAspectRatio);
                        renderHeight = destinationRectangle.height;
                    }

                    var renderCentreX = Math.round(destinationRectangle.left + destinationRectangle.width / 2),
                        renderCentreY = Math.round(destinationRectangle.top + destinationRectangle.height / 2);
                    
                    renderRectangle = makeRectangle(Math.round(renderCentreX - renderWidth / 2), Math.round(renderCentreY - renderHeight / 2), renderWidth, renderHeight);
                    
                    if (mode === OMPhoneManager.ViewMode.CROP) {
                        maskRectangle = makeRectangle(destinationRectangle.left, destinationRectangle.top, destinationRectangle.width, destinationRectangle.height);
                    }
                } else {
                    OMLogger.warn('The view mode \'' + mode + '\' is not supported by this Flash backend.');
                }
                
                return {'renderRectangle' : renderRectangle, 'maskRectangle' : maskRectangle === null ? renderRectangle : maskRectangle, 'flashRotationDegrees' : flashRotation};
            };
            
            // Setup capture video.
            if (this.canCaptureVideo && (this.uiLayout === this.UILayouts.VIDEO_CALL || this.uiLayout === this.UILayouts.FULL_SCREEN || this.uiLayout === this.UILayouts.ACQUIRE_MEDIA || this.uiLayout === this.UILayouts.LOCAL_PREVIEW)) {
                var captureWidth = this.remotingCall('getCameraCaptureWidth', []);
                var captureHeight = this.remotingCall('getCameraCaptureHeight', []);
                
                // Override the destination rectangle to fill the canvas if we are acquiring media or showing the local preview.
                var destinationRectangle;
                if (this.uiLayout === this.UILayouts.ACQUIRE_MEDIA || this.uiLayout === this.UILayouts.LOCAL_PREVIEW) {
                    destinationRectangle = {'top' : 0, 'left' : 0, 'width' : visibleCanvas.width, 'height' : visibleCanvas.height};
                } else {
                    destinationRectangle = this.phoneView.localVideo;
                }
                
                // Calculate the rectangle to render into.
                var renderParameters = getRenderParameters(destinationRectangle, {'width' : captureWidth, 'height' : captureHeight}, this.captureVideoRotation, this.phoneView.localVideo.mode);
                
                // Apply the parameters.
                var transformParameters = [renderParameters.renderRectangle.left, renderParameters.renderRectangle.top, renderParameters.renderRectangle.width, renderParameters.renderRectangle.height, renderParameters.flashRotationDegrees];
                transformParameters.push.apply(transformParameters, [renderParameters.maskRectangle.left, renderParameters.maskRectangle.top, renderParameters.maskRectangle.width, renderParameters.maskRectangle.height]);
                this.remotingCall('setCaptureVideoDisplayParameters', transformParameters)
                this.remotingCall('setCaptureVideoVisible', [this.uiLayout === this.UILayouts.LOCAL_PREVIEW]);
            }
            
            // Setup receive video once it has started arriving.
            if (this.uiLayout === this.UILayouts.VIDEO_CALL || this.uiLayout === this.UILayouts.FULL_SCREEN) {
                this.getReceivingRemoteVideoDeferred().done(function(receiveWidth, receiveHeight) {
                    var renderParameters = getRenderParameters(this.phoneView.remoteVideo, {'width' : receiveWidth, 'height' : receiveHeight}, this.remoteRotationEnabled ? this.receiveVideoRotation - 90 : 0, this.phoneView.remoteVideo.mode);
                    var transformParameters = [renderParameters.renderRectangle.left, renderParameters.renderRectangle.top, renderParameters.renderRectangle.width, renderParameters.renderRectangle.height, renderParameters.flashRotationDegrees];
                    transformParameters.push.apply(transformParameters, [renderParameters.maskRectangle.left, renderParameters.maskRectangle.top, renderParameters.maskRectangle.width, renderParameters.maskRectangle.height])
                    this.remotingCall('setReceiveVideoDisplayParameters', transformParameters);
                    
                    // The receive video will be made visible after it first gets video.
                    this.remotingCall('setReceiveVideoVisible', [false]);
                    this.remotingCall('hideFullScreenButton', [], true);
                    this.getReceivingRemoteVideoDeferred().done(function() {
                        this.remotingCall('setReceiveVideoVisible', [true]);
                        this.remotingCall('setCaptureVideoVisible', [this.phoneView.inCallLocalVideoVisible || this.uiLayout === this.UILayouts.LOCAL_PREVIEW]);
                        
                        // Configure the full-screen button.
                        if (this.uiLayout === this.UILayouts.VIDEO_CALL && this.phoneView.fullScreenButton != null) {
                            this.remotingCall('showFullScreenButton', [this.getResourceUrl('button-fullscreen.png'), this.getResourceUrl('button-fullscreen-hover.png'), 
                                                                       getPixelDimension(this.phoneView.fullScreenButton.left, this.visibleCanvas.window.width), 
                                                                       getPixelDimension(this.phoneView.fullScreenButton.top, this.visibleCanvas.window.height)],
                                                                       true);
                        } else if (this.uiLayout === this.UILayouts.FULL_SCREEN) {
                            this.remotingCall('showFullScreenButton', [this.getResourceUrl('button-window.png'), this.getResourceUrl('button-window-hover.png'), 
                                                                       getPixelDimension(this.phoneView.fullScreenButton.left, this.visibleCanvas.fullScreen.width), 
                                                                       getPixelDimension(this.phoneView.fullScreenButton.top, this.visibleCanvas.fullScreen.height)],
                                                                       true);
                        }
                    });
                });
            }
        },
        
        getReceivingRemoteVideoDeferred : function() {
            var self = this;
            var getReceiveVideoDimensions = function() {
                var receiveWidth = self.getReceiveVideoWidth(),
                    receiveHeight = self.getReceiveVideoHeight();
                
                if (receiveWidth == 0 || receiveHeight == 0) {
                    return undefined;
                } else {
                    return [receiveWidth, receiveHeight];
                }
            };
            
            var dimensions = getReceiveVideoDimensions();
            if (typeof dimensions !== 'undefined') {
                var receivingRemoteVideoDeferred = new jQuery.Deferred();
                receivingRemoteVideoDeferred.resolveWith(this, dimensions);
                
                // Throw away the old deferred as it pertains to a stale call.
                this.receivingRemoteVideoDeferred = receivingRemoteVideoDeferred;
                
                return receivingRemoteVideoDeferred;
            } else {
                // We don't have video at the moment. Set up polling.
                if (this.receivingRemoteVideoDeferred == null || this.receivingRemoteVideoDeferred.isResolved()) {
                    this.receivingRemoteVideoDeferred = new jQuery.Deferred();
                }
                
                this.remotingCall('pollForReceivingRemoteVideo', [null]);
            }
            
            return this.receivingRemoteVideoDeferred;
        },
        
        onReceivingRemoteVideo : function(width, height) {
            // Layout the canvas for receiving video.
            if (this.receivingRemoteVideoDeferred != null) {
                this.receivingRemoteVideoDeferred.resolveWith(this, [width, height]);
            }
            
            // Notify the application that we have media.
            this.backend.onReceivingRemoteVideo();
        },
        
        getCaptureVideoWidth : function() {
            return this.remotingCall('getCameraCaptureWidth', []);
        },
        
        getCaptureVideoHeight : function() {
            return this.remotingCall('getCameraCaptureHeight', []);
        },
        
        getReceiveVideoWidth : function() {
            return this.remotingCall('getReceiveVideoWidth', []);
        },
        
        getReceiveVideoHeight : function() {
            return this.remotingCall('getReceiveVideoHeight', []);
        },
        
        getSoundUrl : function() {
            return this.soundUrl;
        },
        
        getSoundShouldRepeat : function() {
            return this.soundShouldRepeat;
        },
        
        playSound : function(soundFileName, shouldRepeat) {
            // Timeout the previous playSound call's state.
            if (this.updateSoundDoneDeferred != null) {
                if (this.updateSoundDoneTimeout != null) {
                    window.clearTimeout(this.updateSoundDoneTimeout);
                    this.updateSoundDoneTimeout = null;
                }
                this.updateSoundDoneDeferred.resolveWith(this.backend, []);
            }
            
            var thisUpdateSoundDoneDeferred = new jQuery.Deferred();
            this.updateSoundDoneDeferred = thisUpdateSoundDoneDeferred;
            
            this.soundUrl = this.getResourceUrl(soundFileName);
            this.soundShouldRepeat = shouldRepeat;
            
            if (this.phoneView.sounds === true) {
                var self = this;
                this.updateSoundDoneTimeout = window.setTimeout(function() {
                    OMLogger.warn('Timed out while loading a sound.');
                    self.updateSoundDoneTimeout = null;
                    thisUpdateSoundDoneDeferred.resolveWith(self.backend, []);
                }, 1000);

                this.remotingCall('updateSound', []);
            } else {
                // Sounds are disabled.
                this.updateSoundDoneDeferred.resolveWith(this.backend, []);
            }
            
            return this.updateSoundDoneDeferred;
        },
        
        updateSoundDone : function(didLoad) {
            if (this.updateSoundDoneTimeout != null) {
                // We got here from Flash.
                window.clearTimeout(this.updateSoundDoneTimeout);
                this.updateSoundDoneTimeout = null;
                OMLogger.info('Notified from Flash that the sound loaded.');
            }
            
            var thisSoundDeferred = this.updateSoundDoneDeferred;
            this.updateSoundDoneDeferred = null;
            OMUtils.yieldThenExecute(this, function() {
                thisSoundDeferred.resolveWith(this.backend, []);
            });
        },
        
        stopSound : function() {
            this.soundUrl = '';
            this.soundShouldRepeat = false;
            
            if (this.updateSoundDoneDeferred != null) {
                window.clearTimeout(this.updateSoundDoneTimeout);
                this.updateSoundDoneDeferred.resolveWith(this.backend, []);
                this.updateSoundDoneDeferred = null;
                OMLogger.warn('Timed out due to stopping a sound.');
            }
            
            this.remotingCall('updateSound', []);
        },
        
        // Event handlers invoked by Flash:
        registerFailure : function() {
            this.onConnectionLost();
        },

        registerResult : function(success, message) {
            function updateDiagnostics(data, key) {
                var diagnosticsId = 'om-flash-diagnostics';
                var diagnosticsSelector = $('#' + diagnosticsId);
                if (diagnosticsSelector.length === 0) {
                    $('<div />', {
                        id : diagnosticsId,
                        style : 'position: absolute; top: 0; right: 0; font-size: 10px; display: none;'
                    }).appendTo($('body'));
                    diagnosticsSelector = $('#' + diagnosticsId);
                }
                
                var tableId = diagnosticsId + '-' + key;
                var tableSelector = $('#' + tableId);
                if (tableSelector.length === 0) {
                    $('<table />', {
                        id : tableId
                    }).appendTo(diagnosticsSelector);
                    tableSelector = $('#' + tableId);
                } else {
                    tableSelector.empty();
                }
                
                for (var i = 0; i < data.length; i++) {
                    var row = $('<tr />');
                    var k = $('<td />', {text : data[i][0]});
                    var v = $('<td />', {text : data[i][1]});
                    row.append(k);
                    row.append(v);
                    tableSelector.append(row);
                }
            }
            
            if (!success) {
                this.backend.onLoginFail(OMPhoneManager.LoginError.INVALID_PASSWORD_PROVIDED, message);
            } else {
                this.isConnected = true;
                this.remotingCall('startRegistering', [this.credentials.user.getSipAor(), this.credentials.password]);
                this.remotingCall('overrideConferenceFactoryUri', ['sip:conffactorytest@sip.banter.mxtelecom.com:443']);
                
                OMUtils.yieldThenExecute(this, function() {
                    this.backend.loginResult();
                });
                
                var self = this;
                this.pollInterval = window.setInterval(function () {
                    if (self.isRemotingActive() && self.shouldPollVideoState) {
                        self.remotingCall('getCaptureVideoState', [], true).done(function(captureVideoState) {
                            if (captureVideoState !== null) {
                                updateDiagnostics(captureVideoState, 'Capture');
                            }
                        });
                        self.remotingCall('getReceiveVideoState', [], true).done(function(receiveVideoState) {
                            if (receiveVideoState !== null) {
                                updateDiagnostics(receiveVideoState, 'Receive');
                            }
                        });
                    }
                }, 5000);
            }
        },

        placeCallResult : function(callId) {
            this.diagnosticData['callId'] = callId;
        },

        cancelResult : function() {
            this.backend.cancelResult();
        },

        acceptResult : function(success) {
            if (success) {
                this.backend.acceptResult();
                this.showUI(this.UILayouts.IN_CALL);
            } else {
                this.backend.onCancel();
                this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            }
        },

        rejectResult : function() {
            this.backend.rejectResult();
        },

        hangUpResult : function() {
            this.backend.hangUpResult();
        },

        onIncomingCall : function(userName, displayName, callId, receiveVideo, sendVideo) {
            this.hasVideo = receiveVideo || sendVideo;

            this.diagnosticData['callId'] = callId;

            this.backend.onIncomingCall(userName, displayName, receiveVideo, sendVideo);
        },

        onConnectionLost : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            
            // If we are trying to logout, set the backend to disconnected and return;
            if (this.shouldLogout) {
                this.shouldLogout = false;
                this.isConnected = false;
                return;
            }
            
            this.isConnected = false;
            
            // Increment the failure count.
            for (var i = 0; i < this.endpoints.length; i++) {
                if (this.endpoints[i] == this.chosenEndpoint) {
                    this.endpointFailureCount[i]++;
                }
            }
            
            if (this.getBestEndpointFailureCount() > 0) {
                // Let the application handle the failure.
                this.backend.onAllLoginEndpointsFailed();
            } else {
                this.backend.onSwitchLoginEndpoints();
                
                // Try logging in with the next endpoint.
                this.relogin();
            }
        },

        onFault : function(fault) {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
        
            this.diagnosticData['fault'] = fault;
            
            this.backend.onLoginFail(OMPhoneManager.LoginError.CONNECTION_ERROR, 'Unable to connect to telephony gateway.');
        },

        onRemoteRinging : function() {
            this.backend.onRemoteRinging();
        },

        onTrying : function() {
            // We don't do anything when we receive 'trying' at the moment.
        },

        onAccept : function() {
            this.receiveVideoRotation = this.defaultReceiveVideoRotation;
            
            this.backend.onAccept();
            
            this.showUI(this.UILayouts.IN_CALL);
        },

        onReject : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);

            this.backend.onReject();
        },

        onBusy : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);

            this.backend.onBusy();
        },
        
        onUnavailable : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);

            this.backend.onUnavailable();
        },

        onCancel : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);

            this.backend.onCancel();
        },

        onRemoteHangUp : function() {
            this.showUI(this.UILayouts.OFFSCREEN_RELEASE_MEDIA);
            this.backend.onRemoteHangUp();
        },

        onRemoteCameraMetadata : function(orientation) {
            this.backend.onRemoteCameraMetadata(orientation);
        },
        
        onFlashReady : function() {
            this.flashRemotingDeferred.resolveWith(this);
        },
        
        onStatusEvent : function(message) {
            OMLogger.info('Status ' + message);
        },
        
        onFlashSecurityShown : function() {
            if (this.forceShowAlwaysAllow) {
                // Force showing the full 'always allow' dialog.
                this.remotingCall('showPrivacySettings', [], true);
            }
            this.containerElement.focus();
            this.showUI(this.UILayouts.ACQUIRE_MEDIA);
            if (this.permissionsShownDeferred != null) {
                this.permissionsShownDeferred.resolveWith(this);
            }
            
            // Set up the hidden deferred.
            this.setupPermissionsHiddenDeferred();
        },
        
        setupPermissionsHiddenDeferred : function() {
            if (this.permissionsHiddenDeferred != null) {
                var hiddenDeferred = this.permissionsHiddenDeferred;
                var self = this;
                var testHiddenCallback = function() {
                    // Stop polling if it was resolved.
                    if (hiddenDeferred.isResolved() || hiddenDeferred.isRejected()) {
                        return;
                    }
                    
                    self.remotingCall('isPrivacySettingsClosed', [], true).done(function(isClosed) {
                        if (isClosed) {
                            hiddenDeferred.resolveWith(self);
                        } else {
                            setTimeout(testHiddenCallback, 300);
                        }
                    });
                };
                
                // Keep checking if it's hidden, but first let Flash deal with its event loop.
                setTimeout(testHiddenCallback, 100);
            }
        },
        
        onFlashSecurityDenied : function() {
        
        },
        
        onCameraEnabled : function() {
            this.canCaptureVideo = true;
            
            if (this.flashCameraSetupDeferred != null) {
                this.flashCameraSetupDeferred.resolveWith(this);
            }
            
            this.tryMediaSetupComplete();
        },
        
        getCanCaptureVideo : function() {
            return this.canCaptureVideo;
        },
        
        onMicrophoneEnabled : function() {
            this.voiceCallsEnabled = true;
            
            if (this.flashMicrophoneSetupDeferred != null) {
                this.flashMicrophoneSetupDeferred.resolveWith(this);
            }
            
            this.tryMediaSetupComplete();
        },
        
        onNoCamera : function() {
            if (this.flashCameraSetupDeferred != null) {
                this.flashCameraSetupDeferred.rejectWith(this);
                this.tryMediaSetupComplete();
            }
        },
        
        onNoMicrophone : function() {
            if (this.flashMicrophoneSetupDeferred != null) {
                this.flashMicrophoneSetupDeferred.rejectWith(this);
                this.tryMediaSetupComplete();
            }
        },
        
        tryMediaSetupComplete : function() {
            this.voiceCallsEnabled = (this.flashMicrophoneSetupDeferred != null && this.flashMicrophoneSetupDeferred.isResolved());
            this.canCaptureVideo = (this.flashCameraSetupDeferred != null && this.flashCameraSetupDeferred.isResolved());
            if (this.unmutedDeferred != null && (this.flashMicrophoneSetupDeferred == null || this.flashMicrophoneSetupDeferred.isResolved() || this.flashMicrophoneSetupDeferred.isRejected()) && (this.flashCameraSetupDeferred == null || this.flashCameraSetupDeferred.isResolved() || this.flashCameraSetupDeferred.isRejected())) {
                if (this.flashMicrophoneSetupDeferred.isRejected()) {
                    this.unmutedDeferred.rejectWith(this);
                } else {
                    this.unmutedDeferred.resolveWith(this);
                }
            }
        },
        
        selectCamera : function(name) {
            this.remotingCall('selectCamera', [name], true).done(function() {
                if (this.uiLayout === this.UILayouts.VIDEO_CALL || this.uiLayout === this.UILayouts.FULL_SCREEN || this.uiLayout === this.UILayouts.ACQUIRE_MEDIA || this.uiLayout === this.UILayouts.LOCAL_PREVIEW) {
                    // Re-initialise the camera.
                    this.initialiseMedia(true);
                }
            });
        },
        
        selectMicrophone : function(name) {
            this.remotingCall('selectMicrophone', [name], true).done(function() {
                if (this.uiLayout === this.UILayouts.VIDEO_CALL || this.uiLayout === this.UILayouts.FULL_SCREEN || this.uiLayout === this.UILayouts.ACQUIRE_MEDIA || this.uiLayout === this.UILayouts.LOCAL_PREVIEW) {
                    // Re-initialise the microphone.
                    this.initialiseMedia(true);
                }
            });
        },
        
        getDefaultMicrophone : function() {
            if (this.microphones != null) {
                // Apply heuristics to select a microphone by name.
                
                // Try to find a (camera, microphone) pair which start with the same name.
                if (this.cameras != null) {
                    for (var i = 0; i < this.microphones.length; i++) {
                        for (var j = 0; j < this.cameras.length; j++) {
                            var m = this.microphones[i];
                            var c = this.cameras[j];
                            if (m.device.length < c.device.length) {
                                if (c.device.indexOf(m.device) == 0) {
                                    return i;
                                }
                            } else {
                                if (m.device.indexOf(c.device) == 0) {
                                    return i;
                                }
                            }
                        }
                    }
                }
                
                if (this.microphones.length > 0) {
                    for (var i = 0; i < this.microphones.length; i++) {
                        var m = this.microphones[i].device;
                        if (m != 'Built-in Input') {
                            return i;
                        }
                    }
                }
            }
            
            return 0;
        },
        
        getDefaultCamera : function() {
            if (this.cameras != null) {
                // Apply heuristics to select a camera by name.
                
                // Try to find a (camera, microphone) pair which start with the same name.
                if (this.microphones != null) {
                    for (var i = 0; i < this.microphones.length; i++) {
                        for (var j = 0; j < this.cameras.length; j++) {
                            var m = this.microphones[i];
                            var c = this.cameras[j];
                            if (m.device.length < c.device.length) {
                                if (c.device.indexOf(m.device) == 0) {
                                    return j;
                                }
                            } else {
                                if (m.device.indexOf(c.device) == 0) {
                                    return j;
                                }
                            }
                        }
                    }
                }

                // Select the first camera that isn't a Google camera.
                for (var i = 0; i < this.cameras.length; i++) {
                    if (!this.cameras[i].device.indexOf('Google Camera Adapter') == 0) {
                        return i;
                    }
                }
            }
            
            return 0;
        },
        
        isFirstUsage : function() {
            var firstUsageDeferred = new jQuery.Deferred();
            
            this.remotingCall('hasUsedLocalStore', [], true).done(function(result) {
                firstUsageDeferred.resolveWith(this, [!result]);
            });
            
            return firstUsageDeferred;
        },
        
        getDiagnosticData : function() {
            var result = {};
            result['isConnected'] = this.isConnected;
            result['endpoints'] = this.endPoints;
            result['endpointFailureCount'] = this.endpointFailureCount;
            result['chosenEndpoint'] = this.chosenEndpoint;
            result['isConnected'] = this.isConnected;
            result['flashRemotingDeferred'] = (this.flashRemotingDeferred != null) ? this.flashRemotingDeferred.isResolved() : null;
            result['permissionsShownDeferred'] = (this.permissionsShownDeferred != null) ? this.permissionsShownDeferred.isResolved() : null;
            result['permissionsHiddenDeferred'] = (this.permissionsHiddenDeferred != null) ? this.permissionsHiddenDeferred.isResolved() : null;
            result['unmutedDeferred'] = (this.unmutedDeferred != null) ? this.unmutedDeferred.isResolved() : null;
            result['flashCameraSetupDeferred'] = (this.flashCameraSetupDeferred != null) ? this.flashCameraSetupDeferred.isResolved() : null;
            result['flashMicrophoneSetupDeferred'] = (this.flashMicrophoneSetupDeferred != null) ? this.flashMicrophoneSetupDeferred.isResolved() : null;
            result['cameras'] = this.cameras;
            result['microphones'] = this.microphones;
            
            result['diagnosticData'] = this.diagnosticData;
                        
            return result;
        },
        
        getCameras : function() {
            var cameraArray = this.remotingCall('getCameras', []);
            var cameras = [];
            for (var i = 0; i < cameraArray.length; i++) {
                cameras.push({
                    device : cameraArray[i][0],
                    selected : cameraArray[i][1] === 'true'
                });
            }
            this.cameras = cameras;
            
            return cameras;
        },
        
        getMicrophones : function() {
            var microphoneArray = this.remotingCall('getMicrophones', []);
            var microphones = [];
            for (var i = 0; i < microphoneArray.length; i++) {
                microphones.push({
                    device : microphoneArray[i][0],
                    selected : microphoneArray[i][1] === 'true'
                });
            }
            this.microphones = microphones;
            
            return microphones;
        },
        
        clearLocalStore : function() {
            this.remotingCall('clearLocalStore', []);
        },
        
        showCameraSettings : function() {
            this.remotingCall('showCameraSettings', []);
        },
        
        showMicrophoneSettings : function() {
            this.remotingCall('showMicrophoneSettings', []);
        }
    };
    
    window.OMSoftphoneBackendFlash = OMSoftphoneBackendFlash;
})(this, document);

// Flash callbacks

function OMSoftphoneBackendFlashCallbackOnRegisterFailure() {
    _omSoftphoneBackendFlash.remotingIncomingCall('registerFailure', []);
}

function OMSoftphoneBackendFlashCallbackRegisterResult(success, message) {
    _omSoftphoneBackendFlash.remotingIncomingCall('registerResult', [success, message]);
}

function OMSoftphoneBackendFlashCallbackPlaceCallResult(callId) {
    _omSoftphoneBackendFlash.remotingIncomingCall('placeCallResult', [callId]);
}

function OMSoftphoneBackendFlashCallbackCancelResult() {
    _omSoftphoneBackendFlash.remotingIncomingCall('cancelResult', []);
}

function OMSoftphoneBackendFlashCallbackAcceptResult(result) {
    _omSoftphoneBackendFlash.remotingIncomingCall('acceptResult', [result]);
}

function OMSoftphoneBackendFlashCallbackRejectResult() {
    _omSoftphoneBackendFlash.remotingIncomingCall('rejectResult', []);
}

function OMSoftphoneBackendFlashCallbackHangUpResult() {
    _omSoftphoneBackendFlash.remotingIncomingCall('hangUpResult', []);
}

function OMSoftphoneBackendFlashCallbackOnIncomingCall(userName, displayName, callId, receiveVideo, sendVideo) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onIncomingCall', [userName, displayName, callId, receiveVideo, sendVideo]);
}

function OMSoftphoneBackendFlashCallbackOnConnectionLost() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onConnectionLost', []);
}

function OMSoftphoneBackendFlashCallbackOnFault(fault) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onFault', [fault]);
}

function OMSoftphoneBackendFlashCallbackOnRemoteRinging() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onRemoteRinging', []);
}

function OMSoftphoneBackendFlashCallbackOnTrying() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onTrying', []);
}

function OMSoftphoneBackendFlashCallbackOnAccept() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onAccept', []);
}

function OMSoftphoneBackendFlashCallbackOnReject() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onReject', []);
}

function OMSoftphoneBackendFlashCallbackOnBusy() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onBusy', []);
}

function OMSoftphoneBackendFlashCallbackOnUnavailable() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onUnavailable', []);
}

function OMSoftphoneBackendFlashCallbackOnCancel() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onCancel', []);
}

function OMSoftphoneBackendFlashCallbackOnRemoteHangUp() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onRemoteHangUp', []);
}

function OMSoftphoneBackendFlashCallbackOnRemoteCameraMetadata(orientation) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onRemoteCameraMetadata', [orientation]);
}

function OMSoftphoneBackendFlashCallbackOnFlashReady() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onFlashReady', []);
}

function OMSoftphoneBackendFlashCallbackOnCameraEnabled() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onCameraEnabled', []);
}

function OMSoftphoneBackendFlashCallbackOnNoCamera() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onNoCamera', []);
}

function OMSoftphoneBackendFlashCallbackOnMicrophoneEnabled() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onMicrophoneEnabled', []);
}

function OMSoftphoneBackendFlashCallbackOnNoMicrophone() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onNoMicrophone', []);
}

function OMSoftphoneBackendFlashCallbackOnFlashSecurityShown() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onFlashSecurityShown', []);
}

function OMSoftphoneBackendFlashCallbackOnFlashSecurityDenied() {
    _omSoftphoneBackendFlash.remotingIncomingCall('onFlashSecurityDenied', []);
}

function OMSoftphoneBackendFlashCallbackOnMicrophoneCount(count) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onMicrophoneCount', [count]);
}

function OMSoftphoneBackendFlashCallbackOnCameraCount(count) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onCameraCount', [count]);
}

function OMSoftphoneBackendFlashCallbackOnStatusEvent(properties) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onStatusEvent', [properties]);
}

function OMSoftphoneBackendFlashCallbackOnReceivingRemoteVideo(width, height) {
    _omSoftphoneBackendFlash.remotingIncomingCall('onReceivingRemoteVideo', [width, height]);
}

function OMSoftphoneBackendFlashCallbackGetSoundUrl() {
    return _omSoftphoneBackendFlash.remotingIncomingCall('getSoundUrl', []);
}

function OMSoftphoneBackendFlashCallbackGetSoundShouldRepeat() {
    return _omSoftphoneBackendFlash.remotingIncomingCall('getSoundShouldRepeat', []);
}

function OMSoftphoneBackendFlashCallbackOnUpdateSoundDone() {
    _omSoftphoneBackendFlash.remotingIncomingCall('updateSoundDone', []);
}

function OMSoftphoneBackendFlashCallbackGetDefaultMicrophone() {
    return _omSoftphoneBackendFlash.remotingIncomingCall('getDefaultMicrophone', []);
}

function OMSoftphoneBackendFlashCallbackGetDefaultCamera() {
    return _omSoftphoneBackendFlash.remotingIncomingCall('getDefaultCamera', []);
}

function OMSoftphoneBackendFlashCallbackExitFullScreen() {
    _omSoftphoneBackendFlash.remotingIncomingCall('exitFullScreen', []);
}

function OMSoftphoneBackendFlashCallbackEnterFullScreen(width, height) {
    _omSoftphoneBackendFlash.remotingIncomingCall('enterFullScreen', [width, height]);
}

function OMSoftphoneBackendFlashCallbackOnSetRemoteRotationEnabled(isRemoteRotationEnabled) {
    _omSoftphoneBackendFlash.remotingIncomingCall('setRemoteRotationEnabled', [isRemoteRotationEnabled]);
}
