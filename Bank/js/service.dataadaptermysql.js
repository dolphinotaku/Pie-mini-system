// JavaScript Document
"use strict";

app.service('DataAdapterMySQL', function($rootScope, Security, Core){
	var dataMySQL = this;
	dataMySQL.GetTableStructureRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Table: "",
			Action: "GetTableStructure"
		}
		
		// ECMA6 merge two object
		// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
		// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			// url: url+'/GetData',
			data: JSON.stringify(requestOptions),
			// contentType: "application/json",
			//  dataType: "json", // [xml, json, script, or html]
		}
		return requestObject;
	}
	dataMySQL.GetTableStructureResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var converted_Data = ConvertGetTableStructure(data_or_JqXHR);
		var massagedObj = {
			table_schema: data_or_JqXHR.table_schema,
			DataColumns: converted_Data.DataColumns,
			KeyColumns: data_or_JqXHR.KeyColumns,
			TableSchema: {
				DataDict: data_or_JqXHR.table_schema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.KeyColumns
			},
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.GetDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Table: "",
            PageNum: 1,
            PageRecordsLimit: 10,
			Offset: 0,
			criteria: {},
			Action: "GetData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.GetDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			TableSchema: {
				DataDict: data_or_JqXHR.ActionResult.table_schema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.ActionResult.KeyColumns
			},
			data: data_or_JqXHR.ActionResult.data,
			TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.FindDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Table: "",
			Data: {},
			Action: "FindData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.FindDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			TableSchema: {
				DataDict: data_or_JqXHR.ActionResult.table_schema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.ActionResult.KeyColumns
			},
			data: data_or_JqXHR.ActionResult.data,
			TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.CreateDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();

    	var createObj = {
            "Header":{},
            "Items":{}
    	}
    	createObj.Header[1] = opts.recordObj;

		var requestOptions = {
			Session: clientID,
			Table: opts.Table,
			Data: createObj,
			Action: "CreateData"
		}
		
		// var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.CreateDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			data: data_or_JqXHR.ActionResult.data,
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.UpdateDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Table: "",
			Data: {},
			Action: "UpdateData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.UpdateDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			data: data_or_JqXHR.ActionResult.data,
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.DeleteDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Table: "",
			Data: {},
			Action: "DeleteData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.DeleteDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			data: data_or_JqXHR.ActionResult.data,
			message: data_or_JqXHR.Message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
    }
    dataMySQL.ImportDataRequest = function(opts){
		var clientID = Security.GetSessionID();

		var requestOptions = {
			Session: clientID,
			Table: opts.Table,
			FileUploadedResult: opts.recordObj,
			Action: "ImportData"
		}
		
		// var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
		
    }
	dataMySQL.ImportDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			data: data_or_JqXHR.ActionResult.data,
			message: data_or_JqXHR.ActionResult.processed_message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMySQL.ProcessDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Action: "ProcessData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.ProcessDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
        var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			TableSchema: {
				DataDict: data_or_JqXHR.ActionResult.table_schema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.ActionResult.KeyColumns
			},
			data: data_or_JqXHR.ActionResult.data,
			TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			message: data_or_JqXHR.ActionResult.processed_message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}
		return massagedObj;
    }
    
	dataMySQL.InquiryDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var clientID = Security.GetSessionID();
		var requestOptions = {
			Session: clientID,
			Action: "InquiryData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMySQL.InquiryDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
        var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
		var massagedObj = {
			table_schema: data_or_JqXHR.ActionResult.table_schema,
			TableSchema: {
				DataDict: data_or_JqXHR.ActionResult.table_schema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.ActionResult.KeyColumns
			},
			data: data_or_JqXHR.ActionResult.data,
			InquiryResult: data_or_JqXHR.ActionResult.InquiryResult,
			TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			message: data_or_JqXHR.ActionResult.processed_message,
			status: data_or_JqXHR.Status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}
		return massagedObj;
	}
	function ConvertGetTableStructure(data_or_JqXHR){
		var obj = {
			DataColumns: {}
		};
		var dataColumns = data_or_JqXHR.DataColumns;
		var newDataColumns = {};
		for(var columnName in dataColumns){
			var dataColumn = dataColumns[columnName];
			var newDataCol = {};
			jQuery.extend(true, newDataCol, dataColumn);

			newDataCol.type = Core.ConvertMySQLDataType(dataColumn.type);

			if(newDataCol.default === null){
				var defaultValue = null;
				switch(newDataCol.type){
					case "string":
						defaultValue = null;
						break;
					case "date":
						defaultValue = new Date(1970, 0, 1);
						break;
					case "double":
						defaultValue = 0.0;
						break;
				}
				newDataCol.default = defaultValue;
			}

			newDataColumns[columnName] = newDataCol;
		}
		
		obj.DataColumns = newDataColumns;
		
		return obj;
	}
})