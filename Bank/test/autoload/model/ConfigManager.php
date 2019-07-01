<?php
namespace DCore\Model;

class ConfigManager{
    public function __construct() {
		define("_DB_HOST", "127.0.0.1", true);
		echo " print in ConfigManager constructor. ";
    }
}
?>