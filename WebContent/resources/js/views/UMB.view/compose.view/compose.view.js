define([
  'jquery',
  'underscore',
  'backbone',
  'ckeditor',
  'objects/http',
  'models/UMB.model/contact.model',
  'text!templates/UMB.template/compose.template/compose.template.html',
  'libs/jqueryfileupload/jquery.iframe-transport' 
], function ($, _, Backbone, CKEDITOR1, http, message, composeTemplate, fileUpload) {
	
	// private area.
	var oEditor, /*flagSend = false, flagSave= false,*/ arrReplayMail = [];
	
	function customEllipses(string){
		if (string.length > 70) {
			string = string.substring(0, 50);
		}
		return string + "...";
	}
	
	
	//On Mon, Jul 30, 2012 at 2:17 PM
	function formatDate(strMillisec) {
		
		var string, date, dateElems;
		
		date = new Date(parseInt(strMillisec));
		dateElems = date.toString().split(" ");
		
		string = "On " + dateElems[0] + ", " + dateElems[1] + " " + dateElems[2] + ", " + dateElems[3] + " at " + dateElems[4].match(/^\d{2}:\d{2}/);
		
		return string;
	}
	
	function createCkeditorInstance() {
		 
    	 // if we already have old CKEDITOR instance,
    	 // we must destroy it first before creating a new one.
    	if (CKEDITOR.instances['mailBody']) {
            delete CKEDITOR.instances['mailBody'];
        }
		
    	// create new instance.
		oEditor = CKEDITOR.replace('mailBody',
				{
					language: 'en',
					uiColor: '#F1F1F1',
					toolbar : [ [ 'Bold', 'Italic','Underline','-','BGColor','TextColor','-','NumberedList', 'BulletedList','-', 'Link', 'Unlink','-','Font','FontSize' ] ],
					height: 200,
			        width: 700,
			        enterMode : CKEDITOR.ENTER_DIV
			        //resize_enabled: false
		});

	}
	
	function populateEditorWithquotes(model) {
		//shay addition - todo ask alon/yoav/whatever
		if(!model)
			return;
	
		var _model, quotesList;
		
		// this container will hold all mails quotes html,
    	// that later will be inserted to the ckeditor.
    	var $container = $('<div id="quotes-container" style=""></div>');
    	
    	// TODO: use another element!!!.
    	$(document.body).append($container);
    	
    	// make a reference to the current model.
    	_model = model;
    	// get all threads.
    	quotesList = model.get('quotesList');
    	
    	// we have a problem with ckeditor - we can't get write mode('wysiwyg')
    	// only after a short timeout.
    	setTimeout(function() {
    		
    		if ( oEditor.mode == 'wysiwyg' )
        	{	
    			// recursively render all messages quotes.
    			for (var i=0; i<quotesList.length; i++) {
    			
    				var quote = quotesList[i];
    				
    				// temp stub.
    				 var $element = '<span style="float:left;font-size:12px;margin-left:10px" class="quote" dir="ltr">'+ formatDate(quote.attributes.sentDate) +', ' + quote.from[0].attributes.personal + '&lt;' + quote.from[0].attributes.address + '&gt; wrote:'
		 									
				        						+ '<br />'
				        						+ '<br />'
				        						+ '<span class="content" style="margin-left:5px">' + customEllipses(quote.content.plain) + '</span>'
				        						+ '<br />'
				        						+ '<br />'
			        							+ '<span id="quote_' + i + '" dir="ltr" style="float:left">'		
			        							
			        							+ '</span>'			
					        											
				        				+'</span>';	
    				 
    				 $container.html($element);
    				 $container = $('#quote_' + i);
    			}
    			
    			// although we attached all elements to the dom, it was only for convenient.
    			// using jquery was easy to make the recursive loop. but all we need is the html.
        		oEditor.insertHtml($("#quotes-container").html() );
        	
        		// remove from dom the original element which holds all the quotes html. 
        		$("#quotes-container").remove();
        		oEditor.focus();
        	}
    	}, 500);
	}
	
    var composeView = Backbone.View.extend({
        //el: ".spotlight",
        
        initialize: function() {
        	

        },
        
        events: {
        	"click #mail":  "mail",
        	"click #sms":  "sms",
        	"click #reply":  "reply",
        	"click #reply_to_all":  "reply_to_all",
        	"click #forward":  "forward",
        	"click #addCc":  "addCc",
        	"click #addBcc": "addBcc",
        	"click #editSubject": "editSubject",
        	"click #attachFile": "attachFile",
        	"click #discard": "discardMail",
        	"click #save": "saveMail",
        	"click #sendmail": "sendMail"
        },
        
        mail: function(e) {
        	$("#composeActionItems #sms").removeClass("selected");
        	$("#composeActionItems #mail").addClass("selected");	

        	$(".tabs-content .tab-content").each(function(n){
				$(this).removeClass("active");
			});
			$(".tabs-content #tabContent_reply").addClass("active");
			
			$('.subject').hide();
			$('#editSubject').show();
			
			$("#mailBody").hide();
			$("#cke_mailBody").show();
			
        },
        
        sms: function(e) {
        	$("#composeActionItems #mail").removeClass("selected");
        	$("#composeActionItems #sms").addClass("selected");	
        	
        	$(".tabs-content .tab-content").each(function(n){
				$(this).removeClass("active");
			});
			$(".tabs-content #tabContent_reply").addClass("active");
			
			$("#cke_mailBody").hide();
			$("#mailBody").show();

			$('.cc').hide();
			$('#addCc').show();	
			
			$('.bcc').hide();
			$('#addBcc').show();
			
			$('.subject').hide();
        },
        
        reply: function(e) {
        	
        	var replyToStr = "";
        	
        	for (var i=0; i<arrReplayMail.length; i++) {
    			replyToStr += arrReplayMail[i].attributes.address + ", ";
    		}
        	
        	$("#to").val(replyToStr);
        	
			$("#composeActionItems li").each(function(n){
				$(this).removeClass("selected");
			});
			$(this).addClass("selected");
			
			$(".tabs-content .tab-content").each(function(n){
				$(this).removeClass("active");
			});
			
			$("#composeActionItems #reply").addClass("selected");	
			$(".tabs-content #tabContent_reply").addClass("active");	
			
			$('.cc').hide();
			$('#addCc').show();	
			
			$('.bcc').hide();
			$('#addBcc').show();	
			
			$('.subject').hide();
			$('#editSubject').show();
        },
        
        reply_to_all: function(e) {
        	
        	var replyToStr = "";
        	
        	for (var i=0; i<arrReplayMail.length; i++) {
    			replyToStr += arrReplayMail[i].attributes.address + ", ";
    		}
        	
        	$("#to").val(replyToStr);
        	
        	$("#composeActionItems li").each(function(n){
				$(this).removeClass("selected");
			});
			$(this).addClass("selected");
			
			$(".tabs-content .tab-content").each(function(n){
				$(this).removeClass("active");
			});
			
			$("#composeActionItems #reply_to_all").addClass("selected");	
			//$(".tabs-content #tabContent_reply_to_all").addClass("active");		
			$(".tabs-content #tabContent_reply").addClass("active");	
			
			$('.cc').show();
			$('#addCc').hide();	
			
			$('.subject').hide();
			$('#editSubject').show();
			
			// populate the cc.
			this.populateCc();
        },
        
        
        forward: function(e) {
        	
        	$("#composeActionItems li").each(function(n){
				$(this).removeClass("selected");
			});
			$(this).addClass("selected");
			
			$(".tabs-content .tab-content").each(function(n){
				$(this).removeClass("active");
			});
			
			$("#composeActionItems #forward").addClass("selected");	
			//$(".tabs-content #tabContent_forward").addClass("active");		
			$(".tabs-content #tabContent_reply").addClass("active");	
			
			$('.cc').hide();
			$('#addCc').show();	
			
			$('.bcc').hide();
			$('#addBcc').show();
			
			$('.subject').show();
			$('#editSubject').hide();
			
			$("#to").val('');
        },
		
		addCc: function(){		
			$('.cc').show();
			$('#addCc').hide();	
		},
		
		addBcc: function(){		
			$('.bcc').show();
			$('#addBcc').hide();	
		},
		
		editSubject: function(){
			console.log("editSubject");
			$('.subject').show();
			$('#editSubject').hide();			
		},
		
		discardMail: function(){
			$('.mi-bottom-section-compose').hide();
        	$('.mi-bottom-section').show();
		},
		
		saveMail: function(){
			
			//if (!flagSave) {
				
			var objEditor = CKEDITOR.instances["mailBody"];
			var q = objEditor.getData();
			//var q = objEditor.getHTML();
			
			var attach = new Array();
			var count = 1;
			$(".actionOptions input.attachmentCheckbox:checked").each(function(n){

				var tmpAttach = {
						uploadfilename: $(this).attr('uploadfilename'),
						serverfilename: $(this).attr('serverfilename')		
				};
				attach.push(tmpAttach);
				count++;
				
			});
			var attachments = {
					attachments: JSON.stringify(attach)
			};
			var fromEmail = this.model ? this.model.attributes.from[0].attributes.address : ""; 
			
			var data = {
					to: $('#to').val(),
					cc: $('#cc').val(),
					bcc: $('#bcc').val(),
					from: fromEmail,
					subject: $('#subject').val(),
					attachments: JSON.stringify(attach),
					content: q	
			};
						
			http.doAjax(data,'saveMail');	
			//}
			//flagSave = true;
		},
		
		sendMail: function(){
			
			console.log("inside sendMail");
			
			//if(!flagSend){
			var objEditor = CKEDITOR.instances["mailBody"];
			var q = objEditor.getData();
			//var q = objEditor.getHTML();
			
			var attach = new Array();
			var count = 1;
			$(".actionOptions input.attachmentCheckbox:checked").each(function(n){

				var tmpAttach = {
						uploadfilename: $(this).attr('uploadfilename'),
						serverfilename: $(this).attr('serverfilename')		
				};
				attach.push(tmpAttach);
				count++;
				
			});
			var attachments = {
					attachments: JSON.stringify(attach)
			};
			
			var fromEmail = this.model ? this.model.attributes.from[0].attributes.address : ""; 
			
			var data = {
					to: $('#to').val(),
					cc: $('#cc').val(),
					bcc: $('#bcc').val(),
					from: fromEmail,
					subject: $('#subject').val(),
					attachments: JSON.stringify(attach),
					content: q	
			};
						
			http.doAjax(data,'sendMail');	
			//}
			//flagSend = true;
		},
		
		attachFile: function() {
			$("#fileInput").trigger("click");
		},
		
		/*renderWithMode_reply: function() {
			$("#reply").addClass("selected").siblings().removeClass("selected");
		},
		renderWithMode_replyAll: function() {
			$("#reply_to_all").addClass("selected").siblings().removeClass("selected");
			//this["reply_to_all"]();
		},
		renderWithMode_forward: function() {
			$("#forward").addClass("selected").siblings().removeClass("selected");
		},*/
		populateCc: function() {
			var allRecipientsStr = "";
			_.each(this.model.get('allRecipients'), function(currentElement, index) {
				allRecipientsStr += currentElement.attributes.address;
				allRecipientsStr += ", ";
			});
			$("#cc").val(allRecipientsStr);
		},
		setReplayMailProp:function (data){
			arrReplayMail = data;
			
		},
		
		/*
		 * when the compose is being called from the router
		 * we pass the .spotlight class elemnt and we make the append inside the view.
		 * if we open the compose from the message itself, the param is undefined.
		 * */
        render: function ($container) 
        {
        	var mode;
        	
        	this.$el.html(_.template(composeTemplate));
        	
        	if (!_.isUndefined($container)) {
        		$container.empty().append(this.el);
        	}
        	
        	
        	if (this.options && this.options.fromRouter) {
        		$("#reply_to_all").hide();
        		$("#forward").hide();
        		$("#reply").hide();
        		$(".subject").show();
         	} else{
        		$("#mail").hide();
        		$("#sms").hide();
        		$(".subject").hide();
        		
        	}
        	
        	
        	createCkeditorInstance();  	
        	
        	if(this.model) {
        		
	        	populateEditorWithquotes(this.model);
	        	
	        	mode = this.model.get('mode');
	        	this[mode]();
	     	
        	}
        		
        	this.$("#fileInput").fileupload({
        		 url: window.fuse.baseUrl+"umb/messages/uploadAttachment",
        		 sequentialUploads: true
        	})
        	.bind("fileuploadadd", function (e, data) {
        		$.each(data.files, function(index,file){
        			$("#attachFile").before("<span uploadFileName=\""+file.name+"\" class=\"file-upload-row\"><span class=\"file-upload-loader float\"></span><span class=\"float\">"+file.name+" "+(file.size/1000).toFixed(2)+"KB</span></span>");
        		});
        		
        		$("#attachFile").empty().append("attach another file")
        		
        	})
        	.bind("fileuploadfail", function (e, data) {
        		alert("HTTP error uploading the file");
        	})
        	.bind("fileuploaddone", function (e, data){
        		if(data.result.error){
        			//alert("error attaching file: "+data.files[0].name);
        		}
        		else{
        			//change to checkbox
        			var serverFileName = data.result.data;
        			var fileName = data.files[0].name;
        			$("span[uploadFileName='"+fileName+"']").find(".file-upload-loader").remove();
        			$("span[uploadFileName='"+fileName+"']").last().prepend("<span class=\"float\" style=\"margin-right:3px;\"><input type=\"checkbox\" class=\"attachmentCheckbox\" uploadFileName=\""+fileName+"\" serverFileName=\""+serverFileName+"\" checked /> </span>");
        		}
        	});
        
        	return this;
        }
    });
    
    return composeView;
});
