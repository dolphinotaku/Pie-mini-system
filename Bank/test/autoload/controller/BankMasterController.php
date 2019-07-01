<?php
namespace DCore\Controller;

use DCore\Model as Model;

class BankMasterController {
    public function __construct() {
		echo " print in BankMasterController constructor. ";
    }
	public function GetData(){
		echo " print in BankMasterController GetData. ";
		$bank = new Model\BankManager();
		$bank->select();
	}
}

?>