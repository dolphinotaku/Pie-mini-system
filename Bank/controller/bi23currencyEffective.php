<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$currencyManager = new CurrencyEntityManager();
    
    return $currencyManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$currencyManager = new CurrencyManager();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	foreach ($searchRows as $columnName => $value) {
		$currencyManager->$columnName = $value;

	}
	$currencyManager->Status = "Enabled";
	
	$responseArray = $currencyManager->select();
			
	return $responseArray;
}

function GetData($requestData){
	$currencyManager = new CurrencyEntityManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $currencyManager->selectPage($offsetRecords);
    
	return $responseArray;

}

?>