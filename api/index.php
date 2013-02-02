<?php
require 'aws.phar';

use Aws\Common\Aws;
use Aws\Common\Enum\Region;
use Aws\DynamoDb\Enum\Type;
use Aws\DynamoDb\Exception\DynamoDbException;

$client = getClient('dynamodb');

if ($_GET['noteId']) {
	$noteId = $_GET['noteId'];

	try {
		$result = $client->getItem(array(
			'TableName' => 'wnNotes',
			'Key' => $client->formatAttributes(array(
				'HashKeyElement' => $noteId
			)),
			'ConsistentRead' => true
		));
		if (!is_null($result['Item'])) {
			$result = json_encode(
				array(
					'status' => 'success',
					'result' => $result['Item']['note']['S']
				)
			);
		} else {
			$result = json_encode(
				array(
					'status' => 'fail',
					'message' => 'Item not found for that id'
				)
			);
		}
		echo $result;
	} catch (DynamoDbException $e) {
		echo json_encode(
			array(
				'status' => 'fail',
				'message' => 'Unable to fetch result.'
			)
		);
	}
} else if ($_POST['note']) {
	$note = $_POST['note'];
	$noteId = md5(uniqid('mitchell-'));
	
	try {
		$response = $client->putItem(array(
			"TableName" => 'wnNotes',
			"Item" => array(
				"noteId"	=> array(Type::STRING => $noteId),
				"note"		=> array(Type::STRING => $note),
				"created"	=> array(Type::STRING => date('Y-m-d H:i:s')),
			)
		));
		$result = json_encode(array(
			'status'	=> 'success',
			'result'	=> $noteId,
			'data'		=> $note
		));
		echo $result;
	} catch (DynamoDbException $e) {
		echo json_encode(
			array(
				'status'	=> 'fail',
				'message'	=> 'Unable to save item.'
			)
		);
	}
}


// Create a service building using shared credentials for each service
function aws()
{
	return Aws::factory(array(
		'key'    => 'AKIAI5Q5KQMJLQQVAQDA',
		'secret' => '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',
		'region' => Region::US_WEST_2
	));
}

function getClient($shortName)
{
	return aws()->get('dynamodb');
}