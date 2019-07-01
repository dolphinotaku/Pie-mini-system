<?php
namespace DCore;

require_once __DIR__ . "/coreAutoloader.php";

$ctrlNamespace = "Controller";
$prgmID = "BankMasterController";
$prgmClass = "DCore\Controller\\".$prgmID;

$bankMasterController = new $prgmClass();
$bankMasterController->GetData();
?>