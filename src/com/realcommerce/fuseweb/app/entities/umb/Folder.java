package com.realcommerce.fuseweb.app.entities.umb;

import java.util.Map;

import org.codehaus.jackson.annotate.JsonGetter;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonIgnoreProperties;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.annotate.JsonSetter;

/**
 * 
 * @author shaye
 *
 */

@JsonIgnoreProperties(ignoreUnknown=true)
public class Folder {
	private String alias;
	private String name;
	private String oldName;
	private String color;
	private String type;
	private Integer unreadCount;
	private String account;
	private Map<String,String> attributes;
	private Boolean external;
	
	
	public Folder() {
		super();
		attributes=null;
		alias=null;
	}
	
	/*Getters*/
	
	
	
	public String getName() {
		return name;
	}
	
	@JsonProperty("external")
	public Boolean isExternal() {
		return external;
	}


	@JsonProperty("color")
	public String getColor() {
		return color;
	}
	
	public String getType() {
		return type;
	}
	
	@JsonProperty("unreadCount")
	public Integer getUnreadCount() {
		return unreadCount;
	}
	
	@JsonProperty("account")
	public String getAccount() {
		return account;
	}
	
	@JsonProperty("alias")
	public String getAlias() {
		if(alias!=null) return alias;
		return name.replace(" ", "_").replaceAll("[^A-Za-z0-9_]+", "").toLowerCase();
	}
	
	public String getOldName() {
		return oldName;
	}
	
	/*Setters*/
	
	public void setId(String pId) {
		this.name = pId;
	}
	
	@JsonIgnore
	public void setExternal(Boolean external) {
		this.external = external;
	}
		
	@JsonIgnore
	public void setAlias(String alias) {
		this.alias = alias;
	}

	@JsonIgnore
	public void setColor(String color) {
		this.color = color;
	}
	
	
	@JsonIgnore
	public void setType(String type) {
		this.type = type;
	}
	
	@JsonIgnore
	public void setAccount(String account) {
		this.account = account;
	}
	
	@JsonIgnore
	public void setUnreadCount(Integer unreadCount){
		this.unreadCount = unreadCount;
	}
	
	public void setOldName(String oldName) {
		this.oldName = oldName;
	}
	
	public void setAttributes(Map pAttributes){
		this.attributes=pAttributes;
		this.unreadCount = Integer.valueOf(this.attributes.get("unreadEmails"));
	}

	@Override
	public boolean equals(Object obj) {
		if(obj instanceof Folder){
			if(this.name==null){
				return ((Folder)obj).name==null;
			}
			return this.name.equalsIgnoreCase(((Folder)obj).name);
		}
		return false;
	}

	

	
	
	
	
	
	
	
}
