/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 * brackets-nodeexec - a brackets plugin to run scripts
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global exports, require */

(function () {
    "use strict";
    var process = require('child_process'),
        domainManager = null;
    var childproc = null;
    var startDate = null;
    function runScript(file, args, options) {
        startDate = new Date();
        childproc = process.execFile(file, args, options, function (error, stdout, stderr) {
            if (error === null) {
                error = '';
            }
            var name = file.substring(file.lastIndexOf('/') + 1);
            var resultobj = {'error' : error, 'stdout' : stdout, 'stderr' : stderr, 'command' : file, 'title' : name, 'exitcode' : childproc.exitCode, 'time' : (new Date() - startDate)/1000 };
            var resultstr = JSON.stringify(resultobj);
            domainManager.emitEvent("nodeexec", "update", resultstr);
        });
    }

    function init(DomainManager) {
        domainManager = DomainManager;
        if (!domainManager.hasDomain("nodeexec")) {
            domainManager.registerDomain("nodeexec", {major: 0, minor: 1});
        }

        domainManager.registerCommand(
            "nodeexec",
            "runScript",
            runScript,
            false,
            "Runs nodeexec test on a file",
            ["file", "args", "options"],
            []
        );
        domainManager.registerEvent(
            "nodeexec",
            "update",
            ["data"]
        );
    }

    exports.init = init;
}());