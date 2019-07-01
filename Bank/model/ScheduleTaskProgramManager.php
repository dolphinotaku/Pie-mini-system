<?php

class ScheduleTaskProgramManager extends DatabaseManager {
    protected $_ = array();
	
	protected $table = "scheduletaskprogram";
    
    function __construct() {
		parent::__construct();
    }
    
	function SetDefaultValue(){
		parent::setDefaultValue();
	}
    
    function __isset($name) {
        return isset($this->_[$name]);
    }
}

?>