<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$timeDepositManager = new TimeDepositTranManager();
    
    return $timeDepositManager->selectPrimaryKeyList();
}

function FindData($requestData){
	$timeDepositManager = new TimeDepositTranManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $timeDepositManager->$columnName = $value;
        }
        $responseArray = $timeDepositManager->select();
        break;
    }
    
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
	
	$sql_str = sprintf("SELECT * FROM %s WHERE `AdjustedMaturityDate` < DATE_FORMAT(CURRENT_DATE, '%%Y-%%m-%%d') LIMIT %s OFFSET %s",
			$timeDepositManager->table,
			10,
			$offsetRecords);
	$responseArray = $timeDepositManager->runSQL($sql_str);
		
	return $responseArray;

}

?>