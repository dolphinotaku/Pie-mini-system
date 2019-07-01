<?php

require_once("../model/Core.php");
require_once '../config/config.php';
require_once("../model/DatabaseManager.php");
require_once("../model/HolidayManager.php");

$holidayManager = new HolidayManager();

$holidayManager->CalendarYear = 2014;
print_r($holidayManager->_);

?>