"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateHolidayController', ['$scope', '$timeout', 'Core', 'MessageService', '$rootScope', function ($scope, $timeout, Core, MessageService, $rootScope) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.processModel = {};
    $scope.processModel.Record = {};
    var globalCriteria = $rootScope.globalCriteria;

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
        newRecord.Type = 'Public Holiday';
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		switch (fieldName) {
			case "HolidayDate":
                if(typeof (newObj.HolidayDate) == "undefined" || newObj.HolidayDate == null ){
                }else{
                    newObj.CalendarYear = newObj.HolidayDate.getFullYear();
                }
				break;
			default:

		}
	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var isValid = true;
		var record = controller.ngModel;
        var errorMsgList = [];
        
        var isHolidayValid = true;
        
        // if(typeof (record.HolidayDate) == "undefined" || record.HolidayDate == null ){
        //     errorMsgList.push("Holiday format incorrect.");
        //     isValid = false;
        //     isHolidayValid = false;
        // }else{
        // }

		// if(isHolidayValid && record.HolidayDate.getFullYear() <= 1970){
		// 	errorMsgList.push("Holiday year must greater than 1970.");
		// 	isValid = false;
        // }

		if(!Core.IsDateInvalid(record.HolidayDate)){
            errorMsgList.push("Holiday is required or the format incorrect, the year must greater than 1970.");
            isValid = false;
        }
        
		if(scope.editMode == globalCriteria.editMode.Amend){
            if(record.AutoID == "" || record.AutoID == 0){
                errorMsgList.push("Please select holiday for amend.");
                isValid = false;
            }
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
		var hashID = 'pageview_bw23holiday';
        
		if(prgmID == "bs23holiday"){
		//   $scope.directiveScopeDict[hashID].SubmitData();
			// $timeout(function(){
        	// 	$scope.directiveScopeDict[hashID].SubmitData();
            //   	}, 1000); // (milliseconds),  1s = 1000ms
            $scope.directiveScopeDict[hashID].ClearNRefreshData();
		}
	}

}]);

