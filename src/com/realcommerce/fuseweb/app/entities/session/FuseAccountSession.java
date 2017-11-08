package com.realcommerce.fuseweb.app.entities.session;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.amdocs.fuse.common.apigateway.dto.Credential;
import com.amdocs.fuse.common.apigateway.dto.ServiceType;
import com.amdocs.fuse.communication.exchangedata.MyProfileDataDefinition.MyProfile.ServiceLevel;

/**
 * Account for Critical Path API, Fuse BE API etc.
 * @author shaye
 *
 */
public class FuseAccountSession {
	
	private String userIdInternal;
	private String user;
	private String password;
	private String domain;
	private String token;
	private String sessionId;
	private Boolean loggedIn;
	private String voipData;
	private ServiceLevel serviceLevel;
	private String userInternalIdWithName;
	private List<FuseAccountSessionCredential> credentialList;
	private String facebookAppId;
	private String msisdn;
	private String facebookUserId;
	private String twitterUserId;
	private HashMap<String, String> systemMessageTemplates;
	private HashMap<String, String> serverConfigurableData;
	private HashMap<String, Boolean> fuseSettings;
	
	public FuseAccountSession()
	{
		this.user = "";
		this.password = "";
		this.domain = "";
		this.token = "";
		this.sessionId = "";
		this.loggedIn = false;
		this.voipData = "";
		this.credentialList = new ArrayList<FuseAccountSessionCredential>();
		this.serviceLevel = ServiceLevel.SERVICE_LEVEL_BASIC;
		this.userInternalIdWithName = "";
		this.facebookAppId = "";
		this.msisdn = "";
		this.serverConfigurableData = new HashMap<String, String>();
		this.systemMessageTemplates = new HashMap<String, String>();
		this.fuseSettings			= new HashMap<String, Boolean>();
	}
	
	
	
	
	


	public HashMap<String, String> getSystemMessageTemplates() {
		return systemMessageTemplates;
	}


	public void setSystemMessageTemplates(
			HashMap<String, String> systemMessageTemplates) {
		this.systemMessageTemplates = systemMessageTemplates;
	}



	public List<FuseAccountSessionCredential> getCredentialList() 
	{
		return credentialList;
	}

	public void setCredentialList(List<Credential> credentials) 
	{
		this.credentialList = new ArrayList<FuseAccountSessionCredential>();
		if (credentials != null)
			for (Credential credential : credentials) 
			{
				this.credentialList.add(new FuseAccountSessionCredential(credential));
			}
	}
	
	public FuseAccountSessionCredential getCredential(ServiceType serviceType) 
	{
		if (this.credentialList != null)
			for (FuseAccountSessionCredential credential : this.credentialList) 
			{
				if(serviceType.equals(credential.getServiceType()))
				{
					return credential;
				}
			}
		return null;
	}

	public String getVoipData() {
		return voipData;
	}
	

	public void setVoipData(String voipData) {
		this.voipData = voipData;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).getUsername OR getUserIdInternal instead
	 * @return 
	 */
	public String getUser() {
		return user;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).setUser instead
	 * @return 
	 */
	public void setUser(String user) {
		this.user = user;
	}

	public String getUserIdInternal() {
		return this.userIdInternal;
	}
	
	public void setUserIdInternal(String userIdInternal) {
		this.user = userIdInternal;
		this.userIdInternal = userIdInternal;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).getPassword instead
	 * @return 
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).setPassword instead
	 * @return 
	 */
	public void setPassword(String password) {
		this.password = password;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).getDomain instead
	 * @return 
	 */
	public String getDomain() {
		return domain;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).setDomain instead
	 * @return 
	 */
	public void setDomain(String domain) {
		this.domain = domain;
	}
	
	/**
	 * @deprecated
	 * use getCredential(ServiceType).getToken instead
	 * @return 
	 */
	public String getToken() {
		return token;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).setToken instead
	 * @return 
	 */
	public void setToken(String token) {
		this.token = token;
	}
	
	/**
	 * @deprecated
	 * use getCredential(ServiceType).getSessionId instead
	 * @return 
	 */
	public String getSessionId() {
		return sessionId;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).setSessionId instead
	 * @return 
	 */
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	
	/**
	 * @deprecated
	 * use getCredential(ServiceType).isLoggedIn instead
	 * @return 
	 */
	public Boolean isLoggedIn() {
		return loggedIn;
	}

	/**
	 * @deprecated
	 * use getCredential(ServiceType).isLoggedIn instead
	 * @return 
	 */
	public void setLoggedIn(Boolean loggedIn) {
		this.loggedIn = loggedIn;
	}
	
	public void setServiceLevel(ServiceLevel i_ServiceLevel){
		serviceLevel = i_ServiceLevel;
	}
	
	public void setUserInternalIdWithName(String i_UserInternalIdWithName){
		userInternalIdWithName = i_UserInternalIdWithName;
	}

	public ServiceLevel getServiceLevel() {
		return serviceLevel;
	}

	public String getUserInternalIdWithName() {
		return userInternalIdWithName;
	}

	public String getFacebookAppId() {
		return facebookAppId;
	}

	public void setFacebookAppId(String facebookAppId) {
		this.facebookAppId = facebookAppId;
	}

	public String getMsisdn() {
		return msisdn;
	}

	public void setMsisdn(String msisdn) {
		this.msisdn = msisdn;
	}

	public String getFacebookUserId() {
		return facebookUserId;
	}

	public void setFacebookUserId(String facebookUserId) {
		this.facebookUserId = facebookUserId;
	}

	public String getTwitterUserId() {
		return twitterUserId;
	}

	public void setTwitterUserId(String twitterUserId) {
		this.twitterUserId = twitterUserId;
	}

	public HashMap<String, String> getServerConfigurableData() {
		return serverConfigurableData;
	}

	public HashMap<String, Boolean> getFuseSettings() {
		return fuseSettings;
	}
	
}
