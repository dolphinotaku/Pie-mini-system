"use strict";

function ReadExcel(){
    var demo = 'xhr', book = 'xlsx';

    if(!window.XMLHttpRequest || typeof Uint8Array === 'undefined')
        throw new Error("This demo is not supported in your browser");

    function process_wb(wb) {
        console.log(wb);
        htmlout.innerHTML = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]], {editable:true}).replace("<table", '<table id="table" border="1"');
    }

    var url = "bankUpdateLog.xlsx";

        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = function(e) {
            var data = new Uint8Array(req.response);
            var wb = XLSX.read(data, {type:"array"});
            process_wb(wb);
        };
        req.send();

}

app.controller('updateLogController', ['$scope', function ($scope, $rootScope) {
	$scope.customData = {};
	$scope.customData.daysDiff = 0;
	$scope.customData.formula = "";

	$scope.directiveScopeDict = {};
	$scope.directiveCtrlDict = {};

    ReadExcel();
    
	$scope.EventListener = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
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
		var hashID = tagName + '_' + prgmID;
		
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		// 	newObj.StaffID = newObj.StaffID.toUpperCase();

		
	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var isValid = true;
		var record = controller.ngModel;
		var msg = [];

        return isValid;
	}

    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
		var hashID = tagName + '_' + prgmID;

		// if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel != "undefined")
        if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
			if(prgmID == "bw21bank")
            	CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
		}else{
			$scope.SwitchToAmend(sRecord);
		}
	}
	
	$scope.CustomGetDataResult = function(responseObj, httpStatusCode, scope, ielement, attrs, controller){
		// console.dir(responseObj);
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
		var effectiveHashID = 'pageview_bw41timedepositEffective';
		var historyHashID = 'pageview_bw42timedepositHistory';
		
		if(prgmID == "be31timedeposit"){
			$scope.directiveScopeDict[effectiveHashID].ClearNRefreshData();
			$scope.directiveScopeDict[historyHashID].ClearNRefreshData();
		}
	}

}]);