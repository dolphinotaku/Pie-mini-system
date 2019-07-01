<?php

$errors         = array();  	// array to hold validation errors
$data 			= array(); 		// array to pass back data

$responseArray = array();

function GetTableStructure(){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
    return $foreignCurrencyTranManager->selectPrimaryKeyList();
}

function ProcessData($requestData){
	return FindData($requestData);
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$responseArray = Core::CreateResponseArray();
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$asAtDateStr = $requestData->InquiryRecord->AsAtDate;
	$exchangeToCurrency = $requestData->InquiryRecord->ExchangeToCurrency;
    
    $asAtDate = date('Y-m-d', strtotime($asAtDateStr));
    $asAtDateTime = date('Y-m-d h:i:s', strtotime($asAtDateStr));
	/*
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
	$sql_str .= "foreigncurrencytran forex ";
	$sql_str .= "WHERE ";
	$sql_str .= "LOWER(forex.Status) != 'archive' ";
	$sql_str .= "AND LOWER(forex.Purpose) = 'investment'";
	$sql_str .= "AND ExchangeDate <= '".$asAtDate."'";
	
	$responseArrayForex = $foreignCurrencyTranManager->runSQL($sql_str);
    */
    
    $responseArrayForex = GetForeignCurrencyTran($asAtDate);
    $responseArrayExchangeRate = GetExchangeRate($asAtDate, $exchangeToCurrency);
    
    foreach($responseArrayForex as $rowIndex=>$rowObj){
        $foreignCurrencyTranManager->_ = $rowObj;
        $responseArrayForexEdge = GetEdgeTran($asAtDate, $rowObj["ExchangeTranID"]);
        $responseArrayForex[$rowIndex]["Edge"] = array();
        if(count($responseArrayForexEdge)>0){
            $responseArrayForex[$rowIndex]["Edge"] = $responseArrayForexEdge;
        }
    }
    
    $responseArray["AllAssets"] = array();
    $responseArray["AllAssets"]["foreignCurrencyTran"] = $responseArrayForex;
    $responseArray["AllAssets"]["exchangerate"] = $responseArrayExchangeRate;

    $responseArray["data"] = $responseArray["AllAssets"];

    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";
    
	return $responseArray;
}
function GetForeignCurrencyTran($asAtDate){
    $responseArray = Core::CreateResponseArray();
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    $responseArray = $foreignCurrencyTranManager->GetForeignCurrencyTran($asAtDate);
    return $responseArray["data"];
}
function GetExchangeRate($asAtDate, $exchangeToCurrency){
    $responseArray = Core::CreateResponseArray();
	$exchangeRateManager = new ExchangeRateManager();
    $responseArray = $exchangeRateManager->GetExchangeRate($asAtDate);
    return $responseArray["data"];
}
function GetEdgeTran($asAtDate, $exchangeTranID){
    $responseArray = Core::CreateResponseArray();
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$sql_str = "SELECT forex.*, edge.*";
	$sql_str .= "FROM ";
	$sql_str .= "foreigncurrencytran forex, trandagedge edge ";
	$sql_str .= "WHERE ";
	$sql_str .= "LOWER(forex.Status) = 'archive' ";
	$sql_str .= "AND LOWER(forex.Purpose) = 'investment' ";
	$sql_str .= "AND ExchangeDate <= '".$asAtDate."' ";
	$sql_str .= "AND forex.ExchangeTranID = edge.EndVertex ";
	$sql_str .= "AND StartVertex = $exchangeTranID";
    
	$responseArray = $foreignCurrencyTranManager->runSQL($sql_str);
    return $responseArray["data"];
}

function GetData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;
	
	$sql_str = sprintf("SELECT * FROM %s WHERE `AdjustedMaturityDate` < CURRENT_DATE LIMIT %s OFFSET %s",
			$foreignCurrencyTranManager->table,
			10,
			$offsetRecords);
	$responseArray = $foreignCurrencyTranManager->runSQL($sql_str);
		
	return $responseArray;

}

?>