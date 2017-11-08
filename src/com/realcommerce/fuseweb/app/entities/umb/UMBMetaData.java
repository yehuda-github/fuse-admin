package com.realcommerce.fuseweb.app.entities.umb;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class UMBMetaData {
	private List<String> folderColors;
	private Map<String,String> foldersToColors;
	
	public UMBMetaData() {
		super();
		folderColors = new ArrayList<String>();
		foldersToColors = new HashMap<String,String>();
	}
	
	public List<String> getFolderColors() {
		return folderColors;
	}
	public void setFolderColors(List<String> folderColors) {
		this.folderColors = folderColors;
	}
	public Map<String, String> getFoldersToColors() {
		return foldersToColors;
	}
	public void setFoldersToColors(Map<String, String> foldersToColors) {
		this.foldersToColors = foldersToColors;
	}
	
	
	
	public void generateRandomFolderColors(List<String> pColors){
		
		List<String> colors = new ArrayList<String>(pColors);
		Random r = new Random();
		while(colors.size()>0){
			folderColors.add(colors.remove(r.nextInt(colors.size())));
		}
	}
	
	public String nextAvailableColor(){
		if(folderColors.size()>0)
			return folderColors.get(foldersToColors.size() % folderColors.size());
		return null;
	}
	
	
}
