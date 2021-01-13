// JavaScript Document
"use strict";

app.service('DataAdapterMsSQL', function($rootScope, Core){
	var dataMsSQL = this;
	
	dataMsSQL.GetTableStructureRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
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
	dataMsSQL.GetTableStructureResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var converted_Data = ConvertGetTableStructure(data_or_JqXHR);
        
		var massagedObj = {
			DataColumns: converted_Data.DataColumns,
			KeyColumns: data_or_JqXHR.dataSets[1],
			TableSchema: {
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.dataSets[1]
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
	dataMsSQL.GetDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
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
	dataMsSQL.GetDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
		var massagedObj = {
			TableSchema: {
				DataDict: converted_Data.NativeDataSchema,
				DataColumns: converted_Data.DataColumns,
				KeyColumns: data_or_JqXHR.dataSets[1]
			},
			data: data_or_JqXHR,
			TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			status: data_or_JqXHR.overall_status,
			overall_status: data_or_JqXHR.overall_status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMsSQL.FindDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
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
	dataMsSQL.FindDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		//var converted_Data = ConvertGetTableStructure(data_or_JqXHR.ActionResult);
			/*
		var massagedObj = {
			dataSets: data_or_JqXHR.dataSets,
			//TotalRecordCount: (data_or_JqXHR.TotalRecordCount) ? data_or_JqXHR.TotalRecordCount : -1,
			//message: data_or_JqXHR.Message,
			status: data_or_JqXHR.overall_status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}
		*/
		var massagedObj = data_or_JqXHR;
		return massagedObj;
	}
	dataMsSQL.CreateDataRequest = function(opts){
		var url = $rootScope.serverHost;

    	var createObj = {
            "Header":{},
            "Items":{}
    	}
    	createObj.Header[1] = opts.recordObj;

		var requestOptions = {
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
	dataMsSQL.CreateDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			data: data_or_JqXHR,
			status: data_or_JqXHR.overall_status,
			overall_status: data_or_JqXHR.overall_status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMsSQL.UpdateDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
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
	dataMsSQL.UpdateDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			data: data_or_JqXHR,
			//message: data_or_JqXHR.Message,
			status: data_or_JqXHR.overall_status,
			overall_status: data_or_JqXHR.overall_status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
	}
	dataMsSQL.DeleteDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
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
	dataMsSQL.DeleteDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
		var massagedObj = {
			data: data_or_JqXHR,
			//message: data_or_JqXHR.Message,
			status: data_or_JqXHR.overall_status,
			overall_status: data_or_JqXHR.overall_status,
			HTTP: {
				statusCode: responseObj.status,
				statusText: responseObj.statusText,
			}
		}

		return massagedObj;
    }
	dataMsSQL.InquiryDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
			Action: "InquiryData"
		}
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMsSQL.InquiryDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
        // 20200121, keithpoon, InquiryData should not call ConvertGetTableStructure
        // assume all directive called GetTableStructure once ready
        //var converted_Data = ConvertGetTableStructure(data_or_JqXHR);
		/*
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
		*/
		var massagedObj = data_or_JqXHR;
		return massagedObj;
	}
    
	dataMsSQL.ProcessDataRequest = function(opts){
		var url = $rootScope.serverHost;
		var requestOptions = {
			Action: "ProcessData"
		}
		
		var requestOptions = Object.assign({}, requestOptions, opts);
		var requestObject = {
			method: 'POST',
			data: JSON.stringify(requestOptions),
		}
		return requestObject;
	}
	dataMsSQL.ProcessDataResponse = function(responseObj){
		var data_or_JqXHR = responseObj.data;
        /*
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
        */
		var massagedObj = data_or_JqXHR;
		return massagedObj;
    }
	
	function ConvertGetTableStructure(data_or_JqXHR){
		var obj = {
			DataColumns: {},
			NativeDataSchema: {},
		};
        
		var dataColumns = data_or_JqXHR.dataSets[0];
        obj.NativeDataSchema = data_or_JqXHR.dataSets;
		var newDataColumns = {};
		for(var columnIndex in dataColumns){
			var dataColumn = dataColumns[columnIndex];
            var columnName = dataColumn[1];
			var newDataCol = {};
			//jQuery.extend(true, newDataCol, dataColumn);
            newDataCol.length = 0;
            newDataCol.decimalPoint = 0;
            newDataCol.null = dataColumn[4];// "YES" || "NO"
            newDataCol.key = "";
            newDataCol.default = dataColumn[3];
            newDataCol.extra = "";
            if(data_or_JqXHR.dataSets[1][0].includes(columnName)){
                newDataCol.key = "PRI";
                if(columnName == "MYUID"){
                    newDataCol.extra = "auto_increment";
                }
            }
			newDataCol.type = Core.ConvertMsSQLDataType(dataColumn[5]);
			
			if(newDataCol.default === null){
				var defaultValue = null;
				switch(newDataCol.type){
					case "string":
						defaultValue = null;
                        newDataCol.length = dataColumn[6];
						break;
					case "datetime":
					case "date":
					case "time":
						defaultValue = new Date(1970, 0, 1);
						break;
					case "double":
						defaultValue = 0.0;
                        newDataCol.length = dataColumn[8];
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
