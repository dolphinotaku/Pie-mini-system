"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('reportArrangedDepositController', ['$scope', 'MessageService', '$timeout', function ($scope, MessageService, $timeout, $rootScope) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.inquiryModel = {};
    $scope.inquiryModel.Record = {};

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

        if(record.AlphabeticCode != "")
            if(record.Name == ""){
                errorMsgList.push("Name is a mandatory field.");
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
		
		if(prgmID == "bs01currency"){

		//   $scope.directiveScopeDict[hashID].SubmitData();
			$timeout(function(){
        		$scope.directiveScopeDict[hashID].SubmitData();
			  	}, 1000); // (milliseconds),  1s = 1000ms
		}
	}

}]);

