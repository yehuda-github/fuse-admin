/**
 * 
 */
package com.realcommerce.fuseweb.app.entities.session;

import java.awt.HeadlessException;
import java.net.UnknownHostException;

import com.amdocs.fuse.common.apigateway.response.XmppBaseResponse;
import com.amdocs.fuse.common.xmppoutlet.dto.FuseEventDelivery;
import com.amdocs.fuse.communication.FuseEvent;
import com.amdocs.fuse.communication.exchangedata.CommandBuilder.CommandType.CommandTypeId;
import com.amdocs.fuse.communication.exchangedata.ContactDataDefinition.Presence;
import com.amdocs.fuse.communication.exchangedata.EventBuilder.EventType.EventTypeId;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.ClassOfService;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.Customer;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.Device;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.GetUserDetailsAdminEventParams;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.ServiceSummary;
import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.UserDetails;
import com.amdocs.fuse.utils.Environment;
import com.amdocs.fuse.utils.Environment.Server;
import com.amdocs.hub.common.apigateway.common.ApiGatewayException;

/**
 * @author MOSHEA (Moshe Avdiel Levy)
 * <dt>	Created:
 * <dd>	Feb 21, 2013
 *
 */
@Environment(Server.Integ_01)
public class GetUserDetailsAdminMain extends ApiGatewayMainBase {

	/**
	 * @param args
	 * @throws HeadlessException
	 * @throws UnknownHostException
	 */
	public GetUserDetailsAdminMain(String[] args) throws HeadlessException, UnknownHostException {
		super(args);
	}

	/**
	 * ---[  main  ]---
	 *
	 * @param args
	 * @throws UnknownHostException 
	 * @throws HeadlessException 
	 * @throws ApiGatewayException 
	 */
	public static void main(String[] args) throws HeadlessException, UnknownHostException, ApiGatewayException {

		GetUserDetailsAdminMain main = new GetUserDetailsAdminMain(args);
		main.getUserDetailsAdmin("acc81477-d");
		
	}

	
	private void getUserDetailsAdmin(String fuseId) throws ApiGatewayException {
		
		XmppBaseResponse response = executeCommand(CommandTypeId.GET_USER_DETAILS_ADMIN_REQUEST, "", fuseId, null);
		
		for (FuseEventDelivery fuseEventDelivery  :response.getFuseCommandResponse().getFuseEventDeliveries()) {
			FuseEvent fuseEvent = fuseEventDelivery.getFuseEvent();
			if (fuseEvent.getFuseEventType().getEventId() == EventTypeId.GET_USER_DETAILS_ADMIN_EVENT) {
				GetUserDetailsAdminEventParams eventParams = (GetUserDetailsAdminEventParams) fuseEvent.getData();
				UserDetails userDetails = eventParams.getUserDetails();
				
				System.out.println("------------------------------------------------------[  HEADER  ]--------------------------------------------------------------------");
				System.out.println("Presences:");
				for (Presence presence: userDetails.getPresencesList()) {
					System.out.println(presence.getSocialNetworkAccount().getSocialNetworkId() + ": " + presence.getMyPresenceStatus());
				}

				System.out.println("ImageSize: " + userDetails.getImageBuffer().size() + "   FuseID: " + userDetails.getFuseId() + "    Name: " + userDetails.getDisplayName());
				System.out.println();
				System.out.println("----------------[  General Details  ]--------------------------");
				System.out.println("External ID ...........: " + userDetails.getExternalId());
				System.out.println("User Status ...........: " + userDetails.getUserState() + " Last Change Timestamp: " + userDetails.getUserStatusTimestamp());
				System.out.println();
				System.out.println("------------------------------------------------------[  Accounts  ]------------------------------------------------------------------");
				for (Customer customer: userDetails.getCustomersList()) {
					System.out.println("Customer Type: " + customer.getCustOperator() + "  |  Customer ID: " +  customer.getCustID() + "  |  Status: "  + customer.getCustStatus());
				}
				System.out.println();
				System.out.println("------------------------------------------------------[  Devices  ]-------------------------------------------------------------------");
				System.out.println();
				for(Device device: userDetails.getDevicesList()) {
					System.out.println("Device Type: " + device.getDeviceType() + "  |  OS: " + device.getOsType() + "  |  Connection Status: " + device.getDeviceConnectionStatus() + "  |  App.Ver: " + device.getAppVersion());					
				}
				System.out.println();
				System.out.println("------------------------------------------------------[  Class Of Service  ]----------------------------------------------------------");
				System.out.println();
				ClassOfService classOfService = userDetails.getClassOfService();
				System.out.println(" Class Of Service Type .....: " + classOfService.getServiceLevel());
				System.out.println(" Class Of Service Source ...: " + classOfService.getSource());
				System.out.println(" Subscription Start Date ...: " + classOfService.getServiceStartDateTime());
				System.out.println(" Subscription End Date .....: " + classOfService.getServiceEndTDateime());
				System.out.println();
				System.out.println("------------------------------------------------------[  Activity  ]------------------------------------------------------------------");
				System.out.println();
				System.out.println(" Registration Date .........: " + userDetails.getRegistrationDate() );
				System.out.println(" Last Login ................: " + userDetails.getLastLogin());
				System.out.println();
				System.out.println("------------------------------------------------------[  Services  ]------------------------------------------------------------------");
				System.out.println();
				for(ServiceSummary service: userDetails.getServicesList()) {
					System.out.println("Service Type: " + service.getSocialNetworkId() + "  [" + service.getUserId() + "]");
				}
				System.out.println();
				System.out.println("--------------[  END OF USER DETAILS  ]------------------");
			}
		}
		
	}
}
