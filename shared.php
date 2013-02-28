<?php
$apiURL = "http://api.webnoted.com/?noteId=";
$noteId = (isset($_GET['noteId'])) ? $_GET['noteId'] : null;
$note = '';

if ($noteId !== null) {
    $apiData = @file_get_contents($apiURL . $noteId);

    if ($apiData !== false) {
        $apiData = json_decode($apiData);

        if (isset($apiData->status)) {

            if ($apiData->status === 'success') {
                setcookie('noteId', $noteId, time() + 1);
                $note = $apiData->note;
                $title = (isset($apiData->title)) ? $apiData->title : 'Shared Note';
            } else {
                header("Location: /");
                die();
            }

        } else {
            header('HTTP/1.0 500 Internal Server Error');
            die('Fatal Error: API is offline');
        }

    } else {
        header('HTTP/1.0 500 Internal Server Error');
        die('Fatal Error: API URL is unreachable');
    }
} else {

}

require 'html/shared.html';
