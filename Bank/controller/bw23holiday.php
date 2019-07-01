<?php

function GetTableStructure(){
	$holidayManager = new HolidayManager();
    return $holidayManager->selectPrimaryKeyList();
}

function FindData($requestData){
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
	$holidayManager = new HolidayManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $holidayManager->selectPage($offsetRecords);
	
	
	$sql_str = sprintf("SELECT * FROM %s ORDER BY `CalendarYear` DESC, `HolidayDate` ASC LIMIT %s OFFSET %s",
			$holidayManager->table,
			10,
			$offsetRecords);

			
	$responseArray = $holidayManager->runSQL($sql_str);

	return $responseArray;

}

?>