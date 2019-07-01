<?php
// for the future
// the controller should be a class implements the schedulable interface
// use instanceof to detect which program are schedulable instead of reading this static file
// http://php.net/manual/en/internals2.opcodes.instanceof.php

function GetSchedulableProgramList(){
	$programList = array();
	
	//array_push($programList, array("ProgramID"=>"bt32exchangeRate", "Description"=>"Get exchange rate via API"));
	array_push($programList, array("ProgramID"=>"bt32exchangeRate"));
	array_push($programList, array("ProgramID"=>"bt32exchangeRateTestDataType"));
	array_push($programList, array("ProgramID"=>"bt32exchangeRateFixer.io"));
	
	return $programList;
}

?>