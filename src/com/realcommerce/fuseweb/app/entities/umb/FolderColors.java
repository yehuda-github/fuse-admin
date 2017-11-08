package com.realcommerce.fuseweb.app.entities.umb;

import java.util.ArrayList;
import java.util.List;


/**
 * constant class for folder colors
 * @author shaye
 *
 */
public class FolderColors {
	
	private final static FolderColors instance = new FolderColors();
	private	List<String> colors;
	
	private FolderColors(){
		this.colors = new ArrayList<String>();
		colors.add("aqua");
		colors.add("black");
		colors.add("blue");
		colors.add("fuchsia");
		colors.add("gray");
		colors.add("green");
		colors.add("lime");
		colors.add("maroon");
		colors.add("navy");
		colors.add("olive");
		colors.add("red");
		colors.add("silver");
		colors.add("teal");
		colors.add("white");
		colors.add("#822e7d");
		colors.add("#f29d18");
	}
	
	public static FolderColors getInstance(){
		return instance;
	}
	
	public List<String> getColors(){
		return this.colors;
	}
	

}
