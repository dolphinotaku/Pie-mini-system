<?php

require_once '../vendor/autoload.php';
	
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
	$min = "*";
	$hour = "*";
	$dayOfMonth = "*";
	$month = "*";
	$dayOfWeek = "*";
	$weekDayMapList = array("Sun"=>0,"Mon"=>1,"Tue"=>2,"Wed"=>3,"Thu"=>4,"Fri"=>5,"Sat"=>6);
		
	$cronExpression = "$min $hour $dayOfMonth $month $dayOfWeek";
    
    $min = date('i');
    $hour = date('H');
    
    
    $now = DateTime::createFromFormat('Y-m-d H:i:s', "2019-02-13 22:00:00");
    
    $min = $now->format('i');
    $hour = $now->format('H');
    
	//$cronExpression = "$min $hour */15 1 2-5";
    
    $cronExpression = "$min $hour 1/2 * *";
	
	$cronExpression = "0 12 ? * 7L";
	
    //$now = date("Y-m-d H:i:s");
    
	$cron = Cron\CronExpression::factory($cronExpression);
	//$nextRunDate = $cron->getNextRunDate($now);//->format('Y-m-d H:i:s');
		
    print_r("cron expression:");
    print_r("<br>");
    print_r($cronExpression);
    print_r("<br>");
    print_r("now is:");
    print_r("<br>");
    print_r($now->format('Y-m-d H:i:s'));
    print_r("<br>");
	//print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));  

    
	$nextRunDate = $cron->getNextRunDate($now, 0);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));
    
	$nextRunDate = $cron->getNextRunDate($now, 1);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));
    
	$nextRunDate = $cron->getNextRunDate($now, 2);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));
    
	$nextRunDate = $cron->getNextRunDate($now, 3);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));
    
	$nextRunDate = $cron->getNextRunDate($now, 4);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));
    
	$nextRunDate = $cron->getNextRunDate($now, 5);
    print_r("<br>");
	print_r($nextRunDate->format('Y-m-d H:i:s')." weekday ".$nextRunDate->format('N'));


    print_r("<br>");
$sDate = new DateTime();$sDate->setDate(2019, 3,1);
//$nextMonthDate = DateTime::createFromFormat('d', 1);
$nextMonthDate = clone $sDate;
$nextMonthDate->add(new DateInterval('P1M'));
for($dateI = $sDate; $dateI < $nextMonthDate; $dateI->add(new DateInterval('P1D'))){
	$weekIn = getWeeks($dateI->format('Y-m-d'), $dateI->format('l'));
	/*
    print_r("<br>");
	print_r($dateI->format('l'));
    print_r("<br>");
	*/
	print_r("date:".$dateI->format('Y-m-d H:i:s')." week no.:$weekIn");
    print_r("<br>");
}

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

function weekOfMonth($date) {
    //Get the first day of the month.
    $firstOfMonth = strtotime(date("Y-m-01", $date));
    //Apply above formula.
    return intval(date("W", $date)) - intval(date("W", $firstOfMonth)) + 1;
}
?>