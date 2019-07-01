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
	$responseArray = Core::CreateResponseArray();
	
	$asAtDateStr = $requestData->InquiryRecord->AsAtDate;
	$exchangeToCurrency = $requestData->InquiryRecord->ExchangeToCurrency;
    
    $asAtDate = date('Y-m-d h:i:s', strtotime($asAtDateStr));
    // get month start end date of asAtDate;
    $firstDayOfMonth = date('Y-m-01'); // hard-coded '01' for first day
    $lastDayOfMonth = date_format(date_create($asAtDate), 'Y-m-t');
    
    // validate time deposit and exchagne rate records
    // select non-maturitied time deposit and group in currency
	
    $responseArrayTimeDeposit = GetTimeDeposit($asAtDate, $exchangeToCurrency);
    $responseArrayTimeDepositInGroup = GetGroupedTimeDeposit($firstDayOfMonth, $lastDayOfMonth, $exchangeToCurrency);
    $responseArraySaving = GetSaving($asAtDate, $exchangeToCurrency);
    $responseArrayExchangeRate = GetExchangeRate($asAtDate, $exchangeToCurrency);
    
    $responseArray["AllAssets"] = array();
    $responseArray["AllAssets"]["timedeposit"] = $responseArrayTimeDeposit;
    $responseArray["AllAssets"]["timedepositInGroup"] = $responseArrayTimeDepositInGroup;
    $responseArray["AllAssets"]["saving"] = $responseArraySaving;
    $responseArray["AllAssets"]["exchangerate"] = $responseArrayExchangeRate;

    $responseArray["data"] = $responseArray["AllAssets"];

    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";

	return $responseArray;
}
function GetExchangeRate($asAtDate, $exchangeToCurrency){
    $responseArray = Core::CreateResponseArray();
	$exchangeRateManager = new ExchangeRateManager();
    $responseArray = $exchangeRateManager->GetExchangeRate($asAtDate);
    return $responseArray["data"];
}
function GetSaving($asAtDate, $exchangeToCurrency){
    $responseArray = Core::CreateResponseArray();
    
	$bankAccountBalanceManager = new BankAccountBalanceManager();
    $responseArray = $bankAccountBalanceManager->GetLatestEffectiveSavingRecords($asAtDate, $exchangeToCurrency);
    return $responseArray["data"];
}
function GetTimeDeposit($asAtDate, $exchangeToCurrency){
	$timeDepositTranManager = new TimeDepositTranManager();
    $responseArray = Core::CreateResponseArray();
    $responseArray = $timeDepositTranManager->GetTimeDepositFutureRecords($asAtDate, $exchangeToCurrency);
    return $responseArray["data"];
}
function GetGroupedTimeDeposit($startDate, $endDate, $exchangeToCurrency){
	$timeDepositTranManager = new TimeDepositTranManager();
    $responseArray = Core::CreateResponseArray();
    $responseArray = $timeDepositTranManager->GetGroupedTimeDepositFutureRecords($startDate, $exchangeToCurrency);
        
    return $responseArray["data"];
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