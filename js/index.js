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
    initialize: function () {
        this.bindEvents();

        /*test notifications */
        //var self = this;
        //self.showAlert('Test notification', 'Info');
        //$('.search-key').on('keyup', $.proxy(this.findByName, this));
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scantest, false);
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
    scantest: function () {
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
                alert(xhr.responseText);
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
                    wisaId: JSON.stringify(args.text),
                    datetime: JSON.stringify(datetime)
                };

                $("#info").html("Verwerken...");
                $.ajax({
                    url: "http://llnmobile.vtir.be/services/LaatkomerService.asmx/AddTeLaatKomer",
                    data: data,
                    dataType: "jsonp",
                    success: function (json) {
                        $("#info").html("Barcode gelezen: " + args.text);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert(xhr.responseText);
                    }
                });
                //console.log(args);
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