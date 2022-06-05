#!/usr/bin/env bash
#https://www.mongodb.com/docs/v5.0/tutorial/configure-scram-client-authentication/
mongod -f mongod.cfg --noauth
mongosh init.js
mongod -f mongod.cfg
