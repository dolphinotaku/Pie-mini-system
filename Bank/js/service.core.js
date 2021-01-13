// JavaScript Document
"use strict";

app.service('Core', ['$rootScope', 'config', 'SysMessageManager', function($rootScope, config, SysMessageManager){
	var core = this;
	core.SysLog = SysMessageManager;
	core.SysMsg = SysMessageManager;
	core.RegistryConfig = function(){
		$rootScope.globalCriteria = {};
		
		$rootScope.globalCriteria.editMode = config.editMode;
				
		$rootScope.serverHost = config.serverHost;
		$rootScope.webRoot = config.webRoot;
		
		$rootScope.webRoot += "/";	
		$rootScope.requireLoginPage = $rootScope.webRoot+config.requireLoginPage;
		$rootScope.afterLoginPage = $rootScope.webRoot+config.afterLoginPage;
		
		$rootScope.uiTheme = config.uiTheme.toUpperCase();
		$rootScope.icon = (config.icon) ? config.icon : "font_awesome4";
		
		$rootScope.controller = $rootScope.webRoot+config.reservedPath.controller;
		$rootScope.templateFolder = $rootScope.webRoot+config.reservedPath.templateFolder;
		$rootScope.screenTemplate = $rootScope.templateFolder+config.reservedPath.screenTemplate;
		$rootScope.uiThemeFolder = $rootScope.templateFolder+config.reservedPath.uiThemeTemplate;
		
		$rootScope.CookiesEffectivePath = config.CookiesEffectivePath;

		// Server Environment
		$rootScope.serEnv = {};
		$rootScope.serEnv.phpRecordLimit = 10; // assume PHP select reocrd limit as 10, must match with server side
	}
	core.GetConfig = function(){
		return config;
	}
	
    core.GetEditModeEnum = function(attrEditMode){
		attrEditMode = attrEditMode.toLowerCase();
        var editModeList = $rootScope.globalCriteria.editMode;
        var isEditModeExists = false;
        var isEditModeNumeric = false;
        var isEditModeValid = false;
        var editMode = 0;

        if(typeof(attrEditMode) != undefined){
            if(attrEditMode != null && attrEditMode !=""){
                isEditModeExists = true;
            }
        }
        if(isEditModeExists){
            isEditModeNumeric = !isNaN(parseInt(attrEditMode));
        }
        if(!isEditModeExists){
            editMode = editModeList.None;
        }else{
			for(var index in editModeList){
				var modeLowerCase = index.toLowerCase();
				var value = editModeList[index];
				if(isEditModeNumeric){
					if(attrEditMode == value)
					{
						isEditModeValid = true;
						break;
					}
				}else{
					if(attrEditMode == modeLowerCase)
					{
						attrEditMode = value
						isEditModeValid = true;
						break;
					}
				}
			}
        }
		if(!isEditModeValid){
			console.trace("stack trace details")
			throw ("Unable to identify the edit mode '"+attrEditMode+"' on directive");
		}
        return editMode;
	}
	
	core.IsDateInvalid = function(dateObj){
		var isDate = true;

		if(typeof (dateObj) == "undefined" || dateObj == null){
			isDate = false;
		}else{
			if(dateObj.getFullYear() <= 1970){
				isDate = false;
			}
		}

		return isDate;
	}
	
	core.ConvertMySQLDataType = function(mySqlDataType){
        var dataType ="string";
        if(mySqlDataType == "varchar" || 
            mySqlDataType == "char" || 
            mySqlDataType == "tinytext" || 
            mySqlDataType == "text" || 
            mySqlDataType == "mediumtext" || 
            mySqlDataType == "longtext"){
            dataType = "string";
        }
        else if (
            mySqlDataType == "date"){
            dataType = "date";
        }
        else if (mySqlDataType == "datetime" ||
            mySqlDataType == "timestamp" ){
            dataType = "datetime";
        }
        else if (mySqlDataType == "double" ||
            mySqlDataType == "decimal"  ||
            mySqlDataType == "float"  ||
            mySqlDataType == "tinyint"  ||
            mySqlDataType == "smallint"  ||
            mySqlDataType == "mediumint"  ||
            mySqlDataType == "int"  ||
            mySqlDataType == "bigint" ){
            dataType = "double";
        }
        return dataType;
	}
	core.IsSystemField = function(fieldName){

        var isSystemField = false;

        switch (fieldName)
        {
            // skill these colummn
            case "line":
            case "systemUpdateDate":
            case "systemUpdateUser":
            case "systemUpdateProgram":
            case "createDate":
            case "createUser":
            case "lastUpdateUser":
            // case "lastUpdateDate":
                isSystemField = true;
                break;
        }

        return isSystemField;
	}
	core.IsMySQLServer = function(){
		var isMySQLServer = false;
		if(config.dataServer == "php")
			isMySQLServer = true;
		return isMySQLServer;
	}
	
	core.RegistryConfig();
	return core;
}]);