// connect to get JSON info

var mobile_bridge_href =  'http://www.theproprietaryserver.com';
// to be used in websql-store-init to insert into tblAdmin as the username
var usernameFromLogin = '';
// the sql that will be sent back from the PHP server telling us what to put in the admin table
var tableAdminSQLJSON = '';

// the color of the LI on the #mainAppsList when showApps() is called
// this would be better kept in the database but, not sure how to do this and on a time crunch
var appListColor = {" Employee Directory" : "#006600", "ECAR" : "#990000", "ECON" : "#6633ff","JAOA" : "#990099", "PRP" : "#00066", "NST" : "#666600"};
//var directoryColor = {" Employee Directory" : "#006600" };
//appListColor.push(directoryColor);
//var ecarColor = {"ECAR" : "#990000" };
//appListColor.push(ecarColor);

var app = {
    // this will kick off once the user clicks "Login" on the form; send this off to the mobile_bridge PHP session check page
    // on SUCCESS: 1) check for database 2) check to see if DB is full 3) load if not 4) display spinner stating such
    loginToPortal: function (u, p) {
        // check to make sure that the username comes in correctly: companyname\username
        var usernameRegex = /[A-Za-z]+\\[A-Za-z]+/ig;
        if (!usernameRegex.test(u)) {
            app.showAlert("Please try again using this format: companyname\\username " + u, "Your username is not correctly formatted");
            return 0;
        }
        
        // display spinner for login wait - pass in msg or default is "Please Wait"
        app.showSpinner(1,'Attempting Login');
        $.ajax({
               url:mobile_bridge_href,
               dataType: 'json',
               type:'POST',
               xhrFields: {withCredentials: true},
               success: function(data, status, jqxhr) {
                    // alert("jqxhr: " + jqxhr.getResponseHeader("Content-Length"));
                    var cookies = [];
                    if (document.cookie)
                        cookies = document.cookie.split('; ');
                        // alert("cookies inside" + cookies);
                },
               data: { uname: u, pwd: p, submitlogin: true } // u and p are passed in from the login form
               }).done(function(d) {
                  if(d.status == 'SUCCESS') {
                       // app.showAlert("SUCCESS", "loginToPortal");
                       // app.animateOutLoginForm(); // this is a neat idea but, the whole process is too fast and it gets wiped out
                       // OK, logged in successfully so, this is where it all starts
                       usernameFromLogin = u; // assign the global var to the u var passed in on successful login
                       // assign the tableAdminSQL to the returned json data
                       tableAdminSQLJSON = $.parseJSON(d.adminSQL);
                       // check the tables to see if we have data and it is valid
                       WebSqlStoreInit.checkTable();
                    } else if (d.status == 'AUTH_FAIL') {
                       // try a count? and if past 3, send them to help.html?msg=tooManyLoginAttempts
                       $("#loginButton > span").animate({marginLeft:'+=15px'},20).animate({marginLeft:'-=15px'},20).animate({marginLeft:'+=15px'},20).animate({marginLeft:'-=15px'},20);
                       // $("#login").append("<p class=\"msgText\">Your login failed. Please try again</p>");
                       // $("#login").append(d.content);
                       $("#loginError").show();
                       app.showSpinner(0,'');
                    } // end d.status
                }).fail(function() {
                    // app.showAlert("ajax called failed", "loginToPortal");
                    // show help file
                    window.location = "help.html?msg=noVPN";
                });
        return 1; // for good measure
    }, // loginToPortal
    
    showLogin: function showLogin() {
        app.showSpinner(0,'');// hide spinner
        var centerDiv = $("#centered");
        var loginFormString = "";
        loginFormString += "<img src='logo.png' class='center' width='200' border='0'><br><p class='center white uniTitle'>UNIVERSAL APP</p>";
        loginFormString += "<div id='login' class='blue left-rounded-corners'><form id='loginForm' action='http://appsdev.pccportal.com/mobile_bridge/'>";
        loginFormString += "<span class='pccBlue'>U:</span> <input type='text' id='uname' value='precastcorp\\'/> <br> <br><span class='pccBlue'>P:</span> <input type='password' id='pwd'/>";
        loginFormString += "<a href='#' onclick=\"app.loginToPortal($('#uname').val(), $('#pwd').val())\" id='loginLink'><div id='loginButton' class='white left-rounded-corners'> <span>Login</span> <img width=40 src='arrow-blue.png'/></div></a>";
        loginFormString += "</form><p id=\"loginError\" class=\"msgText\">Your login failed. Please try again</p></div>";
        centerDiv.append(loginFormString);
    }, // showLogin
    
    // call this when you want to check the status of a persons login
    checkLogin: function(callBack) {
        $.ajax({
            url:mobile_bridge_href,
            dataType: 'json',
            type:'POST'
            }).done(function(d) {
                if(d.status == 'AUTH_FAIL') {
                    console.log("auth fail");
                    window.location = "index.html"; 
                } else if (d.status == "SUCCESS") {
                    // execute whatever callBack function was passed in
                    callBack();
                }
            }).fail(function() {
                 window.location = "help.html?msg=noVPN";
             });
    }, // end checkLogin
    
    // you are logged in OK so, show the list of apps available
    showApps: function() {
        console.log("showApps");
        // how about templates?
        app.showSpinner(0,'');// hide spinner
        var centerDiv = $("#centered");
        var headerHTML = "<p class='white uniTitle center' style='font-size:.9em;'><img src='logo.png' width='80' border='0'> UNIVERSAL APP</p>";
        centerDiv.html(headerHTML);
        $('<ul></ul>', {id: "mainAppsList"}).appendTo(centerDiv); // centerDiv.append("<ul id='mainAppsList'></ul>");
        var mainAppsList = $("#mainAppsList");
         
        // make an array of online/offline, send that out to get the types, make a callback to showAppType
        var whatType = 'offLine';
        // these come out of tblAdmin
        WebSqlStoreInit.getAppType(whatType);

        var whatType = 'onLine';
        WebSqlStoreInit.getAppType(whatType);
     }, // end show apps
    
    // called from WebSqlStoreInit.getAppType passing in the array values from the app type sent to it
    showAppType: function(appTypeArray) {
        var mainAppsList = $("#mainAppsList");
        if (typeof appTypeArray !== 'undefined' && appTypeArray[0] !== null) {
            for (var i = 0; i < appTypeArray.length; i++) {
                var appName = appTypeArray[i]["appName"];
                var appLink = appTypeArray[i]["appLink"];
                var listEntryColor = appListColor[appName];
                // console.log("appLink: " + appLink + " has color 1: " + listEntryColor);
                mainAppsList.append("<li class='left-rounded-corners paddingFive' style='background-color:" + listEntryColor + "'><a style='color:#fff' href='" + appLink + "'>" + appName + "<img width=40 src='arrow-blue.png'/></a></li>");
            } 
            
        } else {
            centerDiv.append("<p>You have no available " + appTypeArray + " apps. To get apps, you must be connected to the  VPN and try logging in. Please see the <a href='help.html?msg=noVPN'>VPN instructions</a> and try again.</p>"); 
        }  
    },
    
    // interesting idea but, not used. the showApps funciton just runs over top of this and you never see it
    animateOutLoginForm: function animateOutLoginForm(){
        $("#loginForm").animate({marginLeft:'+=400px'},200);
        $("#loginForm").hide();
        $("#login").animate({marginLeft:'-=400px'},200);
        $("#login").hide();
        $("#centered > img").animate({marginTop:'-=400px'},200);
        $("#centered > img").hide();
        return this;
    }, // end animateOutLoginForm
    
    showAlert: function (message, title) {
        if (navigator.notification) {
            navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
     },
    
    // give the user a message and spinning wait image
    showSpinner: function(show, msg) {
        var spinDiv = $("#spinner");
        if (show) {
            // display the spinner
            if (msg != '') {
                $("#spinnerMsg").html(msg);
            }
            // calculate width and put right in center? is that even worth it?
            spinDiv.css({position: 'absolute',top: '50px', left: '100px' });
            spinDiv.show();
        } else {
            // hide it
            spinDiv.hide();
        }
    }, // show spinner
    
    // anything passed in? if so, grab it and return it
    urlParam: function(name){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]); // push the key
            vars[hash[0]] = hash[1]; // set the value
        }
        return vars;
    },
    
    // 1) initialize the app variable
     init: function() {
        // set the return key press to the search function
        $(document).keypress(function(event) {
            if(event.which == 13) {
                event.preventDefault();
                app.loginToPortal($('#uname').val(), $('#pwd').val())
            }
        });
        
        app.showSpinner(1,'');// show spinner while ajax loads
        $.ajax({
               url:"http://www.google.com"
        }).done( // everything is working so far, carry on...
                ).fail(function() {
                // app.showAlert("AJAX call to internet failed.", "onDeviceReady");
                // show them the help file or show offline apps
                window.location = "help.html?msg=noInternet";
        });
        
        // now test for VPN
        $.ajax({
               url:mobile_bridge_href,
               dataType: 'json'
        }).done(function() {
                // they can reach the portal --> show login form
                app.showLogin();
                }
            ).fail(function() {
                // app.showAlert("ajax call to pccportal.com fail", "onDeviceReady method");
                // show them the help file and ask if they want to go to offline apps
                window.location = "help.html?msg=noVPN";
        });
        
    } // end init
    
}; // end var app


