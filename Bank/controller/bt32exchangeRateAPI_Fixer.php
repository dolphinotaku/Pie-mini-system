<?php
namespace ExchangeRate\API;

require_once('RateAPI.php');

class Fixer extends \RateAPI {
    protected $endpoint;
    protected $access_key;
    protected $baseCurreny;
    protected $targetExchangeCurreny;
    protected $jsonFormat;
    
    protected $accountType; // Free, Subscribe    
	public function Initialize($parameterJSON = null){
		parent::Initialize();
        $this->name="Fixer";
        $this->endpoint = 'latest';
        $this->access_key = "";

        //$this->targetExchangeCurreny = 'USD,HKD,CNY,NZD,GBP'; // e.g 'USD,HKD,CNY,NZD,GBP' separate by ','
        $this->jsonFormat = '1'; // 1 is JSON beautify, 0 is JSON minify
        
		$this->baseCurreny = $this->GetBaseCurrency();
        // get system avaiable Curreny
        $this->FindTargetCurrency();
        $this->targetExchangeCurreny = $this->GetTargetCurrency();
        
        if($parameterJSON === null){
            
        }else{
            $this->access_key = $parameterJSON->ApiAccessKey;
            $this->accountType = strtolower($parameterJSON->FixerAccountType);

            if($this->accountType == "free"){
                $this->baseCurreny = 'EUR';
            }
        }
	}
    function SendRateAPI(){
        $this->debug=false;
        $info=array();
        $this->HttpResult = $info;

        // merge URL
        if($this->accountType == "free"){
            $url = sprintf(
            'http://data.fixer.io/api/%s?access_key=%s&symbols=%s&format=%s',
            $this->endpoint,
            $this->access_key,
            $this->targetExchangeCurreny,
            $this->jsonFormat
            );
        }else{
            $url = sprintf(
            'http://data.fixer.io/api/%s?access_key=%s&base=%s&symbols=%s&format=%s',
            $this->endpoint,
            $this->access_key,
            $this->baseCurreny,
            $this->targetExchangeCurreny,
            $this->jsonFormat
            );
        }
        
        // e.g
        // http://data.fixer.io/api/latest?access_key=e7569e3b84cc2b614b4a64b8ea694f92&symbols=USD,HKD,CNY,NZD,GBP&format=1
            
        if(!$this->debug){
            // Initialize CURL:
            $ch = curl_init("$url");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // Store the data:
            $json = curl_exec($ch);
            
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $info = curl_getinfo($ch);
            $this->HttpResult = $info;
            
            if($httpCode == 200){
                // get JSON in array
                $this->jsonDataArray = json_decode($json, true);
				// get beautify JSON
				//$exchangeRates = json_encode($json, JSON_PRETTY_PRINT);
				
                // save json to text file
                $this->SaveAPIHttpResponseLog($json);
            }
            
            curl_close($ch);
        }
        
        return $info;
    }
}
?>