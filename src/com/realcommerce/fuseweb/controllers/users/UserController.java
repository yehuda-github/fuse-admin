/**
 * 
 */
package com.realcommerce.fuseweb.controllers.users;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedSet;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.amdocs.fuse.communication.exchangedata.UserDataDefinition.UserDetails;
import com.amdocs.hub.common.apigateway.interfaces.IApiGatewayFacade;
import com.amdocs.hub.common.filter.FieldFilter;
import com.amdocs.hub.common.search.SortCriteria;
import com.amdocs.hub.common.search.SortOrder;
import com.amdocs.hub.common.um.dto.user.CustomerOperator;
import com.amdocs.hub.common.um.dto.user.Identifier;
import com.amdocs.hub.common.um.dto.user.User;
import com.amdocs.hub.common.um.dto.user.UserSortField;
import com.amdocs.hub.common.um.interfaces.IUserManagementFacade;
import com.amdocs.hub.common.um.util.CustomerUtil;
import com.realcommerce.fuseweb.app.entities.json.JSONObject;
import com.realcommerce.fuseweb.app.utils.ConversionUtils;
import com.realcommerce.fuseweb.app.utils.GeneralUtils;



/**
 * @author nirl
 *
 */
@Controller
@RequestMapping(value="/users")
public class UserController {
	
	@Autowired
	IUserManagementFacade iUserManagementFacade; 
	
	@Autowired	
	IApiGatewayFacade pService;

/*	@Autowired
	HttpServletRequest request;*/
	
	
	/**
	 * 
	 * @param input - contains request params for fetching data (filters, pageNumber, etc.)
	 * @return
	 */
	@RequestMapping(value="/listJSON", method=RequestMethod.GET)
	public @ResponseBody Map<String,Object> ListUsersJSON(@RequestParam MultiValueMap<String, String> input) {
		List<User> users = null;	
		List<String> types = new ArrayList<String>();
		List<String> ssoIds = new ArrayList<String>();
		List<SortedSet<String>> emails = new ArrayList<SortedSet<String>>();
		List<SortedSet<String>> msisdns = new ArrayList<SortedSet<String>>();
		Long usersCount = 0l;
		try{
			
			/*for (String key : input.keySet()) {
				System.out.println("key: " + key);
				System.out.println("value: " + input.get(key)); // note that "value"
																// is a list in
																// itself! since
																// there might be
																// more then one key
																// with the same
																// name
			}*/
			
			//build Filters
			List<FieldFilter> filters = new ArrayList<FieldFilter>();
				FieldFilter filter;
			
			Long fromDate = 0l;
			Long toDate = 0l;
			
			SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
			
			if(input.getFirst("fromDate")!=null && !"".equals(input.getFirst("fromDate"))){
				fromDate = dateFormat.parse(input.getFirst("fromDate")).getTime();
			}
			
			
			if(input.getFirst("toDate")!=null && !"".equals(input.getFirst("toDate"))){
				
				Calendar cal = Calendar.getInstance();
				cal.setTime(  dateFormat.parse(input.getFirst("toDate")));
				cal.add( Calendar.DATE, 1 );
				toDate = cal.getTime().getTime();
				
			}
			
			if(input.getFirst("fuse_id")!=null && !"".equals(input.getFirst("fuse_id"))){
				filter = new FieldFilter();
				filter.setPath("fuseId");
				filter.setPattern("%"+input.getFirst("fuse_id")+"%");
				filters.add(filter);
			}
			
			if(input.getFirst("msisdn")!=null && !"".equals(input.getFirst("msisdn"))){
				filter = new FieldFilter();
				filter.setPath("customers.custId");
				System.out.println("msisdn: /" + input.getFirst("msisdn") + "/");
				filter.setPattern("%"+input.getFirst("msisdn")+"%");
				filters.add(filter);
			}
			
			if(input.getFirst("cos")!=null && !"".equals(input.getFirst("cos"))){
				filter = new FieldFilter();
				filter.setPath("classOfSevice");
				filter.setPattern("%"+input.getFirst("cos")+"%");
				filters.add(filter);
			}
			
			if(input.getFirst("email")!=null && !input.getFirst("email").isEmpty() && input.getFirst("email").contains("@")){
				System.out.println("email: /" + input.getFirst("email") + "/");
				filter = new FieldFilter();
				//filter.setPath("userContact.emails.data");
				filter.setPath("customers.custId");
				filter.setPattern("%"+input.getFirst("email")+"%");
				filters.add(filter);
			}
			
			if(input.getFirst("type")!=null && !input.getFirst("type").isEmpty()){
				System.out.println("type: /" + input.getFirst("type") + "/");
				/*filter = new FieldFilter();
				filter.setPath("customers.custOperator");
				//filter.setPath("customers.custType");
				filter.setPattern("%"+input.getFirst("type")+"%");
				filters.add(filter);*/
				
				
				//quick fix
				System.out.println("type: /" + input.getFirst("type") + "/");
				
				int inputStr = Integer.parseInt(input.getFirst("type"));
				//filter.setPath("customers.custType");
				CustomerOperator type = null;
				
				if(inputStr==1){
					type = CustomerOperator.STM;
				}
				if(inputStr==2){
					type = CustomerOperator.OTT;
				}
				if(inputStr==3){
					type = CustomerOperator.SNBB;
				}
				/*if(inputStr==4){
					type = CustomerOperator.SNBB;
				}*/
				
				/*if("snbb".contains(inputStr.toLowerCase())){
					type = CustomerOperator.SNBB;
				}
				if("ott".contains(inputStr.toLowerCase())){
					type = CustomerOperator.OTT;
				}
				if("stm".contains(inputStr.toLowerCase())){
					type = CustomerOperator.STM;
				}*/
				
				if(type != null){
					filter = new FieldFilter();
					filter.setPath("customers.custOperator");
					filter.setPattern(type);
					filters.add(filter);
				}
			}
			
			//obtain service (LC with interface-name)
			//IUserManagementFacade service = FuseServiceLocator.getInstance().getService(IUserManagementFacade.class);
			
			Integer sizePage = Integer.valueOf(input.getFirst("iDisplayLength"));
			
			Integer pageNumber = 0;

			if(sizePage>0)
				//calculate pageNumber
				pageNumber = Integer.valueOf(input.getFirst("iDisplayStart"))/sizePage + 1;
			
			/*
			 * TODO: change after amdocs add option to all data
			 */
			if (sizePage == -1)
			{
				sizePage = 999999999;
				pageNumber = 1;
			}
			
			/*
			Integer sortIndex = Integer.valueOf(input.getFirst("iSortCol_0"));
			*/
			Integer sortIndex = 1;
			SortCriteria<UserSortField> sortCriteria = 
					new SortCriteria<UserSortField>(
							UserSortField.values()[sortIndex], 
							SortOrder.valueOf(((String)input.getFirst("sSortDir_0")).toUpperCase())); 
					
			//call service and 
			usersCount = iUserManagementFacade.getUsersCount(filters,fromDate,toDate);
			users = iUserManagementFacade.getUsers(pageNumber, sizePage, filters, fromDate, toDate, sortCriteria);
			
			Identifier identifier = null;
			for(User user:users){
				identifier = GeneralUtils.getInstance().findExternalIdentifier(user);
				
				if(identifier != null){
					ssoIds.add(identifier.getValue());
				}
				else{
					ssoIds.add("-");
				}
				
				types.add(CustomerUtil.getCustomerOperator(user.getCustomers()).name());
				emails.add(CustomerUtil.getEMAILs(user.getCustomers()));
				msisdns.add(CustomerUtil.getMSISDNs(user.getCustomers()));
			}
			
		}
		catch(Exception e){
			e.printStackTrace();
		}
		
		//Build response.
		HashMap<String,Object> result = new HashMap<String,Object>();
		result.put("iTotalRecords", usersCount);
		result.put("iTotalDisplayRecords", usersCount);
		result.put("sEcho",input.get("sEcho"));
		result.put("aaData", users);
		result.put("types", types);
		result.put("emails", emails);
		result.put("msisdns", msisdns);
		result.put("ssoIds", ssoIds);
		
		return result;
	}
	
	
	/**
	 * jsp view for users list
	 * @return
	 */
	@RequestMapping(value="/list", method=RequestMethod.GET)
	public String ListUsers() {
		
		return "users/list";
	}
	
	/**
	 * jsp view for users details
	 * @return
	 */
	@RequestMapping(value="/userDetails", method=RequestMethod.GET)
	public String userDetails(@RequestParam String id) {
		
		ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
	    attr.getRequest().getSession(true).setAttribute("contactId", id); // true == allow create
	    
		return "users/UserDetails";
	}
	
	/**
	 * returns the data of the user
	 * @param id
	 * @param pSession
	 * @return
	 */
	@RequestMapping(value="/userDetailsData")
	public @ResponseBody String userDetailsData(
			@RequestParam String userId,
			HttpSession pSession){
		
		String retVal = "";
		byte [] imageByteArr = null;
		
		try{
			UserDetails result = GeneralUtils.getInstance().getUserDetailsDataFunc(pSession, pService, userId);
			if(result != null){
				retVal = ConversionUtils.getInstace().convertAmdocsClassToJSONString(result, UserDetails.class);
				
				if(result.getImageBuffer() != null && result.getImageBuffer().toByteArray() != null){
					imageByteArr = result.getImageBuffer().toByteArray();
					JSONObject tempJson = new JSONObject(retVal);
					sun.misc.BASE64Encoder encoder = new sun.misc.BASE64Encoder();
					
					
					tempJson.getJSONObject("imageBuffer").put("byteArr", encoder.encode(imageByteArr));
					retVal = tempJson.toString();
				}
				
				//retVal = result.toString();
			}
			else{
				System.out.println("SettingsController.java -- updateAccount , result returns null");
			}

		} catch (Exception e) {
			System.out.println("SettingsController.java -- updateAccount , exception");
		}
		
		return retVal;
	}
	

}
