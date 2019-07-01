<?php

function GetTableStructure(){
	$scheduleProgramManager = new ScheduleProgramManager();
    return $scheduleProgramManager->selectPrimaryKeyList();
}

function FindData($requestData){
	$scheduleProgramManager = new ScheduleProgramManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $scheduleProgramManager->$columnName = $value;
        }
        $responseArray = $scheduleProgramManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$scheduleProgramManager = new ScheduleProgramManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleProgramManager->selectPage($offsetRecords);
	
	return $responseArray;

}

?>