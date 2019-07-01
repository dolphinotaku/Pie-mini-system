<?php

$masterTableName = "bank";

function GetTableStructure(){
	$bankManager = new SimpleTableManager();
    $bankManager->Initialize($GLOBALS["masterTableName"]);
    
    return $bankManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$bankManager = new SimpleTableManager();
    $bankManager->Initialize($GLOBALS["masterTableName"]);
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $bankManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$bankManager->$columnName = $value;
		}
		$responseArray = $bankManager->insert();

	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$bankManager = new SimpleTableManager();
    $bankManager->Initialize($GLOBALS["masterTableName"]);

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $bankManager->$columnName = $value;
        }
        $responseArray = $bankManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$bankManager = new SimpleTableManager();
    $bankManager->Initialize($GLOBALS["masterTableName"]);
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $bankManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$bankManager = new SimpleTableManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
        $bankManager->Initialize($GLOBALS["masterTableName"]);
		foreach ($rowItem as $columnName => $value) {
			$bankManager->$columnName = $value;
		}
		$responseArray = $bankManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$bankManager = new SimpleTableManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
        $bankManager->Initialize($GLOBALS["masterTableName"]);
		foreach ($rowItem as $columnName => $value) {
			$bankManager->$columnName = $value;
		}
		$responseArray = $bankManager->delete();

	}
	return $responseArray;
}


?>