<?php

function GetTableStructure(){
	$scheduleProgramManager = new ScheduleProgramManager();
    return $scheduleProgramManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	$filename = "schedulable_program_list.php";
	require_once(__DIR__."/../config/$filename");
	
	$responseArray = GetAllData($requestData);
	$installedScheduleProgramData = $responseArray["data"];
	$schedulableProgramList = GetSchedulableProgramList();
    $uninstalledScheduleProgramData = array();
    
    $allSchedulableProgramInfo = array();

	foreach($schedulableProgramList as $prgmIndex => $prgmItem ){
        $isPrgmInstalled = false;
        $arrayElement = array();
		foreach($installedScheduleProgramData as $rowIndex => $rowItem ){
			if($rowItem["ProgramID"] == $prgmItem["ProgramID"]){
                $isPrgmInstalled = true;
                $arrayElement = $rowItem;
                $arrayElement["Status"] = "Enabled";
				break;
			}
		}
		if(!$isPrgmInstalled){
            $arrayElement = new ArrayObject($prgmItem);
            $arrayElement["Status"] = "Disabled";
		}
        array_push($allSchedulableProgramInfo, $arrayElement);
	}
	
    $responseArray["data"] = $allSchedulableProgramInfo;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    
	return $responseArray;
}

function ProcessData($requestData){
	$responseArray = Core::CreateResponseArray();
    $scheduleProgramManager = new ScheduleProgramManager();

    $actionType = $requestData->ProcessData->CriteriaData->Action;

    if($actionType == "InstallOrUninstall"){
        $responseArray = InstallOrUninstall($requestData);
    }else if($actionType == ""){
        $responseArray = InstallOrUninstall($requestData);
    }
    
	$prgmRows = new stdClass();
    $prgmRows = $requestData->ProcessData->ProcessRecord;

    $isInstall = "Disabled";
    
	foreach ($prgmRows as $keyIndex => $rowItem) {
        // if install
        $isInstall = $rowItem->Status == "Enabled";
        foreach ($rowItem as $columnName => $value) {
            $scheduleProgramManager->$columnName = $value;
        }
        $responseArray = $scheduleProgramManager->select();
        
        if($isInstall){
            require_once(__DIR__."/$rowItem->ProgramID.php");
            $scheduleProgramManager->Description = GetDescription();
            $scheduleProgramManager->AvailableParameterJSON = GetAvailableParameterData();
            $scheduleProgramManager->ParameterSeedID = GenerateRandomString();
            // if install and record not found
            if($responseArray["num_rows"] == 0){
                $responseArray = $scheduleProgramManager->insert();
            }else{
                $responseArray = $scheduleProgramManager->update();
            }
        }else{
            $responseArray = $scheduleProgramManager->delete();
        }
        break;
    }
    
    $affectedRecord = array($scheduleProgramManager->_);
    $affectedRecord[0]["Status"] = $isInstall ? "Enabled" : "Disabled";
    $responseArray["data"] = $affectedRecord;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    // $responseArray["access_status"] = "OK";
	
	return $responseArray;
}

function GenerateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function InstallOrUninstall($requestData){

}

function GetProgramDetails($requestData){

}

function FindData($requestData){
	$scheduleProgramManager = new ScheduleProgramManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $scheduleProgramManager->$columnName = $value;
        }
        $responseArray = $scheduleProgramManager->select();
        break;
    }
    
	return $responseArray;
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

function GetData($requestData){
	$scheduleProgramManager = new ScheduleProgramManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleProgramManager->selectPage($offsetRecords);
	
	return $responseArray;

}
function GetAllData($requestData){
	$scheduleProgramManager = new ScheduleProgramManager();

	$responseArray = $scheduleProgramManager->select();
	
	return $responseArray;

}

?>