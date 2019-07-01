<?php

function GetTableStructure(){
	$scheduleLogManager = new ScheduleLogManager();
    return $scheduleLogManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$scheduleLogManager = new ScheduleLogManager();
	$responseArray = Core::CreateResponseArray();
    
    $searchRows = new stdClass();
    $searchRows = $requestData->InquiryRecord;
    foreach ($searchRows as $columnName => $value) {
        $scheduleLogManager->$columnName = $value;
    }
    
	$sql_str = "SELECT log.*, task.name ";
	// $sql_str .= "FROM `schedulelog` ";
	$sql_str .= "FROM `schedulelog` log, `scheduletask` task ";
    $sql_str .= "WHERE ";
    $sql_str .= "task.`ScheduleID` = log.`ScheduleID` ";
   
    if($scheduleLogManager->ScheduleID)
    $sql_str .= "AND log.`ScheduleID` = $scheduleLogManager->ScheduleID ";
    if($scheduleLogManager->Name)
	$sql_str .= "AND task.`Name` = $scheduleLogManager->Name ";
	// $sql_str .= "AND `task.ScheduleID` = `log.ScheduleID` ";
	$sql_str .= "ORDER BY `scheduleID`, `ExecuteDate` DESC ";
	//$sql_str .= "WHERE prgm.ProgramID = task_prgm.ProgramID ";
	//$sql_str .= "AND task_prgm.ScheduleID = $scheduleID";
    // $sql_str .= "GROUP BY `ScheduleID` ";

    // simple
    // SELECT * FROM `schedulelog` ORDER BY `scheduleID`, `ExecuteDate` DESC
	
	$responseArray = $scheduleLogManager->runSQL($sql_str);
	
    /*
	$responseArray["data"]["record"] = $scheduleLogManager->_;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";
	
	$responseArray["CronExpression"] = $scheduleLogManager->CronExpression;
    $responseArray["NextDateList"] = $nextRunDateList;
    
	$responseArray["data"]["nextDateList"] = $nextRunDateList;
	*/
    
	return $responseArray;
}

function GetData($requestData){
	$scheduleLogManager = new ScheduleLogManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleLogManager->selectPage($offsetRecords);
	
	return $responseArray;

}

?>