#!/usr/bin/bash

sleep 15
cd /home/technik/presenter
git reset --hard
git pull
cd backend
deno task run