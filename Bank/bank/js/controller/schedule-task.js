"use strict";
// app.run(function ($rootScope, $log, Security, config) {
// 	console.log("app.run at local page");
// 	//Security.GoToMenuIfSessionExists();
// 	//Security.RequiresAuthorization();
// 	config.uiTheme = "B";
// });

app.controller('scheduleTaskController', ['$scope', '$rootScope', '$timeout', 'MessageService', function ($scope, $rootScope, $timeout, MessageService) {
	$scope.directiveScopeDict = {};
	$scope.directiveCtrlDict = {};
    
    $scope.inquiryModel = {};
    $scope.inquiryModel.Record = {};
	
	$scope.inquiryNextDayModel = {};
	$scope.inquiryNextDayModel.Record = {};
	
	$scope.entryForm = {};
	
	$scope.processModel = {};
	$scope.processModel.ScheduleTask = {};
	$scope.processModel.ScheduleProgramList = [];
	
	$scope.timeoutId = null;
	
	const ordinalOfDayLabel = "Monthly on day ";
	const ordinalOfWeekdayLabel = "Monthly on day ";
	
    $scope.entryFormMode = "";
    $scope.processFormMode = "";

    $scope.freqType = {
        availableOptions: {
			Once:{label: 'Do not repeat', value: 'Once'},
            Daily:{label: 'Daily', value: 'Daily'},
            Weekly:{label: 'Weekly', value: 'Weekly'},
            Monthly:{label: 'Monthly', value: 'Monthly'},
            //MonthlyOnRelative:{label: 'Monthly on relative', value: 'Monthly on relative'},
            //Yearly:{label: 'Yearly', value: 'Yearly'}
        },
        selectedOptions: {label: 'Once', value: 'Once'} // deprecated
    };
	
	$scope.freqInterval = {
		// label for display in html, value for indicate in angularjs binding
		weeklyAvailableOptions:{
			Sun:{label: 'Sun', value: 'Sun', weekday: 0},
			Mon:{label: 'Mon', value: 'Mon', weekday: 1},
			Tue:{label: 'Tue', value: 'Tue', weekday: 2},
			Wed:{label: 'Wed', value: 'Wed', weekday: 3},
			Thu:{label: 'Thu', value: 'Thu', weekday: 4},
			Fri:{label: 'Fri', value: 'Fri', weekday: 5},
			Sat:{label: 'Sat', value: 'Sat', weekday: 6}
		},
		monthlyAvailableOptions:{
			MonthlyOnOrdinalOfDay:{label: 'Merge in below ', value: 'Ordinal of nth day'},
			MonthlyOnOrdinalOfWeekday:{label: 'Merge in below ', value: 'Ordinal of weekday'}
		},
		weeklySelectedOptions:{},
		monthlySelectedOptions:""
	}
	
	$scope.ordinalOfDay = '';
	$scope.ordinalOfWeekday = "first/second/third/fourth weekday";
	
	$scope.endConditionType = {
        availableOptions: {
            Never: {label: 'Never', value: 'Never'},
            On: {label: 'On', value: 'On'},
            After: {label: 'After', value: 'After Occurred'}
        },
        selectedOptions: {}
	}
	
	$scope.scheduleTaskProgram = {
    };
    $scope.selectedTaskProgram = {};
    
    $scope.nextDateList = [];

    $scope.CountTaskPrograms = function(taskProgramsObj){
        return Object.keys(taskProgramsObj).length;
    }
	
	$scope.InitializeWeeklySelectedOptions = function(boolFlag){
		angular.forEach($scope.freqInterval.weeklyAvailableOptions, function(optionObj, index) {
			$scope.freqInterval.weeklySelectedOptions[optionObj.value] = boolFlag;
		})
	}
	
	$scope.ResetScheduleTaskProgram = function(){
		$scope.scheduleTaskProgram = {
            ScheduleTask: {},
            TaskPrograms: {},
			List: []
		};
        $scope.programIdOnShow = ""; // mt99xxxx - Properties
        $scope.selectedTaskProgram = {};
    }
	
	$scope.SwitchToCreate = function(){
        var entryFormHashID = "entry_ce01scheduletask";

        $scope.entryFormMode = "create";
        $scope.directiveScopeDict[entryFormHashID].SetDefaultValue($scope.directiveScopeDict[entryFormHashID], [{tagName:"entry"}],"",$scope.directiveCtrlDict[entryFormHashID]);
        // $scope.ProcessForCreateRecord();
		$scope.ResetScheduleTaskProgram();
	}
	$scope.SwitchToAmend = function(){
        $scope.entryFormMode = "amend";
        // $scope.ProcessForUpdateRecord();
		$scope.ResetScheduleTaskProgram();
	}
    $scope.ProcessForCreateRecord = function(){
        $scope.processFormMode = "create";
    }
    $scope.ProcessForUpdateRecord = function(){
        $scope.processFormMode = "amend";
    }
    $scope.ProcessForDeleteRecord = function(){
        $scope.processFormMode = "delete";
    }
    
    $scope.CreateScheduleTask = function(){
        $scope.ProcessForCreateRecord();
        $scope.SubmitProcessScheduleTaskCUD();
    }
    $scope.UpdateScheduleTask = function(){
        $scope.ProcessForUpdateRecord();
        $scope.SubmitProcessScheduleTaskCUD();
    }
    $scope.DeleteScheduleTask = function(){
        $scope.ProcessForDeleteRecord();
        $scope.SubmitProcessScheduleTaskCUD();
    }
    
    $scope.SubmitProcessScheduleTaskCUD = function(){
        var hashID = "process_bp32scheduletaskprogram";

        $scope.directiveScopeDict[hashID].SubmitData();
    }
    
    /*
    $scope.CreateScheduleTask = function(){
        var hashID = "entry_ce01scheduletask"
        $scope.SwitchToCreate();
        $scope.directiveScopeDict[hashID].ResetForm();
    }
    */
    
    $scope.ViewScheduleTaskRecord = function(taskRow){
        $scope.SwitchToAmend();
        $scope.entryForm.ScheduleID = taskRow.ScheduleID;
        
        var hashID = "entry_ce01scheduletask"
        $scope.directiveScopeDict[hashID].FindData();
    }
    
	$scope.FreqIntervalWeeklyChanged = function(){
		// get selected weekly value from freqInterval to ngModel
		var selectedWeekly = [];
		angular.forEach($scope.freqInterval.weeklySelectedOptions, function(weekdayOption, weekday){
			if(weekdayOption){
				selectedWeekly.push(weekday)
			}
		})
		$scope.entryForm.FreqInterval = selectedWeekly.join(",");
    }
	$scope.FreqIntervalMonthlyChanged = function(){
		// get selected monthly value from freqInterval to ngModel
		$scope.entryForm.FreqInterval = $scope.freqInterval.monthlySelectedOptions
    }
	$scope.EndConditionTypeChanged = function(){
		$scope.entryForm.EndConditionType = $scope.endConditionType.selectedOptions;
	}
    $scope.ActivityStartDateChanged = function(newDate, recordObj){
        // calculate weekly repeat option
        var activityStartDate = recordObj.ActivityStartDate;
		var weekdayInNum = activityStartDate.getDay();
		/*
		angular.forEach($scope.freqInterval.weeklySelectedOptions, function(isChecked, weekdayInStr){
			$scope.freqInterval.weeklySelectedOptions[weekdayInStr] = false;
			if($scope.freqInterval.weeklyAvailableOptions[weekdayInStr].weekday == weekdayInNum){
				$scope.freqInterval.weeklySelectedOptions[weekdayInStr] = true;
			}
		});
		*/
		
		// calculate monthly repeat option
        // 2019 Feb 5, ordinalOfDay is 5
		$scope.ordinalOfDay = activityStartDate.getDate();
		$scope.freqInterval.monthlyAvailableOptions.MonthlyOnOrdinalOfDay.label = ordinalOfDayLabel + $scope.ordinalOfDay;
        // 2019 Feb 5, ordinalOfWeekday is second tuesday
        // 20190205, keithpoon this calculation not in expected, it should same as google calendar
		var weekOfMonth = activityStartDate.getWeekOfMonth();
        var ordinalOfWeekday = "";
        switch(weekOfMonth){
            case 1:
            ordinalOfWeekday = "first";
            break;
            case 2:
            ordinalOfWeekday = "second";
            break;
            case 3:
            ordinalOfWeekday = "third";
            break;
            case 4:
            ordinalOfWeekday = "fourth";
            break;
            case 5:
            ordinalOfWeekday = "fifth";
            break;
            case 6:
            ordinalOfWeekday = "last";
            break;
        }
        ordinalOfWeekday += " "+activityStartDate.toLocaleString('en-us', {  weekday: 'long' });
        $scope.ordinalOfWeekday = ordinalOfWeekday;
        
		$scope.freqInterval.monthlyAvailableOptions.MonthlyOnOrdinalOfWeekday.label = ordinalOfWeekdayLabel + $scope.ordinalOfWeekday;
    }
	$scope.CalculateNextRunDateForScheduledTask = function(){
		var newObject = jQuery.extend({}, $scope.entryForm);
		$scope.inquiryNextDayModel.Record = newObject;
		
		$scope.inquiryNextDayModel.InquiryCriteria.RepeatOnMonthly = "";
		$scope.inquiryNextDayModel.InquiryCriteria.RepeatOnWeekly = "";
		//console.dir("CalculateNextRunDateForScheduledTask");
		switch(newObject.FreqType){
			case "Weekly":
			var weeklySelectedOptions = jQuery.extend({}, newObject.FreqInterval);
			$scope.inquiryNextDayModel.InquiryCriteria.RepeatOnWeekly = newObject.FreqInterval;
			break;
			case "Monthly":
			$scope.inquiryNextDayModel.InquiryCriteria.RepeatOnMonthly = $scope.freqInterval.monthlySelectedOptions;
			break;
		}
		
		var hashID = "inquiry_ci02scheduletasknexttime";
		
		$timeout.cancel($scope.timeoutId);
		$scope.timeoutId = $timeout(function(){
			//console.dir("submit CalculateNextRunDate request");
			$scope.directiveScopeDict[hashID].SubmitData();
		}, 1000);
	}
	
	$scope.GetWeekCountStartOnSun = function(year, month_number) {
		// month_number is in the range 1..12
        
		var firstOfMonth = new Date(year, month_number-1, 1);
		var lastOfMonth = new Date(year, month_number, 0);

		var used = firstOfMonth.getDay() + lastOfMonth.getDate();

		return Math.ceil( used / 7);
	}
	$scope.GetWeekCountStartOnMon = function(year, month_number) {

		// month_number is in the range 1..12

		var firstOfMonth = new Date(year, month_number-1, 1);
		var lastOfMonth = new Date(year, month_number, 0);

		var used = firstOfMonth.getDay() + 6 + lastOfMonth.getDate();

		return Math.ceil( used / 7);
	}

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
			$scope.InitializeWeeklySelectedOptions(true);
			$scope.SwitchToAmend();
		})
	}

	$scope.SetDefaultValue = function(scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;

        var newRecord = controller.ngModel;

        // $scope.TaskPrograms
        
        if(prgmID == "ci01scheduletask"){
            // command to select all
            // select disabled
            // newRecord.Record.Name = "";
            // newRecord.Record.Status = "Disabled";
            scope.SubmitData();
        }
        if(prgmID == "ce01scheduletask"){
            newRecord.Status = 'Disabled';
            newRecord.ActivityStartDate = new Date();
            newRecord.FreqRepeatEvery = 1;
			newRecord.FreqType = $scope.freqType.availableOptions.Once.value;
			$scope.endConditionType.selectedOptions = $scope.endConditionType.availableOptions.Never.value;
			newRecord.EndConditionType = $scope.endConditionType.availableOptions.Never.value;
			$scope.freqInterval.monthlySelectedOptions = $scope.freqInterval.monthlyAvailableOptions.MonthlyOnOrdinalOfDay.value;
        }

        if(prgmID == "bp32scheduletaskprogram"){
            $scope.ResetScheduleTaskProgram();
        }
    }

    $scope.SetEntryScheduleTask = function(){

    }
    
	$scope.StatusChange = function(fieldName, newValue, newObj, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
		
		switch (fieldName) {
            case "Name":
                if(newObj.Name)
                    newObj.Name = newObj.Name.toUpperCase(); 
				break;
            case "ActivityStartDate":
                if(newObj.ActivityStartDate){
                }
                break;
            case "FreqType":
                if(newObj.FreqType){
					if(newObj.FreqType == $scope.freqType.availableOptions.Monthly.value){
						$scope.FreqIntervalMonthlyChanged();
					}
					else if(newObj.FreqType == $scope.freqType.availableOptions.Weekly.value){
						$scope.FreqIntervalWeeklyChanged();
					}
                }
                break;
            case "EndConditionType":
                if(newObj.EndConditionType == $scope.endConditionType.availableOptions.On.value){
					var endOnSpecifyDate = new Date(newObj.ActivityStartDate.getTime());
					endOnSpecifyDate.setMonth(endOnSpecifyDate.getMonth()+3);
					newObj.EndOnSpecifyDate = endOnSpecifyDate;
                }
                break;
			default:
            break;
		}
		
		// if the following changed, re-calculate the NextExecuteDate
		switch (fieldName) {
			case "Status":
			case "EndConditionType":
			case "FreqRepeatEvery":
			case "FreqType":
			case "FreqInterval":
			case "EndOnSpecifyDate":
			case "EndOnSpecifyTimeOccurred":
			case "ActivityStartDate":
				//console.dir(new Date().toString() +":"+fieldName);
                $scope.ActivityStartDateChanged(newValue, newObj);
				$scope.CalculateNextRunDateForScheduledTask();
			default:
            break;
		}
	}

	$scope.ValidateBuffer = function(scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
        var prgmID = scope.programId.toLowerCase();
		var record = controller.ngModel;
        
		var isValid = true;
		
		if(prgmID == "ce01scheduletask"){
			var msg = [];
			
			switch(record.FreqType){
				case $scope.freqType.availableOptions.Weekly.value:
				var weeklyOptionsStr = "";
				angular.forEach($scope.freqInterval.weeklySelectedOptions, function(isChecked, weekdayInStr){
					if($scope.freqInterval.weeklySelectedOptions[weekdayInStr]){
						//weeklyOptionsStr = weeklyOptionsStr+$scope.freqInterval.weeklySelectedOptions[weekdayInStr].weekday+",";
						weeklyOptionsStr = weeklyOptionsStr+weekdayInStr+",";
					}
				})
				weeklyOptionsStr = weeklyOptionsStr.substring(0, weeklyOptionsStr.length-1);
				record.FreqInterval = weeklyOptionsStr;
				break;
				case $scope.freqType.availableOptions.Monthly.value:
				record.FreqInterval = $scope.freqInterval.monthlySelectedOptions;
				break;
			}
			record.EndConditionType = $scope.endConditionType.selectedOptions;
			
			if(record.EndConditionType == $scope.endConditionType.availableOptions.Never.value){
				record.EndOnSpecifyDate = null;
				record.EndOnSpecifyTimeOccurred = null;
			}else if(record.EndConditionType == $scope.endConditionType.availableOptions.On.value){
				record.EndOnSpecifyTimeOccurred = null;
			}else if(record.EndConditionType == $scope.endConditionType.availableOptions.After.value){
				record.EndOnSpecifyDate = null;
			}
			
			if(record.FreqType == $scope.freqType.availableOptions.Daily.value){
				record.FreqInterval = "";
			}
		}

        if(prgmID == "bp32scheduletaskprogram"){
			record.ProcessCriteria.EditMode = $scope.processFormMode;
			
            var entryForm = jQuery.extend({}, $scope.entryForm);
			if(record.ProcessCriteria.EditMode == "amend" || record.ProcessCriteria.EditMode == "create"){
				// es6 clone array
                // var programList = [...$scope.scheduleTaskProgram.List];
                // var programList = $scope.scheduleTaskProgram.List.slice();
                // 20190627, fixed: this is a object form, use object clone method
                var programList = jQuery.extend({}, $scope.scheduleTaskProgram.TaskPrograms);

				var newProgramList = {};
				
				// for(var programIndex=0; programIndex<programList.length;programIndex++){
				// 	var scheduleTaskProgram = programList[programIndex];
				// 	scheduleTaskProgram.ParameterJSON = JSON.stringify(programList[programIndex].ParameterJSONObj);
					
				// 	newProgramList[programIndex] = scheduleTaskProgram;
                // }
                
                for (var objIndex in programList) {
                    if (programList.hasOwnProperty(objIndex)) {
                        var programElement = jQuery.extend({}, programList[objIndex]);
                        programElement.ParameterJSON = JSON.stringify(programList[objIndex].ParameterJSONObj);
                        newProgramList[objIndex] = programElement;
                    }
                }
                
                record.ProcessCriteria.ScheduleProgramList = jQuery.extend({}, newProgramList);
			}
                
            record.ProcessCriteria.ScheduleTaskRecord = entryForm;
        }


		return isValid;
	}

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
//				$scope.entryForm = sRecord;
//			}
		}
	}

	$scope.CustomSubmitDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        // var hashID = 'pageview_bw21bank';
                
        var record = controller.ngModel;
		
		if(prgmID == "ce01scheduletask"){
			// convert FreqInterval, EndConditionType to selectedOptions
		}
		else if(prgmID == "ci02scheduletasknexttime"){
			// convert FreqInterval, EndConditionType to selectedOptions
			if(data_or_JqXHR.data){
				var data = data_or_JqXHR.data;
				if(data["record"]){
					var row1 = data["record"];
					$scope.entryForm.NextExecuteDate = new Date(row1.NextExecuteDate);
                    $scope.entryForm.CronExpression = row1.CronExpression;
                    
                    $scope.nextDateList = data["nextDateList"];
				}
            }
        }else if(prgmID == "bp32scheduletaskprogram"){
            if(data_or_JqXHR.data){
                var actionResult = data_or_JqXHR.ActionResult;
        
                // if(actionResult["num_rows"]>0){
                    var entryFormHashID = "entry_ce01scheduletask";
                    var processFormHashID = "process_bp32scheduletaskprogram";

                    if($scope.processFormMode == "create"){
                        $scope.directiveScopeDict[entryFormHashID].ResetForm();
            
                        $scope.directiveScopeDict[entryFormHashID].SetDefaultValue($scope.directiveScopeDict[entryFormHashID], [{tagName:"entry"}],"",$scope.directiveCtrlDict[entryFormHashID]);
                        $scope.directiveScopeDict[processFormHashID].SetDefaultValue($scope.directiveScopeDict[processFormHashID], [{tagName:"process"}],"",$scope.directiveCtrlDict[processFormHashID]);
                    }else if ($scope.processFormMode == "update"){
                    }else if ($scope.processFormMode == "delete"){
                        $scope.directiveScopeDict[entryFormHashID].ResetForm();
            
                        $scope.directiveScopeDict[entryFormHashID].SetDefaultValue($scope.directiveScopeDict[entryFormHashID], [{tagName:"process"}],"",$scope.directiveCtrlDict[entryFormHashID]);
                        $scope.directiveScopeDict[processFormHashID].SetDefaultValue($scope.directiveScopeDict[processFormHashID], [{tagName:"process"}],"",$scope.directiveCtrlDict[processFormHashID]);
                    }

                    // var msg = "";
                    // if($scope.processFormMode == "create"){
                    //     msg = "Data Created"
                    // }
                    //     MessageService.addMsg
                // }
            }
        }
    }
	
	$scope.CustomInquiryDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        
		if(prgmID == "bp32scheduletaskprogram"){
			var data = data_or_JqXHR.data;
			if(data){
                // 20190627, fixed: the child record become as schedule record
                // because the steps 3,7 belows using the same program bp32scheduletaskprogram
                // use = symbol will create the binding, the create/update/delete result will effect on $scope.scheduleTaskProgram.TaskPrograms
                /*
                1
                select schedule task on list

                2
                inquiry-inquiryData,
                calculate next run date

                3
                process-inquiryData,
                select schedule task child records, task programs

                4
                editbox-customedSelectedRecord
                add program to task

                5
                ShowProgramParameterSetting
                display program properties

                6
                RemoveScheduleProgram
                remove program from task

                7
                process-submitData
                update schedule task and child records

                */

                // 20190627, fixed: submit empty ParameterJSON when save record if not click Properties button, 
                // convert the program row, ParameterJSON to ParameterJSONObj
                data.forEach(function (rowObj) {
                    var programJsonDataStructure = JSON.parse(rowObj.AvailableParameterJSON);
                    var jsonObj = $scope.ConvertJSONStringToJSONObj(programJsonDataStructure, JSON.parse(rowObj.ParameterJSON));
                    rowObj.ParameterJSONObj = jsonObj;
                })

                $scope.scheduleTaskProgram.TaskPrograms = jQuery.extend({}, data);
                console.dir(data.length+" task programs displaied.")
                console.dir(data)
            }
		}
            
        // console.dir($scope.scheduleTaskProgram)
	}
	
	$scope.CustomGetDataResult = function(data_or_JqXHR, textStatus, scope, iElement, iAttrs, controller){
		var tagName = iElement[0].tagName.toLowerCase();
		var prgmID = scope.programId.toLowerCase();
		var scopeID = scope.$id;
        
        // selected schedule task record
		if(prgmID == "ce01scheduletask"){
			// convert FreqInterval, EndConditionType to selectedOptions
			$scope.ConvertFreqIntervalToDom(data_or_JqXHR.data[0]);
			
			// find the schedule task child records, task programs
			var hashID = "process_bp32scheduletaskprogram";
			var data = data_or_JqXHR.data;
			if(data[0]){
				$scope.processModel.InquiryCriteria.ScheduleID = parseInt(data[0].ScheduleID);
				$scope.directiveScopeDict[hashID].InquiryData();
			}
		}
        
    }
	$scope.CustomPointedToRecord = function(pRecord, rowScope, scope, iElement, controller){
		var prgmID = scope.programId.toLowerCase();
        
		if(prgmID == "cw01schedulableprogram"){
		}
		// if(prgmID == "bp32scheduletaskprogram"){
		// 	$scope.ShowProgramParameterSetting(pRecord);
		// }
	}

	$scope.CustomSelectedToRecord = function(sRecord, rowScope, scope, iElement, controller){
		var prgmID = scope.programId.toLowerCase();
		
		if(prgmID == "cw01schedulableprogram"){
			// add program to task
			$scope.AddProgramToTask(sRecord);
		}
		// if(prgmID == "bp32scheduletaskprogram"){
		// 	$scope.ShowProgramParameterSetting(sRecord);
		// }
	}
	
	$scope.ShowProgramParameterSetting = function(selectedProgram){
		console.dir("show program id: "+selectedProgram.ProgramID+" properties.")
		var newProgram;
        // find program in list
        /*
		for(var programIndex=0; programIndex<$scope.scheduleTaskProgram.List.length; programIndex++){
			var programElement = $scope.scheduleTaskProgram.List[programIndex];
			//newProgram = jQuery.extend({}, programElement);
			newProgram = $scope.scheduleTaskProgram.List[programIndex];
			
			if(programElement.ProgramID == selectedProgram.ProgramID){
				if(typeof(programElement.Status) == "undefined"){
					newProgram.Status = "Disabled";
				}
				break;
			}
        }
        */
       
        for (var objIndex in $scope.scheduleTaskProgram.TaskPrograms) {
            if ($scope.scheduleTaskProgram.TaskPrograms.hasOwnProperty(objIndex)) {
                var programElement = $scope.scheduleTaskProgram.TaskPrograms[objIndex];
                
                newProgram = $scope.scheduleTaskProgram.TaskPrograms[objIndex];
                if(programElement.ProgramID == selectedProgram.ProgramID){
                    if(typeof(programElement.Status) == "undefined"){
                        newProgram.Status = "Disabled";
                    }
                }
            }
        }
		
		
		//var newProgram = jQuery.extend({}, selectedProgram);
		// create JSON object for convert html control
		newProgram.programJsonDataStructure = JSON.parse(newProgram.AvailableParameterJSON);
		if(typeof(newProgram.ParameterJSONObj) == "undefined"){
		
			var jsonObj = $scope.ConvertJSONStringToJSONObj(newProgram.programJsonDataStructure, JSON.parse(newProgram.ParameterJSON));
			//newProgram.ParameterJSONObj = JSON.parse(newProgram.ParameterJSON);
			newProgram.ParameterJSONObj = jsonObj;
		}
		
        $scope.selectedTaskProgram = newProgram;
		
		$scope.programIdOnShow = newProgram.ProgramID + " - Properties";
		
		/*
		console.dir(newProgram);
		console.dir(selectedProgram);
		console.dir($scope.scheduleTaskProgram);
		*/
	}
	
	$scope.ConvertJSONStringToJSONObj = function(dataStructureObj, valueJson){
		var jsonObj = {};
		
		for(var parameterIndex=0; parameterIndex<dataStructureObj.length; parameterIndex++){
			var dataStructure = dataStructureObj[parameterIndex];
			var dataType = dataStructure.dataType;
			var stringValidationType = dataStructure.stringValidationType;
			var name = dataStructure.name;
			var defaultValue;
			
			switch(dataType){
				case "DATATYPE_STRING":
				case "DATATYPE_TEXT_AREA":
					defaultValue = "";
					break;
				case "DATATYPE_INTEGER":
				case "DATATYPE_DOUBLE":
					defaultValue = 0;
					break;
				case "DATATYPE_BOOLEAN":
					defaultValue = false;
					break;
				case "DATATYPE_ARRAY":
					// handle at below
					//defaultValue = [];
					break;
				case "DATATYPE_DATE":
					defaultValue = new Date();
					break;
				case "DATATYPE_DATETIME":
					defaultValue = new Date();
					break;
				case "DATATYPE_TIME":
					defaultValue = new Date();
					break;
			}
			
			if(dataType == "DATATYPE_ARRAY"){
				var validOptionList = dataStructure.validOptionList;
				switch(stringValidationType){
					case "VALID_STRING_RADIOLIST":
					if(validOptionList.length>0){
						defaultValue = validOptionList[0];
					}else{
						defaultValue = "";
					}
					break;
					case "VALID_STRING_CHECKLIST":
						defaultValue = {};
					for(var optionIndex=0; optionIndex<validOptionList.length; optionIndex++){
						defaultValue[validOptionList[optionIndex]] = true;
					}
					break;
					case "VALID_STRING_EMAIL":
					break;
				}
			}
			
			var isValueParsed;
			var valueParse;
			if(typeof(valueJson) != "undefined" && valueJson != null){
				
				try{
					var storedValue = valueJson[name];
					switch(dataType){
						case "DATATYPE_STRING":
						case "DATATYPE_TEXT_AREA":
							if(typeof(storedValue) == "undefined" || storedValue == null){
							}else{
								valueParse = storedValue;
							}
							break;
						case "DATATYPE_INTEGER":
						case "DATATYPE_DOUBLE":
							if(typeof(storedValue) == "undefined" || isNaN(storedValue)){
							}else{
								valueParse = parseFloat(storedValue);
							}
							break;
						case "DATATYPE_BOOLEAN":
							if(storedValue){
								valueParse = true;
							}else{
								valueParse = false;
							}
							break;
						case "DATATYPE_ARRAY":
							valueParse = storedValue;
							break;
						case "DATATYPE_DATE":
							valueParse = new Date(storedValue);
							break;
						case "DATATYPE_DATETIME":
							valueParse = new Date(storedValue);
							break;
						case "DATATYPE_TIME":
							valueParse = new Date(storedValue);
							break;
					}
					isValueParsed = true;
				}catch(err){
					console.log("Error occurred: when convert ParameterJSON to javascript object.");
					console.log(err.message);
					console.dir(err);
					isValueParsed = false;
				}
				
			}
			if(isValueParsed){
				jsonObj[name] = valueParse;
			}else{
				jsonObj[name] = defaultValue;
			}
		}
		
		return jsonObj;
    }
    
    $scope.RemoveScheduleProgram = function(removeProgram){
		var isProgramExists = false;
        
        var removeIndexAt = -1;
        /*
		for(var index = 0; index<$scope.scheduleTaskProgram.List.length; index++){
            var programElement = $scope.scheduleTaskProgram.List[index];
            
			if(programElement.ProgramID == removeProgram.ProgramID){
                removeIndexAt = index;
				isProgramExists = true;
			}
        }
        
		if(isProgramExists){
            $scope.scheduleTaskProgram.List.splice(removeIndexAt, 1);
        }
        */
       
        for (var objIndex in $scope.scheduleTaskProgram.TaskPrograms) {
            if ($scope.scheduleTaskProgram.TaskPrograms.hasOwnProperty(objIndex)) {
                var programElement = $scope.scheduleTaskProgram.TaskPrograms[objIndex];
                
                if(programElement.ProgramID == removeProgram.ProgramID){
                    removeIndexAt = objIndex;
                    isProgramExists = true;
                }
            }
        }

        // delete $scope.scheduleTaskProgram.TaskPrograms[removeIndexAt];
        // $scope.scheduleTaskProgram.TaskPrograms.splice(removeIndexAt, 1);
        delete $scope.scheduleTaskProgram.TaskPrograms[removeIndexAt];
    }
	
	$scope.AddProgramToTask = function(selectedProgram){
		var newProgram = jQuery.extend({}, selectedProgram);
		var programJsonDataStructure = JSON.parse(newProgram.AvailableParameterJSON);
		// create JSON object for convert html control
		//newProgram.programJsonDataStructure = programJsonDataStructure;
		newProgram.ParameterJSONObj = {};
		
		for(var parameterIndex=0; parameterIndex<programJsonDataStructure.length; parameterIndex++){
			var dataStructure = programJsonDataStructure[parameterIndex];
			var dataType = dataStructure.dataType;
			var stringValidationType = dataStructure.stringValidationType;
			var name = dataStructure.name;
			var parameterObj;
			switch(dataType){
				case "DATATYPE_STRING":
				case "DATATYPE_TEXT_AREA":
					parameterObj = "";
					break;
				case "DATATYPE_INTEGER":
				case "DATATYPE_DOUBLE":
					parameterObj = 0;
					break;
				case "DATATYPE_BOOLEAN":
					parameterObj = false;
					break;
				case "DATATYPE_ARRAY":
					// handle at below
					//parameterObj = [];
					break;
				case "DATATYPE_DATE":
					parameterObj = new Date();
					break;
				case "DATATYPE_DATETIME":
					parameterObj = new Date();
					break;
				case "DATATYPE_TIME":
					parameterObj = new Date();
					break;
			}
			
			if(dataType == "DATATYPE_ARRAY"){
				var validOptionList = dataStructure.validOptionList;
				switch(stringValidationType){
					case "VALID_STRING_RADIOLIST":
					if(validOptionList.length>0){
						parameterObj = validOptionList[0];
					}else{
						parameterObj = "";
					}
					break;
					case "VALID_STRING_CHECKLIST":
						parameterObj = {};
					for(var optionIndex=0; optionIndex<validOptionList.length; optionIndex++){
						parameterObj[validOptionList[optionIndex]] = true;
					}
					break;
					case "VALID_STRING_EMAIL":
					break;
				}
			}
			newProgram.ParameterJSONObj[name] = parameterObj;
        }
        
		if(typeof(newProgram.ParameterJSON) == "undefined"){
			newProgram.ParameterJSON = JSON.stringify(newProgram.ParameterJSONObj);
		}
		newProgram.Status = "Disabled";
		
		var isProgramExists = false;
        
        /*
		for(var index = 0; index<$scope.scheduleTaskProgram.List.length; index++){
			var programElement = $scope.scheduleTaskProgram.List[index];
			if(programElement.ProgramID == newProgram.ProgramID){
				isProgramExists = true;
			}
        }
        */

        for (var objIndex in $scope.scheduleTaskProgram.TaskPrograms) {
            if ($scope.scheduleTaskProgram.TaskPrograms.hasOwnProperty(objIndex)) {
                var programElement = $scope.scheduleTaskProgram.TaskPrograms[objIndex];
                
                if(programElement.ProgramID == newProgram.ProgramID){
                    isProgramExists = true;
                }
            }
        }
		
		if(!isProgramExists){
            // console.dir(typeof $scope.scheduleTaskProgram.TaskPrograms)
            // console.dir($scope.scheduleTaskProgram.TaskPrograms)
            // $scope.scheduleTaskProgram.TaskPrograms.push(newProgram);
            
            $scope.scheduleTaskProgram.TaskPrograms[Object.keys($scope.scheduleTaskProgram.TaskPrograms).length+1] = newProgram;
        }
		
	}
	
	$scope.ConvertFreqIntervalToDom = function(dataRow){
		var type = dataRow.FreqType;
		
		switch(type){
			case "Weekly":
				var weekDays = dataRow.FreqInterval.split(',');
				$scope.InitializeWeeklySelectedOptions(false);
				for(var index=0; index<weekDays.length; index++){
					$scope.freqInterval.weeklySelectedOptions[weekDays[index]] = true;
				}
				break;
			case "Monthly":
				$scope.freqInterval.monthlySelectedOptions = dataRow.FreqInterval;
				break;
		}
	}

}]);

