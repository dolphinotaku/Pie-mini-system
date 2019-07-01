<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$currencyEntityManager = new CurrencyEntityManager();
    
    return $currencyEntityManager->selectPrimaryKeyList();
}

function ProcessData($requestData){
	$currencyEntityManager = new CurrencyEntityManager();
	$currencyManager = new CurrencyManager();
	
	$sql_str = "SELECT `Entity`,`Currency`,`AlphabeticCode`,`NumericCode`,`MinorUnit`, COUNT(*) as `Count` FROM `currencyentity` ";
	$sql_str .= "WHERE `AlphabeticCode` <> '' ";
	$sql_str .= "GROUP BY `AlphabeticCode` ";
	$sql_str .= "ORDER BY `AlphabeticCode`";
	
	$responseArray = $currencyEntityManager->runSQL($sql_str);
	
	$sql_str = "delete from currency";
	$currencyManager->runSQL($sql_str);
	
	$insertResult = new stdClass();
	$insertResult->success = array();
	$insertResult->failure = array();
	
	for($rowIndex = 0; $rowIndex < count($responseArray['data']); $rowIndex++) {
		$currencyRow = $responseArray['data'][$rowIndex];
		
		$sql_str = sprintf("INSERT INTO `currency` VALUES ('%s', '%s', '%s', '%s', '', %s)",
			$currencyRow['AlphabeticCode'],
			$currencyRow['NumericCode'],
			"Disabled",
			$currencyRow['Currency'],
			$currencyRow['Count']
		);
				
		$insertResponseArray = array();
		$insertResponseArray = $currencyManager->runSQL($sql_str);
		
		if($insertResponseArray["affected_rows"] == 1){
			array_push($insertResult->success, $insertResponseArray['data']);
		}else{
			array_push($insertResult->failure, $insertResponseArray['data']);
		}
		
	}
	
	$responseArray = Core::CreateResponseArray();
	
	$responseArray['processed_message'] = [];
	array_push($responseArray['processed_message'], sprintf("Successful: %s, Failure: %s",
	count($insertResult->success),
	count($insertResult->failure)));
	
	$responseArray['table_schema'] = $insertResponseArray['table_schema'];
	$responseArray['access_status'] = Core::$access_status['OK'];
	$responseArray['affected_rows'] = count($insertResult->success);
		
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
	
	$sql_str = sprintf("SELECT * FROM %s WHERE `MaturityDate` < CURRENT_DATE LIMIT %s OFFSET %s",
			$timeDepositManager->table,
			10,
			$offsetRecords);
	$responseArray = $timeDepositManager->runSQL($sql_str);
		
	return $responseArray;

}

?>