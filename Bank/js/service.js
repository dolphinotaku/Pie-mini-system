// JavaScript Document
"use strict";

app.service('ThemeService', ['$rootScope', 'config', 'TemplateService', function($rootScope, config, TemplateService){
	var theme = this;
	
	theme.GetThemeName = function(){
		var themeCode = config.uiTheme.toUpperCase();
		return GetThemeName(themeCode);
	}
	
	theme.GetTemplateHTML = function(directiveName){
		var templatePath = theme.GetTemplateURL(directiveName);
		
		var request = TemplateService.GetTemplate(templatePath);
		// request.then(function(responseObj) {
  //           var data = responseObj.data;
		// });
		
		return request;
	}
	
	theme.GetTemplateURL = function(directiveName){
		var themeCode = config.uiTheme.toUpperCase();
		var themeName = theme.GetThemeName(themeCode);
		var templateName = directiveName+"-"+themeName+".html";
		var templatePath = $rootScope.uiThemeFolder + themeName + "/" + templateName;
		
		return templatePath;
	}
	
	function GetThemeName(themeCode){
		var themeName = "";
		switch(themeCode){
			case "D":
				themeName = "default";
				break;
			case "B":
				themeName = "bootstrap";
				break;
			case "U":
				themeName = "uikit";
				break;
			case "W":
				themeName = "w3css";
				break;
			case "M":
				themeName = "material_ng";
				break;
			case "J":
				themeName = "jqueryui";
				break;
			case "S":
				themeName = "semantic";
				break;
			default:
				themeName = "default";
				break;
		}
		return themeName;
	}
}]);

app.service('CookiesManager', function($rootScope, $cookies) {
	var cookies = this;
	var rootScope = $rootScope;
   
	cookies.Save = function(name, value){
		//Define lifetime of the cookie. Value can be a Number which will be interpreted as days from time of creation or a Date object. If omitted, the cookie becomes a session cookie.
		var expiryDay = 1;
		
		//Define the path where the cookie is valid. By default the path of the cookie is the path of the page where the cookie was created (standard browser behavior). If you want to make it available for instance across the entire domain use path: '/'. Default: path of page where the cookie was created.
		$.cookie(name, value, { expires: expiryDay, path: '/' });
	}
	cookies.Read = function(name){
		var value;
		value = $.cookie(name);
		return value;
	}
	cookies.Remove = function(name){
		var removeStatus = $.removeCookie(name, { path: '/' });
		return removeStatus;
	}
	cookies.RemoveAllCookies = function(){
		var allCookies = $.cookie();
		for(var key in allCookies){
			var removeResultDesc = "Remove cookies: "+key;
			var removeStatus = $.removeCookie(key);
			removeResultDesc += removeStatus;
			console.log(removeResultDesc);
		}
	}
	cookies.PrintAllCookies = function(){
		var allCookies = $.cookie();
		var cooliesAsJsonText = JSON.stringify(allCookies, null, 4);
		console.dir(allCookies);
		console.log(cooliesAsJsonText);
	}
});


app.service('HTML5WebStorageManager', ["$rootScope", "$log", function($rootScope, $log) {
	var webstorage = this;
    var rootScope = $rootScope;
    var dataStoreLabel = "DolphinOtakuValue";
    var dictionaryStoreLabel = "DolphinOtakuSchema";
    
	webstorage.IsSupportWebStorage = function(){
        var supportWebStorage = false;
        if (typeof(Storage) !== "undefined") {
            supportWebStorage = true;
        } else {
            // Sorry! No Web Storage support..
        }
        return supportWebStorage;
    }
    webstorage.PrintNotSupportWebStorageMsg = function(){
        var msg = "";
        msg = "Html 5 web storage is not supported in this browser";
        $log.error(msg);
        msg = "reject for read/write data to webstorage";
        $log.error(msg);
        console.trace();
    }
    webstorage.CheckValueDataType = function(value){
        var _type = "string";
        // https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
        if(Object.prototype.toString.call(value) === '[object Date]'){
            _type = "date";
        }else if(!isNaN(value)){
            _type = "number"
        }else if(typeof variable === "boolean"){
            _type = "boolean"
        }else if(Array.isArray(value)){
            _type = "array";
        }else if(Object.prototype.toString.call(value) === '[object Object]'){
            _type = "object";
        }else{
            _type = "string";
        }
        return _type;
    }
    webstorage.CreateDataSchemaByValue = function(value){
        var _dataSchema;
        var _type = webstorage.CheckValueDataType(value);
        if(_type == "object"){
            _dataSchema = {};
            for (var objProperty in value) {
                _dataSchema[objProperty] = webstorage.CreateDataSchemaByValue(value[objProperty]);
            }
        }else if(_type == "array"){
            _dataSchema = [];
            value.forEach(function(item){
                var elementSchema = webstorage.CreateDataSchemaByValue(item);
                _dataSchema.push(elementSchema);
            });
        }else{
            _dataSchema = _type;
        }

        return _dataSchema;
    }
    webstorage.CorrectValueByDataSchema = function(dataSchema, _jsonParseResult){
        var _type = "string";
        var adjustedValue;
        // use data schema to massaged the json parsed object
        if(Array.isArray(_jsonParseResult)){
            _type = "array";
            adjustedValue = [];
            for (var index = 0; index < _jsonParseResult.length; index++) { 
                var arrayElement = _jsonParseResult[index];
                var elementSchema = dataSchema[index];
                var _value = webstorage.CorrectValueByDataSchema(elementSchema, arrayElement);
                adjustedValue[index] = _value;
            }

        }else if(Object.prototype.toString.call(_jsonParseResult) === '[object Object]'){
            _type = "object";
            adjustedValue = {};
            
            for (var objProperty in _jsonParseResult) {
                var objectElement = _jsonParseResult[objProperty];
                var elementSchema = dataSchema[objProperty];
                
        // console.dir("data is in object");
        // console.dir(objProperty);
        // console.dir(objectElement);
        // console.dir(elementSchema);
                var _value = webstorage.CorrectValueByDataSchema(elementSchema, objectElement);
                adjustedValue[objProperty] = _value;
            }
        }else{
            _type = "string";
            // console.dir("data is in not array/object");
            // console.dir(_jsonParseResult);
            // console.dir(dataSchema);
            switch(dataSchema){
                case "date":
                    adjustedValue = new Date(_jsonParseResult);
                break;
                case "number":
                    adjustedValue = _jsonParseResult;
                break;
                case "boolean":
                    adjustedValue = _jsonParseResult;
                break;
                case "string":
                    adjustedValue = _jsonParseResult;
                break;
                default:
                    adjustedValue = _jsonParseResult;
            }
        }

        return adjustedValue;
    }
    webstorage.ConvertValueFromSave = function(schemaObjList, _jsonParseResult){
        var _adjustedObject;

        // console.dir(_jsonParseResult);
        // console.dir(_dataSchemaParseResult);
        _adjustedObject = webstorage.CorrectValueByDataSchema(schemaObjList, _jsonParseResult);

        return _adjustedObject;
    }
    webstorage.ConvertValueToWrite = function(_customValue){
        var _object = {
            _strValue:"", // in string of JSON.stringify
            _dataSchema:"" // in string of JSON.stringify
        }

        _object._strValue = JSON.stringify(_customValue);
        _object._dataSchema = webstorage.CreateDataSchemaByValue(_customValue);

        return _object;
    }
    webstorage.SaveLocalStorage = function(key, customValue){
        var isSupport = webstorage.IsSupportWebStorage();
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }
        var _object = webstorage.ConvertValueToWrite(customValue);
        var _valueStr = window.localStorage[dataStoreLabel];
        var _valueObj = {};
        // read local storage and convert json string to a object
        if(typeof(_valueStr) == "undefined" || _valueStr == null || _valueStr == ""){
            
        }else{
            try {
                _valueObj = JSON.parse(_valueStr);
            } catch(e) {
            }
        }
        // assign empty object if the converted object is undefined | null | empty
        if(typeof(_valueObj) == "undefined" || _valueObj == null || _valueObj == ""){
            _valueObj = {};
        }
        
        // save value to local storage
        // window.localStorage[key] = _object._strValue;
        _valueObj[key] = customValue;
        // console.dir(_object);
        // console.dir(customValue);
        window.localStorage[dataStoreLabel] = JSON.stringify(_valueObj);

        var _dictionaryStr = window.localStorage[dictionaryStoreLabel];
        if(typeof _dictionaryStr == "undefined" || _dictionaryStr == null || _dictionaryStr == ""){
            webstorage.SaveLocalDictionary({});
        }
        // read schema
        var schemaListObj = webstorage.ReadLocalDictionary();
        if(typeof schemaListObj == "undefined" || schemaListObj == null || schemaListObj == "") schemaListObj = {};
        // save schema to local storage
        if(!schemaListObj.hasOwnProperty(key)){
        }
        schemaListObj[key] = _object._dataSchema;
        // console.dir(_object);
        // console.dir(schemaListObj);
        webstorage.SaveLocalDictionary(schemaListObj);
    }
    webstorage.SaveLocalDictionary = function(schemaObjList){
        window.localStorage[dictionaryStoreLabel] = JSON.stringify(schemaObjList);
    }
    webstorage.ReadLocalDictionary = function(){
        var _dictionaryStr;
        var _dictionaryObj;
        _dictionaryStr = window.localStorage[dictionaryStoreLabel];
        // return undefined if dictionary is not created
        if(typeof _dictionaryStr == "undefined" || _dictionaryStr == null || _dictionaryStr == "") return _dictionaryObj;
        
        // JSON parse the dictionary string
        if(typeof (_dictionaryStr) != "undefined" && _dictionaryStr != null && _dictionaryStr != ""){
            try {
                _dictionaryObj = JSON.parse(_dictionaryStr);
            } catch(e) {
            }
        }
        
        return _dictionaryObj;
    }
    webstorage.ReadLocalStorage = function(key){
        var isSupport = webstorage.IsSupportWebStorage();
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }
        var value;
        var isValueExists = true;
        var isSchemaExists = true;
        // read string value
        var valueString = window.localStorage[dataStoreLabel];
        // return if the string value is undefined | null | empty
        if(typeof(valueString) == "undefined" || valueString == null || valueString == "") return valueString;
        
        // Convert json string into a object
        var _valueObj;
        try {
            _valueObj = JSON.parse(valueString);
        } catch(e) {
        }
        // return the converted object if it is undefined | null | empty
        if(typeof(_valueObj) == "undefined" || _valueObj == null || _valueObj == "") return _valueObj;
        // return undefined if the converted object is undefined | null | empty
        if(!_valueObj.hasOwnProperty(key)){
            isValueExists = false;
            return value;
        }

        // read schema list
        var _schemaListObj = webstorage.ReadLocalDictionary();
        if(typeof(_schemaListObj) == "undefined" || _schemaListObj == null || _schemaListObj == "") return value;
        // check valueString schema
        if(!_schemaListObj.hasOwnProperty(key)) return value;
        var _valueSchemaObj = _schemaListObj[key];
        
        if(typeof (_valueSchemaObj) == "undefined") isSchemaExists = false;
        if(isValueExists && isSchemaExists){
            var _jsonParseResult = _valueObj[key];
            value = webstorage.ConvertValueFromSave(_valueSchemaObj, _jsonParseResult);
        }

        return value;
    }
	webstorage.RemoveLocalStorage = function(key){
        var isSupport = webstorage.IsSupportWebStorage();
        var isDeleted = false;
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }

        // read string value
        var valueString = window.localStorage[dataStoreLabel];
        // return if the string value is undefined | null | empty
        if(typeof(valueString) == "undefined" || valueString == null || valueString == "") return isDeleted;
        
        // Convert json string into a object
        var _valueObj;
        try {
            _valueObj = JSON.parse(valueString);
        } catch(e) {
        }
        // return the converted object if it is undefined | null | empty
        if(typeof(_valueObj) == "undefined" || _valueObj == null || _valueObj == "") return isDeleted;
        // return undefined if the converted object is undefined | null | empty
        if(_valueObj.hasOwnProperty(key)){
            // remove key-value pair from storage 
            delete _valueObj[key];
            // save new storage
            window.localStorage[dataStoreLabel] = JSON.stringify(_valueObj);

            // remove schema
            var schemaListObj = webstorage.ReadLocalDictionary();
            if(typeof schemaListObj == "undefined" || schemaListObj == null || schemaListObj == "") schemaListObj = {};
            if(schemaListObj.hasOwnProperty(key)){
                delete schemaListObj[key];
            }
            // save new schema
            webstorage.SaveLocalDictionary(schemaListObj);

            isDeleted = true;
        }

        // window.localStorage.removeItem(key);

        return isDeleted;
	}
    webstorage.SaveSessionStorage = function(key, value){
        var isSupport = webstorage.IsSupportWebStorage();
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }
        window.sessionStorage[key] = value;
    }
    webstorage.ReadSessionStorage = function(key){
        var isSupport = webstorage.IsSupportWebStorage();
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }
        var value = window.sessionStorage[key];
        return value;
    }
	webstorage.RemoveSessionStorage = function(key){
        var isSupport = webstorage.IsSupportWebStorage();
        if(!isSupport){
            webstorage.PrintNotSupportWebStorageMsg();
            return;
        }
        window.sessionStorage.removeItem(key);
	}
}]);

app.service('SysMessageManager', ["$rootScope", "$log", "config", function($rootScope, $log, config) {
	var message = this;
	var rootScope = $rootScope;
    
    // GetMessageText(msgID, parma1, parma2...)
    // msgID: message unique ID
    // parma: parma will be merge in the message
    // reference: https://stackoverflow.com/questions/18405736/is-there-a-c-sharp-string-format-equivalent-in-javascript
    message.GetMessageText = function(){
        var msgID = arguments[0];
        var msg = message.GetMessage(msgID);
        var args = arguments;
        var text = msg.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number++] != 'undefined'
            ? args[number++]
            : match
          ;
        });
        return text;
    }
    
    message.GetMessage = function(msgID){
        var messageList = {
            PageRecordsLimitDefault: "<PAGEVIEW> attribute of page-records-limit default as {0}",
            PageviewValidateRecord: "scope.$id:{0}, may implement $scope.ValidateRecord() function in webapge",
            PageviewEventListener: "scope.$id:{0}, may implement $scope.EventListener() function in webapge",
            CustomPointedToRecordNotFound: "<PAGEVIEW> program ID: {0} may implement CustomPointedToRecord() function in webpage",
            CustomSelectedToRecordNotFound: "<PAGEVIEW> program ID: {0} may implement CustomSelectedToRecord() function in webpage",
            BeginningOfThePageCannotGotoPrevious: "<PAGEVIEW> program ID: {0} already at the first page, cannot go previous.",
            DisplayPageNum: "<PAGEVIEW> program ID: {0} going to display the records of the Page no.({1})",
        }
        
        var msg = "";
        if(typeof(messageList[msgID]) != "undefined")
            msg = messageList[msgID];
        return msg;
    }
    message.Print = function(msgID, caller, issueType, logType){
        var text = message.GetMessageText(msgID);
        message.WriteLog(text, caller, issueType, logType);
    }
   
	message.WriteLog = function(msg, caller, issueType, logType){
        if(typeof(logType) == "undefined") logType = "log";
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";

        logType = logType.toLowerCase();
        switch(logType){
            case "log":
                message.L(msg);
                break;
            case "warn":
                message.W(msg);
                break;
            case "info":
                message.I(msg);
                break;
            case "error":
                message.E(msg);
                break;
        }
		if(config.debugLog.ShowCallStack)
			console.trace();
	}
    message.L = function(msg, caller, issueType, issueCategory){
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";
        if(typeof(issueCategory) == "undefined") issueCategory = "None";
        if(!CheckLoggingAvailable(caller, issueType, issueCategory)) return;
        $log.log(msg);
        if(!CheckLoggingTraceCallStack(caller, issueType)) return;
        console.trace()
    }
	message.W = function(msg, caller, issueType, issueCategory){
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";
        if(typeof(issueCategory) == "undefined") issueCategory = "None";
        if(!CheckLoggingAvailable(caller, issueType, issueCategory)) return;
        $log.warn(msg);
        if(!CheckLoggingTraceCallStack(caller, issueType)) return;
        console.trace()
	}
	message.I = function(msg, caller, issueType, issueCategory){
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";
        if(typeof(issueCategory) == "undefined") issueCategory = "None";
        if(!CheckLoggingAvailable(caller, issueType, issueCategory)) return;
        $log.info(msg);
        if(!CheckLoggingTraceCallStack(caller, issueType)) return;
        console.trace()
	}
	message.E = function(msg, caller, issueType, issueCategory){
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";
        if(typeof(issueCategory) == "undefined") issueCategory = "None";
        if(!CheckLoggingAvailable(caller, issueType, issueCategory)) return;
        $log.error(msg);
        if(!CheckLoggingTraceCallStack(caller, issueType)) return;
        console.trace()
	}
	message.D = function(msg, caller, issueType, issueCategory){
        if(typeof(caller) == "undefined") caller = "MessageManager";
        if(typeof(issueType) == "undefined") issueType = "Default";
        if(typeof(issueCategory) == "undefined") issueCategory = "None";
        if(!CheckLoggingAvailable(caller, issueType, issueCategory)) return;
        $log.debug(msg);
        if(!CheckLoggingTraceCallStack(caller, issueType)) return;
        console.trace()
	}
    
    function CheckLoggingAvailable(caller, issueType){
        var isValid = true;
        var debugLogConfig = config.debugLog;
        
        if(typeof(debugLogConfig[issueType]) != "undefined")
            isValid = debugLogConfig[issueType];
        
        else if(typeof(debugLogConfig[caller]) != "undefined")
            isValid = debugLogConfig[caller];
        
        return isValid;
    }
    function CheckLoggingTraceCallStack(){
        var isValid = false;
        var debugLogConfig = config.debugLog;
        if(typeof(debugLogConfig["ShowCallStack"]) != "undefined")
            isValid = debugLogConfig["ShowCallStack"];
        return isValid;
    }
}]);

// 20180917, keithpoon, fixed: now can create instance for LoadingModal
app.factory('LoadingModal', function ($window, $document, $rootScope) {
    var root = function(){
        var loadingModal = {};
        var loadingIcon = {};
        var loadingIconContainer = {};
        var seed = Math.floor(Math.random() * 100) + 1;

        var showModal = function(msg){
            if(typeof(msg) == "undefined" || msg == null || msg == "")
                msg = "Loading...";

            loadingModal = $( "<div/>", {
            "class": "modal loading-modal",
            // click: function() {
            //   $( this ).toggleClass( "test" );
            // }
            }).show().appendTo("body");
            
            if($rootScope.icon == "font_awesome4"){
            // font awesome 4.7
            loadingIcon = $("<div/>", {
                "class": "loading-icon",
                "html": '<i class="fa fa-circle-o-notch fa-spin fa-5x fa-fw"></i>',
            });
            }else if ($rootScope.icon == "font_awesome5"){
            
            // font awesome 5
            loadingIcon = $("<div/>", {
                "class": "loading-icon",
                "html": '<i class="fas fa-circle-notch fa-spin fa-5x fa-fw"></i>',
            });
            
            }

            loadingIconContainer = $("<div/>", {
            "class": "modal",
            "html": loadingIcon,
            }).show();

            loadingIconContainer.appendTo("body");
            loadingIcon.css("margin-top", ( jQuery(window).height() - loadingIcon.height() ) / 2 + "px");
        };
        var hideModal = function(){
            loadingModal.remove();
            loadingIconContainer.remove();
        }

        return {
            showModal: showModal,
            hideModal: hideModal
        }
    };
    return root;
});

//
// call HttpRequest simple
/*
Object{
	data – {string|Object} – The response body transformed with the transform functions.
	status – {number} – HTTP status code of the response.
	headers – {function([headerName])} – Header getter function.
	config – {Object} – The configuration object that was used to generate the request.
	statusText – {string} – HTTP status text of the response.
}
e.g
Object{
	data: Object
	status: 200
	headers: function()
	config: Object
	statusText: "OK"
}
*/
app.service('HttpRequeset', function($rootScope, $http){
	var self = this;
	// return $q(function(resolve, reject){
	// })
	self.send = function(requestOptions){
		var url = $rootScope.serverHost;
		if(typeof(requestOptions.url) == "undefined")
			requestOptions.url = url+'/model/ConnectionManager.php';
        
        requestOptions.cache = false;

//		return $http(
//			requestOptions
//		);
        return SendXMLHttpRequest(requestOptions);
	}
    
    self.GetTemplate = function(templatePath){
        var requestOptions = {
            method: "GET",
            url: templatePath
        }
		return SendXMLHttpRequest(requestOptions);
	}
    
    function SendXMLHttpRequest(requestOptions){
        return $http(requestOptions);
    }
});

app.service('TemplateService', function($rootScope, $http, HttpRequeset){
	var tpService = this;
	
	tpService.GetTemplate = function(templatePath){
		return HttpRequeset.GetTemplate(templatePath);
	}
})
