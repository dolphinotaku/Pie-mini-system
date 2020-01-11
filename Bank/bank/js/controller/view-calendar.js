"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });
app.controller('viewCalendarController', ['$scope', '$timeout', function ($scope, $timeout, $rootScope) {
	$scope.directiveScopeDict = {};
    $scope.directiveCtrlDict = {};
    
    $scope.calendarInquiry = {};
    $scope.calendarInquiry.Record = {};

    $scope.goToStart = null;
    $scope.goToEnd = null;
    $scope.calendarStart = {};
    $scope.calendarEnd = {};

    $scope.dialog = {
        depositObj: {}
    }

    $scope.exportCalendarOption = {
        availableOptions: [
            {id: '1', value: 'ExportAll', name: 'All Records'},
            // {id: '2', value: 'ExportCurrentMonth', name: 'Current Month'},
            {id: '3', value: 'ExportTodayAndFuture', name: 'Today and Coming Days'}
        ],
        selectedOption: {id: '1', value: 'ExportAll', name: 'All Records'} //This sets the default value of the select in the ui
    }

    $scope.CreateFullCalendar = function(){
        $scope.fullcalendarObj = $('#calendar').fullCalendar({
            header: {
              left: 'month,agendaWeek,listWeek', // month,basicWeek,basicDay,listWeek,agendaWeek,agendaDay
              center: 'title',
              right: 'today prev,next'
            },
            defaultView: 'month',
            buttonText:{
                today: 'Today',
            //     next: 'Next month',
            //     prev: 'Previsour month',
            },
            // defaultDate: '2018-03-12', default is today
            navLinks: false, // can click day/week names to navigate views
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            editable: false,
            droppable: false,
            // height: 'parent',
            events: [
                {
                  title: 'All Day Event',
                  start: '2018-03-01'
                },
                {
                  title: 'Long Event',
                  start: '2018-03-07',
                  end: '2018-03-10'
                },
                {
                  id: 999,
                  title: 'Repeating Event',
                  start: '2018-03-09T16:00:00'
                },
                {
                  id: 999,
                  title: 'Repeating Event',
                  start: '2018-03-16T16:00:00'
                },
                {
                  title: 'Conference',
                  start: '2018-03-11',
                  end: '2018-03-13'
                },
                {
                  title: 'Meeting',
                  start: '2018-03-12T10:30:00',
                  end: '2018-03-12T12:30:00'
                },
                {
                  title: 'Lunch',
                  start: '2018-03-12T12:00:00'
                },
                {
                  title: 'Meeting',
                  start: '2018-03-12T14:30:00'
                },
                {
                  title: 'Happy Hour',
                  start: '2018-03-12T17:30:00'
                },
                {
                  title: 'Dinner',
                  start: '2018-03-12T20:00:00'
                },
                {
                  title: 'Birthday Party',
                  start: '2018-03-13T07:00:00'
                },
                {
                  title: 'Click for Google',
                  url: 'http://google.com/',
                  start: '2018-03-28'
                }
            ],
            eventClick: function(calEvent, jsEvent, view){
                var depositTransactionObj = calEvent.depositTransactionObj;
                $scope.DisplayDepositDetailsOnModal(depositTransactionObj);
            },
            eventRender: function(event, element) {
                element.css("cursor", "pointer");
                // element.css("font-size","12px");
                element.css("font-size","1.1em");
                element.css("font-weight","400");
            },
            viewRender: function(view, element){
                $scope.viewRender(view, element);
            },
            windowResize: function(view){ $scope.calendarResize(view);}
        });
    }

    $scope.DisplayDepositDetailsOnModal = function(depositTransactionObj){
        $scope.$apply(function () {
            // es6 clone object
            //$scope.dialog.depositObj = {...depositTransactionObj};
            $scope.dialog.depositObj = depositTransactionObj;
        });
        $('#depositModal').modal('show');

        // event trigger when modal displaied
        $('#depositModal').on('shown.bs.modal', function () {
        })
    }

    $scope.viewRender = function(view){
        var changedStartYear = view.start.year();
        var changedEndYear = view.end.year();

        var calendarYearStart = $scope.calendarStart.getFullYear();
        var calendarYearEnd = $scope.calendarEnd.getFullYear();
        
        $scope.goToStart = view.start.toDate();
        $scope.goToEnd = view.end.toDate();

        if(changedStartYear < calendarYearStart){
            $scope.GetDataByYearRange(changedStartYear, calendarYearEnd);
        }else if(changedEndYear > calendarYearEnd){
            $scope.GetDataByYearRange(calendarYearStart, changedEndYear);
        }else{
            $scope.calendarStart = $scope.goToStart;
            $scope.calendarEnd = $scope.goToEnd;
        }
    }

    $scope.calendarResize = function(view){
        var width = $scope.fullcalendarObj.width();
        var currentView = $scope.fullcalendarObj.fullCalendar('getView');
        var viewName = currentView.name;
        if(width < 600){
            if(viewName == "month"){
                $scope.fullcalendarObj.fullCalendar('changeView','listWeek');
            }
        }else if (width >= 600){
            if(viewName != "month"){
                $scope.fullcalendarObj.fullCalendar('changeView','month');
            }
        }
    }

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
        
        if(prgmID == "bi44timedepositforcalendarview")
            $scope.SetDefaultValueForCalendar(scope, iElement, iAttrs, controller);

        if(prgmID == "bu04timedepositinics")
            $scope.SetDefaultValueForExportIcs(scope, iElement, iAttrs, controller);

    }

    $scope.SetDefaultValueForCalendar = function(scope, iElement, iAttrs, controller){
        var newRecord = controller.ngModel;
        var today = new Date();
        $scope.goToStart = new Date(today.getFullYear(), 0, 1);
        $scope.goToEnd = new Date(today.getFullYear(), 11, 31);
        
        if(today.month == 0){
            $scope.goToStart = new Date(today.getFullYear() - 1, 0, 1);
        }else if(today.month == 11){
            $scope.goToEnd = new Date(today.getFullYear() + 1, 11, 31);
        }

        $scope.calendarStart = $scope.goToStart;
        $scope.calendarEnd = $scope.goToEnd;

        // $('#parent').height($(window).height() - $('nav').height() - $(".nav.nav-tabs").height())

        $scope.CreateFullCalendar();
        // $scope.GetDataByPeriod($scope.calendarStart, scope.calendarEnd)

        // 20191202, keithpoon, below line will trigger twice call in Dec 2019
        //$scope.GetDataByYear($scope.calendarStart.getFullYear());
    }

    $scope.SetDefaultValueForExportIcs = function(scope, iElement, iAttrs, controller){
        controller.ngModel.ExportType = $scope.exportCalendarOption.selectedOption;
    }
    
    $scope.GetDataByYear = function(year){
        $scope.GetDataByYearRange(year, year);
    }
    $scope.GetDataByYearRange = function(startYear, endYear){
        var start = new Date(startYear, 0, 1);
        var end = new Date(endYear, 11, 31);
        
        $scope.GetDataByPeriod(start, end);
    }
    $scope.GetDataByPeriod = function(start, end){
        var hashID = "inquiry_bi44timedepositForCalendarView";
        
        $scope.goToStart = start;
        $scope.goToEnd = end;

        $scope.calendarInquiry.Record.StartDate = start;
        $scope.calendarInquiry.Record.EndDate = end;
        console.trace();
        $scope.directiveScopeDict[hashID].SubmitData();
    }

	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		switch (fieldName) {
			case "HolidayDate":
                // newObj.AlphabeticCode = newObj.CalendarYear.toUpperCase(); 
                // console.dir(newObj.HolidayDate)
				break;
			default:

		}

	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var isValid = true;
		var record = controller.ngModel;
		var msg = [];

		return isValid;
    }
    

	// $scope.CustomPointedToRecord = function(sRecord, rowScope, scope, iElement, controller){
	// 	$scope.entryAmendForm = sRecord;

	// 	var tagName = iElement[0].tagName.toLowerCase();
	// 	var prgmID = scope.programId.toLowerCase();
	// 	var scopeID = scope.$id;
    //     var hashID = tagName + '_' + prgmID;

    // }
    
	$scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
		$scope.entryAmendForm = sRecord;

		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
        
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        var hashID = tagName + '_' + prgmID;
		
		if(hashID == "inquiry_bi44timedepositforcalendarview"){
            if(data_or_JqXHR.status == "success"){
                var events = $scope.GetEventsList(data_or_JqXHR.data);
                console.trace();
                console.dir(events);
				// https://stackoverflow.com/questions/15139780/jquerys-full-calendar-removing-all-events-for-a-single-day
                $scope.fullcalendarObj.fullCalendar('removeEvents', function(){return true;});
                //$scope.fullcalendarObj.fullCalendar('removeEventSources');
                $scope.fullcalendarObj.fullCalendar('renderEvents', events, true);
                $scope.calendarStart = $scope.goToStart;
                $scope.calendarEnd = $scope.goToEnd;
            }
        }
        if(hashID == "process_bu04timedepositinics"){
            if(data_or_JqXHR.status == "success"){
                GenerateIcs(data_or_JqXHR.data);
            }
        }

    }

    function GenerateIcs(data){
        var cal = ics();
        for(var index in data){
            var record = data[index];
            
            var pNi = parseFloat(record.Principal)+parseFloat(record.AdjustedInterest);
            
            var eventName = 
                " ("+record.BankCode+")\"" +
                record.PrincipalCurrency +"\" "+ 
                record.Principal +
                " + " + 
                record.AdjustedInterest;
            var desc = "TimeDepositTranID: "+record.TimeDepositTranID+"\\n"+
                "Bank: "+record.BankCode+"\\n"+
                "\\n"+
                "Currency: "+record.PrincipalCurrency+"\\n"+
                "Principal: "+record.Principal+", Interest: "+record.AdjustedInterest+"\\n"+
                "Principal + Interest = "+pNi+"\\n"+
                "\\n"+
                "Effective Date: "+record.EffectiveDate+"\\n"+
                "Maturity Date: "+record.AdjustedMaturityDate+"\\n";
            var beginDate = record.AdjustedMaturityDate.replace("-", "/");
            cal.addEvent(eventName, desc, '', beginDate, beginDate);
        }
        cal.download('timeDeposit');
    }
    
    $scope.GetEventsList = function(data){
        var events = [];
        data.forEach(row => {
            var eventTitle = 
            // title format 1
            " ("+row.BankCode+")\"" +
            row.PrincipalCurrency +"\" "+ 
            row.Principal +
            " + " + 
            row.AdjustedInterest;
            // title format 2
            eventTitle = 
            row.PrincipalCurrency +" "+ 
            row.Principal +
            " + " + 
            row.AdjustedInterest;
            
            var todayDate = new Date();
            todayDate.setHours(0,0,0);
            var adjustedMaturityDate = new Date(row.AdjustedMaturityDate);

            var bgColor = "rgb(3, 155, 229)";
            var borderColor = "rgb(3, 155, 229)";
            var textColor = "#ffffff";

            if(todayDate > adjustedMaturityDate){
                bgColor = "#b3e1f7";
                // borderColor = "#81cdf2";
                borderColor = "#b3e1f7";
                textColor = "rgba(32,33,36,0.38)";
            }

            // event cannot use url:"#" to render the a href tag, because routeProvider will route to home page when click on it, use eventRender
            var event = {
                id: row.TimeDepositTranID,
                title: eventTitle,
                start: $.fullCalendar.moment(row.AdjustedMaturityDate),
                depositTransactionObj: row,
                backgroundColor: bgColor,
                borderColor: borderColor,
                textColor: textColor
            };
            events.push(event);
        });
        return events;
    }

}]);

