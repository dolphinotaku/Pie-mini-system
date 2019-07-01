<?php

function GetTableStructure(){
	$bankAccountManager = new BankAccountManager();
    return $bankAccountManager->selectPrimaryKeyList();
}

function FindData($requestData){
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
	$bankAccountManager = new BankAccountManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $bankAccountManager->selectPage($offsetRecords);

	return $responseArray;

}

?>