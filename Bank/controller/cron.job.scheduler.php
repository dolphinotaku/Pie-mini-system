<?php

function InquiryData($requestData){
    return ProcessData($requestData);
}

function ProcessData($requestData){
	$runResponseArray = Core::CreateResponseArray();
	$updateResponseArray = Core::CreateResponseArray();
	$responseArrayTasks = Core::CreateResponseArray();
	$responseArrayTaskPrograms = Core::CreateResponseArray();
    
    $scheduleTaskManager = new ScheduleTaskManager();
    $scheduleTaskProgramManager = new ScheduleTaskProgramManager();
    $scheduleLogManager = new ScheduleLogManager();
    
    // select schedule tasks
    $responseArrayTasks = SelectScheduleTask();
    
    if($responseArrayTasks["num_rows"] > 0){
        $toBeRunSchedule = array();

        // select schedule task programs
        foreach($responseArrayTasks["data"] as $keyIndex => $taskRowItem){
            $_taskScheduleID = $taskRowItem["ScheduleID"];
            $toBeRunSchedule[$_taskScheduleID] = array();
            $toBeRunSchedule[$_taskScheduleID]["scheduleID"] = $_taskScheduleID;
            $toBeRunSchedule[$_taskScheduleID]["programs"] = array();

            $scheduleTaskProgramManager->Initialize();
            $scheduleTaskProgramManager->ScheduleID = $taskRowItem["ScheduleID"];
            $scheduleTaskProgramManager->Status = "Enabled";
            $responseArrayTaskPrograms = $scheduleTaskProgramManager->select();
            $responseArray = $responseArrayTaskPrograms;

            if($responseArrayTaskPrograms["num_rows"] > 0){
                // array_push($toBeRunSchedule[$_taskScheduleID]["tasks"], $responseArrayTaskPrograms["data"]);
                $toBeRunSchedule[$_taskScheduleID]["programs"] = $responseArrayTaskPrograms["data"];
            }
        }
        
        // query schedule tasks
        foreach($toBeRunSchedule as $scheduleID => $scheduleRowItem){
            $taskExecuteDatetimeStr = GetCurrentDatetimeMysqlString();

            // query programs
            foreach($scheduleRowItem["programs"] as $programIndex => $taskProgramRowItem){
                $programID = $taskProgramRowItem["ProgramID"];
                // if the scheduler task have not assigned program
                if(!$programID)
                    continue;

                // run program
                $runResponseArray = RunScheduleTaskProgram($taskProgramRowItem);

                // record the executed log
                $programExecuteDatetimeStr = GetCurrentDatetimeMysqlString();

                $scheduleLogManager->Initialize();
                $scheduleLogManager->ScheduleID = $scheduleID;
                $scheduleLogManager->ProgramID = $programID;
                $scheduleLogManager->ExecuteDate = $programExecuteDatetimeStr;
                $scheduleLogManager->ResultStatus = $runResponseArray["access_status"];
                $scheduleLogManager->ResultLogJSON = json_encode($runResponseArray["data"]["JsonObj"]);
                $scheduleLogManager->insert();
            }
            // update schedule task
            $updateResponseArray = UpdateExecutedTask($scheduleID, $taskExecuteDatetimeStr);

        }
    }else{
        $runResponseArray = $responseArrayTasks;
    }

    /*
    $actionType = $requestData->ProcessData->CriteriaData->Action;

    $affectedRecord = array($scheduleProgramManager->_);
    $affectedRecord[0]["Status"] = $isInstall ? "Enabled" : "Disabled";
    $responseArray["data"] = $affectedRecord;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    // $responseArray["access_status"] = "OK";
    */
	
	return $runResponseArray;
}

function SelectScheduleTask(){
    $responseArrayTasks = Core::CreateResponseArray();
    $scheduleTaskManager = new ScheduleTaskManager();

    $executeDatetime = new DateTime();
    $executeDatetimeStr = $executeDatetime->format('Y-m-d H:i:s');
    $executeDatetimeStr = $executeDatetime->format('Y-m-d H:i');

    
    $executeDatetimeStrStart = $executeDatetime->format('Y-m-d H:i:00');
    $executeDatetimeStrEnd = $executeDatetime->format('Y-m-d H:i:59');
    
    $scheduleTaskManager->Initialize();
    $scheduleTaskManager->Status = "Enabled";
    // $scheduleTaskManager->NextExecuteDate = $executeDatetimeStr;
    // $responseArrayTasks = $scheduleTaskManager->select();
    
    $sql_str = "SELECT * ";
    $sql_str .= " FROM `scheduletask`";
    $sql_str .= " WHERE `Status` = 'Enabled'";
    $sql_str .= " AND `NextExecuteDate` >= '$executeDatetimeStrStart'";
    $sql_str .= " AND `NextExecuteDate` <= '$executeDatetimeStrEnd'";

    // sample
    //SELECT *  FROM `scheduletask` WHERE `Status` = 'Enabled' AND `NextExecuteDate` >= '2019-06-26 23:34:00' AND `NextExecuteDate` <= '2019-06-26 23:34:59'
    
	$responseArrayTasks = $scheduleTaskManager->runSQL($sql_str);
    
    return $responseArrayTasks;
}

function RunScheduleTaskProgram($taskProgramRowItem){
	$responseArrayProgram = Core::CreateResponseArray();

    $programID = $taskProgramRowItem["ProgramID"];
    $parameterJSONObj = json_decode($taskProgramRowItem["ParameterJSON"]);

    $programPath = $programID.".php";
    require_once($programPath);
    $responseArrayProgram = ScheduleTask($parameterJSONObj);

    return $responseArrayProgram;
}

function UpdateExecutedTask($scheduleID, $taskExecuteDatetimeStr){
    $responseArraySelect = Core::CreateResponseArray();
    $responseArrayUpdate = Core::CreateResponseArray();
    $scheduleTaskManager = new ScheduleTaskManager();
    
    $scheduleTaskManager->Initialize();
    $scheduleTaskManager->ScheduleID = $scheduleID;

    $responseArraySelect = $scheduleTaskManager->select();
    
    if($responseArraySelect["num_rows"] == 1 ){
        $scheduleRow = $responseArraySelect["data"][0];

        $scheduleTaskManager->Initialize();
        foreach ($scheduleRow as $columnName => $value) {
            $scheduleTaskManager->$columnName = $value;
        }
        $scheduleTaskManager->LastExecuteDate = $taskExecuteDatetimeStr;
        // $scheduleTaskManager->NextExecuteDate = $scheduleTaskManager->CalculateScheduleTaskNextRunTimeList();
        $scheduleTaskManager->CalculateScheduleTaskNextRunTimeList();
        $responseArrayUpdate = $scheduleTaskManager->update();

    }

    return $responseArrayUpdate;
}

function GetCurrentDatetimeMysqlString(){
    $_currentDatetime = new DateTime();
    $_currentDatetimeStr = $_currentDatetime->format('Y-m-d H:i:s');

    return $_currentDatetimeStr;
}

?>