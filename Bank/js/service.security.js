// JavaScript Document
"use strict";

app.service('Security', ['$rootScope', 'Core', 'CookiesManager', 'MessageService', function($rootScope, Core, $jqCookies,  MessageService) {
	var secure = this;
	var rootScope = $rootScope;
   
	secure.IsAlreadyLogin = function(callbackFtn){
		var url = $rootScope.serverHost;
		//var clientID = secure.GetSessionID();
		
		var submitData = {"Session": ""};
		submitData.Action = "CheckLogin";

		var jqxhr = $.ajax({
		  type: 'POST',
		  url: url+'/model/ConnectionManager.php',
		  data: JSON.stringify(submitData),
		  //dataType: "json", // [xml, json, script, or html]
		  dataType: "json",
		});
		jqxhr.done(function (data, textStatus, jqXHR) {
		});
		jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
		});
		jqxhr.always(function (data_or_JqXHR, textStatus, jqXHR_or_errorThrown) {
  			var isUserAlreadyLogin = false;
  			if(textStatus == "success"){
	  			var gData = data_or_JqXHR;
	  			if(data_or_JqXHR.Status == "LoginSuccess" || gData.Status == "OK"){
					isUserAlreadyLogin = true;
			       }
  			}
			callbackFtn && callbackFtn(isUserAlreadyLogin);
		});
	}
	
	secure.GetSessionID = function(){
        var sessionID = $jqCookies.Read("SessionID");
        return sessionID;
	}

	/**
	 *return object {
	 *	CompanyCode - string, 
	 *	UserCode - string, login id
	 *	Password - string, login password
	 *	StaffID - string, staff id without @staff@
	 *}
	*/
	secure.GetLoginData = function(){
        var loginDataString = $jqCookies.Read("LoginData");
        var loginObj = {};
        if(typeof(loginDataString) != "undefined"){
	        if(!loginDataString.IsNullOrEmpty()){
	        	loginObj = JSON.parse(loginDataString);
	        }
        }
        return loginObj;
	}
	
	// redirect a page require user login
	secure.RedirectToLoginPage = function(){
	   window.location = rootScope.requireLoginPage;
	}
	
	// redirect to a page after the user login
	secure.RedirectToMainPage = function(){
	   window.location = rootScope.afterLoginPage;
	}
	
	secure.GoToMenuIfSessionExists = function(){
		secure.IsAlreadyLogin(function(isUserAlreadyLogin){
			if(isUserAlreadyLogin){
				secure.RedirectToMainPage();
			}
		});
	}
	
	secure.RequiresAuthorization = function(){
		secure.IsAlreadyLogin(function(isUserAlreadyLogin){
			if(!isUserAlreadyLogin){
				alert("Session was timeout, please login agian");
				secure.RedirectToLoginPage();
			}
		});
	}

	secure.SuccessButUnexpected = function(jqXHR, textStatus, errorThrown){
		// console.warn("Server response status:200 but response unexpected");
		console.log("textStatus: " + textStatus);
		console.log(jqXHR);
		console.log(errorThrown);
	}

	secure.ServerResponse499 = function(jqXHR, textStatus, errorThrown){
		console.log("Server response status:499");
		console.log("Require login again");

		var gotoLoginAgain = confirm("Server Session timeout, leave this page to login again.");

		if(gotoLoginAgain){
			secure.ClearSessionNUserData();
			secure.RedirectToLoginPage();
		}
	}

	secure.ServerResponseInFail = function(jqXHR, textStatus, errorThrown){
		console.warn("jqxhr.fail, recevied (jqXHR, textStatus, errorThrown)")
		console.log("textStatus: " + textStatus);
		console.log(jqXHR);
		console.log(errorThrown);

		if(jqXHR.status == 499){
			secure.ServerResponse499(jqXHR, textStatus, errorThrown);
		}else if(jqXHR.responseText === ""){
			console.log("HTTP responseText is empty!")
			// Security.ServerResponse499(jqXHR, textStatus, errorThrown);
		}
	}


	secure.HttpPromiseFail = function(reason){
		console.warn("HttpRequest promise return as fail");
		console.dir(reason);
        MessageService.addMsg(reason);
	}
	secure.HttpPromiseReject = function(reason){
		console.warn("HttpRequest promise reject");
		console.dir(reason);
        MessageService.addMsg(reason);
	}
	secure.HttpPromiseErrorCatch = function(reason){
		console.warn("HttpRequest promise error catch");
		console.dir(reason);
		console.trace();
        MessageService.addMsg(reason);
	}

	/**
	 * @param {Object} loginDataObj - {"UserCode":"...","Password":"...","CompanyCode":"..."}
	 */
	secure.LoginNRedirect = function(loginDataObj, scope){
		var url = $rootScope.serverHost;
		var submitData = loginDataObj;
		submitData.UserCode.toLowerCase();

		submitData.Action = "Login";

  			var jqxhr = $.ajax({
  				type: 'POST',
  				url: url+'/model/ConnectionManager.php',
  				data: JSON.stringify(submitData),
  				dataType: "json", // [xml, json, script, or html]
  			});
  			jqxhr.done(function (data, textStatus, jqXHR) {

  			});
  			jqxhr.fail(function (jqXHR, textStatus, errorThrown) {

  			});
  			jqxhr.always(function (data_or_JqXHR, textStatus, jqXHR_or_errorThrown) {
  				// console.log("jqxhr.always, recevied (data_or_JqXHR, textStatus, jqXHR_or_errorThrown)")
  				scope.LoginResult(data_or_JqXHR, textStatus, jqXHR_or_errorThrown);
  				
  				if(textStatus == "success"){
	  				var gData = data_or_JqXHR;
	  				if(gData.Status == "success" || data_or_JqXHR.Status == "LoginSuccess"){
						$jqCookies.Save("SessionID", gData.SESSION_ID);
						submitData.UserCode = submitData.UserCode.toUpperCase();
						$jqCookies.Save("LoginData", JSON.stringify(submitData));
			        }
			        
		  			if(gData.Status == "success" || data_or_JqXHR.Status == "LoginSuccess"){
						alert("login success");
						secure.RedirectToMainPage();
					}
  				}

  			});
	}

	secure.SetTimeout = function(){
		var url = $rootScope.serverHost;
		var submitData = {"timeout": 3000000};

		var jqxhr = $.ajax({
			type: 'POST',
			url: url+'/SETTIMEOUT',
			data: JSON.stringify(submitData),
			dataType: "json", // [xml, json, script, or html]
		});

		jqxhr.done(function (data, textStatus, jqXHR) {
		});
		jqxhr.always(function (data_or_JqXHR, textStatus, jqXHR_or_errorThrown) {
			//secure.RedirectToMainPage();
		});
	}

	secure.LogoutNRedirect = function(){
		var url = $rootScope.serverHost;
		
		secure.IsAlreadyLogin(function(isUserAlreadyLogin){
			if(!isUserAlreadyLogin){
				alert("Session already destroyed.");
				secure.ClearSessionNUserData();
				secure.RedirectToLoginPage();
				return;
			}
		});
		
		var clientID = secure.GetSessionID();
		
		var submitData = {"Session": clientID};
		submitData.Action = "Logout";

		var jqxhr = $.ajax({
		  type: 'POST',
		  url: url+'/model/ConnectionManager.php',
		  data: JSON.stringify(submitData),
		  //dataType: "json", // [xml, json, script, or html]
		  dataType: "html",
		});
		jqxhr.done(function (data, textStatus, jqXHR) {
			secure.ClearSessionNUserData();
			alert("logout success");
			secure.RedirectToLoginPage();
		});
		jqxhr.fail(function (jqXHR, textStatus, errorThrown) {
		  console.log("jqxhr.fail, recevied (jqXHR, textStatus, errorThrown)")
		  console.log("textStatus: " + textStatus);
		  console.log(jqXHR);
		  console.log(errorThrown);
	
		});
		jqxhr.always(function (data_or_JqXHR, textStatus, jqXHR_or_errorThrown) {
		});
	}

	secure.ClearSessionNUserData = function(){
		$jqCookies.Remove("SessionID");
		$jqCookies.Remove("LoginData");
		return true;
	}

	secure.IsSystemField = function(fieldName){

        var isSystemField = false;

        switch (fieldName)
        {
            // skill these colummn
            case "Line":
            case "UserAccessGroups":
            case "UserGroups":
            case "Used":
            case "SysLastUpdateUser":
            case "SysLastUpdateDate":
            case "SysLastUpdatePgm":
            case "CreateDate":
            case "CreateUser":
            case "LastUpdateUser":
            case "LastUpdateDate":
                isSystemField = true;
                break;
        }

        return isSystemField;
	}
}]);
