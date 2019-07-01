<?php
class BankAccountManager extends DatabaseManager {
    protected $_ = array(
		// this Array structure By Initialize()
        // 'columnName1' => value,
        // 'columnName2' => value,
    );
	
	protected $table = "bankaccount";
    
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
	
	function delete(){
		$bankAccountCurrencyManager = new BankAccountCurrencyManager();
	
		$sql_str = "DELETE FROM `$bankAccountCurrencyManager->table` ";
		$sql_str .= "WHERE ";
		$sql_str .= "bankAccountID = $this->BankAccountID ";
		
		$responseArray = parent::delete();
		
		$deleteChildResponseArray = $bankAccountCurrencyManager->runSQL($sql_str);
		return $responseArray;
	}
}

?>