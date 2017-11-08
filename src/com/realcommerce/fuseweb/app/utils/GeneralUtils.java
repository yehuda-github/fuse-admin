package com.realcommerce.fuseweb.app.utils;

import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpSession;

import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.PacketExtension;

import com.amdocs.fuse.common.apigateway.request.XmppBaseRequest;
import com.amdocs.fuse.common.apigateway.response.XmppBaseResponse;
import com.amdocs.fuse.communication.FuseEvent;
import com.amdocs.fuse.communication.commands.FuseCommand;
import com.amdocs.fuse.communication.exchangedata.CommandBuilder.CommandType;
import com.amdocs.fuse.communication.exchangedata.CommandBuilder.CommandType.CommandTypeId;
import com.amdocs.fuse.communication.exchangedata.ContactDataDefinition.Contact;
import com.amdocs.fuse.communication.exchangedata.ContactDataDefinition.ContactPresence;
import com.amdocs.fuse.communication.exchangedata.ErrorDataDefinition.ErrorEventParams;
import com.amdocs.fuse.communication.exchangedata.GroupDefinition.Group;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.GetUserDetailsAdminEventParams;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.GetUserDetailsAdminRequestParams;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.UserDetails;
import com.amdocs.fuse.communication.transport.MessageConverter;
import com.amdocs.hub.common.apigateway.common.ApiGatewayException;
import com.amdocs.hub.common.apigateway.interfaces.IApiGatewayFacade;
import com.amdocs.hub.common.um.dto.user.Identifier;
import com.amdocs.hub.common.um.dto.user.IdentifierType;
import com.amdocs.hub.common.um.dto.user.User;
import com.google.protobuf.GeneratedMessageLite;

public class GeneralUtils {
	
	private final static GeneralUtils INSTANCE = new GeneralUtils();


	/**
	 * SingleTon Stuff
	 */
	private GeneralUtils(){

	}

	public static GeneralUtils getInstance(){
		return INSTANCE;
	}

	public UserDetails getUserDetailsDataFunc(
			HttpSession pSession, IApiGatewayFacade pService, String userId) {
		
		GetUserDetailsAdminEventParams result = null;
		UserDetails retVal = null;
		
		try 
		{
			

			
			 GetUserDetailsAdminRequestParams requestParams = GetUserDetailsAdminRequestParams.newBuilder()

                     .setFuseId(userId)

                     .build();
			 
				FuseCommand command = new FuseCommand(CommandType.
						newBuilder().
						setCommandId(CommandTypeId.GET_USER_DETAILS_ADMIN_REQUEST),
						requestParams);
			
			
			result = callFuseBeApi(pService, userId, command, GetUserDetailsAdminEventParams.class);
			
			if(result!=null){
				retVal = result.getUserDetails();
			}
		
		} catch (Exception e) {
			System.out.println("FuseBEUtils.java -- getAllContacts, exception");
			
		}
		
		
		return retVal;
	}
	
	
	private static <T extends Object> T callFuseBeApi(IApiGatewayFacade apigwFacade,
			String userIdentifier, FuseCommand fuseCommand, Class<T> pClass) {
			XmppBaseRequest<GeneratedMessageLite> apiGatewayRequest = buildXmppBaseRequest(
					fuseCommand, "");
			System.out.println("----------------- user Id:" + userIdentifier);
			apiGatewayRequest.setFuseID(userIdentifier);
			T returnValue = null;
			try {
				//make API call
				XmppBaseResponse apiGatewayResponse = (XmppBaseResponse) apigwFacade
						.invokeApiCall(apiGatewayRequest);
				//convert XmppBaseResponse to <T> for return
				Set<String> fuseEventXmls = ((XmppBaseResponse) apiGatewayResponse)
						.getFuseEventXmls();
				if (fuseEventXmls != null) {
					//EventTypeId fuseEventTypeId;
					for (String eventPacketExtensionXml : fuseEventXmls) {
						FuseEvent fuseEvent = MessageConverter
								.retrieveEvent(eventPacketExtensionXml);
						GeneratedMessageLite eventData = (GeneratedMessageLite) fuseEvent
								.getData();
						
						//cast with reflection to T and return
						if(pClass.isAssignableFrom(eventData.getClass())){
							returnValue = pClass.cast(eventData);
							System.out.println("GeneralUtils.callFuseBeApi() -- userIdentifier: " + 
								userIdentifier + " fuseCommand: " + fuseCommand.getCommandType().getCommandId().name() + " class: " + pClass.getName() + "Status success true");
							
						}
						else if(ErrorEventParams.class.isAssignableFrom(eventData.getClass())){
							System.out.println("GeneralUtils.callFuseBeApi() - ErrorEventParams -- userIdentifier: " + 
									userIdentifier + " fuseCommand: " + fuseCommand.getCommandType() + " class: " + pClass.getName());
						}
						
					}
				}
			} catch (ApiGatewayException e) {
				/*Log4J.getInstance().addToLog("FuseBEUtils.java -- callFuseBeApi",e);*/
			}
			
			
			return returnValue;
		}
	
	private static XmppBaseRequest<GeneratedMessageLite> buildXmppBaseRequest(
			FuseCommand fuseCommand, String userIdentifier) {
		Message message = (Message) MessageConverter
				.generateMessage(fuseCommand);
		PacketExtension commandPacketExtension = MessageConverter
				.retrieveCommandPacketExtension(message);
		return new XmppBaseRequest<GeneratedMessageLite>(
				commandPacketExtension.toXML(), userIdentifier, IdentifierType.WEB_XMPP);
	}
	
	
	  public Identifier findExternalIdentifier(User user) {

          boolean found = false;

          Identifier externalIdentifier = null; // Default if not found.

          Iterator<Identifier> identifierItr  =  user.getIdentifiers().iterator();

          while (identifierItr.hasNext() & !found) {

                 Identifier identifier = identifierItr.next();

                 found = ( IdentifierType.EXTERNAL_ID == identifier.getType() );

                 if (found) {

                       externalIdentifier = identifier;
                 }
          }

          return externalIdentifier;
   }
	
	
}
