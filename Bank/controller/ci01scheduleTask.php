<?php

function GetTableStructure(){
	$scheduleTaskManager = new ScheduleTaskManager();
    return $scheduleTaskManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	foreach ($searchRows as $columnName => $value) {
		$scheduleTaskManager->$columnName = $value;
    }
    
	$responseArray = $scheduleTaskManager->select();
			
	return $responseArray;
}

function GetData($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleTaskManager->selectPage($offsetRecords);
	
	return $responseArray;

}

?>