<?php

function GetTableStructure(){
	$currencyManager = new CurrencyManager();
    
    return $currencyManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $currencyManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->insert();

	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $currencyManager->$columnName = $value;
        }
        $responseArray = $currencyManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $currencyManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->delete();

	}
	return $responseArray;
}


?>