package com;

import java.util.*;
import java.text.*;

import org.apache.http.HttpEntity;
import org.apache.http.util.EntityUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

// add external jar libraries for eclipse project development
// http://www.oxfordmathcenter.com/drupal7/node/44

// add external jar libraries for WAR file
// https://stackoverflow.com/questions/11918957/how-to-add-all-external-jars-to-library-on-eclipse-export-to-war

public class ScheduleTaskOne implements Runnable {
	
	private static final String APPLICATION_JSON = "application/json";

	@Override
	public void run() {
	    // Do your job here.
	      SimpleDateFormat ft = 
	    	      new SimpleDateFormat ("yyyy.MM.dd 'at' hh:mm:ss a zzz");
	      SimpleDateFormat logFile_ft = 
	    	      new SimpleDateFormat ("yyyy.MM.dd_hhmmss");
	      
		Date nowDT = new Date();
		
		String executeDateTimeStr = ft.format(nowDT);
		String logFileName = logFile_ft.format(nowDT);
		
	    System.out.println("Task scheduler trigged on: "+executeDateTimeStr);
	    
	    HttpClient httpClient = HttpClientBuilder.create().build(); //Use this instead 

	    try {

	        HttpPost request = new HttpPost("http://127.0.0.1/Develop/model/ConnectionManager.php");
	        
	        StringEntity params =new StringEntity("{\"Action\":\"ProcessData\",\"Table\":\"cron.job.scheduler\"}");
//	        request.addHeader("content-type", "application/x-www-form-urlencoded");
	        request.addHeader("content-type", APPLICATION_JSON);
	        
	        request.setEntity(params);
	        HttpResponse response = httpClient.execute(request);
	        
            String responseString = EntityUtils.toString(response.getEntity());
            JSONObject jsonObject = new JSONObject(responseString);
            JSONObject jsonActionResultObject = jsonObject.getJSONObject("ActionResult");
	        
	        WriteLog(logFileName, "Task scheduler trigged on: "+executeDateTimeStr);
            
	        System.out.println(jsonActionResultObject);
	        
	        JSONObject jsonArray = jsonActionResultObject.getJSONObject("data");
	        
	        if(jsonArray.length() > 0){
		    	WriteLog(logFileName+"_response", jsonArray.toString());
		    	
		    	/*
				for (int i = 0; i < jsonArray.length(); i++)
				{
//				    String post_id = jsonArray.getJSONObject(i).getString("post_id");
				    String row = jsonArray.getJSONObject(i).toString();
				    System.out.println(row);
				}
				*/
				
	        }

	    }catch (Exception ex) {

	        //handle exception here
	    	WriteLog(logFileName+"_error", ex.toString());
	    } finally {
	        //Deprecated
	        //httpClient.getConnectionManager().shutdown(); 
	    }
	    
	}
	
	public void WriteLog(String filename, String content) {
		String fileFullPath;
		
        BufferedWriter writer = null;
        try {
            //create a temporary file
//            String timeLog = new SimpleDateFormat(filename).format(Calendar.getInstance().getTime());
//            File logFile = new File(System.getProperty("user.dir"), filename);
//            File logFile = new File("D:\\xampp\\tomcat\\webapps\\testlog", filename);

//  		fileFullPath = "D:\\xampp\\tomcat\\webapps\\testlog\\" + timestamp+".txt";
  		fileFullPath = "D:\\xampp\\tomcat\\webapps\\testlog\\"+filename +".txt";

        //System.out.println(fileFullPath);
        	
            File logFile = new File(fileFullPath);
            logFile.createNewFile();
            
            // This will output the full path where the file will be written to...
//            System.out.println(logFile.getCanonicalPath());
            
            writer = new BufferedWriter(new FileWriter(logFile, true));
            writer.write(content);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                // Close the writer regardless of what happens...
                writer.close();
            } catch (Exception e) {
            }
        }
	}
}
