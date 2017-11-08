/**
 * 
 */
package com.realcommerce.fuseweb.app.entities.session;

import java.awt.HeadlessException;
import java.net.UnknownHostException;
import java.util.List;

import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.PacketExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.amdocs.fuse.common.apigateway.dto.Credential;
import com.amdocs.fuse.common.apigateway.dto.ServiceType;
import com.amdocs.fuse.common.apigateway.request.ValidateAccessTokenRequest;
import com.amdocs.fuse.common.apigateway.request.XmppBaseRequest;
import com.amdocs.fuse.common.apigateway.response.ValidateAccessTokenResponse;
import com.amdocs.fuse.common.apigateway.response.XmppBaseResponse;
import com.amdocs.fuse.common.util.Identifiers;
import com.amdocs.fuse.communication.commands.FuseCommand;
import com.amdocs.fuse.communication.exchangedata.CommandBuilder.CommandType;
import com.amdocs.fuse.communication.exchangedata.CommandBuilder.CommandType.CommandTypeId;
import com.amdocs.fuse.communication.transport.MessageConverter;
import com.amdocs.fuse.utils.EnvironmentUtil;
import com.amdocs.hub.common.apigateway.common.ApiGatewayException;
import com.amdocs.hub.common.apigateway.dto.ApiGatewayResponse;
import com.amdocs.hub.common.apigateway.interfaces.IApiGatewayFacade;
import com.google.protobuf.GeneratedMessageLite;

/**
 * @author MOSHEA (Moshe Avdiel Levy)
 * <dt>	Created:
 * <dd>	Dec 19, 2012
 *
 */
public class ApiGatewayMainBase {

	protected ApplicationContext context;
	protected IApiGatewayFacade apiGatewayFacade;
	
	public ApiGatewayMainBase(String[] args) throws HeadlessException, UnknownHostException {
		init(args);
	}
	
	private void init(String[] mainArgs) {

		EnvironmentUtil.setFuseCmDir(this, mainArgs);
		
		this.context = new ClassPathXmlApplicationContext("/META-INF/fuse-web-client-appctx.xml");
		this.apiGatewayFacade = (IApiGatewayFacade) context.getBean("apigwFacade");

	}
	
	/**
	 * ---[  INIT  ]---
	 * 
	 *     Usage:
	 *     If Annotation for Environment with Server is available, then use it. Otherwise:    
	 *     If fuse.cm.dir is available at system.property, then use it.
	 *     Otherwise, look for the first Main Argument:
	 *     			Verify with URL Constructor (or MalformedURLException will tell if this is not a valid URL).  
	 *     			If it starts with integ then look for the Number.
	 *     			Otherwise, take it as it is.  And set the System property.
	 *     
	 *     Any Extending Main program will use the second param and beyond..
	 * @param fuseCmDir 
	 *     
	 *     

//	 * @throws HeadlessException
//	 * @throws UnknownHostException
//	 */
//	private void initOLD(String[] mainArgs) throws HeadlessException, UnknownHostException {
//		
//		String fuseCmDir = null;  //forced.
//		
//		Environment envAnnotation = this.getClass().getAnnotation(Environment.class);
//		
//		// Annotation is 1st priority
//		if (envAnnotation != null) {
//			fuseCmDir = envAnnotation.value().getUrl();
//		}
//		else {
//		
//			String firstArg = mainArgs[0];  // First Param tells the Integ or Host.
//			String systemFuseCmDir;
//			
//			if (!StringUtil.isBlank(firstArg)) {
//				
//				String serverNameOrUrl = firstArg.toLowerCase().replace("_", "-");
//				fuseCmDir = Environment.Server.getByName(serverNameOrUrl).getUrl();
//				
//				if (fuseCmDir == null) {
//					try {
//						URL url = new URL(serverNameOrUrl);
//						fuseCmDir = url.toString();
//					}
//					catch (MalformedURLException e) {
//	
//						systemFuseCmDir = getSystemFuseCmDir();
//						if (systemFuseCmDir != null) {
//							fuseCmDir = systemFuseCmDir;
//						}
//						else {
//							// Problem.  Unable to determine fuse.cm.dir
//							exitProgram();
//						}
//					}
//				}
//			}
//			else {
//				systemFuseCmDir = getSystemFuseCmDir();
//				if (systemFuseCmDir != null) {
//					fuseCmDir = systemFuseCmDir;
//				}
//				else {
//					// Problem.  Unable to determine fuse.cm.dir
//					exitProgram();
//				}					
//			}
//		}
//
//		
//		// SET Fuse CM Dir
//		System.setProperty("fuse.cm.dir",fuseCmDir);
//		
//		this.context = new ClassPathXmlApplicationContext("/META-INF/fuse-web-client-appctx.xml");
//		this.apiGatewayFacade = (IApiGatewayFacade) context.getBean("apigwFacade");
//	}
	
//	private String getSystemFuseCmDir() {
//		String result;
//		String systemFuseCmDir = System.getProperty("fuse.cm.dir");
//		if (!StringUtil.isBlank(systemFuseCmDir)) {
//			result = systemFuseCmDir;
//		}
//		else {
//			result = null;// Problem.  Unable to determine fuse.cm.dir
//		}
//		
//		return result;
//	}

//	private void exitProgram()  {
//		System.out.println("Must Provide -Dfuse.cm.dir OR first program param as integ-NN");
//		System.out.println("Usage:");
//		System.out.println("		java -jar delete-user.jar integ-NN {fuseID-to-delete}");
//		System.out.println(" OR, via the run.cmd:  run integ-NN {fuseID-to-delete}");
//		System.out.println("SUPPORTED INTEGS: ");
//		
//		for (Server server: Server.values()) {
//			System.out.println(server.getName() + " = " + server.getUrl());
//		}  
//	
//		System.exit(1);
//		throw new IllegalArgumentException("Must Provide fuse.cm.dir");
//	}


	protected XmppBaseResponse executeCommand(CommandTypeId commandTypeId, String userIdentifier, String fuseId, GeneratedMessageLite requestParams) throws ApiGatewayException {
		
		FuseCommand command = new FuseCommand(CommandType.newBuilder().setCommandId(commandTypeId), requestParams);
		
		XmppBaseRequest<GeneratedMessageLite> apiGatewayRequest = buildXmppBaseRequest(command,userIdentifier);
		apiGatewayRequest.setFuseID(fuseId);
			
		XmppBaseResponse apiGatewayResponse = (XmppBaseResponse)this.apiGatewayFacade.invokeApiCall(apiGatewayRequest);
		
		System.out.print(commandTypeId.toString());
		
		if (apiGatewayResponse != null) {
			if (apiGatewayResponse.isSuccess()) {
				System.out.println(" Successfully Completed. ");
				System.out.println("Result Data: " + apiGatewayResponse.getFuseCommandResponse().toString());
			}
			else {
				System.out.print(" FAILED! Details: ");
				System.out.println(apiGatewayResponse.getServiceError());
			}	
		}
		else {
			System.out.println("NO RESPONSE AVAILABLE!");
		}
		
		return apiGatewayResponse;
	}

	private static XmppBaseRequest<GeneratedMessageLite> buildXmppBaseRequest(FuseCommand fuseCommand,String userIdentifier) {
		Message message = (Message)MessageConverter.generateMessage(fuseCommand);
		PacketExtension commandPacketExtension = MessageConverter.retrieveCommandPacketExtension(message);
		return new XmppBaseRequest<GeneratedMessageLite>(commandPacketExtension.toXML(), userIdentifier);
	}


	private static void PrintErrorResult(ApiGatewayResponse apiGatewayResponse) {
		if (apiGatewayResponse.getServiceError()!= null){
			System.out.println("FaultCode:"+apiGatewayResponse.getServiceError().getFaultCode());
			System.out.println("FaultMessage:"+ apiGatewayResponse.getServiceError().getFaultMessage());
		}
	}
	
	public static ValidateAccessTokenRequest generatValidateAccessTokenRequest(ApplicationContext context,String userIdentifier) {
		Identifiers identifiers = (Identifiers) context.getBean("identifiers");
		ValidateAccessTokenRequest validateAccessTokenRequest = new ValidateAccessTokenRequest();
		validateAccessTokenRequest.setTenantId("Singtel");
		validateAccessTokenRequest.setToken(userIdentifier);
		validateAccessTokenRequest.setOtac("test_otac");
		validateAccessTokenRequest.setDeviceId(userIdentifier);
		validateAccessTokenRequest.setDeviceType("deviceType");
		validateAccessTokenRequest.setOsType("IOS iphone");
		validateAccessTokenRequest.setAppVersion("2.0.0");
		validateAccessTokenRequest.setAuthService("authService");
		validateAccessTokenRequest.setResetDeviceOwner(false);
		
		validateAccessTokenRequest.setApipass(identifiers.getIdentifiers().get("apipass")); 
		validateAccessTokenRequest.setApiuser(identifiers.getIdentifiers().get("apiuser"));
		validateAccessTokenRequest.setApiVersion(identifiers.getIdentifiers().get("apiVersion"));
		validateAccessTokenRequest.setCallingServicesDomain(identifiers.getIdentifiers().get("callingServicesDomain"));
		validateAccessTokenRequest.setCallingServicesHost(identifiers.getIdentifiers().get("callingServicesHost"));
		validateAccessTokenRequest.setCallingServicesPort(identifiers.getIdentifiers().get("callingServicesPort"));
		validateAccessTokenRequest.setApplicationIdentifier(identifiers.getIdentifiers().get("applicationIdentifier"));
		validateAccessTokenRequest.setLanguage(identifiers.getIdentifiers().get("language"));
		validateAccessTokenRequest.setMssoPassword(identifiers.getIdentifiers().get("mssoPassword"));
		validateAccessTokenRequest.setMssoUserId(identifiers.getIdentifiers().get("mssoUserId"));
		validateAccessTokenRequest.setXmppHost(identifiers.getIdentifiers().get("xmppHost"));
		validateAccessTokenRequest.setXmppPort(identifiers.getIdentifiers().get("xmppPort"));
		validateAccessTokenRequest.setDefaultSocialNetworkServiceInstance(identifiers.getIdentifiers().get("defaultSocialNetworkServiceInstance"));
		
		return validateAccessTokenRequest;
	}

	public static String printValidateAccessTokenResponse(ValidateAccessTokenResponse validateAccessTokenResponse) {
		String fuseId = null;
		System.out.println("ValidateAccessTokenResponse:");
		PrintErrorResult(validateAccessTokenResponse);

		if (validateAccessTokenResponse.getServiceError() == null){
			fuseId = validateAccessTokenResponse.getUserIdInternal();
			System.out.println("fuseId:"+validateAccessTokenResponse.getUserIdInternal());
			List<Credential> credentials = validateAccessTokenResponse.getCredentials();
			for (Credential credential : credentials) {
				System.out.println("[serviceType="+credential.getServiceType()+", domain="+credential.getDomain()+", username="+credential.getUsername()+", pass="+credential.getPassword()+", host="+credential.getHost()+", port="+credential.getPort()+"]");
				if(ServiceType.XMPP.equals(credential.getServiceType())){
				}
			}

		}

		return fuseId;
	}

//	private static Logger log = LoggerService.getLogger(ApiGatewayMainBase.class);
	
}
