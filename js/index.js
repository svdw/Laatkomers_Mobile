/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements. See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership. The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License. You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/
var app = {
    // Application Constructor
    initialize: function (callback) {
        var self = this;
        this.bindEvents();

        //Open local db
        this.db = window.openDatabase("laatkomersdb", "1.0", "Laatkomers DB", 200000);

        //Create table on inti
        this.db.transaction(
            function (tx) {
                //Find the corresponding table in the database
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='laatkomers'", this.txErrorHandler,
                    function (tx, results) {
                        if (results.rows.length == 1) {
                            log('Using existing Employee table in local SQLite database');
                            //Loop through records to check with row needs to be synchronize
                            self.selectChanges();
                        }
                        else {
                            log('Employee table does not exist in local SQLite database');
                            self.createTable(callback);
                        }
                    });
            }
        )

        /*test notifications */
        //var self = this;
        //self.showAlert('Test notification', 'Info');
        //$('.search-key').on('keyup', $.proxy(this.findByName, this));
    },

    createTable: function (callback) {
        this.db.transaction(
            function (tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS laatkomers ( " +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "wisaid VARCHAR(50), " +
                    "datum VARCHAR(50))";
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function () {
                log('Table laatkomers successfully CREATED in local SQLite database');
                callback();
            }
        );
    },

    selectChanges: function (callback) {
        this.db.transaction(
            function (tx) {
                var sql = "SELECT * FROM laatkomers";
                log('Local SQLite database: "SELECT * FROM laatkomers"');
                tx.executeSql(sql, this.txErrorHandler,
                    function (tx, results) {
                        var laatkomers = [];
                        var len = results.rows.length;
                        for (var i = 0; i < len; i = i + 1) {
                            laatkomers[i] = results.rows.item(i);
                            log(results.rows.item(i).wisaid + '\r\n');
                        }
                        $("#info").html('');
                        log(len + ' rows found');
                        app.addLaatkomerToWs(laatkomers);
                        app.deleteRows(laatkomers);
                        callback(laatkomers);
                    }
                );
            }
        );
    },

    deleteRows: function (laatkomers, callback) {
        //De data werd niet opgeslagen bv: geen internet connectie => opslaan in localdb
        this.db.transaction(
            function (tx) {
                var l = laatkomers.length;
                var e;
                for (var i = 0; i < l; i++) {
                    e = laatkomers[i];
                    var sql = "DELETE FROM laatkomers WHERE id = ?";
                    log('Deleting row ' + e.id + ' in local database:');
                    var params = [e.id];
                    tx.executeSql(sql, params);
                }
            },
            this.txErrorHandler,
            function (tx) {
                callback();
            }
        );
    },

    addLaatkomerToWs: function (laatkomers, callback) {
        var l = laatkomers.length;
        var e;
        for (var i = 0; i < l; i++) {
            e = laatkomers[i];
            log('Add ' + e.wisaid + ' to laatkomers webservice');
            var data = {
                wisaId: JSON.stringify(e.wisaid),
                datetime: JSON.stringify(e.datum)
            };

            $.ajax({
                url: "http://llnmobile.vtir.be/services/LaatkomerService.asmx/AddTeLaatKomer",
                data: data,
                dataType: "jsonp",
                success: function (json) {
                    callback();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.responseText);
                }
            });
        }
    },

    insertLaatkomer: function (wisaid, datum, callback) {
        log('insertLaatkomer');
        //De data werd niet opgeslagen bv: geen internet connectie => opslaan in localdb
        this.db.transaction(
            function (tx) {
                //var l = employees.length;
                var l = 1;
                var sql =
                    "INSERT INTO laatkomers (wisaid, datum) " +
                    "VALUES (?, ?)";
                log('Inserting or Updating in local database:');
                var e;
                for (var i = 0; i < l; i++) {
                    log(wisaid + ' ' + datum);

                    var params = [wisaid, datum];

                    tx.executeSql(sql, params);
                }
                log('Insert complete (' + l + ' items synchronized)');
            },
            this.txErrorHandler,
            function (tx) {
                callback();
            }
        );
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
        //document.getElementById('scanbtn').addEventListener('click', this.scantest, false);
    },
    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    scantest: function (callback) {
        var currentdate = new Date();

        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

        var data = {
            wisaId: JSON.stringify($("#scanvalue").val()),
            datetime: JSON.stringify(datetime)
        };

        $.ajax({
            url: "http://llnmobile.vtir.be/services/LaatkomerService.asmx/AddTeLaatKomer",
            data: data,
            dataType: "jsonp",
            success: function (json) {
                $("#info").html("Barcode gelezen: " + $("#scanvalue").val());
            },
            error: function (xhr, ajaxOptions, thrownError) {
                app.insertLaatkomer($("#scanvalue").val(), datetime);
            }
        });
    },
    scan: function () {
        console.log('scanning');
        try {
            window.plugins.barcodeScanner.scan(function (args) {
                /*
                console.log("Scanner result: \n" +
                "text: " + args.text + "\n" +
                "format: " + args.format + "\n" +
                "cancelled: " + args.cancelled + "\n");
                */
                /*
                if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
                }
                */
                var currentdate = new Date();

                var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

                var data = {
                    wisaId: JSON.stringify($("#scanvalue").val()),
                    datetime: JSON.stringify(datetime)
                };

                $.ajax({
                    url: "http://llnmobile.vtir.be/services/LaatkomerService.asmx/AddTeLaatKomer",
                    data: data,
                    dataType: "jsonp",
                    success: function (json) {
                        $("#info").html("Barcode gelezen: " + $("#scanvalue").val());
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        app.insertLaatkomer($("#scanvalue").val(), datetime);
                    }
                });
            });
        } catch (ex) {
            console.log(ex.message);
        }
    },
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
    }
};

function log(msg) {
    //$('#log').val($('#log').val() + msg + '\n');
}