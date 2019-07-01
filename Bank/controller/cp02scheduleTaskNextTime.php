<?php

require_once '../vendor/autoload.php';

function GetTableStructure(){
	$scheduleTaskManager = new ScheduleTaskManager();
    return $scheduleTaskManager->selectPrimaryKeyList();
}

function InquiryData($requestData){
	return FindData($requestData);
}

function FindData($reuqestData){
	$responseArray = Core::CreateResponseArray();
	
	return $responseArray;
}

function FindNextExecuteDate($requestData){
	$scheduleTaskManager = new ScheduleTaskManager();
	
	$searchRows = new stdClass();
	$searchRows = $requestData->InquiryRecord;
	foreach ($searchRows as $columnName => $value) {
		$scheduleTaskManager->$columnName = $value;
    }
	
	// initialize cron parameters
	/*
		*    *    *    *    *
		-    -    -    -    -
		|    |    |    |    |
		|    |    |    |    |
		|    |    |    |    +----- day of week (0 - 7) (Sunday=0 or 7)
		|    |    |    +---------- month (1 - 12)
		|    |    +--------------- day of month (1 - 31)
		|    +-------------------- hour (0 - 23)
		+------------------------- min (0 - 59)
	*/	
	$cron_min = "*";
	$cron_hour = "*";
	$cron_dayOfMonth = "*";
	$cron_month = "*";
	$cron_dayOfWeek = "*";
	$cron_weekDayMapList = array("Sun"=>0,"Mon"=>1,"Tue"=>2,"Wed"=>3,"Thu"=>4,"Fri"=>5,"Sat"=>6);
	
	// 20190214, this will break the monthly "Ordinal of weekday" calculation in terms of week
	$activityStartDate = DateTime::createFromFormat('Y-m-d H:i:s', str_replace("'","",$scheduleTaskManager->ActivityStartDate));
	// 20190213, if activityStartDate earlier than now, use now for nextRunDate calculation
	/*
    if($activityStartDate <= new DateTime()){
        $activityStartDate = new DateTime();
    }
	*/
	// End.20190213
	// End.20190214
	$dayOfMonth = $activityStartDate->format('d');
	
	// merge the cron expression according to the FreqType
	$taskStatus = $scheduleTaskManager->Status;
	$freqType = $scheduleTaskManager->FreqType;
	$endConditionType = $scheduleTaskManager->EndConditionType;
	$endOnSpecifyDate = DateTime::createFromFormat('Y-m-d H:i:s', str_replace("'","",$scheduleTaskManager->EndOnSpecifyDate));
	
	$taskStatus = trim($taskStatus, "'");
	$freqType = trim($freqType, "'");
	$endConditionType = trim($endConditionType, "'");
	
	switch($freqType){
		case "Daily":
			$cron_min = $activityStartDate->format('i');
			$cron_hour = $activityStartDate->format('H');
			$cron_dayOfMonth = $dayOfMonth."/".$scheduleTaskManager->FreqRepeatEvery;
		break;
		case"Weekly":
			$cron_min = $activityStartDate->format('i');
			$cron_hour = $activityStartDate->format('H');
			//$cron_dayOfMonth = $dayOfMonth."/14";
			$cron_dayOfMonth = "*/1";
			$cron_dayOfWeek = "";
			
			$weekDaysList = explode(",", str_replace("'","",$scheduleTaskManager->FreqInterval));
			foreach ($weekDaysList as $index => $weekDay) {
				$cron_dayOfWeek.= $cron_weekDayMapList[$weekDay].",";
			}
			$cron_dayOfWeek = trim($cron_dayOfWeek, ',');
		break;
		case"Monthly":
			$cron_min = $activityStartDate->format('i');
			$cron_hour = $activityStartDate->format('H');
			
			$freqInterval = $scheduleTaskManager->FreqInterval;
			$freqInterval = trim($freqInterval, "'");
			if(strcasecmp($freqInterval, "Ordinal of nth day") == 0){
				$cron_dayOfMonth = $dayOfMonth;
			}else if(strcasecmp($freqInterval, "Ordinal of weekday") == 0){
				
				$firstDayOfMonthOfActivityStartDate = clone $activityStartDate;
				$firstDayOfMonthOfActivityStartDate->setDate($activityStartDate->format('Y'),$activityStartDate->format('m'),1);
				$responseArray["1st day of month:"] = $firstDayOfMonthOfActivityStartDate;
				$responseArray["1st day weekday:"] = $firstDayOfMonthOfActivityStartDate->format('l');
				$responseArray["activityStartDate:"] = $activityStartDate;
				$nth_week = getWeeks($activityStartDate->format('Y-m-d'), $firstDayOfMonthOfActivityStartDate->format('l'));
				$responseArray["nth_week:"] = $nth_week;
				$cron_dayOfMonth = "?";
				if($nth_week > 4){
					// Every month on the last [Mon|Wed|...]
					$cron_dayOfWeek = $activityStartDate->format('N')."L";
				}else{
					$cron_dayOfWeek = $activityStartDate->format('N')."#$nth_week";
				}
			}
			break;
	}
	
	$cronExpression = "$cron_min $cron_hour $cron_dayOfMonth $cron_month $cron_dayOfWeek";
	//$cronExpression = "0-0 0-0 5/2 * *";
	
	//print_r($cronExpression);
	//print_r($freqType);
	
	$nextRunDateList = array();
	if(strcasecmp($taskStatus, "Disabled") == 0){
		
	}else{
		if(strcasecmp($freqType, "Once") == 0){
			//$nextRunDateStr = $activityStartDate->format('Y-m-d H:i:s');
			array_push($nextRunDateList, $activityStartDate->format('Y-m-d H:i:s'));
		}
		else{
			$isContinueFindNextDay = true;
			$nth = 0;
			try{
				$cron = Cron\CronExpression::factory($cronExpression);
				do{
					$nextRunDate = $cron->getNextRunDate(
						$activityStartDate,
						$nth);
					//if($nextRunDate <= new DateTime()){
					//}
					//else{
						if(strcasecmp($endConditionType, "Never") == 0){
							if($nth >= 10){
								$isContinueFindNextDay = false;
							}
						}else if(strcasecmp($endConditionType, "On") == 0){
							if($nextRunDate > $endOnSpecifyDate){
								$isContinueFindNextDay = false;
							}else if($nextRunDate > new DateTime() && $nth >= 10){
								$isContinueFindNextDay = false;
							}
						}else if(strcasecmp($endConditionType, "After Occurred") == 0){
							if(count($nextRunDateList) >= $scheduleTaskManager->EndOnSpecifyTimeOccurred){
								$isContinueFindNextDay = false;
							}
						}else{
							// error handling if endConditionType not passed
							if($nth >= 10){
								$isContinueFindNextDay = false;
							}
						}
					//}
					
					if($isContinueFindNextDay){
						//$nextRunDateStr = $nextRunDate->format('Y-m-d H:i:s');
						array_push($nextRunDateList, $nextRunDate->format('Y-m-d H:i:s'));
					}
					
					$nth++;
				}while($isContinueFindNextDay);
			}catch(Exception $e){
				$responseArray["Cron Exception"] = $e;
			}
		}
	}
	
	// the library not support repeat every two week on Mon,Wed,Fri
	// only support repeat every week on Mon,Wed,Fri
	// or support repeat every 14 days on Mon,Wed,Fri
    /*
    if(strcasecmp($freqType, "Weekly") == 0){
        $isNextDayValid = false;
        $nth = 0;
        do{
            $nextRunDate = $cron->getNextRunDate(
                $activityStartDate,
                $nth)
                ->format('Y-m-d H:i:s');
            $nth++;
        }while($isNextDayValid);
    }
    */
	
	// if $nextRunDate < current datetime, find the next of the next
	
	if(count($nextRunDateList) > 0){
		$scheduleTaskManager->NextExecuteDate = $nextRunDateList[0];
	}else{
		$scheduleTaskManager->NextExecuteDate = null;
	}
	
	//$responseArray = $scheduleTaskManager->select();
	
	$responseArray = Core::CreateResponseArray();
	
	$responseArray["data"][0] = $scheduleTaskManager->_;
    $responseArray["num_rows"] = count($responseArray["data"]);
    $responseArray["affected_rows"] = $responseArray["num_rows"];
    $responseArray["access_status"] = "OK";
	
	$responseArray["CronExpression"] = $cronExpression;
	$responseArray["NextDateList"] = $nextRunDateList;
	
	return $responseArray;
}

function ProcessData($requestData){
	return InsertData($requestData);
}

function InsertData($requestData){
	$responseArray = array();
	$updateArray = array();
	$bankAccountBalanceManager = new BankAccountBalanceManager();

	$updateRows = new stdClass();
	$updateRows = $requestData->ProcessData->ProcessRecord;

	$effectiveDate = date('Y-m-d H:i:s');
	foreach ($updateRows as $keyIndex => $rowItem) {
		foreach ($rowItem as $columnName => $value) {
			$bankAccountBalanceManager->$columnName = $value;
		}
		$bankAccountBalanceManager->BankAccountBalanceID = NULL;
		$bankAccountBalanceManager->EffectiveDate = $effectiveDate;
		
		$responseArray = $bankAccountBalanceManager->insert();

	}
	// $responseArray = $bankAccountBalanceManager->CreateResponseArray();
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