package com.realcommerce.fuseweb.app.entities.umb;

public class Account {
	private String id;
	private String name;
	private String hostName;
	private String port;
	private String serverType;
	private String ssl;
	private String userName;
	private String timeout;
	private String defaultAccount;
	
	
	
	
	public Account() {
		super();
		
	}
	
	
	
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getHostName() {
		return hostName;
	}
	public void setHostName(String hostName) {
		this.hostName = hostName;
	}
	public String getPort() {
		return port;
	}
	public void setPort(String port) {
		this.port = port;
	}
	public String getServerType() {
		return serverType;
	}
	public void setServerType(String serverType) {
		this.serverType = serverType;
	}
	public String getSsl() {
		return ssl;
	}
	public void setSsl(String ssl) {
		this.ssl = ssl;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getTimeout() {
		return timeout;
	}
	public void setTimeout(String timeout) {
		this.timeout = timeout;
	}
	public String getDefaultAccount() {
		return defaultAccount;
	}
	public void setDefaultAccount(String defaultAccount) {
		this.defaultAccount = defaultAccount;
	}

	
	
}
