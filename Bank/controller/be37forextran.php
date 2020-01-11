<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
    return $foreignCurrencyTranManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $foreignCurrencyTranManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$foreignCurrencyTranManager->$columnName = $value;
		}
		$responseArray = $foreignCurrencyTranManager->insert();

	}

	return $responseArray;
}

function FindData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $foreignCurrencyTranManager->$columnName = $value;
        }
        $responseArray = $foreignCurrencyTranManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $foreignCurrencyTranManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$foreignCurrencyTranManager->$columnName = $value;
		}
        
		$responseArray = $foreignCurrencyTranManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$foreignCurrencyTranManager->$columnName = $value;
		}
		$responseArray = $foreignCurrencyTranManager->delete();

	}
	return $responseArray;
}


?>