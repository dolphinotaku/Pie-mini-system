"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateBankController', ['$scope', 'MessageService', function ($scope, MessageService, $rootScope) {
	$scope.directiveScopeDict = {};
	$scope.directiveCtrlDict = {};

	$scope.EventListener = function(scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
		var hashID = tagName + '_' + prgmID;

		if($scope.directiveScopeDict[hashID] == null || typeof($scope.directiveScopeDict[hashID]) == "undefined"){
			$scope.directiveScopeDict[hashID] = scope;
			$scope.directiveCtrlDict[hashID] = controller;

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
		newRecord.EffectiveDate = new Date();
		newRecord.PrincipalCurrency = "HKD";
		newRecord.DepositPeriodUnit = "Y";
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){

	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var isValid = true;
		var record = controller.ngModel;
        var errorMsgList = [];
        
        if(record.BankCode == ""){
            errorMsgList.push("Bank Code is mandatory field.");
            isValid = false;
        }

        if(!isValid){
            MessageService.setPostponeMsg(errorMsgList);
        }
        
		return isValid;
	}

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
//				$scope.entryForm = sRecord;
//			}
		}
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
		var hashID = 'pageview_bw21bank';
        
		if(prgmID == "bs21bank"){
		  $scope.directiveScopeDict[hashID].ClearNRefreshData();
		}
	}

}]);

