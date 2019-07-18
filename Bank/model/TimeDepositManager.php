<?php
// require_once 'DatabaseManager.php';

class TimeDepositTranManager extends DatabaseManager {
    protected $_ = array(
		// this Array structure By Initialize()
        // 'columnName1' => value,
        // 'columnName2' => value,
    );
	
	protected $table = "timedeposittran";
    
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
	
    // get un maturitied time deposit records with exchange rate informations
    public function GetTimeDepositFutureRecords($asAtDate, $exchangeToCurrency){
        $responseArray = Core::CreateResponseArray();
        
        // select foreign currency in time deposit
        /*
        $sql_str = "SELECT t.TimeDepositTranID, t.EffectiveDate as `TimeDeposit_EffectiveDate`, t.AdjustedMaturityDate, EXTRACT(YEAR_MONTH FROM t.AdjustedMaturityDate) as `AdjustedMaturityDateYearMonthStr`, t.PrincipalCurrency, t.Principal, t.Interest, e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, ((t.Interest + t.Principal) * e.Rate) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t, `exchangerate` e ";
        $sql_str .= "WHERE t.AdjustedMaturityDate >= '$asAtDate' AND e.OutCurrencyID = t.PrincipalCurrency ";
        $sql_str .= "AND t.PrincipalCurrency <> '$exchangeToCurrency' ";
        $sql_str .= "AND e.OutCurrencyID <> '$exchangeToCurrency' ";
        
        $sql_str .= "AND e.IsEffective = 'Enabled' ";
        $sql_str .= "AND e.EffectiveDate = ";
		$sql_str .= "( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '$asAtDate' ORDER BY sub_e.EffectiveDate DESC Limit 1 ) ";
        $sql_str .= "ORDER BY t.PrincipalCurrency ";
        */
        
        // e.g
        /*
        SELECT t.TimeDepositTranID,
        t.EffectiveDate as `TimeDeposit_EffectiveDate`, t.AdjustedMaturityDate, EXTRACT(YEAR_MONTH FROM t.AdjustedMaturityDate) as `AdjustedMaturityDateYearMonthStr`, t.PrincipalCurrency, t.Principal, t.Interest, e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, ((t.Interest + t.Principal) * e.Rate) as `LocalValue`
        FROM `timedeposittran` t, `exchangerate` e
        WHERE t.AdjustedMaturityDate >= '2019-05-26 01:56:02' 
        AND e.OutCurrencyID = t.PrincipalCurrency 
        AND t.PrincipalCurrency <> 'HKD' 
        AND e.OutCurrencyID <> 'HKD' 
        AND e.IsEffective = 'Enabled' 
        --AND e.EffectiveDate = ( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '2019-05-26 01:56:02' ORDER BY sub_e.EffectiveDate DESC Limit 1 )
        ORDER BY t.PrincipalCurrency 
        */
        
        // 20190526, keithpoon, update: select time deposit and select exchange rate record independently, merge both programmatically instead of selecting both in SQL
        $sql_str = "SELECT t.TimeDepositTranID, t.EffectiveDate as `TimeDeposit_EffectiveDate`, t.AdjustedMaturityDate, EXTRACT(YEAR_MONTH FROM t.AdjustedMaturityDate) as `AdjustedMaturityDateYearMonthStr`, t.PrincipalCurrency, t.Principal, t.Interest ";
        $sql_str .= "FROM `timedeposittran` t ";
        $sql_str .= "WHERE t.AdjustedMaturityDate >= '$asAtDate' ";
        $sql_str .= "AND t.PrincipalCurrency <> '$exchangeToCurrency' ";
        $foreignTimeDepositArray = $this->runSQL($sql_str);
        $foreignCurrencyArray = $foreignTimeDepositArray;
        if($foreignTimeDepositArray["num_rows"]>0){
            foreach($foreignTimeDepositArray["data"] as $rowIndex=>$rowObj){
                // select exchange rate record
                $t_EffectiveDate = $rowObj["TimeDeposit_EffectiveDate"];
                $t_PrincipalCurrency = $rowObj["PrincipalCurrency"];
                $t_Interest = $rowObj["Interest"];
                $t_Principal = $rowObj["Principal"];
                $forex_sql_str = "select e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, (($t_Interest + $t_Principal) * e.Rate) as `LocalValue` ";
                $forex_sql_str .= "FROM `exchangerate` e ";
                $forex_sql_str .= "WHERE e.EffectiveDate >= '".$t_EffectiveDate."' " ;
                $forex_sql_str .= "AND e.OutCurrencyID = '".$t_PrincipalCurrency."' ";
                $forex_sql_str .= "AND e.IsEffective = 'Enabled' ";
                $forex_sql_str .= "ORDER BY e.EffectiveDate DESC ";
                $forex_sql_str .= "LIMIT 1 ";
                $forexArray = $this->runSQL($forex_sql_str);
                if($forexArray["num_rows"]>0){
                    $foreignCurrencyArray["data"][$rowIndex] = array_merge($foreignCurrencyArray["data"][$rowIndex],$forexArray["data"][0]);
                }else{
                    // 20190718
                    // if no exchange rate record effective date is greater or equal to the td effective date
                    // find the most recent past record
                    $forex_sql_str = "select e.Rate, e.EffectiveDate as `ExchangeRate_EffectiveDate`, (($t_Interest + $t_Principal) * e.Rate) as `LocalValue` ";
                    $forex_sql_str .= "FROM `exchangerate` e ";
                    $forex_sql_str .= "WHERE e.EffectiveDate < '".$t_EffectiveDate."' " ;
                    $forex_sql_str .= "AND e.OutCurrencyID = '".$t_PrincipalCurrency."' ";
                    //$forex_sql_str .= "AND e.IsEffective = 'Enabled' ";
                    $forex_sql_str .= "ORDER BY e.EffectiveDate DESC ";
                    $forex_sql_str .= "LIMIT 1 ";
                    $forexArray = $this->runSQL($forex_sql_str);
                    if($forexArray["num_rows"]>0){
                        $foreignCurrencyArray["data"][$rowIndex] = array_merge($foreignCurrencyArray["data"][$rowIndex],$forexArray["data"][0]);
                    }else{
                        // if no exchange rate record effective date is early than the time deposit effective date
                        // use the system default exchange rate 
                    }
                }
            }
            // e.g
            /*
            select e.Rate, 
            e.EffectiveDate as `ExchangeRate_EffectiveDate`, ((305.01 + 11000.96) * e.Rate) as `LocalValue` 
            FROM `exchangerate` e 
            WHERE e.EffectiveDate >= '2019-07-04' AND e.OutCurrencyID = 'CNY' AND e.IsEffective = 'Enabled' 
            ORDER BY e.EffectiveDate DESC LIMIT 1 
            */
        }
        
        // e.g
        /*
        SELECT t.TimeDepositTranID,
        t.EffectiveDate as `TimeDeposit_EffectiveDate`, t.AdjustedMaturityDate, EXTRACT(YEAR_MONTH FROM t.AdjustedMaturityDate) as `AdjustedMaturityDateYearMonthStr`, t.PrincipalCurrency, t.Principal, t.Interest
        FROM `timedeposittran` t
        WHERE t.AdjustedMaturityDate >= '2019-05-26 01:56:02' 
        AND t.PrincipalCurrency <> 'HKD' 
        ORDER BY t.EffectiveDate ASC 
        */

        //$foreignCurrencyArray = $this->runSQL($sql_str);
		
        
        // validation
        // select non-maturitied foreach time deposit
        // compare the foreignCurrencyArray[num_rows]
        
        // select local currency in time deposit
        $sql_str = "SELECT t.TimeDepositTranID, t.EffectiveDate as `TimeDeposit_EffectiveDate`, t.AdjustedMaturityDate, EXTRACT(YEAR_MONTH FROM t.AdjustedMaturityDate) as `AdjustedMaturityDateYearMonthStr`, t.PrincipalCurrency, t.Principal, t.Interest, 1 as `Rate`, CURDATE() as `ExchangeRate_EffectiveDate`, (Interest + Principal) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t ";
        $sql_str .= "WHERE AdjustedMaturityDate >= '$asAtDate' AND PrincipalCurrency = '$exchangeToCurrency' ";
        // e.g
        /*
        SELECT 
        PrincipalCurrency, SUM(Principal) as `Principal`, SUM(Interest) as `Interest`, 1 as `Rate`, SUM(Interest + Principal) as `LocalValue` 
        FROM 
        `timedeposittran` 
        WHERE 
        AdjustedMaturityDate >= "2018-11-24" 
        AND PrincipalCurrency = "HKD" 
        GROUP BY PrincipalCurrency
        */
        $localCurrencyArray = $this->runSQL($sql_str);
        
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

    public function GetGroupedTimeDepositFutureRecords($asAtDate, $exchangeToCurrency){
        $responseArray = Core::CreateResponseArray();
        
        // select foreign currency in time deposit
        $sql_str = "SELECT t.PrincipalCurrency, SUM(t.Principal) as `Principal`, SUM(t.Interest) as `Interest`, e.Rate, (SUM(t.Interest + t.Principal) * e.Rate) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t, `exchangerate` e ";
        $sql_str .= "WHERE t.AdjustedMaturityDate >= '$asAtDate' AND e.OutCurrencyID = t.PrincipalCurrency AND PrincipalCurrency <> '$exchangeToCurrency' AND e.IsEffective = 'Enabled' AND e.EffectiveDate = ";
		$sql_str .= "( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '$asAtDate' ORDER BY sub_e.EffectiveDate DESC Limit 1 ) ";
        $sql_str .= "GROUP BY t.PrincipalCurrency ORDER BY t.PrincipalCurrency ";
        // e.g
        /*
        SELECT t.PrincipalCurrency, SUM(t.Principal) as `Principal`, SUM(t.Interest) as `Interest`, e.Rate, (SUM(t.Interest + t.Principal) * e.Rate) as `LocalValue` 
        FROM 
        `timedeposittran` t, `exchangerate` e 
        WHERE 
        t.AdjustedMaturityDate >= "2018-09-17" 
        AND e.OutCurrencyID = t.PrincipalCurrency 
        AND PrincipalCurrency <> 'HKD' 
        AND e.IsEffective = 'Enabled' 
        AND e.EffectiveDate <= NOW() 
        GROUP BY t.PrincipalCurrency 
        ORDER BY t.PrincipalCurrency
        */
        
        $foreignCurrencyArray = $this->runSQL($sql_str);
        
        
        // select local currency in time deposit
        $sql_str = "SELECT PrincipalCurrency, SUM(Principal) as `Principal`, SUM(Interest) as `Interest`, 1 as `Rate`, SUM(Interest + Principal) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t ";
        $sql_str .= "WHERE AdjustedMaturityDate >= '$asAtDate' AND PrincipalCurrency = '$exchangeToCurrency' ";
        $sql_str .= "GROUP BY PrincipalCurrency";
        // e.g
        /*
        SELECT 
        PrincipalCurrency, SUM(Principal) as `Principal`, SUM(Interest) as `Interest`, 1 as `Rate`, SUM(Interest + Principal) as `LocalValue` 
        FROM 
        `timedeposittran` 
        WHERE 
        AdjustedMaturityDate >= "2018-11-24" 
        AND PrincipalCurrency = "HKD" 
        GROUP BY PrincipalCurrency
        */
        $localCurrencyArray = $this->runSQL($sql_str);
        
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

    public function GetGroupedTimeDepositRecords($startDate, $endDate, $exchangeToCurrency){
        $responseArray = Core::CreateResponseArray();
        
        // select foreign currency in time deposit
        $sql_str = "SELECT t.PrincipalCurrency, SUM(t.Principal) as `Principal`, SUM(t.Interest) as `Interest`, e.Rate, (SUM(t.Interest + t.Principal) * e.Rate) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t, `exchangerate` e ";
        $sql_str .= "WHERE (t.AdjustedMaturityDate BETWEEN '$startDate' AND '$endDate') AND e.OutCurrencyID = t.PrincipalCurrency AND PrincipalCurrency <> '$exchangeToCurrency' AND e.IsEffective = 'Enabled' AND e.EffectiveDate = ";
		$sql_str .= "( SELECT sub_e.EffectiveDate from `exchangerate` sub_e WHERE sub_e.EffectiveDate <= '$startDate' ORDER BY sub_e.EffectiveDate DESC Limit 1 ) ";
        $sql_str .= "GROUP BY t.PrincipalCurrency ORDER BY t.PrincipalCurrency ";
        // e.g
        /*
        SELECT t.PrincipalCurrency, SUM(t.Principal) as `Principal`, SUM(t.Interest) as `Interest`, e.Rate, (SUM(t.Interest + t.Principal) * e.Rate) as `LocalValue` 
        FROM 
        `timedeposittran` t, `exchangerate` e 
        WHERE 
        t.AdjustedMaturityDate >= "2018-09-17" 
        AND e.OutCurrencyID = t.PrincipalCurrency 
        AND PrincipalCurrency <> 'HKD' 
        AND e.IsEffective = 'Enabled' 
        AND e.EffectiveDate <= NOW() 
        GROUP BY t.PrincipalCurrency 
        ORDER BY t.PrincipalCurrency
        */
        $foreignCurrencyArray = $this->runSQL($sql_str);
        
        
        // select local currency in time deposit
        $sql_str = "SELECT PrincipalCurrency, SUM(Principal) as `Principal`, SUM(Interest) as `Interest`, 1 as `Rate`, SUM(Interest + Principal) as `LocalValue` ";
        $sql_str .= "FROM `timedeposittran` t ";
        $sql_str .= "WHERE (t.AdjustedMaturityDate BETWEEN '$startDate' AND '$endDate') AND PrincipalCurrency = '$exchangeToCurrency' ";
        $sql_str .= "GROUP BY PrincipalCurrency";
        // e.g
        /*
        SELECT 
        PrincipalCurrency, SUM(Principal) as `Principal`, SUM(Interest) as `Interest`, 1 as `Rate`, SUM(Interest + Principal) as `LocalValue` 
        FROM 
        `timedeposittran` 
        WHERE 
        AdjustedMaturityDate >= "2018-11-24" 
        AND PrincipalCurrency = "HKD" 
        GROUP BY PrincipalCurrency
        */
        $localCurrencyArray = $this->runSQL($sql_str);
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
}

?>