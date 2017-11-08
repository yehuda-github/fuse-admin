package com.realcommerce.fuseweb.app.entities.umb;

public enum MessageSourceEnum {
	FACEBOOK(1),EMAIL(2),TWEETER(3);
	
	private Integer type;
	
	MessageSourceEnum(Integer type){
		type=type;
	}
}
