package com.realcommerce.fuseweb.app.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Date;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;

import com.realcommerce.fuseweb.app.entities.mediatypes.ExcelRow;


/**
 * 
 * @author shaye
 *
 */
public class ExcelExporter {
	private static final ExcelExporter INSTANCE = new ExcelExporter();
	
	private static final int HEADER_STYLE = 1;
	private static final int NORMAL_STYLE = 2;
	
	private ExcelExporter(){
		
	}
	
	public static ExcelExporter getInstance(){
		return INSTANCE;
	}
	
	
	/**
	 * 
	 * @param pRows - Data to export
	 * @param pResourcesDirPath - Absolute path on server to output folder.
	 * @return
	 */
	public String exportToExcel(ExcelRow[] pRows, String pResourcesDirPath){
		HSSFWorkbook wb = new HSSFWorkbook();
		
		
		//Declare styles:
		//Header Styles
        HSSFCellStyle HeaderCellStyle = wb.createCellStyle();
		HSSFFont font = wb.createFont();
		font.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
		HeaderCellStyle.setFont(font);
		HeaderCellStyle.setFillForegroundColor(HSSFColor.GREY_25_PERCENT.index);
		HeaderCellStyle.setFillPattern(HeaderCellStyle.SOLID_FOREGROUND);
		HeaderCellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		HeaderCellStyle.setBottomBorderColor(HSSFColor.BLACK.index);
		HeaderCellStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		HeaderCellStyle.setLeftBorderColor(HSSFColor.BLACK.index);
		HeaderCellStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		HeaderCellStyle.setRightBorderColor(HSSFColor.BLACK.index);
		HeaderCellStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		HeaderCellStyle.setTopBorderColor(HSSFColor.BLACK.index);
		HeaderCellStyle.setWrapText(false);  
        // General Cell Style
        HSSFCellStyle cellStyle = wb.createCellStyle();
		cellStyle.setBorderBottom(HSSFCellStyle.BORDER_THIN);
		cellStyle.setBottomBorderColor(HSSFColor.BLACK.index);
		cellStyle.setBorderLeft(HSSFCellStyle.BORDER_THIN);
		cellStyle.setLeftBorderColor(HSSFColor.BLACK.index);
		cellStyle.setBorderRight(HSSFCellStyle.BORDER_THIN);
		cellStyle.setRightBorderColor(HSSFColor.BLACK.index);
		cellStyle.setBorderTop(HSSFCellStyle.BORDER_THIN);
		cellStyle.setTopBorderColor(HSSFColor.BLACK.index);
		
		HSSFSheet sheet = wb.createSheet("Report");
		
		HSSFRow row;
		for (int i=0; i<pRows.length;i++) {
			
			row = sheet.createRow((short)(i));
			
			for(int j=0;j<pRows[i].getValues().length;j++){
				HSSFCell cell = row.createCell((short)j);
				cell.setEncoding( HSSFCell.ENCODING_UTF_16 );
				cell.setCellValue(pRows[i].getValues()[j]);
				if(pRows[i].getStyle()==HEADER_STYLE){
					cell.setCellStyle(HeaderCellStyle);	
				}
				else{
					cell.setCellStyle(cellStyle);
				}
			}			
			
		}		
        
		
        try {
        	String currentDate = String.valueOf(new Date().getTime());
        	String filename=null;
        	if(pResourcesDirPath.indexOf("/")>=0){
        		filename = pResourcesDirPath+"/"+currentDate+".xls";
        	}
        	else{
        		filename = pResourcesDirPath+"\\"+currentDate+".xls";
        	}
        	FileOutputStream fos = new FileOutputStream(new File(filename));
			wb.write(fos);
			fos.close();
			return currentDate;
		} catch (IOException e) {
			e.printStackTrace();
		}
		
        return null;
	}
	
}
