"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('scheduleLogController', ['$scope', function ($scope, $rootScope) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.scheduleLogModel = {};
    $scope.scheduleLogModel.Record = {};
    $scope.scheduleLogModel.InquiryCriteria = {};
    $scope.scheduleLogModel.InquiryRecord = {};
    

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
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;

		var newRecord = controller.ngModel;
		// newRecord.EffectiveDate = new Date();
		// newRecord.PrincipalCurrency = "HKD";
		// newRecord.DepositPeriodUnit = "Y";
        
        if(prgmID == "ci03schedulelog"){
            // command to select all
            // select disabled
            // newRecord.Record.Name = "";
            // newRecord.Record.Status = "Disabled";
            scope.SubmitData();
        }
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){

	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var isValid = true;
		var record = controller.ngModel;
		var msg = [];

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
		// var hashID = 'pageview_bw21bank';
		
		// if(prgmID == "bs01bank"){
		//   $scope.directiveScopeDict[hashID].ClearNRefreshData();
		// }
	}

}]);

