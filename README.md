brackets-scriptexec
===========

A brackets extension to an executable shell and display the results within brackets.

Installation
===========

1. Find your extensions folder by going to "Help -> Show Extensions Folder"
2. Extract the .zip to your Brackets extension directory
3. Start Brackets and create a script in brackets,  To make the script executable the first line must be #!/usr/bin/env node 
or #! something specifying how to run the file
4. Right click on the script file in the sidebar
5. Select Run Script from the context menu
6. The results will appear in new window

Usage
=====

The intent of the extension is to allow for writing and running scripts within brackets

Implementation Notes
============

A script is identified as having #! on the first line (e.g. #!/usr/bin/env python).  The 'Run Script' item is added to the
context menu when script is identified as a script.  The results window only appears when the script finishes.  The extension
is currently meant for fast running scripts.

Let me know if you have any suggestions or issues.  Contact me at: dschaffe@adobe.com.

Limitations and Future Enhancements
============

* Should support passing arguments, environment variables, and starting directory, maybe special comment patterns are extracted
from the script.
* Output is only shown when the process completes, There should be a way to display results as the script is running.

Change Log
=========

03-20-2013 Initial commit