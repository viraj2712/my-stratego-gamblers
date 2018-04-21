#!/usr/bin/env bash

apt-get update
sudo apt-get install -y npm

curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
