package com.realcommerce.fuseweb.filters;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RequestEncodingFilter implements Filter  {
	private FilterConfig filterConfig = null;
    private String encoding;
	public void init(FilterConfig filterConfig) 
    throws ServletException {
		this.filterConfig = filterConfig;
		this.encoding = filterConfig.getInitParameter("encoding");

	}
	public void destroy() {
	      this.filterConfig = null;
	   }

	public void doFilter(ServletRequest request,ServletResponse response,FilterChain chain)
		throws IOException, ServletException 
		{
		HttpServletRequest req = (HttpServletRequest) request;
	    HttpServletResponse res = (HttpServletResponse) response;

        req.setCharacterEncoding(encoding);
		chain.doFilter(request, response);
		 
 
	}

}