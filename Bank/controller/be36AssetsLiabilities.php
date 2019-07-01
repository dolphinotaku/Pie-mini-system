<?php

function GetTableStructure(){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
    
    return $assetsLiabilitiesManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = array();
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		// $assetsLiabilitiesManager->Initialize();
		foreach ($rowItem as $columnName => $value) {
			$assetsLiabilitiesManager->$columnName = $value;
		}
		$responseArray = $assetsLiabilitiesManager->insert();

	}
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $assetsLiabilitiesManager->$columnName = $value;
        }
        $responseArray = $assetsLiabilitiesManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $assetsLiabilitiesManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$assetsLiabilitiesManager->$columnName = $value;
		}
		$responseArray = $assetsLiabilitiesManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$assetsLiabilitiesManager->$columnName = $value;
		}
		$responseArray = $assetsLiabilitiesManager->delete();

	}
	return $responseArray;
}


?>