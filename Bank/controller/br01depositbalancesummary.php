<?php

require_once '../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function GetTableStructure(){
	$currencyManager = new CurrencyEntityManager();
    
    return $currencyManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$effectiveAsAtStr = $requestData->InquiryCriteria->EffectiveAsAt;
    $effectiveAsAt = date('Y-m-d', strtotime($effectiveAsAtStr));
    
	$baseCurrency = $requestData->InquiryCriteria->EquivalentCurrency;
	$fileFormat = $requestData->InquiryCriteria->ExportFileTypeAs;
    
    // sql select data
    $timeDepositManager = new TimeDepositTranManager();
    
    
    $sql_str = "SELECT PrincipalCurrency";
    $sql_str .= " FROM `timedeposittran`";
	$sql_str .= " WHERE EffectiveDate <= '$effectiveAsAt'";
	$sql_str .= " AND AdjustedMaturityDate >= '$effectiveAsAt'";
	$sql_str .= " GROUP BY PrincipalCurrency ";
	$sql_str .= " ORDER BY PrincipalCurrency ASC ";
    $currencyGroupResponseArray = $timeDepositManager->runSQL($sql_str);
    /*
    SELECT PrincipalCurrency 
    FROM `timedeposittran` 
    WHERE EffectiveDate <= '2019-07-28' 
    AND AdjustedMaturityDate >= '2019-07-28' 
    GROUP BY PrincipalCurrency 
    ORDER BY PrincipalCurrency ASC, AdjustedMaturityDate ASC
    */
    
    $sql_str = "SELECT *";
    $sql_str .= " FROM `timedeposittran`";
	$sql_str .= " WHERE EffectiveDate <= '$effectiveAsAt'";
	$sql_str .= " AND AdjustedMaturityDate >= '$effectiveAsAt'";
	$sql_str .= " ORDER BY PrincipalCurrency ASC, AdjustedMaturityDate ASC ";
    // $sql_str .= " Limit 1 ";
    // e.g
    /*
    SELECT *
     FROM `timedeposittran`
      WHERE EffectiveDate <= '2019-07-28'
      AND AdjustedMaturityDate >= '2019-07-28'
      ORDER BY PrincipalCurrency ASC, AdjustedMaturityDate ASC
    */
	
    $depositResponseArray = $timeDepositManager->runSQL($sql_str);
    
    $responseArrayExchangeRate = GetExchangeRate($effectiveAsAt, $baseCurrency);

    // initialize PhpSpreadsheet
    $phpSpreadsheetManager = new PhpSpreadsheetManager("br01depositbalancesummary.xlsx");
    $phpSpreadsheetManager->Initialize();

    // $phpSpreadsheetManager->MergeDataRow("G", array("PrincipalCurrency"=>"AUD"));
    foreach($currencyGroupResponseArray["data"] as $currencyIndex => $currencyRow){
        $currency = $currencyRow["PrincipalCurrency"];
        
        $dataRows = array_filter($depositResponseArray["data"], function ($depositRow) use ($currency) {
            if($depositRow["PrincipalCurrency"] == $currency){
                return true;
            }else{
                return false;
            }
        });
        
        $subTotal = array(
            "PrincipalCurrency"=>$currencyRow["PrincipalCurrency"],
            "SubTotalPrincipal"=>0,
            "SubTotalInterest"=>0,
            "SubTotalPI"=>0,
        );
        $equivalentTotal = array(
            "BaseCurrency"=>$baseCurrency,
            "EquivalentPrincipal"=>0,
            "EquivalentInterest"=>0,
            "EquivalentPI"=>0
        );

        // calculate sub total
        foreach($dataRows as $rowIndex => $dataRow){
            $subTotal["SubTotalPrincipal"] += $dataRow["Principal"];
            $subTotal["SubTotalInterest"] += $dataRow["Interest"];
            $subTotal["SubTotalPI"] += ($dataRow["Principal"]+$dataRow["Interest"]);
            $dataRows[$rowIndex]["DepositRate"] = $dataRow["DepositRate"]/100;
        }

        // calculate equivalent value
        if($currency != $baseCurrency){
            foreach($dataRows as $rowIndex => $dataRow){
                foreach($responseArrayExchangeRate as $forexRowIndex => $forexRow){

                    if($forexRow["OutCurrencyID"] == $currency && $forexRow["InCurrencyID"] == $baseCurrency){
                        $rate = $forexRow["Rate"];

                        $equivalentTotal["EquivalentPrincipal"] += ($dataRow["Principal"] * $rate);
                        $equivalentTotal["EquivalentInterest"] += ($dataRow["Interest"] * $rate);
                        $equivalentTotal["EquivalentPI"] += (($dataRow["Principal"]+$dataRow["Interest"]) * ($rate));
                    }
                }
            }
        }

        $phpSpreadsheetManager->MergeDataRow("G", $currencyRow);
        $phpSpreadsheetManager->MergeDataRows("R", $dataRows);
        $phpSpreadsheetManager->MergeDataRow("S", $subTotal);

        if($currency != $baseCurrency){
            $phpSpreadsheetManager->MergeDataRow("E", $equivalentTotal);
        }
        $phpSpreadsheetManager->PrintGroupInterval(array("G", "R", "S", "E"));

        // if($currency == "CNY")
        // break;
    }
    
    // $dataSet = array();
    // $dataSet["tablename"] = "timedeposittran";
    // $dataSet["table_schema"] = $depositResponseArray["table_schema"];
    // $dataSet["rows"] = $depositResponseArray["data"];
    // $phpSpreadsheetManager->MergeDataSet("R", $dataSet);

    $spreadsheet = $phpSpreadsheetManager->GetSpreadsheet();

    $spreadsheet->getProperties()
            ->setTitle("br01depositbalancesummary")
            ->setSubject("Deposit Balance Details Summary")
            ->setDescription(
                "Describe effective deposit as at date"
            );

    $worksheet = $spreadsheet->getActiveSheet();

    // $worksheet->getCell('B7')->setValue('John');
    // $worksheet->getCell('B61')->setValue('Smith');

    $phpSpreadsheetManager->SetSpreadsheet($spreadsheet);
    $responseArray = $phpSpreadsheetManager->Save($fileFormat);
    $responseArray["data"][0] = $responseArray["filename"];
    $responseArray["data"][1] = $responseArray["FileAsBase64"];
    
    // $writer = new Xlsx($spreadsheet);
    // $writer->save(__DIR__.'/../temp/export/hello world.xlsx');
			
	return $responseArray;
}
function GetExchangeRate($asAtDate, $exchangeToCurrency){
    $responseArray = Core::CreateResponseArray();
	$exchangeRateManager = new ExchangeRateManager();
    $responseArray = $exchangeRateManager->GetExchangeRate($asAtDate);
    return $responseArray["data"];
}

function GetData($requestData){
	$currencyManager = new CurrencyEntityManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $currencyManager->selectPage($offsetRecords);
    
	return $responseArray;

}

?>