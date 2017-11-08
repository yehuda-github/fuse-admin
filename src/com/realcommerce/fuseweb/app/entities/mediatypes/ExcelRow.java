package com.realcommerce.fuseweb.app.entities.mediatypes;

public class ExcelRow {
	private int style;
	private String[] values;
	
	
	public ExcelRow(){
		
	}
	
	
	public ExcelRow(int style, String[] values) {
		super();
		this.style = style;
		this.values = values;
	}
	public int getStyle() {
		return style;
	}
	public void setStyle(int style) {
		this.style = style;
	}
	public String[] getValues() {
		return values;
	}
	public void setValues(String[] values) {
		this.values = values;
	}
	
	
}
