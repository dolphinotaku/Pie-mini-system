// JavaScript Document
"use strict";

app.service('TableManager', ["$rootScope", "$log", "config", "$q", "Security", "HttpRequeset", "DataAdapter", "Core", function($rootScope, $log, config, $q, Security, HttpRequeset, DataAdapter, Core) {
	var table = this;
	var rootScope = $rootScope;
    
    if(typeof $rootScope.Table == "undefined")
        $rootScope.Table = {};
    
    var tableCollection = $rootScope.Table;
    
    table.RequestTableStructure = function(progID){
        var url = $rootScope.serverHost;
        var clientID = Security.GetSessionID();
        var programId = progID
        var submitData = {
            "Session": clientID,
            "Table": programId
        };
        submitData.Action = "GetTableStructure";

        var requestOption = {
            method: 'POST',
            data: JSON.stringify(submitData)
        };
        var request = HttpRequeset.send(requestOption);
//        request.then(function(responseObj) {
//            if(Core.GetConfig().debugLog.DirectiveFlow)
//            console.log("ProgramID: "+programId+", Table structure obtained.")
//            var structure = responseObj.data.ActionResult.table_schema;
//            table.SetTableStructure(progID, structure);
//        }, function(reason) {
//          console.error("Fail in GetTableStructure() - "+tagName + ":"+$scope.programId)
//          Security.HttpPromiseFail(reason);
//                    reject(reason);
//        }).finally(function() {
//            // Always execute this on both error and success
//        });

        return request;
    }
    table.SetTableStructure = function(progID, _tableSchema){
        if(typeof $rootScope.Table[progID] == "undefined"){
            $rootScope.Table[progID] = {name:"", _tableSchema:{}, record:{}, lastUpdated:new Date()};
        }
        var tbInfo = $rootScope.Table[progID];
        if(typeof tbInfo._tableSchema == "undefined" || tbInfo._tableSchema == null || tbInfo._tableSchema == {}){
            $rootScope.Table[progID]._tableSchema = {};
        }
        $rootScope.Table[progID]._tableSchema = _tableSchema;
    }
    table.GetTableStructure = function(submitData){
    	var progID = submitData.Table;
        var isExists = table.IsTableStructeExists(progID);
        var ngPromise;
        
        if(!isExists){
            
            ngPromise = $q(function(resolve, reject) {
                // var tbRequest = table.RequestTableStructure(progID);
                var tbPromise = DataAdapter.GetTableStructure(submitData);
                tbPromise.then(function(responseObj) {
                    if(Core.GetConfig().debugLog.DirectiveFlow)
                    	console.log("ProgramID: "+programId+", Table structure obtained.")
                    var structure = responseObj.table_schema;
                    table.SetTableStructure(progID, responseObj.TableSchema);

                    resolve(responseObj);
                }, function(reason) {

                    reject(reason);
                }).finally(function() {
                    // Always execute this on both error and success
                });
            
            });
        }else{
            console.log("TableStructure already exists, avoid to send GetTableStructure again");
            ngPromise = $q(function(resolve, reject) {
                    var structure = tableCollection[progID].structure;
                    resolve(structure);
            });
        }
        
        return ngPromise;
    }
    table.ClearTableStrucute = function(progID){
        
    }
    table.IsTableStructeExists = function(progID){
        var isExists = false;
        
        if(typeof $rootScope.Table[progID] != "undefined"){
            var tbInfo = $rootScope.Table[progID];
            if(typeof tbInfo.structure != "undefined" && tbInfo != null && tbInfo.structure != {}){
                isExists = true;
            }
        }
        
        return isExists;
    }
    
    table.RequestTableRecords = function(){
        
    }
    table.SetTableRecords = function(){
        
    }
    table.GetTableRecords = function(){
        
    }
    table.ClearTableRecords = function(){
    }
    
    table.ClearCache = function(){
        table.ClearTableStrucute();
        table.ClearTableRecords();
    }
    table.RefreshCache = function(){
        table.ClearCache();
        table.GetTableStructure();
        table.GetTableRecords();
    }
}]);
