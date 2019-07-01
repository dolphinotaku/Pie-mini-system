<?php

function GetTableStructure(){
	$exchangeRateManager = new ExchangeRateManager();
    
    return $exchangeRateManager->selectPrimaryKeyList();
}

function FindData($requestData){
	$responseArray = array();
	$exchangeRateManager = new ExchangeRateManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $exchangeRateManager->$columnName = $value;
        }
        $responseArray = $exchangeRateManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$exchangeRateManager = new ExchangeRateManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $exchangeRateManager->selectPage($offsetRecords);
    
	return $responseArray;

}

?>