<?php
interface SPCloudStoreInterface
{
	public function setTable($tableName);
	public function getItem($itemName);
	public function setItem($itemKey, $itemValue);
}