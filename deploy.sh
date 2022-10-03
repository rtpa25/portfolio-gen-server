#!/bin/bash

echo "Pulling"
git pull 

echo "Building Application"
docker-compose up -d --build