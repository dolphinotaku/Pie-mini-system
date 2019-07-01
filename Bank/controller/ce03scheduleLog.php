<?php

function GetTableStructure(){
	$scheduleLogManager = new ScheduleLogManager();
    return $scheduleLogManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$scheduleLogManager = new ScheduleLogManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleLogManager->$columnName = $value;
		}
		$responseArray = $scheduleLogManager->insert();

	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$scheduleLogManager = new ScheduleLogManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $scheduleLogManager->$columnName = $value;
        }
        $responseArray = $scheduleLogManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$scheduleLogManager = new ScheduleLogManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleLogManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$scheduleLogManager = new ScheduleLogManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleLogManager->$columnName = $value;
		}
		$responseArray = $scheduleLogManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$scheduleLogManager = new ScheduleLogManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$scheduleLogManager->$columnName = $value;
		}
		$responseArray = $scheduleLogManager->delete();

	}
	return $responseArray;
}

?>