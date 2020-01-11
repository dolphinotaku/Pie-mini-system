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
    $responseArray = Core::CreateResponseArray();

	$effectiveFromStr = $requestData->InquiryCriteria->EffectiveFrom;
    $effectiveFrom = date('Y-m-d', strtotime($effectiveFromStr));
	$effectiveToStr = $requestData->InquiryCriteria->EffectiveTo;
    $effectiveTo = date('Y-m-d', strtotime($effectiveToStr));
    
	$effectiveCurrency = $requestData->InquiryCriteria->EffectiveCurrency;
	$fileFormat = $requestData->InquiryCriteria->ExportFileTypeAs;
    
    // sql select data
    $timeDepositManager = new TimeDepositTranManager();
    
    
    $sql_str = "SELECT PrincipalCurrency";
    $sql_str .= " FROM `timedeposittran`";
	$sql_str .= " WHERE AdjustedMaturityDate >= '$effectiveFrom'";
	$sql_str .= " AND AdjustedMaturityDate <= '$effectiveTo'";
    if(!empty($effectiveCurrency)){
        $sql_str .= " AND PrincipalCurrency = '$effectiveCurrency' ";
    }
	$sql_str .= " GROUP BY PrincipalCurrency ";
	$sql_str .= " ORDER BY PrincipalCurrency ASC ";
    $currencyGroupResponseArray = $timeDepositManager->runSQL($sql_str);
    /*
    SELECT PrincipalCurrency 
    FROM `timedeposittran` 
    WHERE AdjustedMaturityDate >= '2019-07-01'
    AND AdjustedMaturityDate <= '2019-08-31'
    AND AdjustedMaturityDate >= '2019-07-28' 
    GROUP BY PrincipalCurrency 
    ORDER BY PrincipalCurrency ASC
    */
    if($currencyGroupResponseArray["num_rows"] == 0){
        $responseArray["data"][0] = "";
        $responseArray["data"][1] = "";
        $responseArray["access_status"] = "Error";
        $responseArray["processed_message"] = array("No deposit matured during the period from $effectiveFrom to $effectiveTo.");
        
        return $responseArray;
    }
    
    $sql_str = "SELECT *";
    $sql_str .= " FROM `timedeposittran`";
	$sql_str .= " WHERE AdjustedMaturityDate >= '$effectiveFrom'";
	$sql_str .= " AND AdjustedMaturityDate <= '$effectiveTo'";
    if(!empty($effectiveCurrency)){
        $sql_str .= " AND PrincipalCurrency = '$effectiveCurrency' ";
    }
	$sql_str .= " ORDER BY PrincipalCurrency ASC, AdjustedMaturityDate ASC ";
    // $sql_str .= " Limit 1 ";
    // e.g
    /*
    SELECT *
     FROM `timedeposittran`
      WHERE AdjustedMaturityDate >= '2019-07-01'
      AND AdjustedMaturityDate <= '2019-08-31'
      ORDER BY PrincipalCurrency ASC, AdjustedMaturityDate ASC
    */
	
    $depositResponseArray = $timeDepositManager->runSQL($sql_str);
    
    // $responseArrayExchangeRate = GetExchangeRate($effectiveTo, $baseCurrency);

    // initialize PhpSpreadsheet
    $phpSpreadsheetManager = new PhpSpreadsheetManager("br03matureddeposit.xlsx");
    $phpSpreadsheetManager->Initialize();

    $phpSpreadsheetManager->MergeDataRow("H", array(
        "EffectiveFrom"=>$effectiveFrom,
        "EffectiveTo"=>$effectiveTo));

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
        // $equivalentTotal = array(
        //     "BaseCurrency"=>$baseCurrency,
        //     "EquivalentPrincipal"=>0,
        //     "EquivalentInterest"=>0,
        //     "EquivalentPI"=>0
        // );

        // calculate sub total
        foreach($dataRows as $rowIndex => $dataRow){
            $subTotal["SubTotalPrincipal"] += $dataRow["Principal"];
            $subTotal["SubTotalInterest"] += $dataRow["Interest"];
            $subTotal["SubTotalPI"] += ($dataRow["Principal"]+$dataRow["Interest"]);
            $dataRows[$rowIndex]["DepositRate"] = $dataRow["DepositRate"]/100;
        }

        // calculate equivalent value
        // if($currency != $baseCurrency){
        //     foreach($dataRows as $rowIndex => $dataRow){
        //         foreach($responseArrayExchangeRate as $forexRowIndex => $forexRow){

        //             if($forexRow["OutCurrencyID"] == $currency && $forexRow["InCurrencyID"] == $baseCurrency){
        //                 $rate = $forexRow["Rate"];

        //                 $equivalentTotal["EquivalentPrincipal"] += ($dataRow["Principal"] * $rate);
        //                 $equivalentTotal["EquivalentInterest"] += ($dataRow["Interest"] * $rate);
        //                 $equivalentTotal["EquivalentPI"] += (($dataRow["Principal"]+$dataRow["Interest"]) * ($rate));
        //             }
        //         }
        //     }
        // }

        $phpSpreadsheetManager->MergeDataRow("G", $currencyRow);
        $phpSpreadsheetManager->MergeDataRows("R", $dataRows);
        $phpSpreadsheetManager->MergeDataRow("S", $subTotal);

        // if($currency != $baseCurrency){
        //     $phpSpreadsheetManager->MergeDataRow("E", $equivalentTotal);
        // }
        $phpSpreadsheetManager->PrintGroupInterval(array("G", "R", "S"));

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
            ->setTitle("br03matureddeposit")
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