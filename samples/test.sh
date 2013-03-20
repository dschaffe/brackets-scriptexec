#!/bin/bash
# sample of a bash script

if [ "$#" != "0" ]
then
    echo "Hello $1!"
else
    echo "Hello World!"
fi
