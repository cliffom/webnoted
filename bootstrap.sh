#!/usr/bin/env bash

apt-get update
apt-get install -y apache2 php5
rm -rf /var/www
ln -fs /vagrant /var/www
