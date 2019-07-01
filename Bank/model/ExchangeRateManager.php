<?php
// require_once 'DatabaseManager.php';

class ExchangeRateManager extends DatabaseManager {
    protected $_ = array(
		// this Array structure By Initialize()
        // 'columnName1' => value,
        // 'columnName2' => value,
    );
	
	protected $table = "exchangerate";
    
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

    public function insert(){
		$sql_str = "UPDATE `exchangerate` SET ";
		$sql_str .= " `IsEffective` = 'Disabled' ";
		$sql_str .= "WHERE `OutCurrencyID` = $this->OutCurrencyID AND ";
		$sql_str .= "`InCurrencyID` = $this->InCurrencyID AND ";
		$sql_str .= "`EffectiveDate` <= $this->EffectiveDate";
		$updateArray = $this->runSQL($sql_str);
		
        $responseArray = parent::insert();
        return $responseArray;
    }
    public function update($ignoreTheLastDateCheck = false){
		$sql_str = "UPDATE `exchangerate` SET ";
		$sql_str .= " `IsEffective` = 'Disabled' ";
		$sql_str .= "WHERE `OutCurrencyID` = $this->OutCurrencyID AND ";
		$sql_str .= "`InCurrencyID` = $this->InCurrencyID AND ";
		$sql_str .= "`EffectiveDate` <= $this->EffectiveDate";
		$updateArray = $this->runSQL($sql_str);
		
        $responseArray = parent::update();
        return $responseArray;
    }

    public function GetExchangeRate($asAtDate, $currencyArray = "ALL"){
        // $currencyArrayInStr = "SELECT AlphabeticCode FROM `currency` WHERE Status = 'Enabled'";
        $currencyArrayInStr = "";
        if(!is_array($currencyArray)){
            if($currencyArray == "ALL"){
                $currencyManager = new CurrencyManager();
                $currencyManager->Status = "Enabled";
                $responseArray = $currencyManager->select();
                $enabledCurrencyList = array();
                foreach ($responseArray["data"] as $key => $value) {
                    array_push($enabledCurrencyList, $value["AlphabeticCode"]);
                }
                $currencyArray = $enabledCurrencyList;
            }else{
                $currencyArray = array($currencyArray);
            }
        }
        foreach ($currencyArray as $key => $value) {
            $currencyArrayInStr .= "'$value',";
        }
        $currencyArrayInStr = substr_replace($currencyArrayInStr ,"",-1) ;
        
        
        $sql_str = "SELECT ";
        $sql_str .= "* ";
        $sql_str .= "FROM ";
        $sql_str .= "`exchangerate` eView1 ";
        $sql_str .= "WHERE ";
        $sql_str .= "eView1.OutCurrencyID in ($currencyArrayInStr) ";
        $sql_str .= "AND eView1.EffectiveDate <= '$asAtDate' ";
        $sql_str .= "AND eView1.EffectiveDate >= (SELECT MAX(EffectiveDate) FROM `exchangerate` WHERE `OutCurrencyID` = eView1.OutCurrencyID AND `InCurrencyID` = eView1.InCurrencyID ) ";
        $sql_str .= "ORDER BY eView1.OutCurrencyID ";
        // e.g
        /*
        SELECT * 
        FROM `exchangerate` eView1 
        WHERE eView1.OutCurrencyID in ('CNY','GBP','HKD','JPY','NZD') 
        AND eView1.EffectiveDate <= '2018-11-24' 
        AND eView1.EffectiveDate >= (SELECT MAX(EffectiveDate) FROM `exchangerate` WHERE `OutCurrencyID` = eView1.OutCurrencyID AND `InCurrencyID` = eView1.InCurrencyID ) 
        ORDER BY eView1.OutCurrencyID
        */

        $responseArray = $this->runSQL($sql_str);

        if($responseArray["num_rows"] == 0){
            $sql_str = "SELECT ";
            $sql_str .= "* ";
            $sql_str .= "FROM ";
            $sql_str .= "`exchangerate` eView1 ";
            $sql_str .= "WHERE ";
            $sql_str .= "eView1.OutCurrencyID in ($currencyArrayInStr) ";
            $sql_str .= "AND eView1.EffectiveDate >= '$asAtDate' ";
            $sql_str .= "AND eView1.EffectiveDate >= (SELECT MAX(EffectiveDate) FROM `exchangerate` WHERE `OutCurrencyID` = eView1.OutCurrencyID AND `InCurrencyID` = eView1.InCurrencyID ) ";
            $sql_str .= "ORDER BY eView1.OutCurrencyID ";
            $responseArray = $this->runSQL($sql_str);
        }

        return $responseArray;
    }
}

?>