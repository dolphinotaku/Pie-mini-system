"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateSALController', ['$scope', '$rootScope', 'Core', 'MessageService', function ($scope, $rootScope, Core, MessageService) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.assetsInquiryModel = {};
    $scope.assetsInquiryModel.Record = {};

    $scope.showAssetsEntryForm = true;
    $scope.assetsEntryFormMode = "amend"
    $scope.assetsEntryFormTitle = "Amend Assets / Liabilities";

	$scope.SwitchToCreate = function(){
		$scope.entryFormMode = "create"
		$scope.entryFormTitle = "Create Bank Account";

        var hashID = "entry_be33bankaccount";
		$scope.directiveScopeDict[hashID].ResetForm();
	}
	$scope.SwitchToAmend = function(){
		$scope.entryFormMode = "amend"
		$scope.entryFormTitle = "Amend Bank Account";
	}

	$scope.SwitchAssetsToCreate = function(){
		$scope.assetsEntryFormMode = "create"
		$scope.assetsEntryFormTitle = "Create Assets / Liabilities";

        var hashID = "entry_be36assetsliabilities";
		$scope.directiveScopeDict[hashID].ResetForm();
	}
	$scope.SwitchAssetsToAmend = function(){
		$scope.assetsEntryFormMode = "amend"
		$scope.assetsEntryFormTitle = "Amend Assets / Liabilities";
	}
	
	$scope.SwitchToAssetsList = function(){
        $scope.SwitchTab('AssetsList');
        $scope.SwitchAssetsToAmend();
	}
	$scope.SwitchToCreateAssetsEntry = function(){
		$scope.SwitchTab('CreateAssetsEntry');
		$scope.SwitchAssetsToCreate();
    }
    
	$scope.SwitchToSavingList = function(){
		$scope.SwitchTab('SavingList');
    }
    
	$scope.SwitchToBankAccountList = function(){
		$scope.SwitchTab('BankAccountListSavingEntry');
    }
	$scope.SwitchToCreateBankAccountEntry = function(){
		$scope.SwitchTab('BankAccountEntry');
		$scope.SwitchToCreate();
    }
    
	
	$scope.SwitchTab = function(target){
		$scope.showSavingList = false;
        $scope.showEntryForm = false;
        $scope.showAssetsEntryForm = false;

		$scope.entryFormMode = "";
		switch(target){
			case"AssetsList":
				$scope.showAssetsEntryForm = true;
				break;
            case"CreateAssetsEntry":
                $scope.showAssetsEntryForm = true;
                break;
            case"SavingList":
                $scope.showSavingList = true;
                break;
			case"BankAccountListSavingEntry":
				$scope.showEntryForm = true;
				$scope.entryFormMode = "create"
				break;
			case"BankAccountEntry":
				$scope.showEntryForm = true;
				$scope.entryFormMode = "create"
				break;
		}
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
        }else if(prgmID == "bp33bankaccount"){
            controller.ngModel.Record.Status = "Enabled";
        }

        if(prgmID == "bp35salsavingentry"){
            scope.InquiryData();
        }
        if(prgmID == "bi36assetsliabilities"){
            controller.ngModel.InquiryCriteria.InquiryType = "Effective" // ALL | Effective | History
            scope.SubmitData();
        }
        if(prgmID == "be36assetsliabilities"){
            controller.ngModel.EffectiveDate = new Date();
            controller.ngModel.Type = 'Assets';
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
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();

		var record = controller.ngModel;

		var isValid = true;
        var errorMsgList = [];
        
        if(prgmID == "be36assetsliabilities"){
            if(!Core.IsDateInvalid(record.EffectiveDate)){
                errorMsgList.push("Effective Date is required.");
                isValid = false;
            }
            if(record.Type == ""){
                errorMsgList.push("Type is required.");
                isValid = false;
            }
            if(record.Item == ""){
                errorMsgList.push("Item Name is required.");
                isValid = false;
            }
            if(typeof(record.Amount) == "undefined" || record.Amount == null || record.Amount <0){
                errorMsgList.push("Amount is required and equal or greater than zero.");
                isValid = false;
            }
        }

        if(prgmID == "bp35salsavingentry"){
            var recordList = controller.ngModel.ProcessRecord;
            recordList.forEach(function(savingRecord) {
                if(typeof(savingRecord.AvailableBalance) == "undefined" || savingRecord.AvailableBalance == null || savingRecord.AvailableBalance <0){
                    errorMsgList.push("Account '"+savingRecord.FullAccountCodeWithDash+"' available balance is required and equal or greater than zero.");
                    isValid = false;
                }
            });
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
		}else if(prgmID == "bw33bankaccount"){
			$scope.SwitchToAmend();
            if(hashID == "pageview_bw33bankaccount"){
                $scope.entryCreateForm = sRecord;
                $scope.processModel.Record.BankAccountID = sRecord.BankAccountID;

                $scope.directiveScopeDict["process_bp33bankaccount"].InquiryData();
            }
        }
        if(prgmID == "bi36assetsliabilities"){
            if(hashID == "inquiry_bi36assetsliabilities"){
                $scope.assetsEntryCreateForm = sRecord;
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
		//console.dir(responseObj);
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        var assetsListHashId = 'inquiry_bi36assetsliabilities';
		if(prgmID == "be36assetsliabilities"){
			$scope.directiveScopeDict[assetsListHashId].SubmitData();
        }
		var respondRecords = controller.ngModel.InquiryResult.Data;
        var massageRecords = [...respondRecords];
        massageRecords.forEach(function(row) {
            row.EffectiveDate = new Date(row.EffectiveDate);
            row.Amount = parseInt(row.Amount);
        });
    }
	$scope.CustomInquiryDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        var listHashID = 'pageview_bw33bankaccount';
		var responseData = data_or_JqXHR.data;

		if(prgmID == "bp35salsavingentry"){
            for(var arrayIndex in responseData)
            {
                var rowItem = responseData[arrayIndex];
                rowItem.AvailableBalance = parseFloat(rowItem.AvailableBalance);
            }
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