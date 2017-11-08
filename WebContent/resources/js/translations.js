define(['jquery'], function ($) {
    var translations = {
    };
    
    var popup = {
		addNewMail:{
			TITLE: "Add email address",
			FIELD_ACCOUNT: "Account",
			FIELD_NAME: "Name",
			FIELD_ADDRESS: "Address",
			FIELD_PASSWORD: "Password",
			FIELD_POP_SERVER: "POP Server",
			FIELD_POP_SERVERTYPE: "Server Type",
			FIELD_POP_PORT: "Port",
			FIELD_POP_SSL: "SSL",
			FIELD_POP_HOSTNAME: "Host Name",
			REQUIRED_FIELD: "Required",
			BTN_CANCEL: "Cancel",
			BTN_ADD_CONTACT: "Add Account",
			ACCOUNT_OPTION_GMAIL: "Gmail",
			ACCOUNT_OPTION_YAHOO_MAIL: "Yahoo! Mail",
			ACCOUNT_OPTION_WINDOWS_LIVE_HOTMAIL: "Windows Live Hotmail",
			ACCOUNT_OPTION_OTHER: "Other",
			VALIDATE_HOSTNAME: "Please enter hostname address",
			VALIDATE_ADDRESS: "Please enter a valid email address",
			VALIDATE_PASSWORD: "Please choose a password for your account",
		}
    };
    
    var view = {
		settings: {
			SETTINGS_LEFT_MENU_TITLE: "Display option:",
			SETTINGS_LEFT_MENU_ACCOUNT_STTINGS_LINK: "Account Settings",
			SETTINGS_LEFT_MENU_PRIVACY_SETTINGS_LINK: "Privacy Settings",
			SETTINGS_LEFT_MENU_MAILBOX_STTINGS_LINK: "Mailbox Settings",
			SETTINGS_LEFT_MENU_PROFILE_LINK: "Profile",
			ACCOUNT_SETTINGS_MAIN_TITLE: "Account Settings",
			EMAIL_ADDRESSES_TITLE: "Email addresses",
			EMAIL_ADDRESSES_SEND_MAIL_FROM_TITLE: "Send mail from:",
			EMAIL_ADDRESSES_SEND_MAIL_FROM_DESCRIPTION: "Messages will be sent by default from the primary address. There will always be an option to switch addresses.",
			EMAIL_ADDRESSES_PRIMARY_EMAIL_OPTION: "primary",
			EMAIL_ADDRESSES_MAKE_EMAIL_PRIMARY_OPTION: "make primary",
			EMAIL_ADDRESSES_ADD_EMAIL_ADDRRESS_BTN: "add email address",
			EMAIL_ADDRESSES_REMOVE_BTN: "remove",
			EMAIL_ADDRESSES_REPLY_FROM_TITLE: "Reply from:",
			EMAIL_ADDRESSES_REPLY_FROM_SENT_EMAIL_OPTION: "email address that the message was sent to",
			EMAIL_ADDRESSES_REPLY_FROM_PRIMARY_EMAIL_OPTION: "primary email address (currently {0})",
			SNIM_ACCOUNTS_TITLE: "Social networks and IM accounts",
			SNIM_ACCOUNTS_DESCRIPTION: "Whether other users see you as available to chat. Turn off presence to log out from a specific service.",
			SNIM_ACCOUNTS_GTALK_TAB_BTN: "Google Talk",
			SNIM_ACCOUNTS_YAHOO_CHAT_TAB_BTN: "Yahoo Chat",
			SNIM_ACCOUNTS_FACEBOOK_CHAT_TAB_BTN: "Facebook Chat",
			SNIM_ACCOUNTS_MESSENGER_TAB_BTN: "Messenger",
			
			SNIM_ACCOUNTS_GTALK_TAB_TITLE: "Connect to Google talk:",
			SNIM_ACCOUNTS_GTALK_TAB_USERNAME_INPUT: "User name:",
			SNIM_ACCOUNTS_GTALK_TAB_PASSWORD: "Password:",
			SNIM_ACCOUNTS_GTALK_TAB_CONNECT_BTN: "Connect",
			
			SNIM_ACCOUNTS_YAHOO_TAB_TITLE: "Connect to Yahoo! Chat:",
			SNIM_ACCOUNTS_YAHOO_TAB_USERNAME_INPUT: "User name:",
			SNIM_ACCOUNTS_YAHOO_TAB_PASSWORD: "Password:",
			SNIM_ACCOUNTS_YAHOO_TAB_CONNECT_BTN: "Connect",
			
			SNIM_ACCOUNTS_MESSANGER_TAB_TITLE: "Connect to Messanger:",
			SNIM_ACCOUNTS_MESSANGER_TAB_USERNAME_INPUT: "User name:",
			SNIM_ACCOUNTS_MESSANGER_TAB_PASSWORD: "Password:",
			SNIM_ACCOUNTS_MESSANGER_TAB_CONNECT_BTN: "Connect",
			
			SNIM_ACCOUNTS_FACEBOOK_TAB_TITLE: "Connect to Facebook Chat:",
			SNIM_ACCOUNTS_FACEBOOK_TAB_USERNAME_INPUT: "User name:",
			SNIM_ACCOUNTS_FACEBOOK_TAB_PASSWORD: "Password:",
			SNIM_ACCOUNTS_FACEBOOK_TAB_CONNECT_BTN: "Connect"
		},
		
		umbFoldersTree: {
			BTN_COMPOSE: "Compose",
			BTN_EDIT: "edit",
			SETTINGS_FOLDER_ITEM: "Settings",
			BTN_CREATE_NEW_FOLDER: "Create New Folder",
			CREATE_NEW_FOLDER_FORM_INPUT_DEFAULT: "New Folder",
			CREATE_NEW_FOLDER_FORM_BTN_CREATE: "create",
			CREATE_NEW_FOLDER_FORM_BTN_CANCEL: "cancel",
			EDIT_MODE_OK_BTN: "ok"
		},
		
		umbSelectedFolderMessages: {
			FIRST_LAST_VIEWD_MESSAGES_SEPERATOR: "-",
			TOTAL_MESSAGES_SEPERATOR: "out of",
			empty_message_prt1: "your ",
			empty_message_prt2: "  is looking empty. Why don't you try ",
			empty_message_prt3: "adding another account",
			empty_message_prt4: "?",
			empty_trash_prt1: "Empty Trash",
			empty_trash_prt2: " (messages in the Trash folder are deleted permanently after 30 days)",
			lng_umb_back: "back",
			lng_umb_unselectAll: "unselect all",
			lng_umb_delete: "delete",
			lng_umb_spam: "spam",
			lng_umb_moveTo: "move to folder",
			lng_umb_markUnread: "mark as unread",
			lng_umb_markUnreado: "mark as unread",
			lng_umb_markReado: "mark as read",
			lng_UMB_noItemSelected: "There are no item selected",
			lng_UMB_sellectAll: "Select All"			
		},
		
		umbQuota: {
			USAGE_DATA_FIRST_PART: "using",
			USAGE_DATA_SECOND_PART: "MB out of your",
			USAGE_DATA_THIRD_PART: "MB",
		}		
    };
    
    var changeText = function(sectionlngPack) {
    	sectionlngPack = sectionlngPack ? sectionlngPack : translations;
    	var tmpJqureyObg, currentText;
    	
    	for(var item in sectionlngPack) {
    		tmpJqureyObg = $("." + item);
    		currentText = sectionlngPack[item];
    		
    		if(tmpJqureyObg.attr("alt") || tmpJqureyObg.attr("title")) {
    			tmpJqureyObg.attr("alt", currentText);
    			tmpJqureyObg.attr("title", currentText);
    		}
    		else {
    			if(tmpJqureyObg.is("input:text")) {
    				tmpJqureyObg.val(currentText);
    			}
    			else {
    				tmpJqureyObg.text(currentText);
    			}
    		}
    	}
    };
    
    return ({
    	changeText: changeText,
    	popup: popup,
	    view: view,
	    translations: translations
	});
});

