<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$timeDepositManager = new TimeDepositTranManager();
    
    return $timeDepositManager->selectPrimaryKeyList();
}

function ProcessData($requestData){
	return FindData($requestData);
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$timeDepositManager = new TimeDepositTranManager();
	
	$startDateStr = $requestData->InquiryRecord->StartDate;
	$endDateStr = $requestData->InquiryRecord->EndDate;
	$startDate = date('Y-m-d', strtotime($startDateStr));
	$endDate = date('Y-m-d', strtotime($endDateStr));
	
	/*
	$asAtDate = date('Ymd');
	
	$sql_str = "SELECT DATE_FORMAT(AdjustedMaturityDate,'%Y-%m') as `Period`, PrincipalCurrency, SUM(Interest) as `Interest` FROM `timedeposittran` ";
	$sql_str .= "WHERE AdjustedMaturityDate BETWEEN ";
	$sql_str .= "DATE_ADD(LAST_DAY(DATE_SUB($asAtDate, INTERVAL 13 MONTH)), INTERVAL 1 DAY)";
	$sql_str .= "AND LAST_DAY(DATE_SUB($asAtDate, INTERVAL 1 MONTH)) ";
	$sql_str .= "GROUP BY Year(AdjustedMaturityDate), Month(AdjustedMaturityDate), PrincipalCurrency ";
	$sql_str .= "ORDER BY DATE_FORMAT(AdjustedMaturityDate,'%Y-%m') DESC";
	*/
	
	$sql_str = "SELECT DATE_FORMAT(AdjustedMaturityDate,'%Y-%m') as `Period`, PrincipalCurrency, SUM(Interest) as `Interest` FROM `timedeposittran` ";
	$sql_str .= "WHERE AdjustedMaturityDate BETWEEN ";
	$sql_str .= "'$startDate' ";
	$sql_str .= "AND '$endDate' ";
	$sql_str .= "GROUP BY Year(AdjustedMaturityDate), Month(AdjustedMaturityDate), PrincipalCurrency ";
	$sql_str .= "ORDER BY DATE_FORMAT(AdjustedMaturityDate,'%Y-%m') DESC";
	
	$responseArray = $timeDepositManager->runSQL($sql_str);
		
	return $responseArray;
}

function GetData($requestData){
	$timeDepositManager = new TimeDepositTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;
	
	
	//$timeDepositManager->sql_str = "SELECT * FROM `timedeposittran` WHERE `MaturityDate` > CURRENT_DATE";
	//$responseArray = $timeDepositManager->queryForDataArray();
	//$responseArray['table_schema'] = $timeDepositManager->dataSchema['data'];
    //
	//return $timeDepositManager->GetResponseArray();
	
	$sql_str = sprintf("SELECT * FROM %s WHERE `AdjustedMaturityDate` < CURRENT_DATE LIMIT %s OFFSET %s",
			$timeDepositManager->table,
			10,
			$offsetRecords);
	$responseArray = $timeDepositManager->runSQL($sql_str);
		
	return $responseArray;

}

?>