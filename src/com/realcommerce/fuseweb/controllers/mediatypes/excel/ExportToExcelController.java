package com.realcommerce.fuseweb.controllers.mediatypes.excel;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.realcommerce.fuseweb.app.entities.mediatypes.ExcelRow;
import com.realcommerce.fuseweb.app.utils.ExcelExporter;

@Controller
@RequestMapping(value = "/excel")
public class ExportToExcelController {

	@Autowired
	ServletContext context;

	/**
	 * 
	 * @param pRows
	 *            - data to export - input as JSON. Structure ExcelRow[] e.g.
	 *            [{style:1, values: ["shay","elkayam"]},...]
	 * @param request
	 *            - http request - self injected.
	 * @return
	 */
	@RequestMapping(value = "/export", method = RequestMethod.POST)
	@ResponseBody
	public String exportToExcel(@RequestBody ExcelRow[] pRows) {

		// obtain model and process excel sheet.
		System.out.println(context.getRealPath(
				"/resources/generatedReports"));
		String filename = ExcelExporter.getInstance().exportToExcel(
				pRows,
				context.getRealPath(
						"/resources/generatedReports"));

		return "/resources/generatedReports/" + filename + ".xls";
	}
}