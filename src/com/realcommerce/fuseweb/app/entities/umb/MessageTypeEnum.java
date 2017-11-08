package com.realcommerce.fuseweb.app.entities.umb;

public enum MessageTypeEnum {
	EMAIL(1),SMS(2),MMS(3),IM(4),EVENT(5);
	
	private Integer type;
	
	MessageTypeEnum(Integer type){
		type=type;
	}
	
	
}
