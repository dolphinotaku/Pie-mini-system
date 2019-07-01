<?php

function GetTableStructure(){
	$bankAccountManager = new BankAccountManager();
    
    return $bankAccountManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$updateArray = array();
	$bankAccountManager = new BankAccountManager();
	$currencyManager = new CurrencyManager();
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();
	
	$currencyManager->Status = "Enabled";
	$currencyResponseArray = $currencyManager->select();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountManager->$columnName = $value;
		}
		$bankAccountManager->BankAccountID = null;
		
		$responseArray = $bankAccountManager->insert();
		if($responseArray["affected_rows"] > 0){
			foreach($currencyResponseArray["data"] as $keyIndex => $currencyRowItem){
				$bankAccountCurrencyManager = new BankAccountCurrencyManager();
				$bankAccountCurrencyManager->BankAccountID = $responseArray["insert_id"];
				$bankAccountCurrencyManager->AlphabeticCode = $currencyRowItem["AlphabeticCode"];
				$bankAccountCurrencyManager->Status = "Disabled";
				$bankAccountCurrencyManager->insert();
			}
		}
	}
	
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$bankAccountManager = new BankAccountManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $bankAccountManager->$columnName = $value;
        }
        $responseArray = $bankAccountManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$bankAccountManager = new BankAccountManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $bankAccountManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$updateArray = array();
	$bankAccountManager = new BankAccountManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountManager->$columnName = $value;
		}
		
		$responseArray = $bankAccountManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$bankAccountManager = new BankAccountManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountManager->$columnName = $value;
		}
		$responseArray = $bankAccountManager->delete();

	}
	return $responseArray;
}


?>