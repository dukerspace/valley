#!/bin/bash
pm2 restart ecosystem.config.js
service nginx restart
