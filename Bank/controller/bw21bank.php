<?php

function GetTableStructure(){
	$bankManager = new BankManager();
    return $bankManager->selectPrimaryKeyList();
}

function FindData($requestData){
	$bankManager = new BankManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $bankManager->$columnName = $value;
        }
        $responseArray = $bankManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$bankManager = new BankManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $bankManager->selectPage($offsetRecords);

	return $responseArray;

}

?>