package com.realcommerce.fuseweb.app.utils;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.Set;

import javax.servlet.http.HttpSession;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;




import com.realcommerce.fuseweb.app.entities.general.ActionResult;
import com.realcommerce.fuseweb.app.entities.json.JSONArray;
import com.realcommerce.fuseweb.app.entities.json.JSONException;
import com.realcommerce.fuseweb.app.entities.json.JSONObject;
import com.realcommerce.fuseweb.app.entities.session.FuseAccountSession;
import com.realcommerce.fuseweb.app.entities.umb.Account;
import com.realcommerce.fuseweb.app.entities.umb.Folder;
import com.realcommerce.fuseweb.app.entities.umb.FolderColors;
import com.realcommerce.fuseweb.app.entities.umb.UMBMetaData;
import com.sun.org.apache.xalan.internal.xsltc.compiler.util.Type;



/**
 * CriticalPath API Utils.
 * @author shaye
 *
 */
public class CPUtils {

	private final static CPUtils INSTANCE = new CPUtils();


	/**
	 * SingleTon Stuff
	 */
	private CPUtils(){

	}

	public static CPUtils getInstance(){
		return INSTANCE;
	}


	/** Private Methods **/

	private String readAll(Reader rd) throws IOException {
		StringBuilder sb = new StringBuilder();
		int cp;
		while ((cp = rd.read()) != -1) {
			sb.append((char) cp);
		}
		return sb.toString();
	}

	private JSONObject readJsonFromUrl(String url, String pCookie, HttpSession pSession) throws JSONException {
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		JSONObject json = null;
		InputStream is = null;
		//boolean flag to see if there was a re-authentication need.
		Boolean reAuthenticate = false;
		try{
			URLConnection urlConnection = new URL(url).openConnection();
			if(pCookie!=null)
				urlConnection.setRequestProperty("Cookie", "s="+pCookie);
			is = urlConnection.getInputStream();
		
			BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
			String jsonText = readAll(rd);
			//strip the /*-secure- /*
			
			if(jsonText.indexOf("/*-secure-")>=0){
				jsonText = jsonText.substring(jsonText.indexOf("/*-secure-")+10, jsonText.lastIndexOf("*/")-1);

			}
						
			json = new JSONObject(jsonText);
			
		}
		catch(IOException e){
			//check if authentication error and try again
			if(e.getMessage().contains("403")){
				FuseAccountSession accountSession = (FuseAccountSession)pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);				
				//after authentication, we need to set the flag (to make the call again) and also update the cookie
				reAuthenticate = true;	
				accountSession = (FuseAccountSession)pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
				pCookie = accountSession.getSessionId();
				url = url.replaceFirst("\\?t=[\\w]+", "?t="+accountSession.getToken());
			}
		}
		finally {
			try{
				if(is!=null)
					is.close();
			}
			catch(IOException e){
				e.printStackTrace();
			}
		}
		if(!reAuthenticate)
			return json;
		return readJsonFromUrl(url,pCookie,pSession);
	}
	
	private String readStringFromUrl(String url, String pCookie) throws IOException, JSONException {
		String returnValue = null;
		URLConnection urlConnection = new URL(url).openConnection();
		if(pCookie!=null)
			urlConnection.setRequestProperty("Cookie", "s="+pCookie);
		InputStream is = urlConnection.getInputStream();
		try {
			BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
			String jsonText = readAll(rd);
			//strip the /*-secure- /*
			
			if(jsonText.indexOf("/*-secure-")>=0){
				jsonText = jsonText.substring(jsonText.indexOf("/*-secure-")+10, jsonText.lastIndexOf("*/")-1);
				
				returnValue=jsonText;
			}
			
			
		} finally {
			is.close();
		}
		
		
		
		return returnValue;
	}
	
	
	
	private JSONObject readJsonFromUrl(String url, String pCookie, String[] pFiles, HttpSession pSession){
		JSONObject json = null;
		Boolean reAuthenticate = false;
		Integer BUFFER_SIZE = 4096;
		PrintWriter writer = null;
		InputStream input = null;
		HttpURLConnection urlConnection = null;
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		
		try {
			urlConnection = (HttpURLConnection)new URL(url).openConnection();
			
			//boolean flag to see if there was a re-authentication need.
			
			
			//urlConnection.setChunkedStreamingMode(BUFFER_SIZE);
			if(pCookie!=null)
				urlConnection.setRequestProperty("Cookie", "s="+pCookie);
			//urlConnection.setRequestMethod("POST");
			String boundary = Long.toHexString(System.currentTimeMillis());
			String CRLF = "\r\n";
			urlConnection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
			urlConnection.setDoOutput(true);
		

		
			OutputStream outputStream = urlConnection.getOutputStream();
			
			writer = new PrintWriter(new OutputStreamWriter(outputStream, "UTF-8"), true); // true = autoFlush, important!
			//first, write simple post params:
			

			//second, write files.
			//do the file uploading
			for(String fileName:pFiles){
				// Send binary file.
				writer.append("--" + boundary).append(CRLF);
				writer.append("Content-Disposition: form-data; name=\"attachFile\"; filename=\"" + fileName + "\"").append(CRLF);
				//writer.append("Content-Type: " + URLConnection.guessContentTypeFromName(fileName)).append(CRLF);
				//writer.append("Content-Transfer-Encoding: binary").append(CRLF);
				writer.append(CRLF).flush();
				
				
					input = new FileInputStream(fileName);
					byte[] buffer = new byte[BUFFER_SIZE];
					for (int length = 0; (length = input.read(buffer)) > 0;) {
						outputStream.write(buffer, 0, length);
					}
					outputStream.flush(); // Important! Output cannot be closed. Close of writer will close output as well.
			
				
				writer.append(CRLF).flush(); // CRLF is important! It indicates end of binary boundary.		     
			}
			// End of multipart/form-data.
			writer.append("--" + boundary + "--").append(CRLF);
			
			
			//read response.
			InputStream urlIS = urlConnection.getInputStream();
			try{
				BufferedReader urlBR = new BufferedReader(new InputStreamReader(urlIS, Charset.forName("UTF-8")));
				String jsonText = readAll(urlBR);
				//strip the /*-secure- /*

				if(jsonText.indexOf("/*-secure-")>=0){
					jsonText = jsonText.substring(jsonText.indexOf("/*-secure-")+10, jsonText.lastIndexOf("*/")-1);
					
				}

				json = new JSONObject(jsonText);

			} finally {
				urlIS.close();
			}
		}
		catch(IOException e){
			//check if authentication error and try again
			if(e.getMessage().contains("403")){
				FuseAccountSession accountSession = (FuseAccountSession)pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);				
				//after authentication, we need to set the flag (to make the call again) and also update the cookie
				reAuthenticate = true;	
				accountSession = (FuseAccountSession)pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
				pCookie = accountSession.getSessionId();
				url = url.replaceFirst("\\?t=[\\w]+", "?t="+accountSession.getToken());
			}
			else{
				e.printStackTrace();
			}
		}
		catch(JSONException e){
			e.printStackTrace();
		}
		finally {
			
			
			if (input != null) 
				try { 
					input.close(); 
					} 
			catch (IOException logOrIgnore) {
				logOrIgnore.printStackTrace();
			}
		
			
			if (writer != null) writer.close();
		}

		
		return json;
	}
	
	
	
	private <T extends Object> T readObjectFromUrl(String url, String pCookie, Class<T> pType) throws IOException, JSONException {
		T returnValue = null;
		URLConnection urlConnection = new URL(url).openConnection();
		if(pCookie!=null)
			urlConnection.setRequestProperty("Cookie", "s="+pCookie);
		InputStream is = urlConnection.getInputStream();
		try {
			BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
			String jsonText = readAll(rd);
			//strip the /*-secure- /*
			if(jsonText.indexOf("/*-secure-")>=0){
				jsonText = jsonText.substring(jsonText.indexOf("/*-secure-")+11, jsonText.lastIndexOf("*/")-1);
				
			}
			ObjectMapper mapper = new ObjectMapper();
			
			returnValue = pType.cast(mapper.readValue(jsonText, pType)); 
			
		} finally {
			is.close();
		}
		return returnValue;
	}
	
	
	
	private Boolean isExternalAccount(String pAccountName){
		return pAccountName.contains("@") && !(pAccountName.contains("SINGNET_") || pAccountName.contains("DefaultMailAccount"));
	}
	
	
	/**
	 * 
	 * @param pSource
	 * @param pType
	 * @return
	 * @throws IOException 
	 * @throws JsonMappingException 
	 * @throws JsonParseException 
	 */
	public <T extends Object> T convertJSONStringToJavaObject(String pSource, Class<T> pType) throws JsonParseException, JsonMappingException, IOException{
		ObjectMapper mapper = new ObjectMapper();
		
		return pType.cast(mapper.readValue(pSource, pType));
		
		
	}
	
	/**
	 * 
	 * @param pSource
	 * @param pType
	 * @return
	 */
	public <T extends Object> T convertJSONStringToJavaObject(String pSource, TypeReference<T> pType){
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.readValue(pSource, pType);
		} catch (JsonParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	
	
	/**
	 * 
	 * @param pObject
	 * @return
	 */
	public String convertJavaObjectToJsonString(Object pObject){
		ObjectMapper mapper = new ObjectMapper();
		String returnValue = "{}";
		try {
			returnValue =mapper.writeValueAsString(pObject);
		} catch (JsonGenerationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JsonMappingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return returnValue;
	}
	
	
	/**
	 * fills in the request default params
	 * @param pAccountSession
	 * @return
	 */
	private final QueryStringBuilder getQueryStringDefaultValues(FuseAccountSession pAccountSession){
		QueryStringBuilder qs = new QueryStringBuilder();
		
		qs.add("t", pAccountSession.getToken());
		qs.add("u", pAccountSession.getUser());
		qs.add("d", pAccountSession.getDomain());
		
		return qs;
	}
	
	
	


	/** Public Methods **/


	/**
	 * authenticate via CP
	 * @param pUser
	 * @param pPassword
	 * @param pDomain
	 * @param pSession
	 * @return
	 */
	public HttpSession authenticate(String pUser, String pPassword, String pDomain, HttpSession pSession){
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		FuseAccountSession accountSession = new FuseAccountSession();
		try {
			
			//connect to service
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.authenticateMethod")+"?";
			QueryStringBuilder qs = new QueryStringBuilder();
			qs.add("u", pUser);
			qs.add("password", pPassword);
			qs.add("d", pDomain);
			qs.add("drf", "json");

			urlWithQueryString += qs;

			JSONObject resultJson = readJsonFromUrl(urlWithQueryString,null,pSession);
			
			
			
			//fill up session object.
			accountSession.setUser(pUser);
			accountSession.setPassword(pPassword);
			accountSession.setDomain(pDomain);
			
			if(resultJson.getString("success").equals("true")){
				accountSession.setSessionId(resultJson.getString("sessionId"));
				accountSession.setToken(resultJson.getString("token"));
				accountSession.setLoggedIn(true);
			}
			
			pSession.setAttribute(bundle.getString("session.fuseAccountAttribute"), accountSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return pSession;
	}
	
	
	/**
	 * list user mail accounts
	 * @param pSession
	 * @param detailLevel
	 * @return
	 */
	public JSONObject listAccounts(HttpSession pSession,Integer detailLevel){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		
		
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.listAccountsMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			if(detailLevel!=null){
				qs.add("detailLevel", detailLevel.toString());
			}

			urlWithQueryString += qs;
			
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
		
		}catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		//return result;
		
		return result;
	}
	
	/**
	 * list user mail accounts
	 * @param pSession
	 * @param detailLevel
	 * @return
	 */
	public ArrayList<Account> listAccountsForWeb(HttpSession pSession,Integer detailLevel){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		ArrayList<Account> accounts=new ArrayList<Account>();
		
		try {
			
			result = listAccounts(pSession, detailLevel);
			
			Account account;
			
			String data;
			
			for(int i=0;i<result.getJSONArray("accounts").length();i++){
				
				account = new Account();
				
				data = result.getJSONArray("accounts").getJSONObject(i).get("id").toString();
				
				account.setId(data);
				
					
				for(int j=0;j<result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").length();j++){
					
					
					switch (j){
						 case 0:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("name").toString();
							 account.setName(data);
		                 break;
		                 
						 case 1:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("hostName").toString();
							 account.setHostName(data);
		                 break;
		                 
						 case 2:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("port").toString();
							 account.setPort(data);
		                 break;
		                 
						 case 3:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("serverType").toString();
							 account.setServerType(data);
		                 break;
		                 
						 case 4:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("ssl").toString();
							 account.setSsl(data);
		                 break;
		                 
						 case 5:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("userName").toString();
							 account.setUserName(data);
		                 break;
		                 
						 case 6:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("timeout").toString();
							 account.setTimeout(data);
		                 break;
		                 
						 case 7:
							 data = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(j).get("defaultAccount").toString();
							 account.setDefaultAccount(data);
		                 break;
					}
				}
				
				
				accounts.add(account);
				
			}
			
		
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		//return result;
		return accounts;
	}
	
	
	/**
	 * create a new mail account
	 * @param pName
	 * @param pUserName
	 * @param pPassword
	 * @param pHostName
	 * @param pPort
	 * @param pServerType
	 * @param pSSL
	 * @param pTimeOut
	 * @param pDraftsFolder
	 * @param pRootFolder
	 * @param pSentFolder
	 * @param pTrashFolder
	 * @param pSession
	 */
	public JSONObject createAccount(
			String pName, 
			String pUserName, 
			String pPassword, 
			String pHostName, 
			Integer pPort, 
			String pServerType, 
			Boolean pSSL, 
			String pTimeOut, 
			String pDraftsFolder, 
			String pRootFolder, 
			String pSentFolder,
			String pTrashFolder,
			HttpSession pSession
			){
		
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		
		JSONObject result=new JSONObject();
		
		try {
			
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.addAccountMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add("accountName", pName);
			qs.add("userName", pUserName);
			qs.add("password", pPassword);
			qs.add("hostName", pHostName);
			
			//optional params
			if(pPort!=null){
				qs.add("port", pPort.toString());
			}
			if(pServerType!=null){
				qs.add("serverType", pServerType);
			}
			if(pSSL!=null){
				qs.add("ssl", pSSL.toString());
			}
			if(pTimeOut!=null){
				qs.add("timeout", pTimeOut);
			}
			if(pDraftsFolder!=null){
				qs.add("draftsFolder", pDraftsFolder);
			}
			if(pRootFolder!=null){
				qs.add("rootFolder", pRootFolder);
			}
			if(pSentFolder!=null){
				qs.add("sentFolder", pSentFolder);
			}
			if(pTrashFolder!=null){
				qs.add("trashFolder", pTrashFolder);
			}
			
			

			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return result;
		
	}
	
	
	/**
	 * delete account
	 * @param pName
	 * @param pSession
	 */
	public JSONObject deleteAccount(String pName, HttpSession pSession){
		
		JSONObject result=new JSONObject();
		
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.deleteAccountMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add("accountName", pName);
			
			
			

			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
			//System.out.println(result);
			

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return result;
		
	}
	

	/**
	 * modify (update) existing account
	 * @param pAccountId
	 * @param pName
	 * @param pUserName
	 * @param pPassword
	 * @param pHostName
	 * @param pPort
	 * @param pServerType
	 * @param pSSL
	 * @param pTimeOut
	 * @param pDraftsFolder
	 * @param pRootFolder
	 * @param pSentFolder
	 * @param pTrashFolder
	 * @param pSession
	 */
	public void modifyAccount(
			String pAccountId, 
			String pName, 
			String pUserName, 
			String pPassword, 
			String pHostName, 
			Integer pPort, 
			String pServerType, 
			Boolean pSSL, 
			String pTimeOut, 
			String pDraftsFolder, 
			String pRootFolder, 
			String pSentFolder,
			String pTrashFolder,
			HttpSession pSession
			){
		
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.modifyAccountMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add("accountId", pAccountId);
			
			if(pName!=null){
				qs.add("accountName", pName);
			}
			if(pUserName!=null){
				qs.add("userName", pUserName);
			}
			if(pPassword!=null){
				qs.add("password", pPassword);
			}
			if(pHostName!=null){
				qs.add("hostName", pHostName);
			}
			
			if(pPort!=null){
				qs.add("port", pPort.toString());
			}
			if(pServerType!=null){
				qs.add("serverType", pServerType);
			}
			if(pSSL!=null){
				qs.add("ssl", pSSL.toString());
			}
			if(pTimeOut!=null){
				qs.add("timeout", pTimeOut);
			}
			if(pDraftsFolder!=null){
				qs.add("draftsFolder", pDraftsFolder);
			}
			if(pRootFolder!=null){
				qs.add("rootFolder", pRootFolder);
			}
			if(pSentFolder!=null){
				qs.add("sentFolder", pSentFolder);
			}
			if(pTrashFolder!=null){
				qs.add("trashFolder", pTrashFolder);
			}
			
			

			urlWithQueryString += qs;

			JSONObject result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
			
			

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	/**
	 * 
	 * @param pSession
	 * @return
	 */
	public JSONObject makePrimaryAccount(String pAccountName, HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.modifyPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add(bundle.getString("cp.primaryAccountSetting"), pAccountName);

			urlWithQueryString += qs;
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	/**
	 * 
	 * @param pSession
	 * @return
	 */
	public JSONObject readPreferences(HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.readPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			

			urlWithQueryString += qs;
			

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	
	/**
	 * 
	 * @param pSession
	 * @return
	 */
	public ActionResult<Boolean> isReplyFromPrimary(HttpSession pSession){
		ActionResult<Boolean> returnValue=new ActionResult<Boolean>();
		JSONObject result = null;
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.readPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			

			urlWithQueryString += qs;
			

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
			returnValue.setError(!result.getBoolean("success"));
			if(returnValue.isError()){
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(result.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(result.getJSONArray("error").getJSONObject(0).getInt("result")));
				returnValue.setErrorsList(errors);
			}
			else{
				returnValue.setData(result.getJSONObject("attributes").getJSONArray(bundle.getString("cp.replyFromMainAccountSetting")).getBoolean(0));
			}
			

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return returnValue;
	}
	
	/**
	 * 
	 * @param pValue
	 * @param pSession
	 * @return
	 */
	public ActionResult<String> setReplyFromPrimary(Boolean pValue, HttpSession pSession){
		ActionResult<String> returnValue=new ActionResult<String>();
		JSONObject result = null;
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.modifyPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add(bundle.getString("cp.replyFromMainAccountSetting"), pValue.toString());

			urlWithQueryString += qs;
			

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			returnValue.setError(!result.getBoolean("success"));
			if(returnValue.isError()){
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(result.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(result.getJSONArray("error").getJSONObject(0).getInt("result")));
				returnValue.setErrorsList(errors);
			}
			else{
				returnValue.setData("success");
			}
			
			


		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return returnValue;
	}
	
	
	/**
	 * 
	 * @param pSession
	 */
	public UMBMetaData retrieveMetaData(HttpSession pSession){
		UMBMetaData returnValue=null;
		JSONObject result = null;
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.readPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			

			urlWithQueryString += qs;
			

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
			if(result.getBoolean("success")){
				try{
					returnValue = convertJSONStringToJavaObject(result.getJSONObject("attributes").getJSONArray(bundle.getString("cp.metaDataSetting")).getString(0), UMBMetaData.class);
				}
				catch(Exception e){
					returnValue = new UMBMetaData();
					returnValue.generateRandomFolderColors(FolderColors.getInstance().getColors());
					saveMetaData(returnValue, pSession);
				}
			}
			else{
				//not good
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return returnValue;

	}
	
	
	
	/**
	 * 
	 * @param pData
	 * @param pSession
	 * @return
	 */
	public Boolean saveMetaData(UMBMetaData pData, HttpSession pSession){
		Boolean returnValue=true;
		JSONObject result = null;
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.modifyPreferencesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			qs.add("drf", "json");
			qs.add(bundle.getString("cp.metaDataSetting"), convertJavaObjectToJsonString(pData));

			urlWithQueryString += qs;
			

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			returnValue = result.getBoolean("success");
			

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return returnValue;
	}
	
	
	
	/* Messages */
	
	/**
	 * 
	 * @param pName
	 * @param pFolderPath
	 * @param pSortCriteria
	 * @param pSortReverse
	 * @param pStartRange
	 * @param pEndRange
	 * @param pSelect
	 * @param pDetailLevel
	 * @param pSession
	 * @return
	 */
	public JSONObject listMessages(String pName,
			String pFolderPath,
			String pSortCriteria,
			Boolean pSortReverse,
			String pStartRange,
			String pEndRange,
			String pSelect,
			String pDetailLevel,
			HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.listMessagesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "xjson");
			
			if(pName!=null){
				qs.add("accountName", pName);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			if(pSortCriteria!=null){
				qs.add("sortCriteria", pSortCriteria);
			}
			if(pSortReverse!=null){
				qs.add("sortReverse", pSortReverse.toString());
			}
			if(pStartRange!=null){
				qs.add("startRange", pStartRange);
			}
			if(pEndRange!=null){
				qs.add("endRange", pEndRange);
			}
			if(pSelect!=null){
				qs.add("select", pSelect);
			}
			if(pDetailLevel!=null){
				qs.add("detailLevel", pDetailLevel);
			}
			
			qs.add("mode", "threadnested");
			
			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
		
		
	}
	
	
	/**
	 * 
	 * @param pName
	 * @param pFolderPath
	 * @param pSortCriteria
	 * @param pSortReverse
	 * @param pStartRange
	 * @param pEndRange
	 * @param pSelect
	 * @param pDetailLevel
	 * @param pSession
	 * @return
	 */
	public JSONObject listAggregatedMessages(String[] pNames,
			String[] pFolderPaths,
			String pSortCriteria,
			Boolean pSortReverse,
			String pStartRange,
			String pEndRange,
			String pSelect,
			String pDetailLevel,
			HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.listAggregatedMessagesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "xjson");
			
			//build the matrix of accounts/folders
			if(pNames!=null && pFolderPaths!=null){
				for(int i=1;i<=pNames.length;i++){
					for(int j=1;j<=pFolderPaths.length;j++){
						qs.add("accountName_"+i*j, pNames[i-1]);
						qs.add("folderPath_"+i*j, pFolderPaths[j-1]);
					}
				}
			}
			
			if(pSortCriteria!=null){
				qs.add("sortCriteria", pSortCriteria);
			}
			if(pSortReverse!=null){
				qs.add("sortReverse", pSortReverse.toString());
			}
			if(pStartRange!=null){
				qs.add("startRange", pStartRange);
			}
			if(pEndRange!=null){
				qs.add("endRange", pEndRange);
			}
			if(pSelect!=null){
				qs.add("select", pSelect);
			}
			if(pDetailLevel!=null){
				qs.add("detailLevel", pDetailLevel);
			}
			
			qs.add("mode", "threadnested");
			
			urlWithQueryString += qs;
			
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
		
		
	}
	
	
	/**
	 * 
	 * @param pMessageId
	 * @param pAccountName
	 * @param pFolderPath
	 * @param pDetailLevel
	 * @param pSession
	 * @return
	 */
	public JSONObject readMessage(
			String[] pMessageIds,
			String pAccountName,
			String pFolderPath,
			String pDetailLevel,
			HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.readMessagesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pMessageIds!=null){
				StringBuffer messageIds = new StringBuffer();
				for(String messageId:pMessageIds){
					messageIds.append(messageId+" ");
				}
				qs.add("messageIds", messageIds.substring(0, messageIds.length()-1));
				
			}
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			if(pDetailLevel!=null){
				qs.add("detailLevel", pDetailLevel);
			}
			else{
				qs.add("detailLevel", "ba");
			}
						
			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
		
		
	}
	
	
	/**
	 * Send Message
	 * @param pAccountName
	 * @param pReplyFolderPath
	 * @param pReplyMessageUID
	 * @param pReplyAll
	 * @param pForwardFolderPath
	 * @param pForwardMessageUID
	 * @param pDraftFolderPath
	 * @param pDraftMessageUID
	 * @param pSaveMessageFolderPath
	 * @param pCharset
	 * @param pFrom
	 * @param pReplyTo
	 * @param pTo
	 * @param pCC
	 * @param pBCC
	 * @param pSubject
	 * @param pContent
	 * @param pContentType
	 * @param pText
	 * @return
	 */
	public JSONObject sendMessage(
			String pAccountName, 
			String pReplyFolderPath, 
			String pReplyMessageUID, 
			Boolean pReplyAll, 
			String pForwardFolderPath, 
			String pForwardMessageUID, 
			String pDraftFolderPath, 
			String pDraftMessageUID, 
			String pSaveMessageFolderPath, 
			String pCharset, 
			String pFrom, 
			String pReplyTo, 
			String[] pTo, 
			String[] pCC, 
			String[] pBCC, 
			String pSubject, 
			String pContent, 
			String pContentType, 
			String pText,
			String pAttachments,
			HttpSession pSession){
		
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		String urlWithQueryString;
		QueryStringBuilder qs;
		
		String defaultAccount,name,userName;
		
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			
			
			
			if(pFrom==null || pFrom.equals("")){
				
				//list accounts for deciding which one will send (get primary)
				
				result = listAccounts(pSession, 1);
				
				
				
				for(int i=0;i<result.getJSONArray("accounts").length();i++){
					name = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(0).get("name").toString();
					userName = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(5).get("userName").toString();
					defaultAccount = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(7).get("defaultAccount").toString();
					
					if(defaultAccount.equals("true")){
						
						if(userName.indexOf("@")>0)
							pFrom = userName;
						else
							pFrom = name;
						break;
					}
				}
				
						
			}
			
			urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.sendMessageMethod")+"?";
					
			qs = getQueryStringDefaultValues(accountSession);
					
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
				
			}
			if(pReplyFolderPath!=null){
				qs.add("replyMessageFolderPath", pReplyFolderPath);
			}
			if(pReplyMessageUID!=null){
				qs.add("replyMessageUid", pReplyMessageUID);
			}
			if(pReplyAll!=null){
				qs.add("replyAll", pReplyAll.toString());
			}
			if(pForwardFolderPath!=null){
				qs.add("forwardMessageFolderPath", pForwardFolderPath);
			}
			if(pForwardMessageUID!=null){
				qs.add("forwardMessageUid", pForwardMessageUID);
			}
			if(pDraftFolderPath!=null){
				qs.add("draftMessageFolderPath", pDraftFolderPath);
			}
			if(pDraftMessageUID!=null){
				qs.add("draftMessageUid", pDraftMessageUID);
			}
			if(pSaveMessageFolderPath!=null){
				qs.add("saveMessageFolderPath", pSaveMessageFolderPath);
			}
			if(pCharset!=null){
				qs.add("charset", pCharset);
			}
			if(pFrom!=null){
				qs.add("from", pFrom);
				
			}
			if(pReplyTo!=null){
				qs.add("replyTo", pReplyTo);
			}
			if(pTo!=null){
				for(String to:pTo){
					qs.add("toRecipient", to);
				}
				
			}
			if(pCC!=null){
				for(String cc:pCC){
					qs.add("ccRecipient", cc);
				}
			}
			if(pBCC!=null){
				for(String bcc:pBCC){
					qs.add("bccRecipient", bcc);
				}
			}
			if(pSubject!=null){
				qs.add("subject", pSubject);
				
			}
			if(pContent!=null){
				qs.add("content", pContent);
			}
			if(pContentType!=null){
				qs.add("contentType", pContentType);
			}
			if(pText!=null){
				qs.add("text", pText);
			}
			
			
			if(pAttachments!=null){
				JSONArray attachments = new JSONArray(pAttachments);
				for(int i=1;i<=attachments.length();i++){
					JSONObject attachment = attachments.getJSONObject(i-1);
					qs.add("ea"+i+"_url", attachment.getString("serverfilename"));
					qs.add("ea"+i+"_fileName", attachment.getString("uploadfilename"));
				}
			}
			
			//attachments as external URLS
			//qs.add("ea1_url", "http://www.allgoodseats.com/images/rihanna-brick-wall.jpg");
			


			urlWithQueryString += qs;
			
			
			System.out.println(urlWithQueryString);
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
			//attachments test - as post request.
			
			//String[] attachments = {};
			
			//result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),attachments);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
		
	}
	
	/**
	 * 
	 * @param pAccountName
	 * @param pDraftMessageFolderPath
	 * @param pDraftMessageUID
	 * @param pSaveMessageFolderPath
	 * @param pCharset
	 * @param pFrom
	 * @param pReplyTo
	 * @param pTo
	 * @param pCC
	 * @param pBCC
	 * @param pSubject
	 * @param pContent
	 * @param pContentType
	 * @param pText
	 * @param pSession
	 * @return
	 */
	public JSONObject saveMessage(String pAccountName,
			String pDraftMessageFolderPath,
			String pDraftMessageUID,
			String pSaveMessageFolderPath,
			String pCharset, 
			String pFrom, 
			String pReplyTo, 
			String pTo, 
			String pCC, 
			String pBCC, 
			String pSubject, 
			String pContent, 
			String pContentType, 
			String pText,
			String pAttachments,
			HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			String defaultAccount,name,userName;
			
			if(pFrom==null || pFrom.equals("")){
				
				//list accounts for deciding which one will send (get primary)
				
				result = listAccounts(pSession, 1);
				
				
				
				for(int i=0;i<result.getJSONArray("accounts").length();i++){
					name = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(0).get("name").toString();
					userName = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(5).get("userName").toString();
					defaultAccount = result.getJSONArray("accounts").getJSONObject(i).getJSONArray("attributes").getJSONObject(7).get("defaultAccount").toString();
					
					if(defaultAccount.equals("true")){
						
						if(userName.indexOf("@")>0)
							pFrom = userName;
						else
							pFrom = name;
						break;
					}
				}
				
						
			}
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.saveMessageMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
				
			}
			
			if(pDraftMessageFolderPath!=null){
				qs.add("draftMessageFolderPath", pDraftMessageFolderPath);
			}
			
			if(pDraftMessageUID!=null){
				qs.add("draftMessageUid", pDraftMessageUID);
			}
			
			if(pSaveMessageFolderPath!=null){
				qs.add("saveMessageFolderPath", pSaveMessageFolderPath);
			}
			
			if(pCharset!=null){
				qs.add("charset", pCharset);
			}
			if(pFrom!=null){
				qs.add("from", pFrom);
				
			}
			if(pReplyTo!=null){
				qs.add("replyTo", pReplyTo);
			}
			if(pTo!=null){
				qs.add("toRecipient", pTo);
				
			}
			if(pCC!=null){
				qs.add("ccRecipient", pCC);
			}
			if(pBCC!=null){
				qs.add("bccRecipient", pBCC);
			}
			if(pSubject!=null){
				qs.add("subject", pSubject);
				
			}
			if(pContent!=null){
				qs.add("content", pContent);
			}
			if(pContentType!=null){
				qs.add("contentType", pContentType);
			}
			if(pText!=null){
				qs.add("text", pText);
				
			}
			
			if(pAttachments!=null){
				JSONArray attachments = new JSONArray(pAttachments);
				for(int i=1;i<=attachments.length();i++){
					JSONObject attachment = attachments.getJSONObject(i-1);
					qs.add("ea"+i+"_url", attachment.getString("serverfilename"));
					qs.add("ea"+i+"_fileName", attachment.getString("uploadfilename"));
				}
			}
			
			urlWithQueryString += qs;
			
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
		
		
	}
	
	
	
	/**
	 * move messages from folder to folder
	 * @param pAccountName
	 * @param pFolderPath
	 * @param pMessageIds
	 * @param pDestinationFolderPath
	 * @param retrieveNewUids
	 * @param pSession
	 * @return
	 */
	public JSONObject moveMessages(
			String pAccountName, 
			String pFolderPath, 
			String[] pMessageIds, 
			String pDestinationFolderPath, 
			Boolean pRetrieveNewUids, 
			HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.moveMessagesMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			if(pMessageIds!=null){
				StringBuffer messageIds = new StringBuffer();
				for(String messageId:pMessageIds){
					messageIds.append(messageId+" ");
				}
				qs.add("messageIds", messageIds.substring(0, messageIds.length()-1));
				
			}
			if(pDestinationFolderPath!=null){
				qs.add("dstFolderPath", pDestinationFolderPath);
			}
			if(pRetrieveNewUids!=null){
				qs.add("retrieveNewUids", pRetrieveNewUids.toString());
			}
						
			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	/**
	 * 
	 * @param pMessageIds
	 * @param pAccountName
	 * @param pFolderPath
	 * @param pFlags
	 * @param pSession
	 * @return
	 */
	public JSONObject modifyMessageFlags(String[] pMessageIds, String pAccountName, String pFolderPath, Map<String,String> pFlags, HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.modifyMessagesFlagsMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			if(pMessageIds!=null){
				StringBuffer messageIds = new StringBuffer();
				for(String messageId:pMessageIds){
					messageIds.append(messageId+" ");
				}
				qs.add("messageId", messageIds.substring(0, messageIds.length()-1));
				
			}
			Set<String> flagNames = pFlags.keySet();
			for(String flag:flagNames){
				qs.add("flag_"+flag, pFlags.get(flag));
			}
						
			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	
	/* Folders */
	
	/**
	 * 
	 * @param pSession
	 * @return
	 */
	public ActionResult<List<Folder>> listAllFolders(HttpSession pSession){
		
		ActionResult<List<Folder>> returnValue = new ActionResult<List<Folder>>();
		
		JSONObject accountsJson = listAccounts(pSession, 1);
		
		try {
			returnValue.setError(!accountsJson.getBoolean("success"));
			if(returnValue.isError()){
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(accountsJson.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(accountsJson.getJSONArray("error").getJSONObject(0).getInt("result")));
				returnValue.setErrorsList(errors);
			}
			else{
				//success
				returnValue.setData(new ArrayList<Folder>());
				List<Folder> returnFolders = returnValue.getData();
				JSONArray accountsArray = accountsJson.getJSONArray("accounts");
				for(int i=0;i<accountsArray.length();i++){
					JSONObject currentAccount = accountsArray.getJSONObject(i).getJSONArray("attributes").getJSONObject(0); 
					
					//determine if the account is external or internal
					String accountName = currentAccount.getString("name");
					
					if(!isExternalAccount(accountName)){
						List<Folder> folders = listFolders(accountName, null, "1", pSession).getData();
						if(folders!=null){
							for(Folder folder:folders){
								folder.setExternal(false);
								if(!returnFolders.contains(folder)){
									returnFolders.add(folder);
								}
								else{
									//if folder contained in list, just update the number of unread messages
									Folder f = returnFolders.get(returnFolders.indexOf(folder));
									f.setUnreadCount(f.getUnreadCount() + folder.getUnreadCount());
								}
							}
						}
					}
					else{
						//external account - add only inbox folder
						
					}
				}
				
				
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		

		return returnValue;
	}
	
	
	
	/**
	 * 
	 * @param pAccount
	 * @param pFolderPath
	 * @param pExpand
	 * @param pSession
	 * @return
	 */
	public ActionResult<List<Folder>> listFolders(String pAccount, String pFolderPath, String pExpand, HttpSession pSession){
		JSONObject jsonResult=new JSONObject();
		ActionResult<List<Folder>> returnValue = new ActionResult<List<Folder>>();
		
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.listFoldersMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccount!=null){
				qs.add("accountName", pAccount);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			if(pExpand!=null){
				qs.add("expand", pExpand);
			}
			
			qs.add("detailLevel", "1");
			
			
			urlWithQueryString += qs;
			
			
			jsonResult = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			returnValue.setError(!jsonResult.getBoolean("success"));
			if(returnValue.isError()){
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(jsonResult.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(jsonResult.getJSONArray("error").getJSONObject(0).getInt("result")));
				returnValue.setErrorsList(errors);
			}
			else{
				//success
				List<Folder> folders = convertJSONStringToJavaObject(jsonResult.getJSONArray("folders").toString(), new TypeReference<List<Folder>>() {} );
				//assign the folders colors (using CP workaround)
				UMBMetaData metaData = retrieveMetaData(pSession);
				for(Folder f:folders){
					f.setAccount(pAccount);
					f.setColor(metaData.getFoldersToColors().get(f.getName()));
				}
				returnValue.setData(folders);
			}

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return returnValue;
	}
	
	/**
	 * 
	 * @param pAccount
	 * @param pFolderPath
	 * @param pSession
	 * @return
	 */
	public ActionResult<List<Folder>> createFolder(String pAccount, String pFolderPath, HttpSession pSession){
		ActionResult<List<Folder>> result=new ActionResult<List<Folder>>();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		result.setError(false);
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.createFolderMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccount!=null){
				qs.add("accountName", pAccount);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			
			
			urlWithQueryString += qs;

			JSONObject jsonResult = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			if(jsonResult.getBoolean("success")){
				UMBMetaData metaData = retrieveMetaData(pSession);
				if(metaData.getFoldersToColors().get(pFolderPath)==null){
					metaData.getFoldersToColors().put(pFolderPath, metaData.nextAvailableColor());
					saveMetaData(metaData, pSession);
				}
				
				return listAllFolders(pSession);
			}
			else{
				result.setError(true);
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(jsonResult.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(jsonResult.getJSONArray("error").getJSONObject(0).getInt("result")));
				result.setErrorsList(errors);
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	/**
	 * 
	 * @param pAccount
	 * @param pFolderPath
	 * @param pSession
	 * @return
	 */
	public ActionResult<List<Folder>> deleteFolder(String pAccount, String pFolderPath, HttpSession pSession){
		ActionResult<List<Folder>> result=new ActionResult<List<Folder>>();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.deleteFolderMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccount!=null){
				qs.add("accountName", pAccount);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			
			
			urlWithQueryString += qs;

			JSONObject jsonResult = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			if(jsonResult.getBoolean("success")){
				return listAllFolders(pSession);
			}
			else{
				result.setError(true);
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(jsonResult.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(jsonResult.getJSONArray("error").getJSONObject(0).getInt("result")));
				result.setErrorsList(errors);
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	
	/**
	 * 
	 * @param pAccount
	 * @param pOldFolderPath
	 * @param pNewFolderPath
	 * @param pSession
	 * @return
	 */
	public ActionResult<List<Folder>> updateFolder(String pAccount, String pOldFolderPath, String pNewFolderPath, HttpSession pSession){
		ActionResult<List<Folder>> result=new ActionResult<List<Folder>>();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.updateFolderMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccount!=null){
				qs.add("accountName", pAccount);
			}
			if(pOldFolderPath!=null){
				qs.add("folderPath", pOldFolderPath);
			}
			if(pNewFolderPath!=null){
				qs.add("newFolderPath", pNewFolderPath);
			}
			
			
			urlWithQueryString += qs;

			JSONObject jsonResult = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);
			if(jsonResult.getBoolean("success")){
				UMBMetaData metaData = retrieveMetaData(pSession);
				//set the folder color on the meta data
				metaData.getFoldersToColors().put(pNewFolderPath, metaData.getFoldersToColors().get(pOldFolderPath));
				saveMetaData(metaData, pSession);
				
				return listAllFolders(pSession);
			}
			else{
				result.setError(true);
				ArrayList<String> errors = new ArrayList<String>();
				errors.add(jsonResult.getJSONArray("error").getJSONObject(0).getString("message"));
				errors.add(String.valueOf(jsonResult.getJSONArray("error").getJSONObject(0).getInt("result")));
				result.setErrorsList(errors);
			}
			
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	
	/**
	 * 
	 * @param pFolderName
	 * @param pAccountName
	 * @param pSession
	 * @return
	 */
	public JSONObject getFolderDetails(String pFolderName, String pAccountName, HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.getFolderDetailsMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
			}
			if(pFolderName!=null){
				qs.add("folderPath", pFolderName);
			}
			
			qs.add("detailLevel", "1");
						
			urlWithQueryString += qs;

			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	
	/**
	 * 
	 * @param pFolderPath
	 * @param pAccountName
	 * @param pSession
	 * @return
	 */
	public JSONObject emptyTrash(String pFolderPath, String pAccountName, HttpSession pSession){
		JSONObject result=new JSONObject();
		ResourceBundle bundle = ResourceBundle.getBundle("general");
		try {
			
			//check if logged in to API and login
			FuseAccountSession accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			if(!accountSession.isLoggedIn()){
				authenticate(accountSession.getUser(), accountSession.getPassword(), accountSession.getDomain(), pSession);
				accountSession = (FuseAccountSession) pSession.getAttribute(bundle.getString("session.fuseAccountAttribute"));
			}
			
			
			String urlWithQueryString = bundle.getString("cp.apiUrl")+bundle.getString("cp.emptyTrashMethod")+"?";
			
			QueryStringBuilder qs = getQueryStringDefaultValues(accountSession);
			
			qs.add("drf", "json");
			
			if(pAccountName!=null){
				qs.add("accountName", pAccountName);
			}
			if(pFolderPath!=null){
				qs.add("folderPath", pFolderPath);
			}
			
						
			urlWithQueryString += qs;
			
			result = readJsonFromUrl(urlWithQueryString,accountSession.getSessionId(),pSession);

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return result;
	}
	

}
