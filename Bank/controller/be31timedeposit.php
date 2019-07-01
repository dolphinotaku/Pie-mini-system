<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$timeDepositManager = new TimeDepositTranManager();
    
    return $timeDepositManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$timeDepositManager = new TimeDepositTranManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $timeDepositManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$timeDepositManager->$columnName = $value;
		}
		$responseArray = $timeDepositManager->insert();

	}

	return $responseArray;
}

function FindData($requestData){
	$timeDepositManager = new TimeDepositTranManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $timeDepositManager->$columnName = $value;
        }
        $responseArray = $timeDepositManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$timeDepositManager = new TimeDepositTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $timeDepositManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$timeDepositManager = new TimeDepositTranManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$timeDepositManager->$columnName = $value;
		}
        
		$responseArray = $timeDepositManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$timeDepositManager = new TimeDepositTranManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$timeDepositManager->$columnName = $value;
		}
		$responseArray = $timeDepositManager->delete();

	}
	return $responseArray;
}


?>