package com.realcommerce.fuseweb.app.entities.general;

import java.util.List;

/**
 * general action result object.
 * 
 * @author shaye
 * 
 * @param <T>
 */
public class ActionResult<T> {
	private Boolean error;
	private List<String> errorsList;
	private T data;
	
	
	
	public ActionResult() {
		super();
	}
	
	public ActionResult(T data) {
		super();
		this.data = data;
	}


	
	
	
	public Boolean isError() {
		return error;
	}
	public void setError(Boolean error) {
		this.error = error;
	}
	public List<String> getErrorsList() {
		return errorsList;
	}
	public void setErrorsList(List<String> errorsList) {
		this.errorsList = errorsList;
	}
	public T getData() {
		return data;
	}
	public void setData(T data) {
		this.data = data;
	}
	
	
}
