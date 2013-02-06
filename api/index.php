<?php
require 'aws.phar';

use Aws\Common\Aws;
use Aws\Common\Enum\Region;
use Aws\DynamoDb\Enum\Type;
use Aws\DynamoDb\Exception\DynamoDbException;

$client = getClient('dynamodb');

////////////////////////////////////////////////////////////////////////////////
// Main Control
////////////////////////////////////////////////////////////////////////////////

if ($_GET['noteId']) {
	$hashId = $_GET['noteId'];

	echo getItem($client, $hashId);
} else if ($_POST['note']) {
	$note = $_POST['note'];
	$hashId = md5(uniqid('mitchell-'));
	
	echo putItem($client, $hashId, $note);
} else {
	header('HTTP/1.0 403 Forbidden');
	die('Unauthorized API call');
}

////////////////////////////////////////////////////////////////////////////////
// Supporting Functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Supporting functions
 */

/**
 * Create a service building using shared credentials for each service
 */
function aws()
{
	return Aws::factory(array(
		'key'    => 'AKIAI5Q5KQMJLQQVAQDA',
		'secret' => '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',
		'region' => Region::US_WEST_2
	));
}

/**
 *
 */
function getClient($shortName)
{
	return aws()->get('dynamodb');
}

/**
 *
 */
function getItem($client, $hashId)
{
	if (($result = getCachedItem($hashId)) === false) {
		try {
			$result = $client->getItem(array(
				'TableName' => 'wnNotes',
				'Key' => $client->formatAttributes(array(
					'HashKeyElement' => $hashId
				)),
				'ConsistentRead' => true
			));
			if (!is_null($result['Item'])) {
				$result = json_encode(
					array(
						'status' => 'success',
						'hashId' => $hashId,
						'result' => $result['Item']['note']['S'],
						'cacheStatus' => 'MISS'
					)
				);
				cacheItem($hashId, $result);
			} else {
				$result = json_encode(
					array(
						'status' => 'fail',
						'message' => 'Item not found for that id'
					)
				);
			}
		} catch (DynamoDbException $e) {
			$result = json_encode(
				array(
					'status' => 'fail',
					'message' => 'Unable to fetch result.'
				)
			);
		}
	}

	return $result;
}

/**
 *
 */
function putItem($client, $hashId, $itemValue)
{
	try {
		$response = $client->putItem(array(
			"TableName" => 'wnNotes',
			"Item" => array(
				"noteId"	=> array(Type::STRING => $hashId),
				"note"		=> array(Type::STRING => $itemValue),
				"created"	=> array(Type::STRING => date('Y-m-d H:i:s')),
			)
		));
		$result = json_encode(array(
			'status'	=> 'success',
			'hashId'	=> $hashId,
			'result'	=> $itemValue
		));
		cacheItem($hashId, $result);
	} catch (DynamoDbException $e) {
		$result = json_encode(
			array(
				'status'	=> 'fail',
				'message'	=> 'Unable to save item.'
			)
		);
	}
	
	return $result;
}

/**
 *
 */
function cacheItem($hashId, $itemValue)
{
	$result = json_decode($itemValue, true);
	$result['cacheStatus'] = 'HIT';
	$result = json_encode($result);
	return file_put_contents('cache/' . $hashId, $result);
}

/**
 *
 */
function getCachedItem($hashId)
{
	$cacheFile = 'cache/' . $hashId;
	if (file_exists($cacheFile)) {
		return file_get_contents($cacheFile);
	} else {
		return false;
	}
}