// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  urlArgs: (location.search.indexOf("nocache=true") > - 1 ? ("appVersion=" + (new Date()).getTime()) : ""),
  paths: {
	jquery: 'libs/jquery-1.7.1',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    jqxcore: 'libs/jqxwidgets/jqxcore',
    paginator: 'libs/backbone.paginator',
    order: 'libs/order',
    text: 'libs/text',
    ckeditor: 'libs/ckeditor/ckeditor',
    templates: '../templates'
  }
});

if(!String.prototype.format) {
	String.prototype.format = String.prototype.f = function() {
	    var s = this,
	        i = arguments.length;

	    while (i--) {
	        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	    }
	    return s;
	};
}

window.fuse.isMainFrame= true;

window.fuse.iframesData = { 
	fuseIframe: {
		iframeUrl: window.fuse.baseUrl+"umb/index",
		proxyUrl: window.fuse.baseUrl+"umb/fuseProxy",
		targetIframe: "parent",
		iframeId: "parent"
	},
	voipIframe: {
		iframeUrl: window.fuse.baseUrl+"/voip/index",
		proxyUrl: window.fuse.baseUrl+"/voip/voipProxy",
		targetIframe: window.fuse.isMainFrame === true ? "frames['voipIframe']": "parent.frames['voipIframeFrame']",
		iframeId: "voipIframe"
	},
	rightIframe: {
		iframeUrl: window.fuse.baseUrl+"rightIframe/index",
		proxyUrl: window.fuse.baseUrl+"/rightIframe/rightIframeProxy",
		targetIframe: window.fuse.isMainFrame === true ? "frames['rightIframe']": "parent.frames['rightIframe']",
		iframeId: "rightIframe"
	}
};


window.fuse.services = {
	emptyTrash: function(){
		return (window.fuse.baseUrl+"umb/folders/emptyTrash");
	},
	accounts: function() {
		return(window.fuse.baseUrl+"umb/settings/accounts/list");
	},
	
	folders: function() {
		return(window.fuse.baseUrl+"umb/folders/list");
	},
	
	deleteFolder: function() {
		return(window.fuse.baseUrl+"umb/folders/delete");
	},
	
	quota: function() {
		var _url = window.fuse.baseUrl+"umb/folders/getFolderDetails?folderName={0}";
		_url = _url.format(window.fuse.selectedFolderAlias);
		return(_url);
	},
	
	messages: function() {
		var _url = window.fuse.baseUrl+"umb/messages/list?folderPath={0}";
		_url = _url.format(window.fuse.selectedFolderAlias);		
		return(_url);
	},
	
	settings: function() {
		//settings: "/fuse/umb/settings/preferences/isReplyFromPrimary",
		return(window.fuse.baseUrl+"umb/settings/preferences/isReplyFromPrimary");
	},
	makePramiryAccount:function(){
		return(window.fuse.baseUrl+"umb/settings/accounts/makePrimary/");
	},
	removeAccount:function(){
		return(window.fuse.baseUrl+"umb/settings/accounts/delete/");
	},
	addIMFacebookAccount:function(){
		return window.fuse.baseUrl+"umb/settings/accounts/addFacebook";
	},
	addIMSNAccount:function(){
		return window.fuse.baseUrl+"umb/settings/accounts/addMSN/";
	},
	addAccount: function(){
		return window.fuse.baseUrl+"umb/settings/accounts/add/";
	},
	filtter:  function() {
		return(window.fuse.baseUrl+"umb/settings/accounts/list");
	},
	
	moveToFolder: function() {
		return(window.fuse.baseUrl+"umb/messages/move");
	},
	
	getBody: function() {
		return(window.fuse.baseUrl+"umb/messages/read");
	},

	markAsRead: function() {
		return(window.fuse.baseUrl+"umb/messages/markAsRead");
	},
	
	markAsUnRead: function() {
		return(window.fuse.baseUrl+"umb/messages/markAsUnRead");
	},
	inbox: function() {
		return("/folder/inbox");
	}
};

window.fuse.popup = function(d){
	
	/* usage.
	 * 
	 * window.fuse.popup({
	 * 		title 		: title for popup message
	 * 		body 		: body text for popup message
	 * 		callback 	: callback function (pub/sub)
	 * 		params		: additional params
	 * }
	 * 
	 */
	
	$('body').append('<div class="blockModalPopup"></div>');
	$('body').append('<div class="appPopup"></div>');
	$('.appPopup').append('<div class="appPopupHeader"></div>');
	$('.appPopupHeader').append('<div class="appPopupTitle">'+d.title+'</div>');
	$('.appPopupHeader').append('<div class="appPopupCloseBtn" style="cursor:pointer;"></div>');
	$('.appPopupHeader').append('<div style="clear:both;"></div>');
	$('.appPopup').append('<div class="appPopupContent"></div>');
	$('.appPopupContent').append('<div style="padding:25px; font-size:14px;">'+d.body+'</div>');
	$('.appPopup').append('<hr />');
	$('.appPopup').append('<div class="appPopupFooter"></div>');
	$('.appPopupFooter').append('<div class="appPopup_button">Yes</div>');
	$('.appPopupFooter').append('<div class="appPopup_button2">No</div>');
	
	$('.appPopup_button').click(function(){
		$.publish(d.callback,d.params);
		$('.blockModalPopup').remove();
		$('.appPopup').remove();
	});
	
	$('.appPopup_button2').click(function(){
		$('.blockModalPopup').remove();
		$('.appPopup').remove();
	});
	$('.appPopupCloseBtn').click(function(){
		$('.blockModalPopup').remove();
		$('.appPopup').remove();
	});
	
};

require([
  // Load our app module and pass it to our definition function
  'app'
  
  // Some plugins have to be loaded in order due to their non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
