<?php

include (__DIR__ . '/../third-party/shuttle-export-namespaced/vendor/autoload.php');
use ShuttleExport\Exporter;
use ShuttleExport\Exception as ShuttleException;

// https://github.com/2createStudio/shuttle-export/tree/namespaced

function ExportData($httpRequest){
	$responseArray = Core::CreateResponseArray();
    
    $sql_filename = "PIMS.database.".date("Ymd").".".uniqid().".sql";
    $sql_filenameForDownload = "PIMS.database.".date("Ymd").".sql";
    $sql_fullpath = "../temp/export/$sql_filename";
    //$sql_fullpath = __DIR__ . '/../temp/export/' . date('Y_m_d_H_i_s') . '.sql.gz';
    
	Exporter::export(array(
		'db_host'        => _DB_HOST,
		'db_user'        => _DB_USER,
		'db_password'    => _DB_PASS,
		'db_name'        => _DB_NAME,
		'db_port'        => 3306,
		//'prefix'         => 'wp_',
		//'only_tables'    => ['bank', 'holiday'],
		'exclude_tables' => ["area", "card", "cardcontent", "cardspellclass", "cardtype", "catalog", "demo_tree", "demo_closuretable", "demo_naivetrees", "department", "permission", "member"],
		'charset'        => 'utf8mb4',
		//'export_file'    => __DIR__ . '/../temp/export/' . date('Y_m_d_H_i_s') . '.sql.gz',
        'export_file'    => $sql_fullpath,
	));
    
    /*
	$world_dumper = Shuttle_Dumper::create(array(
		'host' => _DB_HOST,
		'username' => _DB_USER,
		'password' => _DB_PASS,
		'db_name' => _DB_NAME,
        'charset' => 'utf8',
        'exclude_tables' => array(
    "area",
    "card",
    "cardcontent",
    "cardspellclass",
    "cardtype",
    "catalog",
    "demo_tree",
    "department"
    )
	));
    */
    
    //print_r($world_dumper->dump('PIMS.database.sql'));
    //$world_dumper->dump($sql_fullpath);
    
    // use excelmanager to performs base64 encode
    $exportManager = new ExcelManager();
    $fileAsByteArray = $exportManager->GetFileAsByteArray($sql_fullpath);
    $fileAsString = $exportManager->GetFileAsString($sql_fullpath);
    $fileAsBase64 = base64_encode(file_get_contents($sql_fullpath));
    
    $responseArray["FileAsBase64"] = "$fileAsBase64";
    $responseArray["FileAsByteArray"] = array();
    $responseArray["FileAsByteArray"] = $fileAsByteArray;
    $responseArray["FileAsByteString"] = "$fileAsString";
    $responseArray["access_status"] = "OK";
    $responseArray["filename"] = "$sql_filenameForDownload";
    
    if (file_exists($sql_fullpath))
        unlink($sql_fullpath);

	return $responseArray;
}

function ImportData($httpRequest){
	$responseArray = array();
	$fileExistsInUploadFolder = false;
	$fileExistsInUserFolder = false;

	$importManager = new ExcelManager();
	$importManager->Initialize();
    
	$importManager->AddTable("foreigncurrencytran");
	$importManager->AddTable("trandagedge");

	$responseArray = Core::CreateResponseArray();

	$requestData = new stdClass();
	$requestData = $httpRequest; //->Data->Header;

	$fileInfo = new stdClass();

	if(is_array($requestData->FileUploadedResult)){
		$fileInfo = $requestData->FileUploadedResult[0];
	}
	$excelFileLocation = $fileInfo->movedTo;

	// move file to user folder if user is valid
	$userID = "";
	$securityManager = new SecurityManager();

	if(file_exists($excelFileLocation))
		$fileExistsInUserFolder = true;

	if($fileExistsInUserFolder)
		$responseArray = $importManager->Import($excelFileLocation);

	// if(!$fileExistsInUploadFolder || !$fileExistsInUserFolder)
	// {
	// 	$responseArray['access_status'] = $importManager->access_status["Fail"];
	// 	$responseArray['error'] = "file was found at: $excelFileLocation";
	// }

	return $responseArray;
}

?>