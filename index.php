<?php
$apiURL = "http://api.webnoted.com/?noteId=";
$noteId = (isset($_GET['noteId'])) ? $_GET['noteId'] : '';
$note = '';

if ($noteId !== '') {
	$apiData = @file_get_contents($apiURL . $noteId);

	if ($apiData !== false) {
		$apiData = json_decode($apiData);

		if (isset($apiData->status)) {

			if ($apiData->status === 'success') {
				$note = $apiData->result;
			} else {
				header('HTTP/1.0 404 Not Found');
				die('Error: Invalid noteId');
			}
		} else {
			header('HTTP/1.0 500 Internal Server Error');
			die('Fatal Error: API is offline');
		}

	} else {
		header('HTTP/1.0 500 Internal Server Error');
		die('Fatal Error: API is offline');
	}
} else {
	
}

require 'html/webnoted.html';
