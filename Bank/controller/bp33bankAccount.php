<?php

function GetTableStructure(){
	$currencyManager = new CurrencyManager();
    return $currencyManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->InquiryData->Record;
	$bankAccountID = $requestData->InquiryData->Record->BankAccountID;
    
	/*
	foreach ($updateRows as $columnName => $value) {
		$bankAccountCurrencyManager->$columnName = $value;
	}
	$responseArray = $bankAccountCurrencyManager->select();
	*/
	
	$sql_str = "SELECT BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, BankChineseName, BankEnglishName, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName, bACcurrency.Status ";
	$sql_str .= "FROM `bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c ";
	$sql_str .= "WHERE ";
	$sql_str .= "b.BankCode = bAC.BankCode ";
	$sql_str .= "AND bAC.BankAccountID = $bankAccountID ";
	$sql_str .= "AND bAC.BankAccountID = bACcurrency.BankAccountID ";
	$sql_str .= "AND bACcurrency.AlphabeticCode = c.AlphabeticCode ";
	//$sql_str .= "GROUP BY Year(AdjustedMaturityDate), Month(AdjustedMaturityDate), PrincipalCurrency ";
	$sql_str .= "ORDER BY c.AlphabeticCode";

	/*
	SELECT BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, BankChineseName, BankEnglishName, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName, bACcurrency.Status 
FROM `bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c 
where 
b.BankCode = bAC.BankCode 
AND bAC.BankAccountID = $bankAccountID 
AND bAC.BankAccountID = bACcurrency.BankAccountID 
AND bACcurrency.AlphabeticCode = c.AlphabeticCode 
ORDER BY c.AlphabeticCode
	*/
	
	$responseArray = $bankAccountCurrencyManager->runSQL($sql_str);
    
	return $responseArray;
}

function ProcessData($requestData){
	return UpdateData($requestData);
}

function UpdateData($requestData){
	$responseArray = array();
	$updateArray = array();
	$bankAccountBalanceManager = new BankAccountBalanceManager();
	$bankAccountCurrencyManager = new BankAccountCurrencyManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->ProcessData->ProcessRecord;

	$effectiveDate = date('Y-m-d H:i:s');
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountCurrencyManager->$columnName = $value;
		}
		
		$responseArray = $bankAccountCurrencyManager->update();
		// insert zero based record for account balance
		if($bankAccountCurrencyManager->Status == "'Enabled'"){
			$bankAccountBalanceManager->Initialize();
			$bankAccountBalanceManager->BankAccountCurrencyID = $bankAccountCurrencyManager->BankAccountCurrencyID;
			$bankAccountBalanceManager->AvailableBalance = 0;
			$bankAccountBalanceManager->EffectiveDate = $effectiveDate;
			$bankAccountBalanceManager->insert();
		}

	}
	
	return $responseArray;
}

?>