<?php

require_once '../vendor/autoload.php';

class ScheduleTaskManager extends DatabaseManager {
    protected $_ = array();
	
	protected $table = "scheduletask";
    
    function __construct() {
		parent::__construct();
    }
    
	function SetDefaultValue(){
		parent::setDefaultValue();
	}
    
    function __isset($name) {
        return isset($this->_[$name]);
    }

    function CalculateScheduleTaskNextRunTimeList(){
        // validation
        // if record information not complete, return empty list
        
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
        
        // 20190626, see the handling with this datetime
        // 20190214, this will break the monthly "Ordinal of weekday" calculation in terms of week
        $activityStartDate = DateTime::createFromFormat('Y-m-d H:i:s', str_replace("'","",$this->ActivityStartDate));
        // 20190213, if activityStartDate earlier than now, use now for nextRunDate calculation
        // if($activityStartDate <= new DateTime()){
        //     $activityStartDate = new DateTime();
        // }
        // End.20190213
        // End.20190214
        $dayOfMonth = $activityStartDate->format('d');
        
        $_current_datetime = new DateTime();
        
        // merge the cron expression according to the FreqType
        $taskStatus = $this->Status;
        $freqType = $this->FreqType;
        $endConditionType = $this->EndConditionType;
        $endOnSpecifyDate = DateTime::createFromFormat('Y-m-d H:i:s', str_replace("'","",$this->EndOnSpecifyDate));
        
        $taskStatus = trim($taskStatus, "'");
        $freqType = trim($freqType, "'");
        $endConditionType = trim($endConditionType, "'");
        
        // 20190626, fixed: the calculated next day still earlier than current datetime
        switch($freqType){
            case "Once":
                if($activityStartDate <= $_current_datetime){
                    // $activityStartDate = $_current_datetime;
                    // 20190627, fixed: don't overwrite the time
                    $activityStartDate = $activityStartDate->setDate(
                        (int)$_current_datetime->format("Y"),
                        (int)$_current_datetime->format("m"),
                        (int)$_current_datetime->format("d")
                        );
                }
            break;
            case "Weekly":
                if($activityStartDate <= $_current_datetime){
                    // $activityStartDate = $_current_datetime;
                    // 20190627, fixed: don't overwrite the time
                    $activityStartDate = $activityStartDate->setDate(
                        (int)$_current_datetime->format("Y"),
                        (int)$_current_datetime->format("m"),
                        (int)$_current_datetime->format("d")
                        );
                }
            break;
            case "Weekly":
                if($activityStartDate <= $_current_datetime){
                    // $activityStartDate = $_current_datetime;
                    // 20190627, fixed: don't overwrite the time
                    $activityStartDate = $activityStartDate->setDate(
                        (int)$_current_datetime->format("Y"),
                        (int)$_current_datetime->format("m"),
                        (int)$_current_datetime->format("d")
                        );
                }
            break;
        }

        switch($freqType){
            case "Once":
            break;
            case "Daily":
                $cron_min = $activityStartDate->format('i');
                $cron_hour = $activityStartDate->format('H');
                $cron_dayOfMonth = $dayOfMonth."/".$this->FreqRepeatEvery;
            break;
            case"Weekly":

                $cron_min = $activityStartDate->format('i');
                $cron_hour = $activityStartDate->format('H');
                //$cron_dayOfMonth = $dayOfMonth."/14";
                $cron_dayOfMonth = "*/1";
                $cron_dayOfWeek = "";
                
                $weekDaysList = explode(",", str_replace("'","",$this->FreqInterval));
                foreach ($weekDaysList as $index => $weekDay) {
                    $cron_dayOfWeek.= $cron_weekDayMapList[$weekDay].",";
                }
                $cron_dayOfWeek = trim($cron_dayOfWeek, ',');
            break;
            case"Monthly":
                $cron_min = $activityStartDate->format('i');
                $cron_hour = $activityStartDate->format('H');
                
                $freqInterval = $this->FreqInterval;
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
                array_push($nextRunDateList, $activityStartDate->format('Y-m-d H:i:s'));
            }
            else{
                $isContinueFindNextDay = true;
                $validNextDayCount = 0;
                $nth = 0;
                try{
                    $cron = Cron\CronExpression::factory($cronExpression);
                    do{
                        $nextRunDate = $cron->getNextRunDate(
                            $activityStartDate,
                            $nth);
                        //if($nextRunDate <= $_current_datetime){
                        //}
                        //else{
                            if(strcasecmp($endConditionType, "Never") == 0){
                                if($validNextDayCount >= 10){
                                    $isContinueFindNextDay = false;
                                }
                            }else if(strcasecmp($endConditionType, "On") == 0){
                                if($nextRunDate > $endOnSpecifyDate){
                                    $isContinueFindNextDay = false;
                                }else if($nextRunDate > $_current_datetime){
                                    $isContinueFindNextDay = false;
                                }
                            }else if(strcasecmp($endConditionType, "After Occurred") == 0){
                                if(count($nextRunDateList) >= $this->EndOnSpecifyTimeOccurred){
                                    $isContinueFindNextDay = false;
                                }
                            }else{
                                // error handling if endConditionType not passed
                                if($validNextDayCount >= 10){
                                    $isContinueFindNextDay = false;
                                }
                            }
                        //}
                        
                        if($isContinueFindNextDay){
                            // 20190626
                            if($nextRunDate >= $_current_datetime){
                                // set nextRunDate time as the time of Activity Start Date
                                // $nextRunDate = $nextRunDate->setTime((int)$activityStartDate->format('H'), (int)$activityStartDate->format('i'), 0);
                                array_push($nextRunDateList, $nextRunDate->format('Y-m-d H:i:s'));
                                $validNextDayCount++;
                            }
                            // 20190626.End
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
            $this->NextExecuteDate = $nextRunDateList[0];
        }else{
            $this->NextExecuteDate = null;
        }
        
        $this->CronExpression = $cronExpression;

        return $nextRunDateList;
    }
	
	function delete(){
		$scheduleTaskProgramManager = new ScheduleTaskProgramManager();
	
		$sql_str = "DELETE FROM `$scheduleTaskProgramManager->table` ";
		$sql_str .= "WHERE ";
		$sql_str .= "scheduleID = $this->ScheduleID ";
		
		$responseArray = parent::delete();
		
		$deleteChildResponseArray = $scheduleTaskProgramManager->runSQL($sql_str);
		return $responseArray;
	}
}

?>