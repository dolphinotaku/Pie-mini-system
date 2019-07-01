<?php

function GetTableStructure(){
	$currencyManager = new CurrencyManager();
    return $currencyManager->selectPrimaryKeyList();
}

function FindData($requestData){
	$currencyManager = new CurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $currencyManager->$columnName = $value;
        }
		$currencyManager->Status = "Enabled";
        $responseArray = $currencyManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$currencyManager = new CurrencyManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;
	
	$currencyManager->Status = "Enabled";
	
	$responseArray = $currencyManager->select();

	//$responseArray = $currencyManager->selectPage($offsetRecords);

	return $responseArray;

}

?>