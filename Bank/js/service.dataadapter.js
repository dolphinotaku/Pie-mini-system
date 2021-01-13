// JavaScript Document
"use strict";

// handle the input / output of the server API
app.service('DataAdapter', function($rootScope, $q, HttpRequeset, DataAdapterMySQL, Security, config){
	var adapter = this;
	var dAdapter = null;
	var dPHP = DataAdapterMySQL;
	switch(config.dataServer){
		case "php":
			dAdapter = dPHP;
			break;
	}

	adapter.GetTableStructure = function(opts){
		var requestObj = dAdapter.GetTableStructureRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.GetTableStructureResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.GetData = function(opts){
		var requestObj = dAdapter.GetDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.GetDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.FindData = function(opts){
		var requestObj = dAdapter.FindDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.FindDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.CreateData = function(opts){
		var requestObj = dAdapter.CreateDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.CreateDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.UpdateData = function(opts){
		var requestObj = dAdapter.UpdateDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.UpdateDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.DeleteData = function(opts){
		var requestObj = dAdapter.DeleteDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.DeleteDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.ExportData = function(opts){
		var requestObj = dAdapter.ExportDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.ExportDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.ImportData = function(opts){
		var requestObj = dAdapter.ImportDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.ImportDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.InquiryData = function(opts){
		var requestObj = dAdapter.InquiryDataRequest(opts);
		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.InquiryDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
	adapter.ProcessData = function(opts){
		var requestObj = dAdapter.ProcessDataRequest(opts);

		var promise = $q(function(resolve, reject){
			HttpRequeset.send(requestObj).then(
			function(responseObj) {
				var massagedObj = dAdapter.ProcessDataResponse(responseObj);
				resolve(massagedObj);
			}, function(reasonObj){
				Security.HttpPromiseReject(reasonObj);
				reject(reasonObj);
			}).catch(function(e) {
				Security.HttpPromiseErrorCatch(e);
            });
		})
		return promise;
	}
})