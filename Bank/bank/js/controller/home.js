"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('homeController', ['$scope', function ($scope, $rootScope) {
	$scope.customData = {};
	$scope.customData.daysDiff = 0;
	$scope.customData.formula = "";

	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};

    $scope.inquiryModel = {};
    $scope.currentMonthInquiryModel = {};
    
    $scope.assetsInquiryModel = {};
    $scope.assetsInquiryModel.Record = {};

    $scope.areaChartModel = {};
    $scope.areaChartModel.Record = {};
    $scope.areaChartModel.last12Months = {};

    $scope.tradeOrderModel = {};
    $scope.tradeOrderModel.Record = {};

    $scope.timeDepositPanelOptions = {
        currentMonth: "Current month",
        currentToNext: "Current month to next month",
        nextMonth: "Next month",
        next3Months: "Next 3 months",
        lastMonth: "Last month",
        last3Months: "Last 3 months",
        last12Months: "Last 12 months"
    }

    $scope.timeDepositPanelData = {};
    $scope.totalAssetsPanelData = {};
    $scope.timeDepositCurrenyRatioPanelData = {};
	
    $scope.CurrentMonthIncomePanelData = {};
    $scope.CurrentMonthIncomePanelData.Data = {};
	
    $scope.CurrentDateLiabilitiesPanelData = {};
    $scope.CurrentDateLiabilitiesPanelData.Data = {};

    $scope.AreaChartPanelData = {};
    $scope.AreaChartPanelData.Data = {};

    $scope.TradeOrderPanelData = {}
    $scope.TradeOrderPanelData.Data = {};
	
	$scope.exchangerateData = {};
    
    $scope.baseCurrencyCode = "HKD";
    
	$scope.EventListener = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried EventListener()");
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;

		if($scope.directiveScopeDict[hashID] == null || typeof($scope.directiveScopeDict[hashID]) == "undefined"){
		  $scope.directiveScopeDict[hashID] = scope;
		  $scope.directiveCtrlDict[hashID] = controller;
        }
        
        if(prgmID == "bi43timedeposithistoryinyearmonth"){
            $scope.RefreshTimeDepositPanel();
        }
        if(prgmID == "bi47gettotalassets"){
            $scope.RefreshTotalAssetsPanel();
        }
        if(prgmID == "bi48gettotalinareachart"){
            $scope.RefreshTotalAssetsInAreaChartPanel();
        }
        if(prgmID == "bi36assetsliabilities"){
            $scope.RefreshCurrentMonthLiabilitiesPanel();
        }
        if(prgmID == "bi49tradeorder"){
            $scope.RefreshTradeOrderPanel();
        }
        
		//http://api.jquery.com/Types/#Event
		//The standard events in the Document Object Model are:
		// blur, focus, load, resize, scroll, unload, beforeunload,
		// click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave,
		// change, select, submit, keydown, keypress, and keyup.
		iElement.ready(function() {

		})
    }

    $scope.RefreshTradeOrderPanel = function(){
        var panelProgramId = "bi49tradeorder";
        var scope = $scope.directiveScopeDict["inquiry_"+panelProgramId];
        var controller = $scope.directiveCtrlDict["inquiry_"+panelProgramId];

        var asAtDate = new Date();
        controller.ngModel.Record.AsAtDate = asAtDate;
        controller.ngModel.Record.ExchangeToCurrency = $scope.baseCurrencyCode;
        
        scope.SubmitData();
    }

    $scope.RefreshTotalAssetsInAreaChartPanel = function(){
        var panelProgramId = "bi48gettotalinareachart";
        var scope = $scope.directiveScopeDict["inquiry_"+panelProgramId];
        var controller = $scope.directiveCtrlDict["inquiry_"+panelProgramId];

        var asAtDate = new Date();
        // not include current month
        var last12months = new Date();
        last12months.setMonth(last12months.getMonth() - 13);
        last12months.setDate(1);
        $scope.areaChartModel.last12Months = last12months;

        controller.ngModel.Record.AsAtDate = last12months;
        controller.ngModel.Record.ExchangeToCurrency = $scope.baseCurrencyCode;
        
        controller.ngModel.Data = [];

        scope.SubmitData();
    }

    $scope.RefreshTotalAssetsPanel = function(){
        var panelProgramId = "bi47gettotalassets";
        var scope = $scope.directiveScopeDict["inquiry_"+panelProgramId];
        var controller = $scope.directiveCtrlDict["inquiry_"+panelProgramId];

        var asAtDate = new Date();

        controller.ngModel.Record.AsAtDate = asAtDate;
        controller.ngModel.Record.ExchangeToCurrency = $scope.baseCurrencyCode;
        
        controller.ngModel.Data = [];
        scope.SubmitData();
    }
    
    $scope.RefreshTimeDepositPanel = function(){
        var selectedOption = $scope.timeDepositPanelSelectedOption;
        var startDate = {}
        var endDate = {}
        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();

        var panelProgramId = "bi43timedeposithistoryinyearmonth";
        var scope = $scope.directiveScopeDict["inquiry_"+panelProgramId];
        var controller = $scope.directiveCtrlDict["inquiry_"+panelProgramId];

        switch(selectedOption)
        {
            case $scope.timeDepositPanelOptions.currentMonth:
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth+1, 0);
                break;
            case $scope.timeDepositPanelOptions.currentToNext:
                startDate = new Date(currentYear, currentMonth, 1);
                endDate = new Date(currentYear, currentMonth+2, 0);
                break;
            case $scope.timeDepositPanelOptions.nextMonth:
                startDate = new Date(currentYear, currentMonth+1, 1);
                endDate = new Date(currentYear, currentMonth+2, 0);
                break;
            case $scope.timeDepositPanelOptions.next3Months:
                startDate = new Date(currentYear, currentMonth+1, 1);
                endDate = new Date(currentYear, currentMonth+4, 0);
                break;
            case $scope.timeDepositPanelOptions.lastMonth:
                startDate = new Date(currentYear, currentMonth-1, 1);
                endDate = new Date(currentYear, currentMonth, 0);
                break;
            case $scope.timeDepositPanelOptions.last3Months:
                startDate = new Date(currentYear, currentMonth-3, 1);
                endDate = new Date(currentYear, currentMonth, 0);
                break;
            case $scope.timeDepositPanelOptions.last12Months:
                startDate = new Date(currentYear, currentMonth-12, 1);
                endDate = new Date(currentYear, currentMonth, 0);
                break;
        }

        controller.ngModel.Record.StartDate = startDate
        controller.ngModel.Record.EndDate = endDate

        controller.ngModel.Data = [];
        scope.SubmitData();
    }

    $scope.RefreshCurrentMonthLiabilitiesPanel = function(){
        var panelProgramId = "bi36assetsliabilities";
        var scope = $scope.directiveScopeDict["inquiry_"+panelProgramId];
        var controller = $scope.directiveCtrlDict["inquiry_"+panelProgramId];

        controller.ngModel.InquiryCriteria.InquiryType = "Effective";

        scope.SubmitData();
    }

	$scope.SetDefaultValue = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
    
        $scope.timeDepositPanelSelectedOption = $scope.timeDepositPanelOptions.currentToNext;
	}

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		
	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
//		console.log("<"+iElement[0].tagName+">" +" Directive overried ValidateBuffer()");
		var isValid = true;
		var record = controller.ngModel;
		var msg = [];

        return isValid;
	}

    $scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
//        console.log("<"+iElement[0].tagName+">" +" Directive overried CustomPointedToRecord()");

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
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
		var effectiveHashID = 'pageview_bw41timedepositEffective';
		var historyHashID = 'pageview_bw42timedepositHistory';
		
		if(prgmID == "be31timedeposit"){
			$scope.directiveScopeDict[effectiveHashID].ClearNRefreshData();
			$scope.directiveScopeDict[historyHashID].ClearNRefreshData();
        }
        
        if(prgmID == "bi43timedeposithistoryinyearmonth"){
            var data = data_or_JqXHR.data;

            $scope.timeDepositPanelData = {};

            data.forEach(element => {
                var period = element.Period;
                if(typeof $scope.timeDepositPanelData[period] == "undefined")
                    $scope.timeDepositPanelData[period] = [];
                $scope.timeDepositPanelData[period].push(element);				
            });
        }
        if(prgmID == "bi47gettotalassets"){
            var data = data_or_JqXHR.data;
            var timedepositData = data.timedeposit;
            var timedepositInCurrencyGroupData = data.timedepositInGroup;
            var savingData = data.saving;
            var exchangerate = data.exchangerate;

            $scope.totalAssetsPanelData.TimeDeposit = 0.0;
            $scope.totalAssetsPanelData.TimeDepositCurrentValue = 0.0;
            $scope.totalAssetsPanelData.TimeDepositTotalValue = 0.0;
            $scope.totalAssetsPanelData.Saving = 0.0;
            $scope.totalAssetsPanelData.Assets = 0.0;
            $scope.totalAssetsPanelData.Liabilities = 0.0;
			
			$scope.timeDepositCurrenyRatioPanelData = {};
			$scope.timeDepositCurrenyRatioPanelData.AllData = [];
            $scope.timeDepositCurrenyRatioPanelData.Currency = {};
            
			$scope.exchangerateData = exchangerate;
            timedepositData.forEach(element => {
                var totalAssets = element.LocalValue;
				var principal = element.Principal;
				var interest = element.Interest;
				var currency = element.PrincipalCurrency;
				var rate = element.Rate;
				
				// https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
				var td_EffectDate = new Date(element.TimeDeposit_EffectiveDate);
				var td_AdjustedMaturityDate = new Date(element.AdjustedMaturityDate);
				
				var asAtDate = new Date();
				var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
				//20181130, keithpoon calculate base on the earning until current day end
				var td_WholePeriodInDays = Math.round(Math.abs((td_AdjustedMaturityDate.getTime() - td_EffectDate.getTime())/(oneDay)));
				var pastDays = Math.round(Math.abs((asAtDate.getTime() - td_EffectDate.getTime())/(oneDay)));
				var todayInterestValue = pastDays / td_WholePeriodInDays * interest * rate;
				var principalValue = principal * rate;
				
				$scope.totalAssetsPanelData.TimeDeposit = $scope.totalAssetsPanelData.TimeDeposit + parseFloat(principal);
                $scope.totalAssetsPanelData.TimeDepositCurrentValue = $scope.totalAssetsPanelData.TimeDepositCurrentValue + parseFloat(todayInterestValue) + principalValue;
				$scope.totalAssetsPanelData.TimeDepositTotalValue = $scope.totalAssetsPanelData.TimeDepositTotalValue + parseFloat(totalAssets);
				
				var currencyRatio = $scope.timeDepositCurrenyRatioPanelData;
				if(typeof(currencyRatio.Currency[currency]) == "undefined"){
					currencyRatio.Currency[currency] = {};
					currencyRatio.Currency[currency].Data = [];
					currencyRatio.Currency[currency].SubTotalValue = 0;
				}
				currencyRatio.AllData.push(element);
				currencyRatio.Currency[currency].Data.push(element);
				currencyRatio.Currency[currency].SubTotalValue += parseFloat(todayInterestValue) + principalValue;
				currencyRatio.TotalValue = $scope.totalAssetsPanelData.TimeDepositCurrentValue;
            });
            
            savingData.forEach(element => {
                var rate = 0.0;
                // if currency code equal to base currency, skip and assign rate as 1
                // for now the server side will not select the currency rate if the currency same as base currency
                if(element.AlphabeticCode == $scope.baseCurrencyCode){
                    rate = 1;
                }else{
                    exchangerate.forEach(rateRow =>{
                        if(rateRow.OutCurrencyID == element.AlphabeticCode)
                            rate = parseFloat(rateRow.Rate);
                    })
                }
                var totalAssets = parseFloat(element.AvailableBalance) * rate;
                $scope.totalAssetsPanelData.Saving = $scope.totalAssetsPanelData.Saving + totalAssets;
            });
            
            RefreshTotalAssetsRatio();
            
            RefreshTimeDepositCurrencyRatio();
			
            $scope.CurrentMonthIncomePanelData.Data = {};
            $scope.CurrentMonthIncomePanelData.Data.TimeDeposit = timedepositInCurrencyGroupData;
            $scope.CurrentMonthIncomePanelData.Data.ExchangeRate = exchangerate;
        }
        if(prgmID == "bi36assetsliabilities"){
            var data = data_or_JqXHR.data;
            $scope.CurrentDateLiabilitiesPanelData.Data = {};
            $scope.CurrentDateLiabilitiesPanelData.Data = data;

            $scope.CurrentDateLiabilitiesPanelData.totalAssets = 0;
            $scope.CurrentDateLiabilitiesPanelData.totalLiabilities = 0;
            
            for(var index in data){
                var record = data[index];
                var amount = Math.round(parseFloat(record.Amount) * 100) / 100;
                if(record.Type == "Assets"){
                    $scope.CurrentDateLiabilitiesPanelData.totalAssets += amount;
                }
                if(record.Type == "Liabilities"){
                    amount *= -1;
                    $scope.CurrentDateLiabilitiesPanelData.totalLiabilities += amount;
                }
            }
            
            RefreshTotalAssetsRatio();
        }
        if(prgmID == "bi48gettotalinareachart"){
            var data = data_or_JqXHR.data;
            $scope.AreaChartPanelData.Data = {}
            $scope.AreaChartPanelData.Data = data;

            var timedepositData = data.timedeposit;
            var timedepositInCurrencyGroupData = data.timedepositInGroup;
            var savingData = data.saving;
            var exchangerate = data.exchangerate;

            var last12Months = new Date($scope.areaChartModel.last12Months.getTime());

            var monthDifference;
            var d2 = new Date();
            var d1 = last12Months;
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();
            months <= 0 ? monthDifference = 0 : monthDifference = months;

            var last12MonthsInYYYYMM = {};
            var savingMonthlyBalance = {};
            for(var i=1; i<=monthDifference; i++){
                var d3 = new Date(last12Months.getTime());
                d3.setMonth(d3.getMonth()+i);

                var monthIn2Digit = ("0" + (d3.getMonth() + 1)).slice(-2);
                last12MonthsInYYYYMM[d3.getFullYear()+monthIn2Digit] = {
                    timedeposit:0,
                    saving:0,
                    income:0
                };
                savingMonthlyBalance[d3.getFullYear()+monthIn2Digit] = {};
            }

            // saving records group in yyyymm, then group in currency
            savingData.forEach(element => {
                var availableBalance = element.AvailableBalance;
                var alphabeticCode = element.AlphabeticCode;
                var rate = element.Rate;

                var saving_EffectDate = new Date(element.EffectiveDate);
                var monthPointer = new Date(saving_EffectDate.getFullYear(), saving_EffectDate.getMonth(), 1);
                var belongsToMonthStr = monthPointer.getFullYear()+("0" + (monthPointer.getMonth() + 1)).slice(-2);

                if(savingMonthlyBalance.hasOwnProperty(belongsToMonthStr)){
                    if(!savingMonthlyBalance[belongsToMonthStr].hasOwnProperty(alphabeticCode)){
                        savingMonthlyBalance[belongsToMonthStr][alphabeticCode] = [];
                    }
                    savingMonthlyBalance[belongsToMonthStr][alphabeticCode].push(element);
                }
                var savingAssets = element.AvailableBalance * rate;
            });

            // calculate saving and grouping
            _.forEach(savingMonthlyBalance, function(currencyList, yyyymm) {
                // console.dir("yyyymm: "+yyyymm);
                _.forEach(currencyList, function(savingList, currency){
                    var monthEndCutOffSavingRecord = {};
                    // console.dir(currency+" saving list");

                    // find closest to month end saving record
                    // store format is object[bank account code] = savingRecordObj
                    _.forEach(savingList, function(savingRecord, index){
                        if(!_.has(monthEndCutOffSavingRecord, savingRecord.FullAccountCodeWithDash)){
                            monthEndCutOffSavingRecord[savingRecord.FullAccountCodeWithDash] = savingRecord;
                        }
                        else{
                            var record1_EffectiveDate = new Date(monthEndCutOffSavingRecord[savingRecord.FullAccountCodeWithDash].EffectiveDate);
                            var record2_EffectiveDate = new Date(savingRecord.EffectiveDate);

                            if(record2_EffectiveDate >= record1_EffectiveDate){
                                monthEndCutOffSavingRecord[savingRecord.FullAccountCodeWithDash] = savingRecord;
                            }
                        }
                    })
                    // console.dir(monthEndCutOffSavingRecord);

                    _.forEach(monthEndCutOffSavingRecord, function(savingRecord, bankCode){
                        var localValue = (parseFloat(savingRecord.AvailableBalance) * parseFloat(savingRecord.Rate));
                        // console.dir("AvailableBalance: "+savingRecord.AvailableBalance+" * Rate:"+savingRecord.Rate+" = "+localValue);
                        last12MonthsInYYYYMM[yyyymm].saving += (parseFloat(savingRecord.AvailableBalance) * parseFloat(savingRecord.Rate));
                    })
                })
            });
           
            timedepositData.forEach(element => {
                var totalAssets = element.LocalValue;
                var principal = element.Principal;
                var interest = element.Interest;
                var currency = element.PrincipalCurrency;
                var rate = element.Rate;
                
                // https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
                var td_EffectDate = new Date(element.TimeDeposit_EffectiveDate);
                var td_AdjustedMaturityDate = new Date(element.AdjustedMaturityDate);
                
                // var asAtDate = new Date();
                // var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                // //20181130, keithpoon calculate base on the earning until current day end
                // var td_WholePeriodInDays = Math.round(Math.abs((td_AdjustedMaturityDate.getTime() - td_EffectDate.getTime())/(oneDay)));
                // var pastDays = Math.round(Math.abs((asAtDate.getTime() - td_EffectDate.getTime())/(oneDay)));
                // var todayInterestValue = pastDays / td_WholePeriodInDays * interest * rate;

                var principalValue = principal * rate;
                // 20190718, keithpoon, if the exchange rate data incomplete, the Rate will undefined
                // NaN will be assigned to timedeposit in below, that will break the chart drawing
                if(typeof(rate) == "undefined"){
                    console.warn("Exchange rate not exists for this record");
                    console.dir(element);
                    rate = 1;
                }
                var interestValue = interest * rate;

                // if the deposit withdraw in the same yyyymm, is not a asset, then skip
                if(td_AdjustedMaturityDate.getMonth() == td_EffectDate.getMonth() && td_AdjustedMaturityDate.getFullYear() == td_EffectDate.getFullYear()){
                }else{
                    var monthPointer = new Date(td_EffectDate.getFullYear(), td_EffectDate.getMonth(), 1);

                    // console.dir("start:"+element.TimeDeposit_EffectiveDate)
                    // console.dir("end:"+element.AdjustedMaturityDate)

                    // acuminate the timedeposit
                    // console.dir(element)
                    while(monthPointer < td_AdjustedMaturityDate
                        ){
                        var belongsToMonthStr = monthPointer.getFullYear()+("0" + (monthPointer.getMonth() + 1)).slice(-2);

                        if(last12MonthsInYYYYMM.hasOwnProperty(belongsToMonthStr)){
                            last12MonthsInYYYYMM[belongsToMonthStr].timedeposit += principalValue;
                            // last12MonthsInYYYYMM[belongsToMonthStr].income += interestValue;
                        }

                        // console.dir(belongsToMonthStr)
                        monthPointer.setMonth(monthPointer.getMonth()+1);

                        // exit loop if the monthPointer equal to the same yyyymm of AdjustedMaturityDate
                        if(
                            td_AdjustedMaturityDate.getMonth() == monthPointer.getMonth() &&
                            td_AdjustedMaturityDate.getFullYear() == monthPointer.getFullYear()
                            ){
                                break;}
                    }

                    // deposit interest count in the month which maturitied
                    var yyyymmOfInterest = td_AdjustedMaturityDate.getFullYear()+("0" + (td_AdjustedMaturityDate.getMonth() + 1)).slice(-2);
                    if(last12MonthsInYYYYMM.hasOwnProperty(belongsToMonthStr)){
                        last12MonthsInYYYYMM[belongsToMonthStr].income += interestValue;
                    }
                }
            });

            RefreshAreaChartPanel(last12MonthsInYYYYMM);
        }
        if(prgmID == "bi49tradeorder"){
            var data = data_or_JqXHR.data;

            $scope.TradeOrderPanelData.Data = data;
            $scope.TradeOrderPanelData.Exchangerate = data.exchangerate;
            $scope.TradeOrderPanelData.ForeignCurrencyTran = [];
			
			data.foreignCurrencyTran.forEach(function(item){
				var forexRow = item;
				var buyOrSellStatus = "buy";
				var tradeOrderOriginalOutAmount = 0;
				var tradeOrderOriginalInAmount = 0;
				
				var tradeOrderRemindersOutAmount = 0;
				var tradeOrderRemindersInAmount = 0;
				var tradeOrderCurrentValue = 0;
				
				var tradeOrderRate = 0;
				
				var tradeInCurrencyID = "";
				var tradeOutCurrencyID = "";
				if(item.OutCurrencyID == $scope.baseCurrencyCode){
					tradeOrderRemindersInAmount = item.InAmount;
					tradeOrderOriginalInAmount = item.InAmount;
					tradeOrderOriginalOutAmount = item.OutAmount;
					tradeInCurrencyID = item.InCurrencyID;
					tradeOutCurrencyID = item.OutCurrencyID;
				}
				
				// if further foreign exchange transaction completed
				if(forexRow.Edge.length > 0){
					forexRow.Edge.forEach(function(edge){
						if(edge.OutCurrencyID == tradeInCurrencyID
						&& edge.InCurrencyID == tradeOutCurrencyID){
							tradeOrderRemindersInAmount -= edge.OutAmount;
						}
					});
				}
				var forexRate = 0;
				
				// for current rate
				for(var i=0; i<data.exchangerate.length; i++){
					var forexRow = data.exchangerate[i];
					if(forexRow.OutCurrencyID == tradeInCurrencyID
					&& forexRow.InCurrencyID == tradeOutCurrencyID){
						forexRate = forexRow.Rate
						break;
					}
				}
				// calculate current value
				tradeOrderCurrentValue = tradeOrderRemindersInAmount * forexRate;
				// calculate the trade order percentage, if greater than 0 means earning, lesser than 0 means losing
				tradeOrderRate = (forexRate - item.Rate) / item.Rate;
				// convert reminders forex amount to current value
				tradeOrderRemindersOutAmount = tradeOrderRemindersInAmount / tradeOrderOriginalInAmount * tradeOrderOriginalOutAmount;
				
				item.tradeOrderOriginalInAmount = tradeOrderOriginalInAmount;
				item.tradeOrderOriginalOutAmount = tradeOrderOriginalOutAmount;
				item.tradeOrderRemindersOutAmount = tradeOrderRemindersOutAmount;
				item.tradeOrderRemindersInAmount = tradeOrderRemindersInAmount;
				item.tradeOrderCurrentValue = tradeOrderCurrentValue;
				item.tradeOrderRate = tradeOrderRate;
								
				$scope.TradeOrderPanelData.ForeignCurrencyTran.push(item);
			});
        }
    }
    /*
    function mysqlTimeStampToDate(timestampStr) {
        var t = timestampStr.split(/[- :]/);

        // Apply each element to the Date function
        var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
        return d;
    }*/
    function mysqlDateToDate(dateStr) {
        var dateParts = dateStr.split("-");
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2].substr(0,2));
    }
    function mysqlTimeStampToDate(timestampStr) {
        //function parses mysql datetime string and returns javascript Date object
        //input has to be in this format: 2007-06-05 15:26:02
        var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
        var parts=timestampStr.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
        return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
    }

    function RefreshAreaChartPanel(last12MonthsInYYYYMM){
        var chartData = [];
        for (var yyyymm in last12MonthsInYYYYMM) {
            if (last12MonthsInYYYYMM.hasOwnProperty(yyyymm)) {
                var yyyymmAddDash = [yyyymm.slice(0, 4), "-", yyyymm.slice(4)].join('');
                chartData.push({
                    period: yyyymmAddDash,
                    timedeposit: last12MonthsInYYYYMM[yyyymm].timedeposit.toFixed(2),
                    saving: last12MonthsInYYYYMM[yyyymm].saving.toFixed(2),
                    income: last12MonthsInYYYYMM[yyyymm].income.toFixed(2)
                })
            }
        }
        DrawAreaChart(chartData);
    }

    function DrawAreaChart(chartData){
        
        Morris.Area({
            element: 'morris-area-chart',
            data: chartData,
            xkey: 'period',
            ykeys: ['timedeposit', 'saving', 'income'],
            labels: ['Time Deposit', 'Saving', 'Income'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true,
            xLabels: "month",
            yLabelFormat: function (y) { return "$"+y.toString() ; },
            behaveLikeLine: true // Set to true to overlay the areas on top of each other instead of stacking them.
        });
    }

    function RefreshTotalAssetsRatio(){
        // draw chart until both ajax call responded
        
        if(
            typeof($scope.totalAssetsPanelData.TimeDepositCurrentValue) == "undefined" ||
            typeof($scope.totalAssetsPanelData.Saving) == "undefined" ||
            // typeof($scope.totalAssetsPanelData.Assets) == "undefined" ||
            // typeof($scope.totalAssetsPanelData.Liabilities) == "undefined")
            typeof($scope.CurrentDateLiabilitiesPanelData.totalAssets) == "undefined" ||
            typeof($scope.CurrentDateLiabilitiesPanelData.totalLiabilities) == "undefined"){
            return;
            }

            $scope.totalAssetsPanelData.Assets = $scope.CurrentDateLiabilitiesPanelData.totalAssets;
            $scope.totalAssetsPanelData.Liabilities = $scope.CurrentDateLiabilitiesPanelData.totalLiabilities;


        DrawTotalAssetsRatio("total-assets-ratio-donut-chart", 
        $scope.totalAssetsPanelData.TimeDepositCurrentValue,
        $scope.totalAssetsPanelData.Saving,
        $scope.totalAssetsPanelData.Assets,
        $scope.totalAssetsPanelData.Liabilities * -1);
    }
    
    function RefreshTimeDepositCurrencyRatio(){
        DrawTimeDepositCurrencyRatio("timedeposit-ratio-donut-chart", 
			$scope.timeDepositCurrenyRatioPanelData);
    }
	
	function DrawTimeDepositCurrencyRatio(_elementID, _currenyRatioPanelData){
		var donutData = [];
		for(var currency in _currenyRatioPanelData.Currency){
			var currencyObject = _currenyRatioPanelData.Currency[currency];
			
			var ratio = (parseFloat(currencyObject.SubTotalValue) / parseFloat(_currenyRatioPanelData.TotalValue)) * 100;
			ratio = parseFloat(Math.round(ratio * 100) / 100).toFixed(2);
			donutData.push({
				label: currency,
				value: ratio
			})
		}
        Morris.Donut({
            element: _elementID,
            data: donutData,
            formatter: function (y) { return y + "%" },
            resize: true
        });
	}

    function DrawTotalAssetsRatio(_elementID, _timedeposit, _saving, _assets, _liabilities){
        var totalAssets = _timedeposit + _saving + _assets + _liabilities;
        var tRate = (_timedeposit / totalAssets) * 100;
        var sRate = (_saving / totalAssets) * 100;
        var aRate = (_assets / totalAssets) * 100;
        var lRate = (_liabilities / totalAssets) * 100;

        tRate = parseFloat(Math.round(tRate * 100) / 100).toFixed(2);
        sRate = parseFloat(Math.round(sRate * 100) / 100).toFixed(2);
        aRate = parseFloat(Math.round(aRate * 100) / 100).toFixed(2);
        lRate = parseFloat(Math.round(lRate * 100) / 100).toFixed(2);

        Morris.Donut({
            element: _elementID,
            data: [{
                label: "Time Deposit",
                value: tRate
            }, {
                label: "Saving",
                value: sRate
            }, {
                label: "Cash Flow",
                value: aRate
            }, {
                label: "Liabilities",
                value: lRate
            }],
            formatter: function (y) { return y + "%" },
            resize: true
        });
    }
    
    $scope.$watch(
        function (){return $scope.timeDepositPanelSelectedOption},
        function (newValue, oldValue){
            if(newValue !== oldValue)
                $scope.RefreshTimeDepositPanel();
        }
    )
	
	// trggier when current month income and exchange rate exists
	var today = new Date();
	var currentYearMonth = today.getFullYear()+"-"+('0' + today.getMonth()).slice(-2);
	
    $scope.$watch(
        function (){return $scope.CurrentMonthIncomePanelData.Data},
        function (newValue, oldValue){
            if(newValue !== oldValue){
				// if(!$.isEmptyObject($scope.exchangerateData)){
					var timeDepositRecords = $scope.CurrentMonthIncomePanelData.Data.TimeDeposit;
					var exchangeRateRecords = $scope.CurrentMonthIncomePanelData.Data.ExchangeRate;
					CalculateCurrentMonthIncome(timeDepositRecords, exchangeRateRecords);
				// }
			}
        }, true
    )
    // $scope.$watch(
    //     function (){return $scope.exchangerateData},
    //     function (newValue, oldValue){
    //         if(newValue !== oldValue){
	// 			if(!$.isEmptyObject($scope.CurrentMonthIncomePanelData.Data)){
	// 				var timeDepositRecords = $scope.CurrentMonthIncomePanelData.Data;
	// 				var exchangeRateRecords = $scope.exchangerateData;
	// 				CalculateCurrentMonthIncome(timeDepositRecords, exchangeRateRecords);
	// 			}
	// 		}
    //     }, true
    // )
	
	function CalculateCurrentMonthIncome (_timeDepositRecords, _exchangeRateRecords){
        $scope.CurrentMonthIncomePanelData.Income = 0;
		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		var firstDay = new Date(y, m, 1);
		var lastDay = new Date(y, m + 1, 0);
		_timeDepositRecords.forEach(tdrecord => {
			var currencyIncome = 0;
            currencyIncome = parseFloat(tdrecord.Interest);
            _exchangeRateRecords.forEach(exchangeRecord => {
                if(tdrecord.PrincipalCurrency == exchangeRecord.OutCurrencyID){
                    currencyIncome = parseFloat(tdrecord.Interest) * parseFloat(exchangeRecord.Rate);
                }
            });
            $scope.CurrentMonthIncomePanelData.Income = $scope.CurrentMonthIncomePanelData.Income + currencyIncome;
		})
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

}]);