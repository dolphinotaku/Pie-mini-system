<?php
namespace DCore\Model;

use DCore\Model\DatabaseManager;

class BankManager extends DatabaseManager{
    public function __construct() {
		parent::__construct();		
		echo " print in BankManager constructor. ";
    }
    public function select() {
		echo " print in BankManager select. ";
    }
}
?>