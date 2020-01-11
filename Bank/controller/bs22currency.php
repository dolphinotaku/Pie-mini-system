<?php

function GetTableStructure(){
	$currencyManager = new CurrencyManager();
    
    return $currencyManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $currencyManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->insert();

	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $currencyManager->$columnName = $value;
        }
        $responseArray = $currencyManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $currencyManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();
	$bankAccountManager = new BankAccountManager();
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();
	// $bankAccountCurrencyManager = new BankAccountCurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->update();

    }

    // if update success, insert bankaccountcurrency records
    if($responseArray["affected_rows"] > 0){
        // if enabled currency, 
        if($currencyManager->Status == "'Enabled'"){
            AddBankAcCurrency($currencyManager->AlphabeticCode);
        }else if($currencyManager->Status == "'Disabled'"){
            DisableBankAcCurrency($currencyManager->AlphabeticCode);
        }
    }

	return $responseArray;
}

function AddBankAcCurrency($alphabeticCode){
	$bankAccountManager = new BankAccountManager();
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();

    // find exists bank account
    $bankAccountManager->Initialize();
    $bankAC_responseArray = $bankAccountManager->select();

    // add currency to bank accounts
    if($bankAC_responseArray["num_rows"]>0){
        foreach($bankAC_responseArray["data"] as $rowIndex => $rowItem){
            $bankAccountCurrencyManager->Initialize();
            $bankAccountCurrencyManager->BankAccountID = $rowItem["BankAccountID"];
            $bankAccountCurrencyManager->AlphabeticCode = $alphabeticCode;

            // check Bank AC currency exists
            $bankAcCurrency_responseArray = $bankAccountCurrencyManager->select();

            if($bankAcCurrency_responseArray["num_rows"]>0){
                // $bankAccountCurrencyManager->Status = "Disabled";
            }else{
                // create Bank AC currency
                $bankAccountCurrencyManager->Status = "Disabled";
                $bankAccountCurrencyManager->insert();
            }
        }
    }
}

function DisableBankAcCurrency($alphabeticCode){
	$bankAccountManager = new BankAccountManager();
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();

    // find exists bank account
    $bankAccountManager->Initialize();
    $bankAC_responseArray = $bankAccountManager->select();

    // add currency to bank accounts
    if($bankAC_responseArray["num_rows"]>0){
        foreach($bankAC_responseArray["data"] as $rowIndex => $rowItem){
            $bankAccountCurrencyManager->Initialize();
            $bankAccountCurrencyManager->BankAccountID = $rowItem["BankAccountID"];
            $bankAccountCurrencyManager->AlphabeticCode = $alphabeticCode;

            // check Bank AC currency exists
            $bankAcCurrency_responseArray = $bankAccountCurrencyManager->select();

            if($bankAcCurrency_responseArray["num_rows"]>0){
                foreach($bankAcCurrency_responseArray["data"] as $bankAcIndex => $bankAcCurrencyRow){
                    // update Bank AC currency
                    $bankAccountCurrencyManager->BankAccountCurrencyID = $bankAcCurrencyRow["BankAccountCurrencyID"];
                    $bankAccountCurrencyManager->Status = "Disabled";
                    $bankAccountCurrencyManager->update();

                }
            }
        }
    }
}

function DeleteData($requestData){
	$responseArray = array();
	$currencyManager = new CurrencyManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$currencyManager->$columnName = $value;
		}
		$responseArray = $currencyManager->delete();

    }
    
    // if delete success


	return $responseArray;
}


?>