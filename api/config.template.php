<?php
namespace WebNoted;
require_once 'aws.phar';

use Aws\Common\Enum\Region;

class Config
{
	private static $options = array(
		'awsKey'		=> 'YOUR_AWS_KEY',
		'awsSecret'		=> 'YOUR_AWS_SECRET',
		'awsRegion'		=> Region::AWS_REGION,
		'table'			=> 'YOUR_DYNAMODB_TABLE',
		'cacheFolder'	=> 'cache'
	);

	/**
	 *
	 */
	public static function getOption($optionName)
	{
		if (isset(self::$options[$optionName])) {
			return self::$options[$optionName];
		} else {
			return null;
		}
	}
}
