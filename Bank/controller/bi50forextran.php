<?php

function GetTableStructure(){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
    return $foreignCurrencyTranManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	// foreach ($searchRows as $columnName => $value) {
	// 	$foreignCurrencyTranManager->$columnName = $value;
    // }
    // $responseArray = $foreignCurrencyTranManager->select();
    
    $outCurrencyID = $requestData->InquiryCriteria->OutCurrencyID;
    $inCurrencyID = $requestData->InquiryCriteria->InCurrencyID;
    $type = $requestData->InquiryCriteria->Type;
    $purpose = $requestData->InquiryCriteria->Purpose;
    $status = $requestData->InquiryCriteria->Status;
    
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
	$sql_str .= "foreigncurrencytran td_tran ";
    $sql_str .= "WHERE ";
    
    $sql_str .= "`OutCurrencyID` LIKE '%".$outCurrencyID."%' ";
    $sql_str .= "AND `InCurrencyID` LIKE '%".$inCurrencyID."%' ";
    $sql_str .= "AND `Type` LIKE '%".$type."%' ";
    $sql_str .= "AND `Purpose` LIKE '%".$purpose."%' ";
    $sql_str .= "AND `Status` LIKE '%".$status."%' ";
    
	$responseArray = $foreignCurrencyTranManager->runSQL($sql_str);
			
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

?>