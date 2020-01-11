"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('updateForeignExchangeController', ['$scope', '$rootScope', '$compile', 'Core', 'MessageService', function ($scope, $rootScope, $compile, Core, MessageService) {
	$scope.customData = {};
	$scope.customData.daysDiff = 0;
	$scope.customData.formula = "";

	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.inquiryModel = {};
    $scope.inquiryModel.Record = {};
    
    $scope.inquirySeriesModel = {};
    $scope.inquirySeriesModel.Record = {};
    
    $scope.inquirySeriesForReferencePath = {};
    $scope.inquirySeriesForReferencePath.Record = {};

    $scope.tableView = "compact";

    $scope.totalCurrentValue = 0;
    $scope.totalEarningDeductionValue = 0;

	$scope.SwitchToCreate = function(){
		$scope.entryFormMode = "create"
		$scope.entryFormTitle = "Create Foreign Exchange";

        var hashID = "entry_be37forextran";
		$scope.directiveScopeDict[hashID].ResetForm();
		$scope.ShowEntryForm();
	}
	$scope.SwitchToAmend = function(){
		$scope.entryFormMode = "amend"
        $scope.entryFormTitle = "Amend Foreign Exchange";
        
		$scope.ShowEntryForm();
    }
    $scope.SelectedOnDataTable = function(timeDepositTranID){
        $scope.SwitchToAmend();
        var entryHashID = "entry_be37forextran";

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
                { "data": "ExchangeTranID" },
                { "data": "ExchangeDate" },
                { "data": "BankCode" },
                { "data": "Type" },
                { "data": "Purpose" },
                { "data": "TradePath" },
                { "data": "OutCurrencyID" },
                { "data": "OutAmount" },
                { "data": "Rate" },
                { "data": "InCurrencyID" },
                { "data": "InAmount" },
                { "data": "RateRelatively" },
                { "data": "Remarks" },
                { "data": "Status" }
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
                    "targets": [8,11],
                    "render": function ( data, type, row ) {
                        return "$"+data ;
                    },
                    className: 'dt-body-right'
                },
                {
                    "targets": [ 1,12,13 ],
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
            if(prgmID == "bi51forextranseries"){
            }
		})
	}

	$scope.SetDefaultValue = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
        if(prgmID == "be37forextran"){
            var newRecord = controller.ngModel;
            newRecord.EffectiveDate = new Date();
            newRecord.OutCurrencyID = "";
            newRecord.InCurrencyID = "";
            newRecord.Type = "T/T";
            newRecord.Purpose = "Investment";

            $scope.SwitchToCreate();
            $scope.HideEntryForm();
        }

        if(prgmID=="bi50forextran"){
            var newRecord = controller.ngModel.InquiryCriteria;
            newRecord.OutCurrencyID = "";
            newRecord.InCurrencyID = "";
            newRecord.Type = "";
            newRecord.Purpose = "";
            newRecord.Status = "";
        }
        if(prgmID=="bi51forextranseries"){
            var newRecord = controller.ngModel.InquiryCriteria;
            newRecord.EffectiveFrom = new Date();
            newRecord.EffectiveTo = new Date();
            newRecord.OutCurrencyID = "";
            newRecord.InCurrencyID = "";
            newRecord.Type = "";
            newRecord.Status = "%";
            newRecord.EquivalentCurrency = "HKD";

            $scope.SetDateRangeLastMonths(6);
            scope.SubmitData();
        }
        if(prgmID=="bi52forextranseries"){
            var newRecord = controller.ngModel.InquiryCriteria;
            newRecord.EffectiveFrom = new Date();
            newRecord.EffectiveTo = new Date();
            newRecord.OutCurrencyID = "";
            newRecord.InCurrencyID = "";
            newRecord.Type = "";
            newRecord.EquivalentCurrency = "HKD";

            $scope.SetDateRangeLastMonths(6);
            scope.SubmitData();
        }
    }
    
    $scope.SetDateRangeThisMonth = function(){
        var todayDate = new Date(), y = todayDate.getFullYear(), m = todayDate.getMonth();
        var startDate = new Date(y, m, 1);
        var endDate = new Date(y, m + 1, 0);
        $scope.SetDateRange(startDate, endDate);
    }
    $scope.SetDateRangeLast12Month = function(){
        var todayDate = new Date(), y = todayDate.getFullYear(), m = todayDate.getMonth();
        var startDate = new Date(y, m-12, 1);
        var endDate = new Date(y, m, 0);
        $scope.SetDateRange(startDate, endDate);
    }
    $scope.SetDateRangeLastMonths = function(months){
        var todayDate = new Date(), y = todayDate.getFullYear(), m = todayDate.getMonth();
        var startDate = new Date(y, m-months, 1);
        var endDate = new Date(y, m, 0);
        $scope.SetDateRange(startDate, endDate);
    }

    $scope.SetDateRange = function(adjustedFromDate, adjustedToDate){
        $scope.inquirySeriesModel.InquiryCriteria.EffectiveFrom = adjustedFromDate;
        $scope.inquirySeriesModel.InquiryCriteria.EffectiveTo = adjustedToDate;
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
		// switch (fieldName) {
		// 	case "EffectiveDate":
		// 	case "DepositPeriodAmt":
		// 	case "DepositPeriodUnit":
		// 		var daysDuringPeriod = CalculateMaturityDateDaysDifference(newObj);
		// 		// console.dir(newObj)
		// 		if(daysDuringPeriod>0){
		// 			DisplayMaturityDate(newObj, daysDuringPeriod);
		// 		}
		// 		break;
		// 	default:
        //         break;
		// }

		// switch (fieldName) {
		// 	case "Principal":
        //     case "EffectiveDate":
		// 	case "DepositPeriodAmt":
		// 	case "DepositPeriodUnit":
		// 	case "DepositRate":
		// 		var interest = CalculateInterest(newObj);
		// 			DisplayInterest(newObj, interest);
		// 		break;
        //     default:
        //         break;
        // }

        // switch(fieldName){
        //     case "AdjustedMaturityDate":
        //             var daysDuringPeriod = CalculateAdjustedMaturityDateDaysDifference(newObj);
        //             $scope.customData.daysDiff = daysDuringPeriod;
        //             newObj.NoOfDays = daysDuringPeriod;
        //             if(daysDuringPeriod>0){
        //                 var interest = CalculateInterest(newObj);
        //                 DisplayInterest(newObj, interest);
        //             }
        //         break;
        // }
        
		// switch (fieldName) {
		// 	case "Interest":
		// 		var principalAndInterest = CalculateTotal(newObj);
		// 		DisplayTotal(newObj, principalAndInterest);
		// 	break;
		// 	case "AdjustedInterest":
		// 		DisplayAdjustedCredit(newObj);
		// 	break;
		// }
    }

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
        var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
        var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;

		var record = controller.ngModel;

		var isValid = true;
        var errorMsgList = [];
        
        if(prgmID == "be37forextran"){
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

        if(prgmID == "bi50forextran"){
            var record = controller.ngModel.InquiryCriteria;
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
            var entryHashID = "entry_be37forextran";
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
		
		if(prgmID == "be37forextran"){
			// $scope.directiveScopeDict[effectiveHashID].ClearNRefreshData();
			// $scope.directiveScopeDict[historyHashID].ClearNRefreshData();
		}else if(prgmID == "bi50forextran"){
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
        }else if(prgmID == "bi51forextranseries"){
            var data = data_or_JqXHR.data;
            DrawForexSeriesTable(data);
        }else if(prgmID == "bi52forextranseries"){
            var data = data_or_JqXHR.data;
            DrawForexSeriesReferenceTable(data);
        }
    }

    $scope.ChangeViewToCompact = function(){
        $scope.tableView = "compact";

        $(".series_summary_row").data("is-show-series-node-row", false);

        $(".series_node_row").hide();
    }

    $scope.ChangeViewToHybrid = function(){
        $scope.tableView = "hybrid";
    }

    $scope.ChangeViewToExpand = function(){
        $scope.tableView = "expand";

        $(".series_summary_row").data("is-show-series-node-row", true);

        $(".series_node_row").show();
    }

    $scope.ToggleSeries = function(ancestorID){
        var isToggle = !$(".series_ancestor_"+ancestorID).data("is-show-series-node-row");

        if(isToggle){
            $(".series_ancestor_"+ancestorID+"_node").show();
        }else{
            $(".series_ancestor_"+ancestorID+"_node").hide();
        }

        $(".series_ancestor_"+ancestorID).each(function(){
            $(this).data("is-show-series-node-row", isToggle);
        })

        $scope.ChangeViewToHybrid();
    }

    function DrawForexSeriesReferenceTable(data){
        var tbodyRowArray = CalculateForexSeries(data);
        console.dir(tbodyRowArray);
    }
    
    function DrawForexSeriesTable(data){
        var table_container = $("#series_table");
        var thead_container = table_container.find("thead");
        var tbody_container = table_container.find("tbody");
        ClearForexSeriesTable(table_container);

        $scope.totalCurrentValue = 0;
        $scope.totalEarningDeductionValue = 0;

        DrawTableHead(table_container);

        var tbodyRowArray = CalculateForexSeries(data);
        DrawForexSeriesTbody(tbodyRowArray, table_container);

        DrawTotalRow(data, table_container);

        var scope = angular.element(table_container).scope();
        $compile(table_container)(scope);
    }

    function DrawTableHead(table_container){
        var thead_container = table_container.find("thead");
        var tbody_container = table_container.find("tbody");
        
        // find date period
        var startDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveFrom);
        var endDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveTo);
        var monthsDifference = moment(endDate).diff(moment(startDate), 'months', true)
        monthsDifference = Math.trunc( monthsDifference ) +1;

        var head_row = $("<tr/>");
        var colspan = 0;
        var tempYear = 0;

        // Draw 1st row, years
        var head_row = $("<tr/>");
        $("<th/>").text("Year").appendTo(head_row);

        var colspan = 1;
        var tempYear = moment(new Date(startDate)).format("YYYY");
        for(var startAt = 0; startAt < monthsDifference; startAt++){
            var pointedMonth = moment(new Date(startDate)).add(startAt, 'M');

            if(tempYear != pointedMonth.format("YYYY")){
                $("<th/>", {
                    class: "text-center",
                    colspan: colspan,
                    text: tempYear
                })
                .appendTo(head_row);
                colspan = 0;
            }else if(startAt == monthsDifference-1){
                $("<th/>", {
                    class: "text-center",
                    colspan: colspan,
                    text: tempYear
                })
                .appendTo(head_row);
            }
            tempYear = pointedMonth.format("YYYY");
            colspan++;
        }
        $("<th/>", {
            rowspan: 2,
            text: "Series total"
        })
        .appendTo(head_row);
        $("<th/>", {
            rowspan: 2,
            text: "Current value"
        })
        .appendTo(head_row);
        $("<th/>", {
            rowspan: 2,
            text: "Earning / Deduction"
        })
        .appendTo(head_row);
        head_row.appendTo(thead_container);

        // Draw 2nd row, cell content MMM YYYY
        var head_row2 = $("<tr/>");
        $("<th/>").text("#").appendTo(head_row2);

        for(var startAt = 0; startAt < monthsDifference; startAt++){
            var pointedMonth = moment(new Date(startDate)).add(startAt, 'M');

            // 20190901, keithpoon, print month only, shrink the table size
            $("<th/>").text(pointedMonth.format("MMM"))
            //$("<th/>").text(pointedMonth.format("MMM YYYY"))
            .appendTo(head_row2);
        }
        // $("<th/>").text("Series total").appendTo(head_row2);
        head_row2.appendTo(thead_container);
    }

    function CreateSeriesTbodyRowObj(){
        var tbodyRowObj = {
            rowData: [],
            rowObj: {},
            childNodeRowData: []
        };
        return tbodyRowObj;
    }

    function DrawForexSeriesTbody(tbodyRowArray, table_container){
        var thead_container = table_container.find("thead");
        var tbody_container = table_container.find("tbody");
        
        // find date period
        var startDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveFrom);
        var endDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveTo);
        var periodMonthsDifference = moment(endDate).diff(moment(startDate), 'months', false)
        periodMonthsDifference = Math.trunc( periodMonthsDifference ) +1;

        tbodyRowArray.map((tbodyRowObj, index, array)=>{
            var ancestorRow = tbodyRowObj.rowObj;
            var seriesSummaryRowCells = tbodyRowObj.rowData;
            var seriesNodeRowArray = tbodyRowObj.childNodeRowData;
            var ancestorID = ancestorRow.ExchangeTranID;
            var isArchive = ancestorRow.Status == "Archive";

            // create row
            var tbody_series_subtotal_row = $("<tr/>",{
                "class": 'series_summary_row series_ancestor_'+ancestorID,
                "data-series-ancestor": ancestorID,
                "data-series-first-row": true,
                "ng-click": "ToggleSeries("+ancestorID+")"
            });

            // create first column
            var foreignCurrency = ancestorRow.foreignCurrency;
            var series_path = ancestorRow.series_path;
            var seriesPathCell = $("<td/>",{
                html:"<div><span class='series_forex_currency'>"+foreignCurrency+"</span> "+series_path+"</div>"
            })
            seriesPathCell
            .appendTo(tbody_series_subtotal_row);
            
            var seriesSubTotalObj = tbodyRowObj.rowObj.seriesSubTotalObj;

            // create reminder columns
            seriesSummaryRowCells.forEach((amount, cellIndex, cellArray)=>{
                var seriesSummaryRowColumn = $("<td/>").text("");
                var divCell = $("<div/>");
                
                var cellHTML = "";

                if(cellIndex >= periodMonthsDifference){
                    return; // means continue;
                }

                if(cellIndex < periodMonthsDifference){
                    if(amount>0){
                        cellHTML = "<span class='positive_amount'>";
                        cellHTML +=
                        "<i class='fas fa-caret-up'></i> ";
                        cellHTML +=
                        "{{ "+amount +" | currency :'$': 2 }}</span>"
                    }else if(amount<0){
                        cellHTML = "<span class='negative_amount'>";
                        cellHTML +=
                        "<i class='fas fa-caret-down'></i> ";
                        cellHTML +=
                        "{{ "+amount +" | currency :'$': 2 }}</span>"
                    }else if(amount==0){
                        cellHTML = "<span>";
                        cellHTML +=
                        amount +"</span>"
                    }
                }else{
                    // if(!isArchive){
                    //     cellHTML = "<span>";
                    //     cellHTML +=
                    //     "{{ "+amount +" | currency :'$': 2 }}</span>"
                    // }else{
                    //     if(amount>=0){
                    //         cellHTML = "<span class='positive_amount'>";
                    //         cellHTML +=
                    //         "<i class='fas fa-caret-up'></i> ";
                    //     }else if(amount <0){
                    //         cellHTML = "<span class='negative_amount'>";
                    //         cellHTML +=
                    //         "<i class='fas fa-caret-down'></i> ";
                    //     }
                    //     cellHTML +=
                    //     "{{ "+amount +" | currency :'$': 2 }}</span>"
                    // }
                }

                    divCell = $("<div/>",{
                        class: "series_amount",
                        // html: "{{ "+amount+" | currency :'$': 2 }}"
                        html: cellHTML
                    })

                divCell.appendTo(seriesSummaryRowColumn);
                seriesSummaryRowColumn.appendTo(tbody_series_subtotal_row);
            })

            // create series total column
            var seriesSummaryRowColumn = $("<td/>").text("");
            var divCell = $("<div/>");
            var cellHTML = "";
            var amount = seriesSubTotalObj.equivalentLocalCurrencyBalance;
            
            cellHTML = "<span>";
            if(isArchive){
                if(amount>=0){
                    cellHTML = "<span class='positive_amount'>";
                    cellHTML +=
                    "<i class='fas fa-caret-up'></i> ";
                }else{
                    cellHTML = "<span class='negative_amount'>";
                    cellHTML +=
                    "<i class='fas fa-caret-down'></i> ";
                }
            }else{
                
            }
            cellHTML +=
            "{{ "+amount +" | currency :'$': 2 }}</span>"

            divCell = $("<div/>",{
                class: "series_amount",
                html: cellHTML
            })
            divCell.appendTo(seriesSummaryRowColumn);
            seriesSummaryRowColumn.appendTo(tbody_series_subtotal_row);

            // create Current value column
            var seriesSummaryRowColumn = $("<td/>").text("");
            var divCell = $("<div/>");
            var cellHTML = "";
            var amount = ancestorRow.currentValue;

            if(!isArchive){
                cellHTML = "<span>";
                cellHTML +=
                "{{ "+amount +" | currency :'$': 2 }}</span>"
            }

            divCell = $("<div/>",{
                class: "series_amount",
                html: cellHTML
            })
            divCell.appendTo(seriesSummaryRowColumn);
            seriesSummaryRowColumn.appendTo(tbody_series_subtotal_row);

            // create Earning / Deduction column
            var seriesSummaryRowColumn = $("<td/>").text("");
            var divCell = $("<div/>");
            var cellHTML = "";
            var amount = ancestorRow.eOrDValue;
            cellHTML = "<span>";
            if(amount>=0){
                cellHTML = "<span class='positive_amount'>";
                cellHTML +=
                "<i class='fas fa-caret-up'></i> ";
            }else{
                cellHTML = "<span class='negative_amount'>";
                cellHTML +=
                "<i class='fas fa-caret-down'></i> ";
            }
            cellHTML +=
            "{{ "+amount +" | currency :'$': 2 }}</span>"

            divCell = $("<div/>",{
                class: "series_amount",
                html: cellHTML
            })
            divCell.appendTo(seriesSummaryRowColumn);
            seriesSummaryRowColumn.appendTo(tbody_series_subtotal_row);
            
            tbody_series_subtotal_row.appendTo(tbody_container);

            // draw series node row
            seriesNodeRowArray.map((nodeRow, nodeIndex, nodeArray)=>{
                var seriesChileRowCells = nodeRow.rowData;
                // create series transactions tbody row
                var tbody_node_row = $("<tr/>",{
                    "class": "series_ancestor_"+ancestorID+"_node series_node_row",
                    "data-series-node-row": true,
                    "data-is-show-series-node-row": false,
                    "data-belong-to-ancestor": ancestorID
                });

                // create first column
                var seriesNodePathCell;
                // var foreignCurrency = FindForeignCurrency(equivalentCurrency, seriesPathArray[ancestorID].data[0]);
                var nodeExchangeDate = moment(nodeRow.rowObj.ExchangeDate, "YYYY-MM-DD");
                var dateContent = "{{ "+nodeExchangeDate+" | date:'yyyy-MM-dd' }}";
                seriesNodePathCell = $("<td/>",{
                    html:"<div>&emsp;"+dateContent+" #"+nodeRow.rowObj.ExchangeTranID+"/</div>"
                })
                // add first column to series node
                seriesNodePathCell
                .appendTo(tbody_node_row);

                // create reminder columns
                seriesChileRowCells.forEach((amount, cellIndex, cellArray)=>{
                    var nodeRowColumn = $("<td/>").text("");
                    var divCell = $("<div/>");
                    
                    var cellHTML = "";

                    if(cellIndex >= periodMonthsDifference){
                        return; // means continue;
                    }

                    if(cellIndex < periodMonthsDifference){
                        if(amount>0){
                            cellHTML = "<span class='positive_amount'>";
                            cellHTML +=
                            "<i class='fas fa-caret-up'></i> ";
                            cellHTML +=
                            "{{ "+amount +" | currency :'$': 2 }}</span>"
                        }else if(amount<0){
                            cellHTML = "<span class='negative_amount'>";
                            cellHTML +=
                            "<i class='fas fa-caret-down'></i> ";
                            cellHTML +=
                            "{{ "+amount +" | currency :'$': 2 }}</span>"
                        }else if(amount==0){
                            cellHTML = "<span>";
                            cellHTML +=
                            amount +"</span>"
                        }
                    }else{
                        // if(!isArchive){
                        //     cellHTML = "<span>";
                        //     cellHTML +=
                        //     "{{ "+amount +" | currency :'$': 2 }}</span>"
                        // }else{
                        //     if(amount>=0){
                        //         cellHTML = "<span class='positive_amount'>";
                        //         cellHTML +=
                        //         "<i class='fas fa-caret-up'></i> ";
                        //     }else if(amount <0){
                        //         cellHTML = "<span class='negative_amount'>";
                        //         cellHTML +=
                        //         "<i class='fas fa-caret-down'></i> ";
                        //     }
                        //     cellHTML +=
                        //     "{{ "+amount +" | currency :'$': 2 }}</span>"
                        // }
                    }

                        divCell = $("<div/>",{
                            class: "series_node_amount",
                            // html: "{{ "+amount+" | currency :'$': 2 }}"
                            html: cellHTML
                        })

                    divCell.appendTo(nodeRowColumn);
                    nodeRowColumn.appendTo(tbody_node_row);
                })
                
                // create node series total column
                var nodeRowColumn = $("<td/>").text("");
                var cellHTML = "";
                var divCell = $("<div/>",{html: cellHTML});
                divCell.appendTo(nodeRowColumn);
                nodeRowColumn.appendTo(tbody_node_row);

                // create node current value column
                var nodeRowColumn = $("<td/>").text("");
                var cellHTML = "";
                var divCell = $("<div/>",{html: cellHTML});
                divCell.appendTo(nodeRowColumn);
                nodeRowColumn.appendTo(tbody_node_row);

                // create node earning or deduction column
                var nodeRowColumn = $("<td/>").text("");
                var cellHTML = "";
                var divCell = $("<div/>",{html: cellHTML});
                divCell.appendTo(nodeRowColumn);
                nodeRowColumn.appendTo(tbody_node_row);

                tbody_node_row.appendTo(tbody_container);
            })
        });
    }

    function CalculateForexSeries(data){
        var dataTable = [];

        var seriesPathArray = data["seriesPathArray"];
        var topancestorArray = data["topancestor"].data;
        var exchangeArray = data["exchangerate"];
        
        // find date period
        var startDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveFrom);
        var endDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveTo);
        var periodMonthsDifference = moment(endDate).diff(moment(startDate), 'months', false)
        periodMonthsDifference = Math.trunc( periodMonthsDifference ) +1;
        
        var equivalentCurrency = $scope.inquirySeriesModel.InquiryCriteria.EquivalentCurrency;
        
        // loop top ancestor
        topancestorArray.map(function(ancestorRow) {
            var ancestorID = ancestorRow.ExchangeTranID;
            var isArchive = ancestorRow.Status == "Archive";

            var tbodyRow = CreateSeriesTbodyRowObj();

            // calculate series_path, foreign currency
            var series_path = "";
            var foreignCurrency = FindForeignCurrency(equivalentCurrency, seriesPathArray[ancestorID].data[0]);
            
            seriesPathArray[ancestorID].data.map(function(ancestorPathArray) {
                series_path += ancestorPathArray.ExchangeTranID+"/";
            });

            tbodyRow.rowObj = ancestorRow;
            tbodyRow.rowObj.foreignCurrency = foreignCurrency;
            tbodyRow.rowObj.series_path = series_path;
            tbodyRow.rowObj.isArchive = isArchive;

            // calculate series earning and deduction
            var seriesSubTotalObj = CalculateSeriesEarningAndDeduction(equivalentCurrency, seriesPathArray[ancestorID].data);
            tbodyRow.rowObj.seriesSubTotalObj = seriesSubTotalObj;
            
            // create reminder columns
            for(var startAt = 0; startAt <= periodMonthsDifference; startAt++){
                var seriesMonthsDifference = seriesSubTotalObj.lastTradeDatetime.diff(moment(startDate), 'months', false)
                if(seriesMonthsDifference == startAt || periodMonthsDifference == startAt){
                    tbodyRow.rowData.push(seriesSubTotalObj.equivalentLocalCurrencyBalance);
                }else{
                    tbodyRow.rowData.push(0);
                }
            }
            
            // create Current value column
            var currentValue = CalculateCurrentValue(data, ancestorRow);

            // create Earning/Deduction column
            var eOrDValue = CalculateEarningDeduction(data, ancestorRow, currentValue);

            tbodyRow.rowObj.currentValue = currentValue;
            tbodyRow.rowObj.eOrDValue = eOrDValue;
            // tbodyRow.rowData.push(currentValue);
            // tbodyRow.rowData.push(eOrDValue);
            
            $scope.totalCurrentValue += currentValue;
            $scope.totalEarningDeductionValue += eOrDValue;
            
            // loop series's node transactions
            var seriesNodeTransactions = seriesPathArray[ancestorID].data;
            seriesNodeTransactions.map((nodeTransaction, index, array)=>{
                // create series transactions tbody row
                var tbody_node_row = $("<tr/>",{
                    "class": "series_ancestor_"+ancestorID+"_node series_node_row",
                    "data-series-node-row": true,
                    "data-is-show-series-node-row": false,
                    "data-belong-to-ancestor": ancestorID
                });
                
                var seriesNodeRow = CreateSeriesTbodyRowObj();

                // create first column
                var seriesNodePathCell;
                var foreignCurrency = FindForeignCurrency(equivalentCurrency, seriesPathArray[ancestorID].data[0]);
                var nodeExchangeDate = moment(nodeTransaction.ExchangeDate, "YYYY-MM-DD");
                var dateContent = "{{ "+nodeExchangeDate+" | date:'yyyy-MM-dd' }}";
                seriesNodePathCell = $("<td/>",{
                    html:"<div>&emsp;"+dateContent+" #"+nodeTransaction.ExchangeTranID+"/</div>"
                })
                // add first column to series node
                seriesNodePathCell
                .appendTo(tbody_node_row);

                seriesNodeRow.rowObj = nodeTransaction;

                // create reminder columns
                for(var startAt = 0; startAt <= periodMonthsDifference; startAt++){
                    var nodeRowColumn = $("<td/>").text("");
                    var divCell = $("<div/>");

                    var cellHTML = "";
                        var nodeExchangeDate = moment(nodeTransaction.ExchangeDate, "YYYY-MM-DD");
                        var nodeMonthsDifference = nodeExchangeDate.diff(moment(startDate), 'months', false)

                        var nodeAmount = 0.0;
                        // shift to 1 right column, because the first column prepared on above
                        if(nodeMonthsDifference == startAt){

                            if(nodeTransaction.OutCurrencyID == equivalentCurrency){
                                nodeAmount = nodeTransaction.OutAmount * -1;
                            }else if(nodeTransaction.InCurrencyID == equivalentCurrency){
                                nodeAmount = nodeTransaction.InAmount;
                            }
                        }

                        seriesNodeRow.rowData.push(nodeAmount);
                }
                tbodyRow.childNodeRowData.push(seriesNodeRow);
            })

            dataTable.push(tbodyRow);
        });

        return dataTable;
    }

    function CalculateCurrentValue(data, ancestorRow){
        var seriesPathArray = data["seriesPathArray"];
        var exchangeArray = data["exchangerate"];
        var isArchive = ancestorRow.Status == "Archive";
        var ancestorID = ancestorRow.ExchangeTranID;
        
        var equivalentCurrency = $scope.inquirySeriesModel.InquiryCriteria.EquivalentCurrency;
        var seriesSubTotalObj = CalculateSeriesEarningAndDeduction(equivalentCurrency, seriesPathArray[ancestorID].data);

        var foreignCurrency = FindForeignCurrency(equivalentCurrency, seriesPathArray[ancestorID].data[0]);

        var curvalue = 0;

        // if the series path status is not archive
        if(!isArchive){
            exchangeArray.map((forexTran, index, array)=>{
                if(forexTran.InCurrencyID == equivalentCurrency &&
                    forexTran.OutCurrencyID == foreignCurrency
                ){
                    curvalue = seriesSubTotalObj.foreignCurrencyBalance * parseFloat(forexTran.Rate);
                }
            })
        }

        return curvalue;
    }

    function CalculateEarningDeduction(data, ancestorRow, curvalue){
        var seriesPathArray = data["seriesPathArray"];
        var isArchive = ancestorRow.Status == "Archive";
        var ancestorID = ancestorRow.ExchangeTranID;
        
        var equivalentCurrency = $scope.inquirySeriesModel.InquiryCriteria.EquivalentCurrency;
        var seriesSubTotalObj = CalculateSeriesEarningAndDeduction(equivalentCurrency, seriesPathArray[ancestorID].data);

        var eOrDValue = 0;
        if(isArchive){
            eOrDValue = seriesSubTotalObj.equivalentLocalCurrencyBalance;
        }else{
            eOrDValue = seriesSubTotalObj.equivalentLocalCurrencyBalance;
            eOrDValue += curvalue;
        }

        return eOrDValue;
    }

    function DrawTotalRow(data, table_container){
        var thead_container = table_container.find("thead");
        var tbody_container = table_container.find("tbody");

        var seriesPathArray = data["seriesPathArray"];
        var topancestorArray = data["topancestor"].data;
        
        // find date period
        var startDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveFrom);
        var endDate = new Date($scope.inquirySeriesModel.InquiryCriteria.EffectiveTo);
        var periodMonthsDifference = moment(endDate).diff(moment(startDate), 'months', false)
        periodMonthsDifference = Math.trunc( periodMonthsDifference ) +1;
        
        var equivalentCurrency = $scope.inquirySeriesModel.InquiryCriteria.EquivalentCurrency;

        // create first row
        var tbody_month_total_row = $("<tr/>",{
        });

        // create first column
        var monthTotalCell;
        
        monthTotalCell = $("<td/>",{
            html:"<div>Total</div>"
        })
        // add first column to series subtotal row
        monthTotalCell
        .appendTo(tbody_month_total_row);
        
        var allMonthsTotal = 0;
        
        // create reminder columns
        for(var startAt = 0; startAt < periodMonthsDifference; startAt++){

            var bottomRowColumn = $("<td/>").text("");
            var divCell = $("<div/>");

            var monthTotal = 0;
            
            // loop top ancestor
            topancestorArray.map(function(ancestorRow) {
                var ancestorID = ancestorRow.ExchangeTranID;
        
                // calculate series earning and deduction
                var seriesSubTotalObj = CalculateSeriesEarningAndDeduction(equivalentCurrency, seriesPathArray[ancestorID].data);

                var seriesMonthsDifference = seriesSubTotalObj.lastTradeDatetime.diff(moment(startDate), 'months', false)
                // console.dir("seriesMonthsDifference:"+seriesMonthsDifference);

                if(seriesMonthsDifference == startAt){
                    monthTotal += seriesSubTotalObj.equivalentLocalCurrencyBalance;
                    allMonthsTotal += seriesSubTotalObj.equivalentLocalCurrencyBalance;
                }
            });

            var cellHTML = "";
            if(monthTotal>0){
                cellHTML = "<span class='positive_amount'>"+
                "<i class='fas fa-caret-up'></i> "+
                "{{ "+monthTotal +" | currency :'$': 2 }}</span>"
            }else if(monthTotal<0){
                cellHTML = "<span class='negative_amount'>"+
                "<i class='fas fa-caret-down'></i> "+
                "{{ "+monthTotal +" | currency :'$': 2 }}</span>"
            }else if(monthTotal==0){
                cellHTML = "<span class=''>"+
                "{{ "+monthTotal +" | currency :'$': 2 }}</span>"
            }

            divCell = $("<div/>",{
                class: "series_amount",
                // html: "{{ "+seriesSubTotalObj.equivalentLocalCurrencyBalance+" | currency :'$': 2 }}"
                html: cellHTML
            })

            divCell.appendTo(bottomRowColumn);
            bottomRowColumn.appendTo(tbody_month_total_row);
        }
        
        // Series total column
        var bottomRowColumn = $("<td/>").text("");
        var divCell = $("<div/>");

        var cellHTML = "";
        if(allMonthsTotal>0){
            cellHTML = "<span class='positive_amount'>"+
            "<i class='fas fa-caret-up'></i> "+
            "{{ "+allMonthsTotal +" | currency :'$': 2 }}</span>"
        }else if(allMonthsTotal<0){
            cellHTML = "<span class='negative_amount'>"+
            "<i class='fas fa-caret-down'></i> "+
            "{{ "+allMonthsTotal +" | currency :'$': 2 }}</span>"
        }else if(allMonthsTotal==0){
            cellHTML = "<span class=''>"+
            "{{ "+allMonthsTotal +" | currency :'$': 2 }}</span>"
        }

        divCell = $("<div/>",{
            class: "series_amount",
            html: cellHTML
        })

        divCell.appendTo(bottomRowColumn);
        bottomRowColumn.appendTo(tbody_month_total_row);

        // Currenct Value total column
        DrawColumnTotalCurrentValue(tbody_month_total_row);

        // Earning or Deduction total column
        DrawColumnTotalEarningOrDeductionValue(tbody_month_total_row);
        
        tbody_month_total_row.appendTo(tbody_container);
    }

    function DrawColumnTotalCurrentValue(tbody_month_total_row){
        var bottomRowColumn = $("<td/>").text("");
        var divCell = $("<div/>");

        var totalCurrentValue = $scope.totalCurrentValue;

        var cellHTML = "";
        cellHTML = "<span class=''>"+
        "{{ "+totalCurrentValue +" | currency :'$': 2 }}</span>"

        divCell = $("<div/>",{
            class: "series_amount",
            html: cellHTML
        })

        divCell.appendTo(bottomRowColumn);
        bottomRowColumn.appendTo(tbody_month_total_row);
    }

    function DrawColumnTotalEarningOrDeductionValue(tbody_month_total_row){
        var bottomRowColumn = $("<td/>").text("");
        var divCell = $("<div/>");

        var totalEarningDeductionValue = $scope.totalEarningDeductionValue;

        var cellHTML = "";
        if(totalEarningDeductionValue>0){
            cellHTML = "<span class='positive_amount'>"+
            "<i class='fas fa-caret-up'></i> "+
            "{{ "+totalEarningDeductionValue +" | currency :'$': 2 }}</span>"
        }else if(totalEarningDeductionValue<0){
            cellHTML = "<span class='negative_amount'>"+
            "<i class='fas fa-caret-down'></i> "+
            "{{ "+totalEarningDeductionValue +" | currency :'$': 2 }}</span>"
        }else if(totalEarningDeductionValue==0){
            cellHTML = "<span class=''>"+
            "{{ "+totalEarningDeductionValue +" | currency :'$': 2 }}</span>"
        }

        divCell = $("<div/>",{
            class: "series_amount",
            html: cellHTML
        })

        divCell.appendTo(bottomRowColumn);
        bottomRowColumn.appendTo(tbody_month_total_row);
    }

    function FindForeignCurrency(equivalentCurrency, forexSeriesRow){
        var currency = "";

        if(forexSeriesRow.InCurrencyID == equivalentCurrency)
            currency = forexSeriesRow.OutCurrencyID;
        else if(forexSeriesRow.OutCurrencyID == equivalentCurrency)
            currency = forexSeriesRow.InCurrencyID;

        return currency;
    }
    function CalculateSeriesEarningAndDeduction(equivalentCurrency, forexSeriesList){
        var seriesSummary = {
            equivalentLocalCurrencyBalance: 0.0,
            foreignCurrencyBalance: 0.0,
            lastTradeDatetime: {}
        }

        forexSeriesList.map(function(forexRow){
            if(forexRow.OutCurrencyID == equivalentCurrency){
                seriesSummary.equivalentLocalCurrencyBalance -= parseFloat(forexRow.OutAmount);
                seriesSummary.foreignCurrencyBalance += parseFloat(forexRow.InAmount);
            }else if(forexRow.InCurrencyID == equivalentCurrency){
                seriesSummary.equivalentLocalCurrencyBalance += parseFloat(forexRow.InAmount);
                seriesSummary.foreignCurrencyBalance -= parseFloat(forexRow.OutAmount);
            }
            seriesSummary.lastTradeDatetime = moment(forexRow.ExchangeDate, "YYYY-MM-DD");
        })

        return seriesSummary;
    }

    function ClearForexSeriesTable(table_container){
        // clear table head
        table_container.find("thead").html("");

        // clear table body
        table_container.find("tbody").html("");
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