<?php
class TranDAGEdgeManager extends DatabaseManager {
	
	protected $table = "trandagedge";
    
    function __construct() {
		parent::__construct();
        // parent::Initialize();
    }
    
	function SetDefaultValue(){
		parent::setDefaultValue();
	}
    
    function __isset($name) {
        return isset($this->_[$name]);
    }
}

?>