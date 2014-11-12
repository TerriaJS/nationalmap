#!/bin/bash
git submodule init
git submodule update
npm install
gulp build
gulp test

