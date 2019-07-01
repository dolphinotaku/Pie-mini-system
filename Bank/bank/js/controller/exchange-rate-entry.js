"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateExchangeRateController', ['$scope', 'Core', 'MessageService', '$rootScope', function ($scope, Core, MessageService, $rootScope) {
	$scope.outCurrencyEditBox = {};
    $scope.outCurrencyEditBox.id = "outCurrency";

	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
	$scope.SwitchToCreate = function(){
		$scope.entryFormMode = "create"
		$scope.entryFormTitle = "Create Exchange Rate";

        var hashID = "entry_be32exchangerate";
		$scope.directiveScopeDict[hashID].ResetForm();
		$scope.ShowEntryForm();
	}
	$scope.SwitchToAmend = function(sRecord){
		$scope.entryFormMode = "amend"
		$scope.entryFormTitle = "Amend Exchange Rate";
		$scope.entryCreateForm = sRecord;
		$scope.ShowEntryForm();
	}
	$scope.HideEntryForm = function(){
		$scope.showEntryForm = false;
	}
	$scope.ShowEntryForm = function(){
		$scope.showEntryForm = true;
	}

	$scope.EventListener = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried EventListener()");
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;

		if($scope.directiveScopeDict[hashID] == null || typeof($scope.directiveScopeDict[hashID]) == "undefined"){
		  $scope.directiveScopeDict[hashID] = scope;
		  $scope.directiveCtrlDict[hashID] = controller;

//		  if(prgmID == "ee01sf")
//			$scope.staffEntryCtrl = scope;
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
		
        var newRecord = controller.ngModel;
        
        newRecord.BuySellType = "Sell to Bank"
        newRecord.EffectiveDate = new Date();
        
        newRecord.IsEffective = "Enabled";

		$scope.SwitchToCreate();
		$scope.HideEntryForm();
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
        // switch(fieldName){
        //     case "OutAmount":
        //     case "InAmount":
        //     StatusChangeOnForm(fieldName, newValue, newObj, scope, iElement, iAttrs, controller);
        //         break;
        // }
        StatusChangeOnForm(fieldName, newValue, newObj, scope, iElement, iAttrs, controller);

    }
    function StatusChangeOnForm(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
        switch(fieldName){
            case "OutAmount":
            case "InAmount":
                var rate = CalculateExchangeRate(newObj);
                DisplayExchangeRate(newObj, rate)
                break;
        }
    }

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried ValidateBuffer()");
		var isValid = true;
		var record = controller.ngModel;
        var errorMsgList = [];

		if(record.Provider == ""){
            errorMsgList.push("Bank Provider is a mandatory field.");
            isValid = false;
		}

		if(!Core.IsDateInvalid(record.EffectiveDate)){
            errorMsgList.push("Effective Date is required or the format incorrect, the year must greater than 1970.");
            isValid = false;
		}
		
        if(!isValid){
            MessageService.setPostponeMsg(errorMsgList);
        }

        return isValid;
	}

    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){

        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
            switch(prgmID){
                case "bw21bank":
                case "bw22currency":
            	    CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
                    break;
            }
		}else{
            hashID = "editbox_bw21bank";
            $scope.SwitchToAmend(sRecord);
            
            $scope.directiveCtrlDict[hashID].ngModel.BankCode = sRecord.Provider;
            $scope.directiveScopeDict[hashID].FindData();
        }
    }
    function CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        var elementPageview = getScope(scope.$id);
        var elementEditboxList = $(elementPageview).parents("editbox");
        var elementID = $(elementEditboxList[0]).attr("id");
        
        // asign the selected record to ng-model
        if(elementID == "outCurrencyC"){
            $scope.entryCreateForm.OutCurrencyID = sRecord.AlphabeticCode;
        }else if(elementID == "inCurrencyC"){
            $scope.entryCreateForm.InCurrencyID = sRecord.AlphabeticCode;
        }
        if(elementID == "bankProviderC"){
            $scope.entryCreateForm.Provider = sRecord.BankCode;
        }

        if(elementID == "outCurrency"){
            $scope.entryAmendForm.OutCurrencyID = sRecord.AlphabeticCode;
        }else if(elementID == "inCurrency"){
            $scope.entryAmendForm.InCurrencyID = sRecord.AlphabeticCode;
        }
        if(elementID == "bankProvider"){
            $scope.entryAmendForm.Provider = sRecord.BankCode;
        }
        
        if(hashID == "pageview_bw32exchangerate"){
            $scope.entryAmendForm = sRecord;
        }

    }
    
    function getScope(id) {
        var elem;
        $('.ng-scope').each(function(){
            var s = angular.element(this).scope(),
                sid = s.$id;
    
            if(sid == id) {
                elem = this;
                return false; // stop looking at the rest
            }
        });
        return elem;
    }
	
	$scope.CustomGetDataResult = function(responseObj, httpStatusCode, scope, ielement, attrs, controller){
		// console.dir(responseObj);
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
        var listHashID = 'pageview_bw32exchangerate';
        
		if(prgmID == "be32exchangeRate"){
            console.dir($scope.directiveScopeDict)
			$scope.directiveScopeDict[listHashID].ClearNRefreshData();
		}
    }
    
    // $scope.$watch(
    //     // This function returns the value being watched. It is called for each turn of the $digest loop
    //     function() { return $scope.entryCreateForm; },
    //     // This is the change listener, called when the value returned from the above function changes
    //     function(newValue, oldValue) {
    //         var changedField = "";
    //         var changedValue;

    //         if ( newValue !== oldValue ) {
    //             for(var colIndex in $scope.entryCreateForm){
    //                 changedField = colIndex;
    //                 changedValue = newValue[colIndex];
    //                 if(oldValue!=null){
    //                     if ( Object.prototype.hasOwnProperty ) {
    //                         if(oldValue.hasOwnProperty(colIndex))
    //                         {
    //                         if(oldValue[colIndex] === newValue[colIndex]){
    //                             //   console.log("continue, old value === new value");
    //                             continue;
    //                         }
    //                         if(oldValue[colIndex] == newValue[colIndex]){
    //                             // console.log("continue, old value == new value");
    //                             continue;
    //                         }
    //                         // 20180419, if it is a object
    //                         if(typeof oldValue[colIndex] == "object" && typeof newValue[colIndex] == "object"){
    //                             //   console.warn("check date object euqal")
    //                             if(typeof (oldValue[colIndex].getMonth) === 'function'){
    //                                 // 20170809, if it is a date object, compare with getTime()
    //                                 if(typeof (oldValue[colIndex].getMonth) === 'function' && typeof (newValue[colIndex].getMonth) === 'function'){
    //                                     if(oldValue[colIndex].getTime() === newValue[colIndex].getTime()){
    //                                         // console.log("continue, oldDate === newDate");
    //                                         continue;
    //                                     }
    //                                 }
    //                             }else{
    //                                 // if it is a object with some properties
    //                             }
    //                         }
    //                         }
    //                     }
    //                 }

    //                 if(typeof $scope.StatusChangeOnCreateForm == "function"){
    //                     $scope.StatusChangeOnCreateForm(colIndex, changedValue, newValue);
    //                 }
    //             }
    //         }
    //     },
    //     true
    // );
    
    // $scope.$watch(
    //     // This function returns the value being watched. It is called for each turn of the $digest loop
    //     function() { return $scope.entryAmendForm; },
    //     // This is the change listener, called when the value returned from the above function changes
    //     function(newValue, oldValue) {
    //         var changedField = "";
    //         var changedValue;

    //         if ( newValue !== oldValue ) {
    //             for(var colIndex in $scope.entryAmendForm){
    //                 changedField = colIndex;
    //                 changedValue = newValue[colIndex];
    //                 if(oldValue!=null){
    //                     if ( Object.prototype.hasOwnProperty ) {
    //                         if(oldValue.hasOwnProperty(colIndex))
    //                         {
    //                         if(oldValue[colIndex] === newValue[colIndex]){
    //                             //   console.log("continue, old value === new value");
    //                             continue;
    //                         }
    //                         if(oldValue[colIndex] == newValue[colIndex]){
    //                             // console.log("continue, old value == new value");
    //                             continue;
    //                         }
    //                         // 20180419, if it is a object
    //                         if(typeof oldValue[colIndex] == "object" && typeof newValue[colIndex] == "object"){
    //                             //   console.warn("check date object euqal")
    //                             if(typeof (oldValue[colIndex].getMonth) === 'function'){
    //                                 // 20170809, if it is a date object, compare with getTime()
    //                                 if(typeof (oldValue[colIndex].getMonth) === 'function' && typeof (newValue[colIndex].getMonth) === 'function'){
    //                                     if(oldValue[colIndex].getTime() === newValue[colIndex].getTime()){
    //                                         // console.log("continue, oldDate === newDate");
    //                                         continue;
    //                                     }
    //                                 }
    //                             }else{
    //                                 // if it is a object with some properties
    //                             }
    //                         }
    //                         }
    //                     }
    //                 }

    //                 if(typeof $scope.StatusChangeOnAmendForm == "function"){
    //                     $scope.StatusChangeOnAmendForm(colIndex, changedValue, newValue);
    //                 }
    //             }
    //         }
    //     },
    //     true
    // );

    function CalculateExchangeRate(screenRecord){
        var rate = 0;
        if(screenRecord.OutAmount>0)
            rate = screenRecord.InAmount / screenRecord.OutAmount;
        return rate;
    }
	function DisplayExchangeRate(screenRecord, rate){
		screenRecord.Rate = rate;
	}

}]);