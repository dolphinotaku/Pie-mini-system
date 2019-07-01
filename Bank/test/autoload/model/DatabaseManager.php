<?php
namespace DCore\Model;

use DCore\Model\ConfigManager;

class DatabaseManager{
    public function __construct() {
		$config = new ConfigManager();
		echo " print in DatabaseManager constructor. ";
    }
    public function select() {
		echo " print in DatabaseManager select. ";
    }
}
?>