<?php

function GetTableStructure(){
	$exchangeRateManager = new ExchangeRateManager();
    
    return $exchangeRateManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$updateArray = array();
	$exchangeRateManager = new ExchangeRateManager();
	$updateExchangeManager = new ExchangeRateManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$exchangeRateManager->$columnName = $value;
        }

        $responseArray = $exchangeRateManager->insert();
        
        /*
		// update records for early effectiveDate with same currency as disabled
		$sql_str = "UPDATE `exchangerate` SET ";
		$sql_str .= " `IsEffective` = 'Disabled' ";
		$sql_str .= "WHERE `OutCurrencyID` = $exchangeRateManager->OutCurrencyID AND ";
		$sql_str .= "`InCurrencyID` = $exchangeRateManager->InCurrencyID AND ";
		$sql_str .= "`EffectiveDate` <= $exchangeRateManager->EffectiveDate";
		$updateArray = $updateExchangeManager->runSQL($sql_str);
		
        $responseArray = $exchangeRateManager->insert();
        */
	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$exchangeRateManager = new ExchangeRateManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $exchangeRateManager->$columnName = $value;
        }
        $responseArray = $exchangeRateManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$exchangeRateManager = new ExchangeRateManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $exchangeRateManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$updateArray = array();
	$exchangeRateManager = new ExchangeRateManager();
	$updateExchangeManager = new ExchangeRateManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$exchangeRateManager->$columnName = $value;
        }
        
        $responseArray = $exchangeRateManager->update();
        
        /*
		// update records for early effectiveDate with same currency as disabled
		$sql_str = "UPDATE `exchangerate` SET ";
		$sql_str .= " `IsEffective` = 'Disabled' ";
		$sql_str .= "WHERE `OutCurrencyID` = $exchangeRateManager->OutCurrencyID AND ";
		$sql_str .= "`InCurrencyID` = $exchangeRateManager->InCurrencyID AND ";
		$sql_str .= "`EffectiveDate` <= $exchangeRateManager->EffectiveDate AND ";
		$sql_str .= "`ExchangeRateID` <> $exchangeRateManager->ExchangeRateID AND ";
		$updateArray = $updateExchangeManager->runSQL($sql_str);
		
        $responseArray = $exchangeRateManager->update();
        */

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$exchangeRateManager = new ExchangeRateManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$exchangeRateManager->$columnName = $value;
		}
		$responseArray = $exchangeRateManager->delete();

	}
	return $responseArray;
}


?>