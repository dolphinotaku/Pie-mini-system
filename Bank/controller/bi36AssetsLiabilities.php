<?php

function GetTableStructure(){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
    
    return $assetsLiabilitiesManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
	
    $searchRows = new stdClass();
    $searchRows = $requestData->InquiryRecord;
    
	$inquiryCriteria = new stdClass();
	$inquiryCriteria = $requestData->InquiryCriteria;
    
    $inquiryType = $inquiryCriteria->InquiryType;
    
    switch($inquiryType){
        case "ALL":
            $responseArray = SelectALLData($searchRows);
            break;
        case "Effective":
            $responseArray = SelectEffectiveData();
            break;
        case "History":
            $responseArray = SelectHistoryData();
            break;
    }
			
	return $responseArray;
}
function SelectALLData($searchRows){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
	foreach ($searchRows as $columnName => $value) {
		$assetsLiabilitiesManager->$columnName = $value;
	}
	$_responseArray = $assetsLiabilitiesManager->select();
    return $_responseArray;
}
function SelectEffectiveData(){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
	$sql_str = sprintf("SELECT * FROM %s al WHERE `EffectiveDate` = ( SELECT `EffectiveDate` FROM assetsliabilities al_view WHERE al.`Item` = al_view.`Item` AND al_view.`EffectiveDate` <= CURRENT_DATE ORDER BY al_view.`EffectiveDate` DESC LIMIT 1 ) ORDER BY `EffectiveDate` ASC",
    
			$assetsLiabilitiesManager->table);
	$_responseArray = $assetsLiabilitiesManager->runSQL($sql_str);
    
    return $_responseArray;
}
function SelectHistoryData(){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
	$sql_str = sprintf("SELECT * FROM %s WHERE `EffectiveDate` < CURRENT_DATE ORDER BY `EffectiveDate` DESC",
			$assetsLiabilitiesManager->table);
	$_responseArray = $assetsLiabilitiesManager->runSQL($sql_str);
    
    return $_responseArray;
}

function GetData($requestData){
	$assetsLiabilitiesManager = new AssetsLiabilitiesManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $assetsLiabilitiesManager->selectPage($offsetRecords);
    
	return $responseArray;
}

?>