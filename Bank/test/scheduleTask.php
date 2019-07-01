<?php
	//$data = date('Y-M-D')."-".time();
    $data = date('Y-M-D H:i:s');
	echo $data;
	$file = fopen('store.txt', 'a');
	fwrite($file, $data."\r\n");
	fclose($file);
?>