<?php
$apiURL = "http://api.webnoted.com/?noteId=";
$noteId = (isset($_GET['noteId'])) ? $_GET['noteId'] : null;
$note = '';
setcookie('noteId', '', time() - 3600);

if ($noteId !== null) {
    $apiData = @file_get_contents($apiURL . $noteId);

    if ($apiData !== false) {
        $apiData = json_decode($apiData);

        if (isset($apiData->status)) {

            if ($apiData->status === 'success') {
                setcookie('noteId', $noteId);
                $note = $apiData->result;
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

require 'html/webnoted.html';
