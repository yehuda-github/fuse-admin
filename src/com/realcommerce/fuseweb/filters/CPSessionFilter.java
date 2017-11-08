package com.realcommerce.fuseweb.filters;

import java.io.IOException;
import java.util.ResourceBundle;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.realcommerce.fuseweb.app.entities.session.FuseAccountSession;

public class CPSessionFilter implements Filter  {
	private FilterConfig filterConfig = null;
    private String username;
    private String password;
    private String domain;
	public void init(FilterConfig filterConfig) 
    throws ServletException {
		this.filterConfig = filterConfig;
		this.username = filterConfig.getInitParameter("username");
		this.password = filterConfig.getInitParameter("password");
		this.domain = filterConfig.getInitParameter("domain");
	}
	
	public void destroy() {
	      this.filterConfig = null;
	   }

	public void doFilter(ServletRequest request,ServletResponse response,FilterChain chain)
		throws IOException, ServletException 
		{
		
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		HttpServletRequest req = (HttpServletRequest) request;
	    HttpServletResponse res = (HttpServletResponse) response;

	    HttpSession session = req.getSession(true);
	    
	    if(session.getAttribute(bundle.getString("session.fuseAccountAttribute"))==null){
	    	FuseAccountSession accountSession = new FuseAccountSession();
			accountSession.setUser(username);
			accountSession.setPassword(password);
			accountSession.setDomain(domain);
			session.setAttribute(bundle.getString("session.fuseAccountAttribute"),accountSession);
	    }
	    
		chain.doFilter(request, response);
		 
 
	}

}