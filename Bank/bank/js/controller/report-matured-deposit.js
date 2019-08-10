"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('reportMaturedDepositController', ['$scope', 'MessageService', '$timeout', function ($scope, MessageService, $timeout, $rootScope) {
    $scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.inquiryModel = {};
    $scope.inquiryModel.Record = {};
    
    $scope.baseCurrencyCode = "HKD";
    
    $scope.reportCtrl = {};

    $scope.reportCtrl.ExportFileTypeAs = {
        availableOptions: [
            {id: '1', value: 'xls', name: 'xls'},
            {id: '2', value: 'xlsx', name: 'xlsx'},
            {id: '3', value: 'pdf', name: 'pdf'}
            // {id: '3', value: 'screen', name: 'on screen'}
        ],
        selectedOption: {id: '3', value: 'pdf', name: 'pdf'} //This sets the default value of the select in the ui
    }

    $scope.EventListener = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId;
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;

        if($scope.directiveScopeDict[hashID] == null || typeof($scope.directiveScopeDict[hashID]) == "undefined"){
            $scope.directiveScopeDict[hashID] = scope;
            $scope.directiveCtrlDict[hashID] = controller;
        }
        
        if(prgmID == "bi22currency"){
            console.dir(controller);
            controller.ngModel.Record.Status = 'Enabled';
        }

        //http://api.jquery.com/Types/#Event
        //The standard events in the Document Object Model are:
        // blur, focus, load, resize, scroll, unload, beforeunload,
        // click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave,
        // change, select, submit, keydown, keypress, and keyup.
        iElement.ready(function() {

        })
    }

    $scope.SetDefaultValue = function(scope, iElement, iAttrs, controller){
        var newRecord = controller.ngModel;
        newRecord.InquiryCriteria.EffectiveFrom = new Date();
        newRecord.InquiryCriteria.EffectiveTo = new Date();
        newRecord.InquiryCriteria.EffectiveCurrency = "";
        newRecord.InquiryCriteria.ExportFileTypeAs = $scope.reportCtrl.ExportFileTypeAs.availableOptions[2].value;

        $scope.SetDateRangeThisMonth();
    }
    
    $scope.SetDateRangeLast7Days = function(){
        var endDate = new Date();
        var startDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        startDate.setDate(endDate.getDate() - 6);
        $scope.SetDateRange(startDate, endDate);
    }
    $scope.SetDateRangeLast30Days = function(){
        var endDate = new Date();
        var startDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        startDate.setDate(endDate.getDate() - 29);
        $scope.SetDateRange(startDate, endDate);
    }
    $scope.SetDateRangeThisMonth = function(){
        var todayDate = new Date(), y = todayDate.getFullYear(), m = todayDate.getMonth();
        var startDate = new Date(y, m, 1);
        var endDate = new Date(y, m + 1, 0);
        $scope.SetDateRange(startDate, endDate);
    }
    $scope.SetDateRangeLastMonth = function(){
        var todayDate = new Date(), y = todayDate.getFullYear(), m = todayDate.getMonth();
        var startDate = new Date(y, m-1, 1);
        var endDate = new Date(y, m, 0);
        $scope.SetDateRange(startDate, endDate);
    }

    $scope.SetDateRange = function(adjustedFromDate, adjustedToDate){
        $scope.inquiryModel.InquiryCriteria.EffectiveFrom = adjustedFromDate;
        $scope.inquiryModel.InquiryCriteria.EffectiveTo = adjustedToDate;
    }

    $scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
        switch (fieldName) {
            case "AlphabeticCode":
                newObj.AlphabeticCode = newObj.AlphabeticCode.toUpperCase(); 
                break;
            default:

        }

    }

    $scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
        var isValid = true;
        var record = controller.ngModel;
        var errorMsgList = [];
        
        if(record.AlphabeticCode == ""){
            errorMsgList.push("Please search and select a currency record for amend.");
            isValid = false;
        }
        
        if(!isValid){
            MessageService.setPostponeMsg(errorMsgList);
        }
        return isValid;
    }

    // $scope.CustomPointedToRecord = function(sRecord, rowScope, scope, iElement, controller){
    // 	$scope.entryAmendForm = sRecord;

    // 	var tagName = iElement[0].tagName.toLowerCase();
    // 	var prgmID = scope.programId.toLowerCase();
    // 	var scopeID = scope.$id;
    //     var hashID = tagName + '_' + prgmID;

    // 	$scope.entryAmendForm = sRecord;
    // 	if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
    // 		// CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
    // 	}else{
    // 	}
    // }
    
    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
        $scope.entryAmendForm = sRecord;

        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        $scope.entryAmendForm = sRecord;
        if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
            // CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
        }else{
//			if(prgmID == "ew01sf"){
                $scope.entryAmendForm = sRecord;
//			}
        }
    }

    $scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId;
        var scopeID = scope.$id;
        var hashID = 'inquiry_bi22currency';
        
        if(data_or_JqXHR["status"] == "success"){
            saveByteArray(data_or_JqXHR["data"][0], data_or_JqXHR["data"][1]);
        }
    }
    function saveByteArray(fileName, b64Data) {
        // http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
        var byteCharacters = atob(b64Data);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
    
        var blob = new Blob([byteArray], {
            // type: "application/vnd.ms-excel;charset=charset=utf-8"
            // type: "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
    
        saveAs(blob, fileName);
    }

}]);