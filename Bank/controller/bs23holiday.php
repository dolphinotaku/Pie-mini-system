<?php

function GetTableStructure(){
	$holidayManager = new HolidayManager();
    
    return $holidayManager->selectPrimaryKeyList();
}

function CreateData($requestData){
	$responseArray = Core::CreateResponseArray();
	$holidayManager = new HolidayManager();
	$checkHolidayManager = new HolidayManager();
    
	$createRows = new stdClass();
	$createRows = $requestData->Data->Header;
	foreach ($createRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$holidayManager->$columnName = $value;
        }

    }
    
        // check 'Holiday Date' not allows duplicated with same the holiday 'Type'
        $checkHolidayManager->Initialize();
        $checkHolidayManager->HolidayDate = $holidayManager->HolidayDate;
        $checkHolidayManager->Type = $holidayManager->Type;
        
        $checkResponseArray = $checkHolidayManager->select();
        if($checkResponseArray["num_rows"]>0){
            $responseArray["error"] = "Duplicated Holiday Date with the $holidayManager->Type holiday Type";
        }else{
            $responseArray = $holidayManager->insert();
        }
	return $responseArray;
}

function FindData($requestData){
	$responseArray = array();
	$holidayManager = new HolidayManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
    
	foreach ($updateRows as $keyIndex => $rowItem) {
        foreach ($rowItem as $columnName => $value) {
            $holidayManager->$columnName = $value;
        }
        $responseArray = $holidayManager->select();
        break;
    }
    
	return $responseArray;
}

function GetData($requestData){
	$responseArray = array();
	$holidayManager = new HolidayManager();
    
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $holidayManager->selectPage($offsetRecords);
    
	return $responseArray;

}

function UpdateData($requestData){
	$responseArray = array();
	$holidayManager = new HolidayManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->Data->Header;
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$holidayManager->$columnName = $value;
		}
		$responseArray = $holidayManager->update();

	}
	return $responseArray;
}

function DeleteData($requestData){
	$responseArray = array();
	$holidayManager = new HolidayManager();

	$deleteRows = new stdClass();
	$deleteRows = $requestData->Data->Header;
	foreach ($deleteRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$holidayManager->$columnName = $value;
		}
		$responseArray = $holidayManager->delete();

	}
	return $responseArray;
}


?>