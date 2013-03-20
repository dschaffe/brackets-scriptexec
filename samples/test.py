#!/usr/bin/env python
# sample python script

import sys,time
arg="World";
if len(sys.argv)>1:
    arg=sys.argv[1]
print("Hello %s!" % arg)
time.sleep(2);
