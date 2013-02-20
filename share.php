<?php
if (isset($_POST['note'])) {
	$note = $_POST['note'];

	$url = "http://api.webnoted.com/";
	$fields = array(
		'note' => $note
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);

	$output = curl_exec($ch);
	$info = curl_getinfo($ch);
	curl_close($ch);
	header('Content-Type: application/json');
	echo $output;
} else {
	die('Unauthorized.');
}