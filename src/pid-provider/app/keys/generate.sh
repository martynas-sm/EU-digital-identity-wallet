#!/bin/bash

if [ ! -f /app/keys/private_key.pem ]; then
    echo "Generating new PID Provider keys"
    openssl ecparam -name prime256v1 -genkey -noout -out /app/keys/private_key.pem
    openssl ec -in /app/keys/private_key.pem -pubout -out /app/keys/public_key.pem
else
    echo "PID provider keys already exist"
fi