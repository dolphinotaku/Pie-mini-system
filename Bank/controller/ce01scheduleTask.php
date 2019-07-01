<?php

function GetTableStructure(){
	$scheduleTaskManager = new ScheduleTaskManager();
    return $scheduleTaskManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function CreateData($requestData){
	$responseArray = array();
	$scheduleTaskManager = new ScheduleTaskManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleTaskManager->$columnName = $value;
		}
		$scheduleTaskManager->UniqueID = uniqid("", true);
		$responseArray = $scheduleTaskManager->insert();
	}
	return $responseArray;
}

function FindData($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	
	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $scheduleTaskManager->$columnName = $value;
        }
        $responseArray = $scheduleTaskManager->select();
        break;
    }
    
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

function UpdateData($requestData){
	$responseArray = array();
	$scheduleTaskManager = new ScheduleTaskManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleTaskManager->$columnName = $value;
		}
		$responseArray = $scheduleTaskManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$scheduleTaskManager = new ScheduleTaskManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleTaskManager->$columnName = $value;
		}
		$responseArray = $scheduleTaskManager->delete();

	}
	return $responseArray;
}

?>