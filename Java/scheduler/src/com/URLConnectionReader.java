package com;

import java.net.*;
import java.io.*;

public class URLConnectionReader {
    public URLConnectionReader(String url) throws Exception {
    	if(main.isNullOrEmpty(url))
    		throw new Exception("url cannot null or empty");
    	
        URL oracle = new URL(url);
        URLConnection yc = oracle.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(
                                    yc.getInputStream()));
        String inputLine;
        while ((inputLine = in.readLine()) != null) 
            System.out.println(inputLine);
        in.close();
    }
}
