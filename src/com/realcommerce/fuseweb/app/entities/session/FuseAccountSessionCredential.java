package com.realcommerce.fuseweb.app.entities.session;

import com.amdocs.fuse.common.apigateway.dto.Credential;

public class FuseAccountSessionCredential extends Credential 
{
	private static final long serialVersionUID = 1L;
	private String token = "";
	private String sessionId = "";
	private Boolean loggedIn = false;
	
	public FuseAccountSessionCredential()
	{
		super();
	}
	
	public FuseAccountSessionCredential(Credential credential)
	{
		if (credential != null)
		{
			this.setServiceType(credential.getServiceType());
			this.setServiceProvider(credential.getServiceProvider());
			this.setDomain(credential.getDomain());
			this.setUsername(credential.getUsername());
			this.setPassword(credential.getPassword());
			this.setUsernamePasswordToken(credential.getUsernamePasswordToken());
			this.setHost(credential.getHost());
			this.setPort(credential.getPort());
			this.setUrl(credential.getUrl());
		}
	}
	
	public String getToken()
	{
		return token;
	}
	
	public void setToken(String token)
	{
		this.token = token;
	}
	
	public String getSessionId()
	{
		return sessionId;
	}
	
	public void setSessionId(String sessionId)
	{
		this.sessionId = sessionId;
	}

	public Boolean isLoggedIn() 
	{
		return loggedIn;
	}

	public void setLoggedIn(Boolean loggedIn) 
	{
		this.loggedIn = loggedIn;
	}
}
