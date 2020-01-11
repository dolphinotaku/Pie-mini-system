<?php

function GetTableStructure(){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
    return $foreignCurrencyTranManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$responseArray = Core::CreateResponseArray();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	// foreach ($searchRows as $columnName => $value) {
	// 	$foreignCurrencyTranManager->$columnName = $value;
    // }
    // $responseArray = $foreignCurrencyTranManager->select();
    
    // find all top ancestors
    $responseTopAncestorArray = GetTopAncestor($requestData);
    $adjustedResponseTopAncestorArray = $responseTopAncestorArray;
    $adjustedResponseTopAncestorArray["data"] = array();

    // loop each ancestor
    $seriesPathArray = array();
    if($responseTopAncestorArray["num_rows"]>0){
        foreach($responseTopAncestorArray["data"] as $rowIndex => $rowItem){
            $exchangeTranID = $rowItem["ExchangeTranID"];

            // check is youngest descendant out of the criteria date range
            $isInDateRange = CheckSeriesChildInDateRange($exchangeTranID, $requestData);

            if($isInDateRange){
                array_push($adjustedResponseTopAncestorArray["data"], $rowItem);

                // find the series path of each ancestor
                $childArray = GetSeriesChild($exchangeTranID);
                if($childArray["num_rows"]>0){
                    $seriesPathArray[$exchangeTranID] = $childArray;
                }
            }
        }
        $adjustedResponseTopAncestorArray["num_rows"] = count($adjustedResponseTopAncestorArray["data"]);
        $adjustedResponseTopAncestorArray["affected_rows"] = $adjustedResponseTopAncestorArray["num_rows"];
    }

    // get exchange rate
	$exchangeToCurrency = $requestData->InquiryCriteria->EquivalentCurrency;
    $responseArrayExchangeRate = GetExchangeRate($requestData);
    
    $responseArray["AllAssets"] = array();
    $responseArray["AllAssets"]["topancestor"] = $adjustedResponseTopAncestorArray;
    $responseArray["AllAssets"]["seriesPathArray"] = $seriesPathArray;
    // $responseArray["AllAssets"]["saving"] = $responseArraySaving;
    $responseArray["AllAssets"]["exchangerate"] = $responseArrayExchangeRate;

    $responseArray["data"] = $responseArray["AllAssets"];

    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";
			
	return $responseArray;
}

function GetTopAncestor($requestData){
    $foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$effectiveFromStr = $requestData->InquiryCriteria->EffectiveFrom;
    $effectiveFrom = date('Y-m-d', strtotime($effectiveFromStr));
	$effectiveToStr = $requestData->InquiryCriteria->EffectiveTo;
    $effectiveTo = date('Y-m-d', strtotime($effectiveToStr));
    
    $outCurrencyID = $requestData->InquiryCriteria->OutCurrencyID;
    $inCurrencyID = $requestData->InquiryCriteria->InCurrencyID;
    $type = $requestData->InquiryCriteria->Type;
    
    // find the earliest effective date
    $isEarliestDateExists = false;
	$sql_str = "SELECT MIN(`ExchangeDate`) AS ExchangeDate ";
	$sql_str .= "FROM ";
    $sql_str .= "foreigncurrencytran ";
    $responseArrayEarliestDate = $foreignCurrencyTranManager->runSQL($sql_str);
    if($responseArrayEarliestDate["num_rows"]> 0){
        $effectiveFromStr = $responseArrayEarliestDate["data"][0]["ExchangeDate"];
        $effectiveFrom = date('Y-m-d', strtotime($effectiveFromStr));

        $isEarliestDateExists = true;
    }
    

    // get all series top ancestor
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
	$sql_str .= "foreigncurrencytran ";
    $sql_str .= "WHERE ";

    $sql_str .= "LOCATE('/', `TradePath`) = CHAR_LENGTH(`TradePath`) - LOCATE('/', REVERSE(`TradePath`))+1 ";
    
    if($isEarliestDateExists){
        $sql_str .= "AND ExchangeDate >= '$effectiveFrom' ";
        // $sql_str .= "AND ExchangeDate <= '$effectiveTo' ";
    }
    
    $sql_str .= "AND `OutCurrencyID` LIKE '%".$outCurrencyID."%' ";
    $sql_str .= "AND `InCurrencyID` LIKE '%".$inCurrencyID."%' ";
    $sql_str .= "AND `Type` LIKE '%".$type."%' ";
    $sql_str .= "AND `Purpose` = 'Investment' ";
    $sql_str .= "AND `Status` <> 'Archive' ";
    
    $responseArray = $foreignCurrencyTranManager->runSQL($sql_str);
    // https://stackoverflow.com/questions/12775352/last-index-of-a-given-substring-in-mysql
    // SELECT *
    // FROM `foreigncurrencytran`
    // WHERE 
    // LOCATE('/', `TradePath`) = CHAR_LENGTH(`TradePath`) - LOCATE('/', REVERSE(`TradePath`))+1
    // AND `Purpose` = 'Investment'
    // AND `Status` = 'Archive'
    /*
    SELECT * 
    FROM foreigncurrencytran 
    WHERE 
    LOCATE('/', `TradePath`) = CHAR_LENGTH(`TradePath`) - LOCATE('/', REVERSE(`TradePath`))+1 
    AND ExchangeDate >= '2018-08-01' 
    AND ExchangeDate <= '2019-07-31' 
    AND `OutCurrencyID` LIKE '%%' 
    AND `InCurrencyID` LIKE '%%' 
    AND `Type` LIKE '%%' 
    AND `Purpose` = 'Investment' 
    AND `Status` = 'Archive'
    */
    
    return $responseArray;
}

function GetSeriesChild($parentExchangeTranID){
    $foreignCurrencyTranManager = new ForeignCurrencyTranManager();

    // get all series top ancestor
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
    $sql_str .= "`ForeignCurrencyTran` ";
    $sql_str .= "WHERE ";
    $sql_str .= "`TradePath` LIKE '$parentExchangeTranID/%'";
    
    $responseArray = $foreignCurrencyTranManager->runSQL($sql_str);
    // get the childs of 4
    // mysql version
    /*
    SELECT * 
    FROM 
    foreigncurrencytran
    WHERE `TradePath` LIKE "4/%";
    */
    
    return $responseArray;
}

function CheckSeriesChildInDateRange($parentExchangeTranID, $requestData){
    $foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$effectiveFromStr = $requestData->InquiryCriteria->EffectiveFrom;
    $effectiveFrom = date('Y-m-d', strtotime($effectiveFromStr));
	$effectiveToStr = $requestData->InquiryCriteria->EffectiveTo;
    $effectiveTo = date('Y-m-d', strtotime($effectiveToStr));

    // get all series top ancestor
	$sql_str = "SELECT * ";
	$sql_str .= "FROM ";
    $sql_str .= "`ForeignCurrencyTran` ";
    $sql_str .= "WHERE ";
    $sql_str .= "`TradePath` LIKE '$parentExchangeTranID/%'";
    
	// $sql_str .= "AND ExchangeDate >= '$effectiveFrom' ";
    // $sql_str .= "AND ExchangeDate <= '$effectiveTo' ";
    
    $seriesChildWithCriteriaArray = $foreignCurrencyTranManager->runSQL($sql_str);

    $seriesChildArray = GetSeriesChild($parentExchangeTranID);

    return $seriesChildWithCriteriaArray["num_rows"] == $seriesChildArray["num_rows"];
    // get the childs of 4
    // mysql version
    /*
    SELECT * 
    FROM 
    foreigncurrencytran
    WHERE `TradePath` LIKE "4/%";
    AND ExchangeDate >= '2018-10-01' 
    AND ExchangeDate <= '2019-07-31'
    */
    
    return $responseArray;
}

function GetExchangeRate($requestData){
    $responseArray = Core::CreateResponseArray();
    $exchangeRateManager = new ExchangeRateManager();
    
	$effectiveFromStr = $requestData->InquiryCriteria->EffectiveFrom;
    $asAtDate = date('Y-m-d', strtotime($effectiveFromStr));

    $responseArray = $exchangeRateManager->GetExchangeRate($asAtDate);
    return $responseArray["data"];
}

function GetData($requestData){
	$foreignCurrencyTranManager = new ForeignCurrencyTranManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $foreignCurrencyTranManager->selectPage($offsetRecords);
    
	return $responseArray;

}

?>