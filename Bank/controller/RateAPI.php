<?php

interface iRateAPI {
	public function Initialize();
	public function SendRateAPI();
	public function GetData();
}
abstract class RateAPI implements iRateAPI {
    private $apiLogBasePath = __DIR__ . "\\..\\logs\\schedule_task\\api_calls\\";
    protected $apiLogFilePath;
	
	protected $name;
    protected $jsonDataArray;
    protected $jsonFileContent;
    protected $HttpResult;

    private $baseCurrency;
    private $targetCurrency;
	
	protected $debug=false;

    public function __construct() {
        // constructor
        $this->name = "RateAPI";
        $this->jsonDataArray = array();
        $this->jsonFileContent = "";
        $this->HttpResult = array();
		
        $this->baseCurrency = "";
        $this->targetCurrency = array();
    }
	public function Initialize(){
		//$this->FindBaseCurrency();
		$this->FindTargetCurrency();
	}
    public function SaveAPIHttpResponseLog($_httpResult){
        $this->apiLogFilePath = $this->apiLogBasePath . "exRateAPI_Fixer.".date("Ymd_His").".txt";

        // fopen,fwrite,fclose is more lower level, also as a simple wrapper around the C fopen function
        // https://stackoverflow.com/questions/24007898/difference-between-file-file-get-contents-and-fopen-in-php
        $fp = fopen($this->apiLogFilePath, "w");
        fwrite($fp, $_httpResult);
        fclose($fp);
        
        // file_put_contents($this->apiLogFilePath, $_httpResult, FILE_APPEND | LOCK_EX);
    }
    public function GetData(){
		if($this->debug){
			$this->apiLogFilePath = __DIR__ . '\\'.'rate.txt';
		}
        $filename = $this->apiLogFilePath;
		
		// read file
        $handle = fopen($filename, "r");
        $this->jsonFileContent = fread($handle, filesize($filename));
        fclose($handle);
        // $this->jsonFileContent = file_get_contents($this->apiLogFilePath);
		
		// use stored property if throw exception in read
		if(!$this->jsonDataArray){
			$this->jsonDataArray = json_decode($this->jsonFileContent, true);
		}
        
        $returnArray = array();
        $returnArray["ApiSource"] = $this->name;
        $returnArray["BaseCurrency"] = $this->baseCurrency;
        $returnArray["TargetCurrencyInString"] = $this->GetTargetCurrency();
        $returnArray["TargetCurrency"] = $this->targetCurrency;
        $returnArray["JsonText"] = $this->jsonFileContent;
        $returnArray["JsonObj"] = $this->jsonDataArray;
        $returnArray["HttpResult"] = $this->HttpResult;
        $returnArray["DebugStatus"] = $this->debug;

        return $returnArray;
    }
	public function SetBaseCurrency($baseCurrency){
		$this->baseCurrency = $baseCurrency;
	}
	public function FindBaseCurrency(){
		$this->baseCurrency = "HKD";
		return $this->baseCurrency;
	}
	public function FindTargetCurrency(){
		$this->targetCurrency = array();
		
		$currencyManager = new CurrencyManager();
		$currencyManager->Status = "Enabled";
		$responseArray = $currencyManager->select();
		
		foreach ($responseArray["data"] as $recordIndex => $currencyRecord){
			array_push($this->targetCurrency, $currencyRecord["AlphabeticCode"]);
		}
		
		return $this->targetCurrency;
	}
	public function GetBaseCurrency(){
		return $this->baseCurrency;
	}
	public function GetTargetCurrency(){
		$targetCurrency = implode(",",$this->targetCurrency);
		return $targetCurrency;
	}
}

class TaskParameter{
    public $name;
    public $label;
    public $description;
    public $dataType;
    // string, integer, double, boolean, array, date, datetime, time
    public $defaultValue;
	
	public $dataLength;
	public $decimalPlaces; // positive integer
	
    public $stringValidationType;
    // email, url, regular expression
    public $numericalValidationType;
    // greater than, greater or equal than, lesser than, lesser or equal than
    // equal to, not euqal to, in range of, out of range
    // positive, negative
    public $dateValidationType;
    // before, on or before, after, on or after, in range of, out of range
    public $validOptionList;
	
	const DATATYPE_STRING = "DATATYPE_STRING"; // 10
	const DATATYPE_INTEGER = "DATATYPE_INTEGER";
	const DATATYPE_DOUBLE = "DATATYPE_DOUBLE";
	const DATATYPE_BOOLEAN = "DATATYPE_BOOLEAN";
	const DATATYPE_ARRAY = "DATATYPE_ARRAY";
	const DATATYPE_DATE = "DATATYPE_DATE";
	const DATATYPE_DATETIME = "DATATYPE_DATETIME";
	const DATATYPE_TIME = "DATATYPE_TIME";
	const DATATYPE_TEXT_AREA = "DATATYPE_TEXT_AREA"; // 18
	
	const VALID_STRING_MANDATORY = "VALID_STRING_MANDATORY"; // 30
	const VALID_STRING_RADIOLIST = "VALID_STRING_RADIOLIST"; // 30
	const VALID_STRING_CHECKLIST = "VALID_STRING_CHECKLIST";
	const VALID_STRING_EMAIL = "VALID_STRING_EMAIL";
	const VALID_STRING_URL = "VALID_STRING_URL";
	const VALID_STRING_REGULAR_EXPRESSION = "VALID_STRING_REGULAR_EXPRESSION"; //34
	
	const VALID_NUM_GREATER_THAN = "VALID_NUM_GREATER_THAN"; // 50
	const VALID_NUM_GREATER_OR_EQUAL_THAN = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_LESSER_THAN = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_LESSER_OR_EQUAL_THAN = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_EQUAL_TO = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_NOT_EUQAL_TO = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_IN_RANGE_OF = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_OUT_OF_RANGE = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_POSITIVE = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_NEGATIVE = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_POSITIVE_ANDZERO = "VALID_NUM_GREATER_THAN";
	const VALID_NUM_NEGATIVE_ZERO = "VALID_NUM_GREATER_THAN"; //61
	
	const VALID_DATE_BEFORE = "VALID_DATE_BEFORE"; // 71;
	const VALID_DATE_ON_OR_BEFORE = "VALID_DATE_ON_OR_BEFORE"; // 72;
	const VALID_DATE_AFTER = "VALID_DATE_AFTER"; // 73;
	const VALID_DATE_ON_OR_AFTER = "VALID_DATE_ON_OR_AFTER"; // 74;
	const VALID_DATE_IN_RANGE_OF = "VALID_DATE_IN_RANGE_OF"; // 75;
	const VALID_DATE_OUT_OF_RANGE = "VALID_DATE_OUT_OF_RANGE"; // 76;
	
    public function __construct() {
		$this->name = "";
		$this->label = "";
		$this->description = "";
		$this->dataType = "string";
		$this->defaultValue = "";
		
        // for 
		$this->dataLength = 0;
		$this->decimalPlaces = 0;
		
		$this->stringValidationType = 0;
		$this->numericalValidationType = "";
		$this->dateValidationType = "";
		$this->validOptionList = array();
    }
	public function Initialize($name, $label="", $dataType = self::DATATYPE_STRING, $default = null) {
		$this->name = WordsToCamelCase($name);
		$this->label = $label;
		$this->dataType = $dataType;
        
        if($default === null){
            switch($dataType){
                case self::DATATYPE_STRING:
                    $default = "";
                	$this->dataLength = 50;
                    break;
                case self::DATATYPE_TEXT_AREA:
                    $default = "";
                	$this->dataLength = 500;
                    break;
                case self::DATATYPE_INTEGER:
                    $default = 0;
                	$this->dataLength = 10;
                    break;
                case self::DATATYPE_DOUBLE:
                    $default = 0;
                	$this->dataLength = 10;
                    $this->decimalPlaces = 2;
                    break;
                case self::DATATYPE_BOOLEAN:
                    $default = false;
                    break;
                case self::DATATYPE_ARRAY:
                    break;
                case self::DATATYPE_DATE:
                    break;
                case self::DATATYPE_DATETIME:
                    break;
                case self::DATATYPE_TIME:
                    break;
                default:
                    break;
            }
        }
	}
	public function SetRadioOptionList($optionArray){
		$this->dataType = self::DATATYPE_ARRAY;
		$this->stringValidationType = self::VALID_STRING_RADIOLIST;
		$this->validOptionList = $optionArray;
	}
	public function SetCheckboxOptionList($optionArray){
		$this->dataType = self::DATATYPE_ARRAY;
		$this->stringValidationType = self::VALID_STRING_CHECKLIST;
		$this->validOptionList = $optionArray;
	}
}

class TaskParameterList {
	private $parameterList;
    public function __construct() {
		$this->Initialize();
    }
	public function Initialize(){
		$this->parameterList = array();
	}
	public function AddParameter($parameter){
		array_push($this->parameterList, clone $parameter);
	}
	public function GetList(){
		return $this->parameterList;
	}
}

function WordsToCamelCase($string, $capitalizeFirstCharacter = true) 
{
    $str = str_replace(' ', '', ucwords($string, ' '));

    if (!$capitalizeFirstCharacter) {
        $str = lcfirst($str);
    }

    return $str;
}

?>