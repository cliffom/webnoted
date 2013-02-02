<?php
require 'aws.phar';

use Aws\Common\Aws;
use Aws\Common\Enum\Region;
use Aws\DynamoDb\Enum\Type;
use Aws\DynamoDb\Exception\DynamoDbException;

class SPCloudStoreDynamoDb
{
	private $client;
	private $key;
	private $secret;
	private $region;
	private $table;
	
	public function __construct($options = array())
	{
		if (!empty($options)) {
			$this->key = $options['key'];
			$this->secret = $options['secret'];
			$this->region = $options['region'];
			$this->client = $this->getClient();
		} else {
			throw new Exception('Could not object');
		}
	}
	
	public function setTable($tableName)
	{
		$this->table = $tableName;
	}
	
	public function getTable()
	{
		return $this->table;
	}
	
	public function getItem($itemName)
	{
		try {
			$result = $this->getClient()->getItem(array(
				'TableName' => $this->getTable(),
				'Key' => $this->getClient()->formatAttributes(array(
					'HashKeyElement' => $itemName
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
						'message' => 'Item not found for that id.'
					)
				);
			}
			return $result;
		} catch (DynamoDbException $e) {
			return json_encode(
				array(
					'status' => 'fail',
					'message' => 'Unable to fetch result.'
				)
			);
		}
	}
	
	public function setItem($item)
	{
		try {
			$response = $this->getClient()->putItem(array(
				"TableName" => $this->getTable(),
				"Item" => $item
			));
			$result = json_encode(array(
				'status'	=> 'success',
				'result'	=> $noteId
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

	private function getClient()
	{
		if (is_null($this->client)) {
			$aws = Aws::factory(array(
				'key'    => $this->key,
				'secret' => $this->secret,
				'region' => $this->region
			));			
			return $aws->get('dynamodb');
		} else {
			return $this->client;
		}
	}
}