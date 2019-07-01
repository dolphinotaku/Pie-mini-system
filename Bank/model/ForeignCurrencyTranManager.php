<?php
class ForeignCurrencyTranManager extends DatabaseManager {
    protected $_ = array(
		// this Array structure By Initialize()
        // 'columnName1' => value,
        // 'columnName2' => value,
    );
	
	protected $table = "foreigncurrencytran";
    
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
    
    public function GetForeignCurrencyTran($asAtDate){
        $responseArray = Core::CreateResponseArray();
        
        $sql_str = "SELECT * ";
        $sql_str .= "FROM ";
        $sql_str .= "foreigncurrencytran forex ";
        $sql_str .= "WHERE ";
        $sql_str .= "LOWER(forex.Status) != 'archive' ";
        $sql_str .= "AND LOWER(forex.Purpose) = 'investment'";
        $sql_str .= "AND ExchangeDate <= '".$asAtDate."'";
        
        /*
        SELECT *
        FROM 
        foreigncurrencytran forex 
        WHERE 
        LOWER(forex.Status) != 'archive' 
        AND LOWER(forex.Purpose) = 'investment'
        AND ExchangeDate <= CURRENT_DATE
        */
        
        $responseArray = $this->runSQL($sql_str);
        
        return $responseArray;
    }
}

?>