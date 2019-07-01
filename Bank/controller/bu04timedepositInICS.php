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
    
    $exportType = $requestData->ProcessData->CriteriaData->ExportType->value;
    
	// $startDateStr = $requestData->InquiryRecord->StartDate;
	// $endDateStr = $requestData->InquiryRecord->EndDate;
	// $startDate = date('Y-m-d', strtotime($startDateStr));
    // $endDate = date('Y-m-d', strtotime($endDateStr));
    
    // $responseArray = $timeDepositManager->select();
	
	$sql_str = "SELECT *";
    $sql_str .= "FROM `timedeposittran` ";
    if($exportType == "ExportAll"){
    }
    else if($exportType == "ExportCurrentMonth")
    {
    }
    else if($exportType == "ExportTodayAndFuture"){
        $sql_str .= "WHERE AdjustedMaturityDate >= ";
        $sql_str .= " Current_Date ";
    }
	// $sql_str .= "WHERE AdjustedMaturityDate BETWEEN ";
	// $sql_str .= "'$startDate' ";
	// $sql_str .= "AND '$endDate' ";
	$sql_str .= "ORDER BY MaturityDate DESC";
			
	$responseArray = $timeDepositManager->runSQL($sql_str);
    		
	return $responseArray;
}

function GetData($requestData){
	$timeDepositManager = new TimeDepositTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;
	
	$sql_str = sprintf("SELECT * FROM %s WHERE `AdjustedMaturityDate` < CURRENT_DATE LIMIT %s OFFSET %s",
			$timeDepositManager->table,
			10,
			$offsetRecords);
	$responseArray = $timeDepositManager->runSQL($sql_str);
		
	return $responseArray;

}

?>