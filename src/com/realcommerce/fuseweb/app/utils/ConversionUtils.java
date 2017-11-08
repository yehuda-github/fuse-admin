package com.realcommerce.fuseweb.app.utils;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;

import com.google.protobuf.GeneratedMessageLite;
import com.realcommerce.fuseweb.app.entities.mappinghelpers.AmdocsDTOMappingHelper;

/**
 * class for simplifying the process of serializing Amdocs Classes which have cyclic dependencies (i.e pointer to themselves via getDefaultInstaceForType)
 *   
 * @author shaye
 *
 */
public class ConversionUtils {
	private final static ConversionUtils INSTANCE = new ConversionUtils();
	
	private ConversionUtils(){
		
	}
	
	public static ConversionUtils getInstace(){
		return INSTANCE;
	}
	
	
	/**
	 * this is the function to use when you want to convert amdocs classes to JSON easily.
	 * usage example:
	 * 
	 * you have a "List<Contacts> contacts"
	 * you use: convertAmdocsClassToJSONString(contacts,Contact.class)
	 * 
	 * you have a "Contact c"
	 * you use: convertAmdocsClassToJSONString(c,Contact.class)
	 * 
	 * if you have a more complicated case such as an object with contacts and groups together or some lists in it:
	 * for example:
	 * 
	 * GetAllContactsResult result = new GetAllContactsResult();
		
		result.setAllContacts(contacts); //list of Contact
		result.setAllGroups(groups); //list of Group
		
		you use:
		
		convertAmdocsClassToJSONString(result, Contact.class, Group.class); //you can send as much "*.class" params as you like!
		
		
		
	 *
	 * 
	 * 
	 * @param pInstance
	 * @param pClass
	 * @return
	 */
	public <T extends Object> String convertAmdocsClassToJSONString(T pInstance, Class... pClasses){
		try{
			Set<Class> annotatedClasses = new HashSet<Class>();
			for(Class pClass : pClasses){
				annotatedClasses.addAll(getAnnotatedClasses(pClass));
			}
			ObjectMapper mapper = new ObjectMapper();
			for(Class annotatedClass : annotatedClasses){
				mapper.getSerializationConfig().addMixInAnnotations(annotatedClass,AmdocsDTOMappingHelper.class);
			}
			return mapper.writeValueAsString(pInstance);
		}
		catch(JsonMappingException e){
			//Log4J.getInstance().addToLog("ConversionUtils.java -- convertAmdocsClassToJSONString",e);
		} catch (JsonGenerationException e) {
			//Log4J.getInstance().addToLog("ConversionUtils.java -- convertAmdocsClassToJSONString",e);
		} catch (IOException e) {
			//Log4J.getInstance().addToLog("ConversionUtils.java -- convertAmdocsClassToJSONString",e);
		}
		
		
		return null;
	}
	
	
	private List<Class> getAnnotatedClasses(Class pClass){
		return getAnnotatedClasses(pClass, new ArrayList<Class>());
	}
	
	/**
	 * recursive
	 * @param pInstance
	 * @param pPlaceHolder
	 * @return
	 */
	private List<Class> getAnnotatedClasses(Class pClass, List<Class> pPlaceHolder){
		for(Method method: pClass.getMethods()){
			if(method.getReturnType().equals(pClass)){
				if(!pPlaceHolder.contains(method.getReturnType())){
					pPlaceHolder.add(method.getReturnType());
				}
			}
			else{
				if(GeneratedMessageLite.class.isAssignableFrom(method.getReturnType())){
					pPlaceHolder = getAnnotatedClasses(method.getReturnType(),pPlaceHolder);
				}
			}
		}
		
		return pPlaceHolder;
	}
	
	
}
