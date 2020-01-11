<?php

function GetTableStructure(){
	$timeDepositTranManager = new TimeDepositTranManager();
    
    return $timeDepositTranManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$timeDepositTranManager = new TimeDepositTranManager();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	foreach ($searchRows as $columnName => $value) {
		$timeDepositTranManager->$columnName = $value;
    }
    $responseArray = $timeDepositTranManager->select();
    
    $principalCurrency = $requestData->InquiryCriteria->PrincipalCurrency;
    $status = $requestData->InquiryCriteria->Status;
    
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
	$sql_str .= "timedeposittran td_tran ";
    $sql_str .= "WHERE ";
    
    $sql_str .= "PrincipalCurrency LIKE '%".$principalCurrency."%' ";
    if($status == "Immature"){
        $sql_str .= "AND AdjustedMaturityDate > CURDATE()";
    }else if($status == "Matured"){
        $sql_str .= "AND AdjustedMaturityDate <= CURDATE()";
    }
	
	$responseArray = $timeDepositTranManager->runSQL($sql_str);
			
	return $responseArray;
}

function GetData($requestData){
	$timeDepositTranManager = new TimeDepositTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $timeDepositTranManager->selectPage($offsetRecords);
    
	return $responseArray;

}

?>