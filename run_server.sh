#!/bin/bash

forever stopall
sudo /etc/init.d/varnish restart
nohup forever server.js --port 3003 > output.log 2> error.log < /dev/null &

