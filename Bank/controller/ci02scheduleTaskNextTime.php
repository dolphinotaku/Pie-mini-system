<?php

function GetTableStructure(){
	$scheduleTaskManager = new ScheduleTaskManager();
    return $scheduleTaskManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	$responseArray = Core::CreateResponseArray();
    
    $searchRows = new stdClass();
    $searchRows = $requestData->InquiryRecord;
    foreach ($searchRows as $columnName => $value) {
        $scheduleTaskManager->$columnName = $value;
    }
    // must assign the record details for the calculation before call CalculateScheduleTaskNextRunTimeList()
    $nextRunDateList = $scheduleTaskManager->CalculateScheduleTaskNextRunTimeList();
	
	$responseArray["data"]["record"] = $scheduleTaskManager->_;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";
	
	$responseArray["CronExpression"] = $scheduleTaskManager->CronExpression;
    $responseArray["NextDateList"] = $nextRunDateList;
    
	$responseArray["data"]["nextDateList"] = $nextRunDateList;
	
	return $responseArray;
}

function GetData($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	$offsetRecords = 0;
	$offsetRecords = $requestData->Offset;
	$pageNum = $requestData->PageNum;

	$responseArray = $scheduleTaskManager->selectPage($offsetRecords);
	
	return $responseArray;

}

// Week of the month = Week of the year - Week of the year of first day of month + 1
// https://stackoverflow.com/questions/32615861/get-week-number-in-month-from-date-in-php
function weekOfMonth($date) {
    //Get the first day of the month.
    $firstOfMonth = strtotime(date("Y-m-01", $date));
    //Apply above formula.
    return intval(date("W", $date)) - intval(date("W", $firstOfMonth)) + 1;
}

// https://stackoverflow.com/questions/5853380/php-get-number-of-week-for-month
/**
 * Returns the amount of weeks into the month a date is
 * @param $date a YYYY-MM-DD formatted date
 * @param $rollover The day on which the week rolls over
 */
function getWeeks($date, $rollover)
{
	$cut = substr($date, 0, 8);
	$daylen = 86400;

	$timestamp = strtotime($date);
	$first = strtotime($cut . "00");
	$elapsed = ($timestamp - $first) / $daylen;

	$weeks = 0;

	for ($i = 1; $i <= $elapsed; $i++)
	{
		$dayfind = $cut . (strlen($i) < 2 ? '0' . $i : $i);
		$daytimestamp = strtotime($dayfind);

		$day = strtolower(date("l", $daytimestamp));

		if($day == strtolower($rollover))  $weeks ++;
	}

	return $weeks;
}

?>