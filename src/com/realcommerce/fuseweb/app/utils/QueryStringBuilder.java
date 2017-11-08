package com.realcommerce.fuseweb.app.utils;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 * Query String builder;
 * @author shaye
 *
 */
public class QueryStringBuilder {
	
	private StringBuilder sb;
	
	public QueryStringBuilder(){
		sb = new StringBuilder();
	}
	
	public void add(String pName, String pValue){
		try{
			if(sb.length()!=0){
				sb.append("&");
			}
			sb.append(pName+"="+URLEncoder.encode(pValue,"UTF-8"));
		}
		catch(UnsupportedEncodingException e){
			e.printStackTrace();
		}
	}
	
	public String toString(){
		return sb.toString();
	}
	
	
}
