"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateTimeDepositController', ['$scope', '$rootScope', 'Core', 'MessageService', function ($scope, $rootScope, Core, MessageService) {
	$scope.customData = {};
	$scope.customData.daysDiff = 0;
	$scope.customData.formula = "";

	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};

	$scope.SwitchToCreate = function(){
		$scope.entryFormMode = "create"
		$scope.entryFormTitle = "Create Time Deposit";

		var hashID = "entry_be31timedeposit";
		$scope.directiveScopeDict[hashID].ResetForm();
		$scope.ShowEntryForm();
	}
	$scope.SwitchToAmend = function(){
		$scope.entryFormMode = "amend"
        $scope.entryFormTitle = "Amend Time Deposit";
        
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
		newRecord.EffectiveDate = new Date();
		newRecord.PrincipalCurrency = "HKD";
		newRecord.DepositPeriodUnit = "Y";
		newRecord.MaturityInstruction = "NO_RENEWAL";

		$scope.SwitchToCreate();
		$scope.HideEntryForm();
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
        var elementPageview = getScope(scope.$id);
        var elementEditboxList = $(elementPageview).parents("editbox");
        var elementID = $(elementEditboxList[0]).attr("id");
        
        // 20190613, keithpoon
        // update: apply the auto calculation on create form and amend form
        // 20190101??
        // fixed: because Create Form and Amend Form sharing the same element
        // clear form when click on create tab
        // if($scope.entryFormMode == "create"){
            StatusChangeOnForm(fieldName, newValue, newObj, scope, iElement, iAttrs, controller)
        // }
    }
    
    function StatusChangeOnForm(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		switch (fieldName) {
			case "EffectiveDate":
			case "DepositPeriodAmt":
			case "DepositPeriodUnit":
				var daysDuringPeriod = CalculateMaturityDateDaysDifference(newObj);
				// console.dir(newObj)
				if(daysDuringPeriod>0){
					DisplayMaturityDate(newObj, daysDuringPeriod);
				}
				break;
			default:
                break;
		}

		switch (fieldName) {
			case "Principal":
			case "DepositPeriodAmt":
			case "DepositPeriodUnit":
			case "DepositRate":
				var interest = CalculateInterest(newObj);
					DisplayInterest(newObj, interest);
				break;
            default:
                break;
        }
        
		switch (fieldName) {
			case "Interest":
				var principalAndInterest = CalculateTotal(newObj);
				DisplayTotal(newObj, principalAndInterest);
			break;
			case "AdjustedInterest":
				DisplayAdjustedCredit(newObj);
			break;
		}
    }

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried ValidateBuffer()");
		var isValid = true;
		var record = controller.ngModel;
		var errorMsgList = [];

		if(record.MaturityInstruction == ""){
            errorMsgList.push("Maturity Instruction is required.");
            isValid = false;
		}

		if(!Core.IsDateInvalid(record.EffectiveDate)){
            errorMsgList.push("Effective Date is required or the format incorrect, the year must greater than 1970.");
            isValid = false;
        }

		if(record.BankCode == ""){
            errorMsgList.push("Bank record is required.");
            isValid = false;
		}

		if(record.DepositPeriodAmt <=0){
            errorMsgList.push("Period Amount is required and greated than zero.");
            isValid = false;
		}

		if(record.DepositPeriodUnit == ""){
            errorMsgList.push("Period Unit is required.");
            isValid = false;
		}

		if(!Core.IsDateInvalid(record.MaturityDate)){
            errorMsgList.push("Maturity date is required or the format incorrect.");
            isValid = false;
		}else{

        }

		if(record.PrincipalCurrency == ""){
            errorMsgList.push("Principal Currency is required.");
            isValid = false;
		}

		if(record.Principal <=0 ){
            errorMsgList.push("Principal is required and greated than zero.");
            isValid = false;
        }
		
        if(!isValid){
            MessageService.setPostponeMsg(errorMsgList);
        }
        // isValid = false;

        return isValid;
	}

    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(typeof $scope.directiveScopeDict[hashID].SetEditboxNgModel == "function"){
			if(prgmID == "bw21bank")
            	CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
		}else{
            hashID = "editbox_bw21bank";
            $scope.SwitchToAmend(sRecord);

            $scope.entryCreateForm = sRecord;
            $scope.directiveCtrlDict[hashID].ngModel.BankCode = sRecord.BankCode;
            $scope.directiveScopeDict[hashID].FindData();
		}
	}
	
	$scope.CustomGetDataResult = function(responseObj, httpStatusCode, scope, ielement, attrs, controller){
		// console.dir(responseObj);
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId;
		var scopeID = scope.$id;
		var effectiveHashID = 'pageview_bw41timedepositeffective';
		var historyHashID = 'pageview_bw42timedeposithistory';
		
		if(prgmID == "be31timedeposit"){
			$scope.directiveScopeDict[effectiveHashID].ClearNRefreshData();
			$scope.directiveScopeDict[historyHashID].ClearNRefreshData();
		}
	}

    function CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller){
        var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(prgmID == "bw21bank"){
            $scope.entryCreateForm.BankCode = sRecord.BankCode;
        }
    }

	function CalculateMaturityDateDaysDifference(screenRecord){
		var periodAmt = screenRecord.DepositPeriodAmt;
		var periodUnit = screenRecord.DepositPeriodUnit;
		var periodUnitDivisionAmt = 0;
		var effectiveDate = new Date(screenRecord.EffectiveDate.getTime());
        var maturityDate = new Date(screenRecord.EffectiveDate.getTime());
        // 20190630, fixed: esimated Maturity Date increase two time, because javascript datetime object is pass by reference
        // check an additional datetime object for validation
        var checkMaturityDate = new Date(screenRecord.EffectiveDate.getTime());

		if(!periodAmt || !periodUnit || !effectiveDate || !maturityDate)
            return;

		switch (periodUnit) {
			case "D":
                // periodUnitDivisionAmt = 1;
				// checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
                periodUnitDivisionAmt = 1 * periodAmt;
				checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
				break;
			case "M":
				// periodUnitDivisionAmt = 12;
				// checkMaturityDate.setMonth(effectiveDate.getMonth()+periodUnitDivisionAmt);
                periodUnitDivisionAmt = 12 * periodAmt;
				checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
				break;
			case "Y":
                // periodUnitDivisionAmt = 365;
                // checkMaturityDate.setFullYear(effectiveDate.getFullYear()+periodUnitDivisionAmt);
                periodUnitDivisionAmt = 365 * periodAmt;
				checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
				break;
			default:
		}
            
		// if the date is Saturday or Sunday, extend to next working day
		var weekDayIndicator = checkMaturityDate.getDay(); //  Sunday is 0, Monday is 1, and so on.
		if(weekDayIndicator == 6 || weekDayIndicator == 0){
            var satSunSteps = 0;
			if(weekDayIndicator == 6){
				periodUnitDivisionAmt += 2
			}
			if(weekDayIndicator == 0){
				periodUnitDivisionAmt += 1
			}
		}
        maturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);

        // if the date is holiday, extend to next working day
        //        ...
        // 20190613, keithpoon, fixed: days difference calculation incorrect
		// var timeDiff = Math.abs(maturityDate.getTime() - effectiveDate.getTime());
        // var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        var diffDays = dateDiffInDays(effectiveDate, maturityDate);
		return diffDays;
    }
    
    // https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
    function dateDiffInDays(a, b) {
        // Discard the time and time-zone information.
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

	function DisplayMaturityDate(screenRecord, days){
		var effectiveDate = new Date(screenRecord.EffectiveDate.getTime());
		var maturityDate = screenRecord.MaturityDate;
		effectiveDate.setDate(effectiveDate.getDate()+days);
		screenRecord.MaturityDate = effectiveDate;
		screenRecord.AdjustedMaturityDate = effectiveDate;

		$scope.customData.daysDiff = days;
	}

	function DisplayInterest(screenRecord, interest){
		screenRecord.Interest = interest;
		screenRecord.AdjustedInterest = interest;
		screenRecord.TotalCredit = screenRecord.Principal + screenRecord.Interest;
	}
	function DisplayTotal(screenRecord, total){
		screenRecord.TotalCredit = total;
    }
    function DisplayAdjustedCredit(screenRecord){
        screenRecord.AdjustedCredit = screenRecord.Principal + screenRecord.AdjustedInterest
    }

	function CalculateInterest(screenRecord){
		var interest = 0;
		var cost = screenRecord.Principal;
		var rate = screenRecord.DepositRate;
		var termAmt = $scope.customData.daysDiff;
        
		if(!cost || !rate || !termAmt){
			$scope.customData.formula = "";
			return;
		}

		interest = cost * rate / 100 * termAmt / 365;
		$scope.customData.formula = "Formula: " + cost + " * ("+ rate + " / " + 100 + ") p.a. * " + termAmt + " / " + 365 + " = " + interest;
        
        interest = parseFloat(interest.toFixed(2))
		return interest;
	}
	function CalculateTotal(screenRecord){
		var principal = screenRecord.Principal
		var interest = screenRecord.Interest
		var total = principal + interest;
		return total;
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
}]);