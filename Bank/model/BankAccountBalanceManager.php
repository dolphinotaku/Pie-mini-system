<?php
// require_once 'DatabaseManager.php';

class BankAccountBalanceManager extends DatabaseManager {
    protected $_ = array(
		// this Array structure By Initialize()
        // 'columnName1' => value,
        // 'columnName2' => value,
    );
	
	protected $table = "bankaccountbalance";
    
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
    
    public function GetSavingRecords($startDate, $exchangeToCurrency){
        $responseArray = Core::CreateResponseArray();
        
        // select foreign currency saving record with exchange rate
        $sql_str = "SELECT ";
        $sql_str .= "bAcB.BankAccountBalanceID, ";
        $sql_str .= "bAc.BankCode, b.BankChineseName, b.BankEnglishName, ";
        $sql_str .= "bAc.FullAccountCodeWithDash, bAcC.AlphabeticCode, bAcB.AvailableBalance, ";
        $sql_str .= "e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, ";
        $sql_str .= "bAcB.EffectiveDate ";
        $sql_str .= "FROM ";
        $sql_str .= "`bankaccountbalance` bAcB, ";
        $sql_str .= "`bankaccountcurrency` bAcC, `bankaccount` bAc, `bank` b, ";
        $sql_str .= "`exchangerate` e ";
        $sql_str .= "WHERE ";
        $sql_str .= "bAc.BankCode = b.BankCode ";
        $sql_str .= "AND bAcB.EffectiveDate >= '$startDate' ";
        $sql_str .= "AND bAcC.AlphabeticCode <> '$exchangeToCurrency' ";
        $sql_str .= "AND e.OutCurrencyID <> '$exchangeToCurrency' ";
        $sql_str .= "AND bAc.BankAccountID = bAcC.BankAccountID ";
        $sql_str .= "AND bAcB.BankAccountCurrencyID = bAcC.BankAccountCurrencyID ";
        $sql_str .= "AND e.OutCurrencyID = bAcC.AlphabeticCode ";
        $sql_str .= "AND e.EffectiveDate = ( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '$startDate' ORDER BY sub_e.EffectiveDate DESC Limit 1 ) ";
        $sql_str .= "ORDER by bAcB.BankAccountBalanceID ASC, bAcB.EffectiveDate ASC";
        
        // e.g
        /*
        SELECT 
        bAcB.BankAccountBalanceID, 
        bAc.BankCode, b.BankChineseName, b.BankEnglishName, 
        bAc.FullAccountCodeWithDash, bAcC.AlphabeticCode, bAcB.AvailableBalance, 
        e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, 
        bAcB.EffectiveDate 
        FROM 
        `bankaccountbalance` bAcB, 
        `bankaccountcurrency` bAcC, `bankaccount` bAc, `bank` b, 
        `exchangerate` e 
        WHERE 
        bAc.BankCode = b.BankCode 
        AND bAcB.EffectiveDate >= '$startDate' 
        AND bAc.BankAccountID = bAcC.BankAccountID 
        AND bAcB.BankAccountCurrencyID = bAcC.BankAccountCurrencyID 
        AND e.OutCurrencyID = bAcC.AlphabeticCode 
        AND e.EffectiveDate = ( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '2018-03-01 11:06:43' ORDER BY sub_e.EffectiveDate DESC Limit 1 ) 
        ORDER by bAcB.BankAccountBalanceID ASC, bAcB.EffectiveDate ASC
        */
        $foreignCurrencyArray = $this->runSQL($sql_str);
        
        //print_r($foreignCurrencyArray);
        
        $sql_str = "SELECT ";
        $sql_str .= "bAcB.BankAccountBalanceID, ";
        $sql_str .= "bAc.BankCode, b.BankChineseName, b.BankEnglishName, ";
        $sql_str .= "bAc.FullAccountCodeWithDash, bAcC.AlphabeticCode, bAcB.AvailableBalance, ";
        $sql_str .= "1 as `Rate`, ";
        $sql_str .= "bAcB.EffectiveDate ";
        $sql_str .= "FROM ";
        $sql_str .= "`bankaccountbalance` bAcB, ";
        $sql_str .= "`bankaccountcurrency` bAcC, `bankaccount` bAc, `bank` b ";
        $sql_str .= "WHERE ";
        $sql_str .= "bAc.BankCode = b.BankCode ";
        $sql_str .= "AND bAcB.EffectiveDate >= '$startDate' ";
        $sql_str .= "AND bAcC.AlphabeticCode = '$exchangeToCurrency' ";
        $sql_str .= "AND bAc.BankAccountID = bAcC.BankAccountID ";
        $sql_str .= "AND bAcB.BankAccountCurrencyID = bAcC.BankAccountCurrencyID ";
        $sql_str .= "ORDER by bAcB.BankAccountBalanceID ASC, bAcB.EffectiveDate ASC";
        
        $localCurrencyArray = $this->runSQL($sql_str);
        
        //print_r($localCurrencyArray);
        
        $responseArray = $foreignCurrencyArray;
        
        if($localCurrencyArray["access_status"] == "OK"){
            $responseArray["affected_rows"] += $localCurrencyArray["affected_rows"];
            $responseArray["num_rows"] += $localCurrencyArray["num_rows"];
            foreach($localCurrencyArray["data"] as $index=>$row) {
                array_push($responseArray["data"], $row);
            }
        }
		
        return $responseArray;
    }

    public function GetLatestEffectiveSavingRecords($asAtDate = "", $exchangeToCurrency = "HKD"){
        $bankAccountCurrencyList = array();
        $bankAccountBalanceList = array();

        $sql_str = "SELECT ";
        $sql_str .= "b.BankChineseName, b.BankEnglishName, ";
        $sql_str .= "BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName, bACcurrency.Status ";
        $sql_str .= "FROM ";
        $sql_str .= "`bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c ";
        $sql_str .= "WHERE ";
        $sql_str .= "b.BankCode = bAC.BankCode ";
        $sql_str .= "AND bAC.BankAccountID = bACcurrency.BankAccountID ";
        $sql_str .= "AND bACcurrency.AlphabeticCode = c.AlphabeticCode ";
        $sql_str .= "AND bACcurrency.Status = 'Enabled'";
        $sql_str .= "ORDER BY c.AlphabeticCode";
        // e.g
        /*
        SELECT b.BankChineseName, b.BankEnglishName, BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName, bACcurrency.Status 
            FROM 
            `bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c 
            where 
            b.BankCode = bAC.BankCode
            AND bAC.BankAccountID = bACcurrency.BankAccountID 
            AND bACcurrency.AlphabeticCode = c.AlphabeticCode 
            AND bACcurrency.Status = 'Enabled' 
            ORDER BY c.AlphabeticCode
        */

        $responseArray = $this->runSQL($sql_str);

        foreach($responseArray["data"] as $keyIndex => $rowItem){
            array_push($bankAccountCurrencyList, $rowItem["BankAccountCurrencyID"]);
        }
        foreach($bankAccountCurrencyList as $arrayIndex => $bankAcCurrency_id){

            $sql_str = "SELECT ";
            $sql_str .= "t1view1.*, ";
            $sql_str .= "b.BankChineseName, b.BankEnglishName, ";
            $sql_str .= "bACcurrency.BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName ";
            // $sql_str .= ",e.Rate, (t1view1.AvailableBalance * e.Rate) as `LocalValue`";
            $sql_str .= "FROM ";
            $sql_str .= "`bankaccountbalance` t1view1, ";
            $sql_str .= "`bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c ";
            // $sql_str .= ",`exchangerate` e ";
            $sql_str .= "WHERE ";
            $sql_str .= "b.BankCode = bAC.BankCode ";
            $sql_str .= "AND t1view1.BankAccountCurrencyID = $bankAcCurrency_id ";
            $sql_str .= "AND t1view1.BankAccountCurrencyID = bACcurrency.BankAccountCurrencyID ";
            $sql_str .= "AND bAC.BankAccountID = bACcurrency.BankAccountID ";
            $sql_str .= "AND bACcurrency.AlphabeticCode = c.AlphabeticCode ";
            $sql_str .= "AND bACcurrency.Status = 'Enabled' ";
            // $sql_str .= "AND e.OutCurrencyID = bACcurrency.AlphabeticCode ";
            $sql_str .= "ORDER BY ";
            $sql_str .= "bACcurrency.BankAccountCurrencyID, EffectiveDate DESC ";
            $sql_str .= "LIMIT 1";
            // e.g
            /*
            SELECT 
            t1view1.*, 
            b.BankChineseName, b.BankEnglishName, bACcurrency.BankAccountCurrencyID, bAC.BankAccountID, bAC.BankCode, FullAccountCodeWithDash, c.AlphabeticCode, c.Name, c.ChineseName 
            FROM 
            `bankaccountbalance` t1view1, `bank` b, `bankaccount` bAC, `bankaccountcurrency` bACcurrency, `currency` c 
            WHERE 
            b.BankCode = bAC.BankCode 
            AND t1view1.BankAccountCurrencyID = 25 
            AND t1view1.BankAccountCurrencyID = bACcurrency.BankAccountCurrencyID 
            AND bAC.BankAccountID = bACcurrency.BankAccountID 
            AND bACcurrency.AlphabeticCode = c.AlphabeticCode 
            AND bACcurrency.Status = 'Enabled' 
            ORDER BY 
            bACcurrency.BankAccountCurrencyID, EffectiveDate DESC LIMIT 1
            */

            $responseArray = $this->runSQL($sql_str);
            array_push($bankAccountBalanceList, $responseArray["data"][0]);
        }
        $responseArray["data"] = $bankAccountBalanceList;
        
        $responseArray["num_rows"] = count($bankAccountCurrencyList);
        $responseArray["affected_rows"] = count($bankAccountCurrencyList);
        
        return $responseArray;
    }
}

?>