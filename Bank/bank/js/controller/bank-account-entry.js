"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateBankAccountController', ['$scope', '$timeout', 'Core', 'MessageService', '$rootScope', function ($scope, $timeout, Core, MessageService, $rootScope) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    var globalCriteria = $rootScope.globalCriteria;

	$scope.SwitchToCreate = function(){
		$scope.entryFormMode = "create"
		$scope.entryFormTitle = "Create Bank Account";

        var hashID = "entry_be33bankaccount";
		$scope.directiveScopeDict[hashID].ResetForm();
		$scope.ShowEntryForm();
	}
	$scope.SwitchToAmend = function(sRecord){
		$scope.entryFormMode = "amend"
		$scope.entryFormTitle = "Amend Bank Account";
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
        
        if(prgmID == "be33bankaccount"){
            var newRecord = controller.ngModel;

            $scope.SwitchToCreate();
            $scope.HideEntryForm();
        }else if(prgmID == "bp33bankaccount"){
            controller.ngModel.Record.Status = "Enabled";
        }
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
            case "BranchCode":
            case "AccountCode":
                var fullAccountCode = MergeFullAccountCode(newObj);
                DisplayFullAccountCode(newObj, fullAccountCode)
                break;
        }
    }

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried ValidateBuffer()");
		var isValid = true;
		var record = controller.ngModel;

		var isValid = true;
        var errorMsgList = [];

		if(record.BankCode == ""){
            errorMsgList.push("Bank Code is required.");
            isValid = false;
        }

		if(record.BranchCode == ""){
            errorMsgList.push("Branch Code is required.");
            isValid = false;
        }

		if(record.AccountCode == ""){
            errorMsgList.push("Account Code is required.");
            isValid = false;
        }

		if(record.FullAccountCodeWithDash == ""){
            errorMsgList.push("Full Account Code With Dash is required.");
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
    
    $scope.UpdateCurrencyData = function(){
        $scope.directiveScopeDict["process_bp33bankaccount"].SubmitData();
    }

    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){

        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
            switch(prgmID){
                case "bw21bank":
            	    CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
                    break;
            }
		}else{
			$scope.SwitchToAmend(sRecord);
            if(hashID == "pageview_bw33bankaccount"){
                $scope.entryCreateForm = sRecord;
                $scope.processModel.Record.BankAccountID = sRecord.BankAccountID;

                $scope.directiveScopeDict["process_bp33bankaccount"].InquiryData();
            }
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
        if(elementID == "bankCode"){
            $scope.entryCreateForm.BankCode = sRecord.BankCode;
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
        var listHashID = 'pageview_bw33bankaccount';
		if(prgmID == "be33bankAccount"){
			$scope.directiveScopeDict[listHashID].ClearNRefreshData();
        }
        
    }
	$scope.CustomInquiryDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
        var listHashID = 'pageview_bw33bankaccount';

		if(prgmID == "bp33bankAccount"){
			$scope.processModel.ProcessRecord = $scope.processModel.InquiryResult.Data;
        }
        
    }
    
    function MergeFullAccountCode(screenRecord){
        var fullAccountCode = "";
        var branchCode = null;
        var accountCode = null;
        if(typeof(screenRecord.BranchCode) != "undefined"){
            branchCode = screenRecord.BranchCode;
        }
        if(typeof(screenRecord.AccountCode) != "undefined"){
            accountCode = screenRecord.AccountCode;
        }
        if(branchCode != "" && accountCode !=""){
            fullAccountCode = branchCode + "-" + accountCode;
        }
        return fullAccountCode;
    }
	function DisplayFullAccountCode(screenRecord, fullAccountCode){
        screenRecord.FullAccountCode = fullAccountCode;
        if(typeof(screenRecord.FullAccountCodeWithDash) != "undefined")
            if($scope.entryFormMode == "create")
		        screenRecord.FullAccountCodeWithDash = fullAccountCode;
	}

}]);