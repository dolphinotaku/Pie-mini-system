<?php

function GetTableStructure(){
	$currencyManager = new CurrencyEntityManager();
    
    return $currencyManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$currencyManager = new CurrencyManager();
	
	// $searchRows = new stdClass();
	// $searchRows = $requestData->InquiryRecord;
	// foreach ($searchRows as $columnName => $value) {
	// 	$currencyManager->$columnName = $value;
	// }
	
	// $responseArray = $currencyManager->select();
    
    $alphabeticCode = $requestData->InquiryCriteria->AlphabeticCode;
    $status = $requestData->InquiryCriteria->Status;

	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
	$sql_str .= "currency ";
    $sql_str .= "WHERE ";
    
    $sql_str .= "Status = '$status' ";
    $sql_str .= "AND AlphabeticCode LIKE '%$alphabeticCode%'";
	
	$responseArray = $currencyManager->runSQL($sql_str);
			
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