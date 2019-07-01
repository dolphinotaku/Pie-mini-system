<?php
function dolphinOtakuAutoload($className)
{
	print_r("dolphinOtakuAutoload: ".$className.". ");
	$className = str_replace('DCore\\', '', $className);
	
	$namespaceArray = explode("\\",$className);
	$folderName = $namespaceArray[0];
	
    $className = ltrim($className, '\\');
		
    $namespace = '';
		
	switch(strtolower($folderName)){
		case "model":
			if ($lastNsPos = strrpos($className, '\\')) {
				$namespace = substr($className, 0, $lastNsPos);
				$className = substr($className, $lastNsPos + 1);
				$className = str_replace('\\', DIRECTORY_SEPARATOR, $className);
				modelAutoload($className);
			}
		break;
		case "controller":
			if ($lastNsPos = strrpos($className, '\\')) {
				$namespace = substr($className, 0, $lastNsPos);
				$className = substr($className, $lastNsPos + 1);
				$className = str_replace('\\', DIRECTORY_SEPARATOR, $className);
				controllerAutoload($className);
			}
		break;
	}
	
	
    $fileName  = '';
    $namespace = '';
    if ($lastNsPos = strrpos($className, '\\')) {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName  = __Dir__ . "/../$folderName/" . str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
    }
    $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';
	loadFile($fileName);
}
function coreClassAutoload($className)
{
    $className = ltrim($className, '\\');
    $fileName  = '';
    $namespace = '';
    if ($lastNsPos = strrpos($className, '\\')) {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName  = __Dir__ . "/../core/" . str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
    }
    $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';
    loadFile($fileName);
}
function baseClassAutoload($className)
{
	$namespaceArray = explode("\\",$className);
	$folderName = "";
	$folderName = $namespaceArray[1];
	if(strtolower($folderName) != "model"){
		return;
	}
	
    $className = ltrim($className, '\\');
    $fileName  = '';
    $namespace = '';
	
    if ($lastNsPos = strrpos($className, '\\')) {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName  = __Dir__ . "/../core/baseClass/" . str_replace('\\', DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
    }
    $fileName .= str_replace('_', DIRECTORY_SEPARATOR, $className) . '.php';
    
	loadFile($fileName);
}
function loadFile($filePath){
	if (is_file($filePath)) {
		if (is_readable($filePath)) {
			print_r("require_once: ".$filePath."<br>");
			require_once $filePath;
		}
	}
}
function modelAutoload($className)
{
	loadFile(dirname(__FILE__) . "/../Model/$className.php");
}
function controllerAutoload($className)
{
	loadFile(dirname(__FILE__) . "/../Controller/$className.php");
}

spl_autoload_register('dolphinOtakuAutoload');
?>