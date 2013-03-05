<?php
$apiURL = "http://api.webnoted.com/?noteId=";
$noteId = (isset($_GET['noteId'])) ? $_GET['noteId'] : null;
$note = '';

if (!empty($noteId)) {
    $apiData = getSharedNoteData($apiURL . $noteId);
 
    if ($apiData !== false) {
        $note = $apiData->note;
        $title = (isset($apiData->title)) ? $apiData->title : 'Shared Note';
        require 'html/shared.html';
        die();
    } else {
        /**
         * TODO: handle possible scenarios
         *
         * 1. Invalid note id - Error page
         * 2. API unreachable/offline - We are sorry page
         */
        header('HTTP/1.0 500 Internal Server Error');
        die('Invalid noteId or API is offline');
    }
} else {
    header('Location: /');
}

die();

/**
 *
 */
function getSharedNoteData($apiURL)
{
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER  => 1,
        CURLOPT_URL             => $apiURL,
        CURLOPT_USERAGENT       => 'API Request from WebNoted.com'
    ));

    $response = curl_exec($curl);
    $responseInfo = curl_getinfo($curl);
    curl_close($curl);

    if (
        $responseInfo['http_code'] === 200
        && $responseInfo['content_type'] === 'application/json'
    ) {
        $response = json_decode($response);
        if (
            isset($response->status)
            && $response->status === 'success'
        ) {
            return $response;
        }
    }
    return false;
}
