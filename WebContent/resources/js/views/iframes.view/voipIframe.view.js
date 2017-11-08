define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
      var voipIframeView = Backbone.View.extend({
          el: "#voipIframe",
          
          iframeData: window.fuse.iframesData.voipIframe,
          
          iframeSizes: {
        	  closed: {"height":"0px"},
        	  minimized: {"width":"250px", "height":"35px"},
        	  small: {
        		  video:{"width":"250px","height":"370px"},
        		  voice:{"width":"250px","height":"220px"}
        	  },
        	  big: {"width":"1280px","height":"653px"}
          },
          
          containerPosition: {
        	  collapsed: {"top": "", "left": "913px"},
        	  expanded: {"top": "0", "left": "0"},
        	  top: {"top": ""},
        	  left: {"left": "913px"}
          },
          
          render: function () {
          	this.$el.html("<iframe id='" + this.iframeData.iframeId + "Frame' scrolling='no' name='" + this.iframeData.iframeId + "Frame' src='" + this.iframeData.iframeUrl + "' frameborder='0'></iframe>");
          },
          initialize:function(){
        	 
        	  //subscribe to call start call end maximaze, normal, mininal view
        	  $.subscribe("OMAnsweredMessage",$.proxy(function(e, type){
        		//  console.log("==================OMAnsweredMessage from voipIframe.view.js type = "+type);
        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.collapsed);
        		  
        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.css(this.iframeSizes.small[type]);
        		  
        	  }, this));
        	  
        	  $.subscribe("OMRemoteEndedMessage",$.proxy(function(){
        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.collapsed);

        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.css(this.iframeSizes.minimized);
        	  }, this));
        	  
        	  $.subscribe("OMLocalEndedMessage",$.proxy(function(){
        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.collapsed);

        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.css(this.iframeSizes.minimized);
        	  }, this));
        	  
        	  $.subscribe("VoipIframeCloseMessage",$.proxy(function(){
        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.animate(this.iframeSizes.closed, 1200);

        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.top).animate(this.containerPosition.left, 600);
        	  }, this));
        	  
        	  $.subscribe("VoipIframeMinimizeMessage",$.proxy(function(){
        		 
        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  var objAnimate = this.iframeSizes.minimized; 
        		 
	       		  if(parseInt(voipIframe.css("height").replace("px","")) < 40){
	       			  objAnimate = this.iframeSizes.small["video"];
	       		  }
	       		  
        		  voipIframe.animate(objAnimate, 600);

        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.top).animate(this.containerPosition.left, 600);
        	  }, this));
        	  
        	  $.subscribe("VoipIframeMaximazeVideoCall",$.proxy(function(){
        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.animate(this.iframeSizes.big, 1200);

        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.animate(this.containerPosition.expanded, 600);
        	  }, this));
        	  
        	  $.subscribe("VoipIframeNormalVideoCall", $.proxy(function(){
        		  var voipIframe = $("#"+  window.fuse.iframesData.voipIframe.iframeId+"Frame");
        		  voipIframe.animate(this.iframeSizes.small["video"], 600);

        		  var voipdiv= $("#"+window.fuse.iframesData.voipIframe.iframeId);
        		  voipdiv.css(this.containerPosition.top).animate(this.containerPosition.left, 600);
        	  }, this));
        	  
        	  $.subscribe("OMLocalRingingMessage", $.proxy(function(e, type){
        		//  console.log("---------Local Ringing Message from voipIframe.view.js");
        	  }, this));
          }
      });
      
      return voipIframeView;
  });

