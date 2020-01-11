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
    
    $scope.inquiryModel = {};
    $scope.inquiryModel.Record = {};

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
    $scope.SelectedOnDataTable = function(timeDepositTranID){
        $scope.SwitchToAmend();
        var entryHashID = "entry_be31timedeposit";

        $scope.entryCreateForm.TimeDepositTranID = timeDepositTranID;
        $scope.directiveScopeDict[entryHashID].FindData();

        var hashID = "editbox_bw21bank";
        $scope.directiveCtrlDict[hashID].ngModel.BankCode = $scope.directiveCtrlDict[entryHashID].ngModel.BankCode;
        $scope.directiveScopeDict[hashID].FindData();
    }
	$scope.HideEntryForm = function(){
		$scope.showEntryForm = false;
	}
	$scope.ShowEntryForm = function(){
		$scope.showEntryForm = true;
	}
    
    $scope.datatable;
    $scope.InitializeDataTable = function(){
        $scope.datatable = $( "#timedeposit_datatable" ).DataTable({
            // https://datatables.net/reference/option/pageLength
            "pageLength": 100,
            "select": "single",
            "responsive": true,
            // https://datatables.net/examples/advanced_init/length_menu.html
            "lengthMenu": [[-1,10,20,50,100], ["All", 10, 20, 50, 100]],
            "columns": [
                { "data": "TimeDepositTranID" },
                { "data": "MaturityInstruction" },
                { "data": "EffectiveDate" },
                { "data": "BankCode" },
                { "data": "DepositPeriodAmt" },
                { "data": "DepositPeriodUnit" },
                { "data": "DepositRate" },
                { "data": "MaturityDate" },
                { "data": "AdjustedMaturityDate" },
                { "data": "PrincipalCurrency" },
                { "data": "Principal" },
                { "data": "Interest" },
                { "data": "AdjustedInterest" },
                { "data": "TotalCredit" },
                { "data": "AdjustedCredit" },
                { "data": "ActualCredit" },
                { "data": "Remarks" }
            ],
            "columnDefs": [
                // https://datatables.net/manual/styling/classes#Cell-classes
                {
                    // The `data` parameter refers to the data for the cell (defined by the
                    // `data` option, which defaults to the column being worked with, in
                    // this case `data: 0`.
                    "targets": [0],
                    className: 'dt-body-right'
                },
                {
                    // The `data` parameter refers to the data for the cell (defined by the
                    // `data` option, which defaults to the column being worked with, in
                    // this case `data: 0`.
                    "targets": [3,10,12,14],
                    "render": function ( data, type, row ) {
                        return "$"+data ;
                    },
                    className: 'dt-body-right'
                },
                {
                    "targets": [ 1,3,4,5,6,11,13,15,16 ],
                    "visible": false,
                    "searchable": false
                }
            ],
            // http://legacy.datatables.net/usage/i18n#oLanguage.sSearch
            "oLanguage": {
              "sSearch": "Filter records:"
            }
        });

        
        $scope.datatable.on('select', function ( e, dt, type, indexes ) {
            if ( type === 'row' ) {
                // var data = $scope.datatable.rows( indexes ).data().pluck( 'id' );
                var row = $scope.datatable.rows( indexes ).data()[0];
                var timeDepositTranID = parseInt(row.TimeDepositTranID)

                $scope.SelectedOnDataTable(timeDepositTranID);
            }
        });
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
            if(!$.fn.DataTable.isDataTable( '#timedeposit_datatable' )){
                $scope.InitializeDataTable();
            }
		})
	}

	$scope.SetDefaultValue = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(prgmID == "be31timedeposit"){
            var newRecord = controller.ngModel;
            newRecord.EffectiveDate = new Date();
            newRecord.PrincipalCurrency = "HKD";
            newRecord.DepositPeriodUnit = "Y";
            newRecord.MaturityInstruction = "NO_RENEWAL";
            newRecord.Purpose = "Investment";

            $scope.SwitchToCreate();
            $scope.HideEntryForm();
        }

        if(prgmID=="bi46timedeposit"){
            var newRecord = controller.ngModel.InquiryCriteria;
            newRecord.PrincipalCurrency = "";
            newRecord.Status = "All";
        }
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
            case "EffectiveDate":
			case "DepositPeriodAmt":
			case "DepositPeriodUnit":
			case "DepositRate":
				var interest = CalculateInterest(newObj);
					DisplayInterest(newObj, interest);
				break;
            default:
                break;
        }

        switch(fieldName){
            case "AdjustedMaturityDate":
                    var daysDuringPeriod = CalculateAdjustedMaturityDateDaysDifference(newObj);
                    $scope.customData.daysDiff = daysDuringPeriod;
                    newObj.NoOfDays = daysDuringPeriod;
                    if(daysDuringPeriod>0){
                        var interest = CalculateInterest(newObj);
                        DisplayInterest(newObj, interest);
                    }
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
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;

		var record = controller.ngModel;

		var isValid = true;
        var errorMsgList = [];
        
        if(prgmID == "be31timedeposit"){
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

            if(!record.DepositPeriodAmt || record.DepositPeriodAmt <=0){
                errorMsgList.push("Period Amount is required and greater than zero.");
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

            if(Core.IsDateInvalid(record.EffectiveDate) && Core.IsDateInvalid(record.AdjustedMaturityDate)){
                if(record.EffectiveDate >= record.AdjustedMaturityDate ){
                    errorMsgList.push("Adjusted Maturity Date must greater than Effective Date.");
                    isValid = false;
                }
            }
            
            // 20190703, ketihpoon, fixed: allowed to create record with empty Principal after delete/backspace the value
            if(!record.Principal || record.Principal <=0 ){
                errorMsgList.push("Principal is required and greater than zero.");
                isValid = false;
            }
            // 20190720, keithpoon, fixed: allowed to create record with negative amount of Rate, Adjusted Interest
            if(!record.DepositRate || record.DepositRate <=0 ){
                errorMsgList.push("Rate is required and greater than zero.");
                isValid = false;
            }
            if(!record.AdjustedInterest || record.AdjustedInterest <=0 ){
                errorMsgList.push("Adjusted Interest is required and greater than zero.");
                isValid = false;
            }
        }

        if(prgmID == "bi46timedeposit"){
            var record = controller.ngModel.InquiryCriteria;
            // if(record.PrincipalCurrency == ""){
            //     errorMsgList.push("Please specify a currency or select 'All' currency.");
            //     isValid = false;
            // }
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
			if(prgmID == "bw21bank")
            	CustomSelectedToRecordUnderEditbox(sRecord, rowScope, scope, iElement, controller);
		}else{
            $scope.SwitchToAmend();
            
            // 20190708, keithpoon, update: CustomSelectedToRecord due to pageview changed to inquriy directive
            // $scope.entryCreateForm = sRecord;
            var entryHashID = "entry_be31timedeposit";
            $scope.entryCreateForm.TimeDepositTranID = parseInt(sRecord.TimeDepositTranID);
            $scope.directiveScopeDict[entryHashID].FindData();


            hashID = "editbox_bw21bank";
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
			// $scope.directiveScopeDict[effectiveHashID].ClearNRefreshData();
			// $scope.directiveScopeDict[historyHashID].ClearNRefreshData();
		}else if(prgmID == "bi46timedeposit"){
            var data = data_or_JqXHR.data;

            $scope.datatable.clear();
            // add row by row
            for (var key in data) {
                var rowObj = data[key];
                var rowArray = Object.values(rowObj);
            }
            
            $scope.datatable.rows.add(data).draw();
            // $('#example').DataTable( {
            //     "ajax": "data/objects.txt",
            //     "columns": [
            //         { "data": "name" },
            //         { "data": "position" },
            //         { "data": "office" },
            //         { "data": "extn" },
            //         { "data": "start_date" },
            //         { "data": "salary" }
            //     ]
            // } );
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
                periodUnitDivisionAmt = 1 * periodAmt;
				checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
				break;
			case "M":
                // periodUnitDivisionAmt = 12 * periodAmt;
				checkMaturityDate.setMonth(effectiveDate.getMonth()+periodAmt);
                // checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
                // periodUnitDivisionAmt = dateDiffInDays(effectiveDate, checkMaturityDate);
				break;
			case "Y":
                // in general, Bank define one year as 365 days, instead of adding 1 into the years.
                // checkMaturityDate.setFullYear(effectiveDate.getFullYear()+periodUnitDivisionAmt);
                periodUnitDivisionAmt = 365 * periodAmt;
				checkMaturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
				break;
			default:
        }
            
		// if the date is Saturday or Sunday, extend to next working day
		var weekDayIndicator = checkMaturityDate.getDay(); //  Sunday is 0, Monday is 1, and so on.
        var satSunSteps = 0;
		if(weekDayIndicator == 6 || weekDayIndicator == 0){
			if(weekDayIndicator == 6){
                periodUnitDivisionAmt += 2;
                satSunSteps += 2;
			}
			if(weekDayIndicator == 0){
				periodUnitDivisionAmt += 1;
                satSunSteps += 1;
			}
		}
        // maturityDate.setDate(effectiveDate.getDate()+periodUnitDivisionAmt);
        // maturityDate.setDate(checkMaturityDate.getDate()+satSunSteps);
        maturityDate = new Date(checkMaturityDate);
        maturityDate.setDate(checkMaturityDate.getDate()+satSunSteps);

        // console.dir(periodUnitDivisionAmt)
        // console.dir(checkMaturityDate)
        // console.dir(maturityDate)

        // if the date is holiday, extend to next working day
        //        ...
        // 20190613, keithpoon, fixed: days difference calculation incorrect
		// var timeDiff = Math.abs(maturityDate.getTime() - effectiveDate.getTime());
        // var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // var diffDays = dateDiffInDays(effectiveDate, maturityDate);
        var diffDays = dateDiffInDays(effectiveDate, maturityDate);
        
		return diffDays;
    }

    function CalculateAdjustedMaturityDateDaysDifference(screenRecord){
        var effectiveDate = new Date(screenRecord.EffectiveDate.getTime());
        var adjustedMaturityDate = new Date(screenRecord.AdjustedMaturityDate.getTime());
        var daysDuringPeriod = dateDiffInDays(effectiveDate, adjustedMaturityDate);
        return daysDuringPeriod;
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
        screenRecord.NoOfDays = days;
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