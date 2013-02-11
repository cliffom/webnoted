<?php
require_once 'aws.phar';
require_once 'config.php';

use Aws\Common\Aws;
use Aws\DynamoDb\Enum\Type;
use Aws\DynamoDb\Exception\DynamoDbException;
use WebNoted\Config;

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
		'key'    => Config::getOption('awsKey'),
		'secret' => Config::getOption('awsSecret'),
		'region' => Config::getOption('awsRegion')
	));
}

/**
 *
 */
function getClient($shortName)
{
	return aws()->get($shortName);
}

/**
 *
 */
function getItem($client, $hashId)
{
	if (($result = getCachedItem($hashId)) === false) {
		try {
			$result = $client->getItem(array(
				'TableName' => Config::getOption('table'),
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
			"TableName" => Config::getOption('table'),
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
	if (is_dir(Config::getOption('cacheFolder'))) {
		return file_put_contents(Config::getOption('cacheFolder') . '/' . $hashId, $result);
	} else {
		return false;
	}
}

/**
 *
 */
function getCachedItem($hashId)
{
	$cacheFile = Config::getOption('cacheFolder') . '/' . $hashId;
	if (file_exists($cacheFile)) {
		return file_get_contents($cacheFile);
	} else {
		return false;
	}
}