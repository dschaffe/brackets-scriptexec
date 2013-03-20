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
 * brackets-scriptexec - a brackets plugin to run jasmine unit tests
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window, jasmine, requirejs */

define(function (require, exports, module) {
    'use strict';

    var AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        Menus               = brackets.getModule("command/Menus"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        NodeConnection      = brackets.getModule("utils/NodeConnection"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        ProjectManager      = brackets.getModule("project/ProjectManager");
    
    var moduledir           = FileUtils.getNativeModuleDirectoryPath(module),
        templateEntry       = new NativeFileSystem.FileEntry(moduledir + '/html/NodeExecReportTemplate.html'),
        reportEntry         = new NativeFileSystem.FileEntry(moduledir + '/generated/NodeExecReport.html'),
        COMMAND_ID          = "BracketsNodeExec.BracketsNodeExec",
        NODEEXEC_CMD        = "nodeexec_cmd",
        projectMenu         = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
        workingsetMenu      = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU),
        nodeConnection      = null;

    function chain() {
        var functions = Array.prototype.slice.call(arguments, 0);
        if (functions.length > 0) {
            var firstFunction = functions.shift();
            var firstPromise = firstFunction.call();
            firstPromise.done(function () {
                chain.apply(null, functions);
            });
        }
    }

    AppInit.appReady(function () {
        nodeConnection = new NodeConnection();
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            connectionPromise.fail(function () {
                console.error("[brackets-scriptexec] failed to connect to node");
            });
            return connectionPromise;
        }

        function loadNodeExecDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/NodeExecDomain");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function () {
                console.log("[brackets-scriptexec] failed to load node-exec domain");
            });
            return loadPromise;
        }

        $(nodeConnection).on("nodeexec.update", function (evt, jsondata) {
            jsondata = jsondata.replace('\\n', '\\\\n');
            FileUtils.readAsText(templateEntry).done(function (text, timestamp) {
                var index = text.indexOf("%jsondata%");
                text = text.substring(0, index) + jsondata + text.substring(index + 10);
                FileUtils.writeText(reportEntry, text).done(function () {
                    window.open(reportEntry.fullPath);
                });
            });

        });

        chain(connect, loadNodeExecDomain);
    });

    function runNodeScript() {
        var entry = ProjectManager.getSelectedItem();
        if (entry == null) {
            entry = DocumentManager.getCurrentDocument().file;
        }
        var path = entry.fullPath;
        nodeConnection.domains.nodeexec.runScript(path, null, {})
            .fail(function (err) {
                console.log("[brackets-scriptexec] error running file: " + entry.fullPath + " message: " + err.toString());
                var dlg = Dialogs.showModalDialog(
                    Dialogs.DIALOG_ID_ERROR,
                    "Run Script Error",
                    "The test file contained an error: " + err.toString()
                );
            });
    }

    function determineFileType(fileEntry) {
        if (fileEntry) {
            var text = DocumentManager.getCurrentDocument().getText();
            if (text.match(/^#!/) !== null) {
                return "script";
            }
            return "unknown";
        } else {
            return "unknown";
        }
    }
    CommandManager.register("Run Script", NODEEXEC_CMD, function () {
        runNodeScript();
    });
    
    $(projectMenu).on("beforeContextMenuOpen", function (evt) {
        var selectedEntry = ProjectManager.getSelectedItem();
        projectMenu.removeMenuItem(NODEEXEC_CMD);
        if (determineFileType(selectedEntry) === "script") {
            projectMenu.addMenuItem(NODEEXEC_CMD, "", Menus.LAST);
        }
    });
    $(workingsetMenu).on("beforeContextMenuOpen", function (evt) {
        var selectedEntry = DocumentManager.getCurrentDocument().file;
        workingsetMenu.removeMenuItem(NODEEXEC_CMD);
        if (determineFileType(selectedEntry) === "script") {
            workingsetMenu.addMenuItem(NODEEXEC_CMD, "", Menus.LAST);
        }
    });

});
