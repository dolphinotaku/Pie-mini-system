<?php

function GetTableStructure(){
	$currencyManager = new CurrencyManager();
    return $currencyManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$bankAccountBalanceManager = new BankAccountBalanceManager();

	$updateRows = new stdClass();
	$bankAccountCurrencyList = array();
    $bankAccountBalanceList = array();
    
    return $bankAccountBalanceManager->GetLatestEffectiveSavingRecords();
}

function ProcessData($requestData){
	return InsertData($requestData);
}

function InsertData($requestData){
	$responseArray = array();
	$updateArray = array();
	$bankAccountBalanceManager = new BankAccountBalanceManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->ProcessData->ProcessRecord;

	$effectiveDate = date('Y-m-d H:i:s');
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountBalanceManager->$columnName = $value;
		}
		$bankAccountBalanceManager->BankAccountBalanceID = NULL;
		$bankAccountBalanceManager->EffectiveDate = $effectiveDate;
		
		$responseArray = $bankAccountBalanceManager->insert();

	}
	// $responseArray = $bankAccountBalanceManager->CreateResponseArray();
	return $responseArray;
}

?>