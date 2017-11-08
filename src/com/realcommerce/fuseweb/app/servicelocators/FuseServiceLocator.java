package com.realcommerce.fuseweb.app.servicelocators;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.amdocs.hub.common.apigateway.interfaces.IApiGatewayFacade;
import com.amdocs.hub.common.um.interfaces.IUserManagementFacade;


/**
 * service locator stub - need to change to JNDI lookup / Other remoting env.
 * @author shaye
 *
 */
public class FuseServiceLocator {
	private final static FuseServiceLocator INSTANCE = new FuseServiceLocator();
	
	private FuseServiceLocator(){
		
	}
	
	public static FuseServiceLocator getInstance(){
		return INSTANCE;
	}
	
	@SuppressWarnings("unchecked")
	public <T extends Object> T getService(Class<T> pClass){
		ApplicationContext context = new ClassPathXmlApplicationContext("/fuse-web-appctx-test.xml");
		if(pClass.isAssignableFrom(IUserManagementFacade.class)){
			return pClass.cast(context.getBean("userManagerFacade"));
		}
		else if(pClass.isAssignableFrom(IApiGatewayFacade.class)){
			return pClass.cast(context.getBean("apigwFacade"));
		}
		
		return null;
	}
	
}
