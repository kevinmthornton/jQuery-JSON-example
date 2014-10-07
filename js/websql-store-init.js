// TODO: this should be changed to UniversalDB
var db = window.openDatabase("EmployeeDB", "1.0", " Employees", 800000);
var hasRows = 0; // do we have rows in our database?
var employees = []; // set up employees out here so we can access it in every function
var WebSqlStoreInit = {
    // 1) test to see if database has data in it or not
    checkTable: function checkTable() {
        var self = this;
        // app.showAlert("made it to checkTable", "checkTable");
        db.transaction(
                        function(tx) {
                            // NO MORE tblDirectory since that is a seperate app now
                            var sql = "SELECT * FROM tblAdmin";
                            tx.executeSql(sql, [], function(tx, results) {
                                          hasRows = results.rows.length;
                                          if (hasRows != 0) {
                                            app.showSpinner(1,'Checking Data Integrity');
                                            // what to do here?????
                                            self.checkTableDate();
                                          } else {
                                            // something went wrong. tblAdmin is present but, has no rows
                                            app.showSpinner(0,'');
                                            app.showAlert("Something went wrong with the installation. Please contact IT.","checkTable:")
                                          }
                            }); // end executeSql
                        },
                        function(error) {
                            // this table does not exist so, start the process to go and get employees then kick off initizlizeDatabase
                            // app.showAlert("Transaction Error in check table: " + error.message, "checkTable");
                            hasRows = 0;
                            app.showSpinner(1,'First Load of data, please be patient');
                            // no longer loading in employees for directory listing
                            // this is now just ECAR, ECON, JOAOA...
                            // employees = self.getEmployees();
                            self.initializeDatabase(); 
                        },
                        function() {
                            // we have no errors so, the tblAdmin is present; checkTableDate is kicked off above to see if data is up to date
                            return 1;
                        }
        ); // end transaction
    }, // checkTable
    
    // 2) checkTable has told us that we don't have any rows so, get the JSON data and assign it to the employees var
    //    checkTable will increment the hasRows var if if finds rows in the database which means we have data already
    getEmployees: function getEmployees() {
        var self = this;
        $.ajax({
               url:mobile_bridge_href + '?page=switch_to_app&id=directory&app_page=mobile_directory_sync',
               dataType: 'json',
               type:'POST'
               }).done(function(d) {
                  if(d.status == 'SUCCESS' && d.content != '404') {
                        // OK, logged in successfully so, this is where it all starts
                        employees = d.records;
                        // app.showAlert("Got data length" + employees.length, "getEmployees");
                        self.initializeDatabase(); 
                  } else if (d.status == 'SUCCESS' && d.content == '404') {
                        app.showAlert("Failed to get data", "addData");
                        // try a count? and if past 3, send them to help.html?msg=too-many-login-attempts
                        window.location = "help.html?msg=noData";
                  } else if (d.status == 'AUTH_FAIL') {
                        app.showAlert("Authorization Failed", "addData");
                        // try a count? and if past 3, send them to help.html?msg=too-many-login-attempts
                        window.location = "index.html";
                  }
                }).fail(function() {
                    // app.showAlert("ajax called failed", "loginToPortal");
                    // show help file
                    window.location = "help.html?msg=noData";
                });
        return employees;
    }, // getEmployees
    
    // 3) we have gotten the employees filled so, now create the tables and add data
    initializeDatabase: function initializeDatabase() {
        var self = this;
        db.transaction(
                function(tx) {
                   // app.showAlert("hasRows: " + hasRows, "initializeDatabase");
                    if(hasRows == 0) {
                        // NO DATA
                        // app.showSpinner(1,'First Load of data, please wait.');
                        self.createTable(tx);
                    } // if check table
                },
                function(error) {
                    // UH-OH, someting bad happened
                    console.log('Transaction error: ' + error.message);
                    app.showAlert('Transaction error: ' + error.message, "initializeDatabase");
                    // if (errorCallback) errorCallback();
                },
                function() {
                    // app.showAlert('SUCCESS', "initializeDatabase");
                    console.log('Transaction success in initializeDatabase');
                 }
        ); // db.transaction
    }, // initializeDatabase
    
    // 4) create the tables in the db
    createTable: function createTable(tx) {
        // app.showAlert("made it to create table","createTable");
        /*
        var sqlDirectory = "CREATE TABLE IF NOT EXISTS tblDirectory ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "firstName VARCHAR(50), " +
            "lastName VARCHAR(50), " +
            "company VARCHAR(50), " +
            "division VARCHAR(50), " +
            "searchField CHAR(200), " +
            "title VARCHAR(50), " +
            "department INTEGER, " +
            "workPhone VARCHAR(50), " +
            "mobilePhone VARCHAR(50), " +
            "email VARCHAR(50)); " 
            // "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            tx.executeSql(sqlDirectory, null,
                function() {
                    console.log('Create directory table success');
                    // successful creation of table, now add in data
                    // WebSqlStoreInit.addData(tx);
                },
                function(tx, error) {
                    app.showAlert('Create directory table error: ' + error.message, "createTable");
                });
            
         // create indexes for optimization
        sqlIndex = "CREATE INDEX search_index ON tblDirectory(searchField); " 
            tx.executeSql(sqlIndex, null,
                function() {
                    console.log('Create indexes success');
                },
                function(tx, error) {
                    app.showAlert('Create index error: ' + error.message, "createTable");
        });// create indexes        
        
        */
        
        // create tblAdmin
        var sqlAdmin = "CREATE TABLE IF NOT EXISTS tblAdmin ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "key VARCHAR(50), value VARCHAR(50), description VARCHAR(150)) ";
            tx.executeSql(sqlAdmin, null,
                function() {
                    console.log('Create admin table success');
                    WebSqlStoreInit.addAdminData(tx);
                },
                function(tx, error) {
                    app.showAlert('Create admin table error: ' + error.message, "createTable");
        });
     }, // createTable
        
   // 5) add the data in from the employees var
    addData: function addData(tx) {
        db.transaction( function(tx) {
            // employees is filled from another method because ajax is running over the db.transaction calls      
            var employeesLength = employees.length;
            var e;
            for (var i = 0; i < employeesLength; i++) {
                e = employees[i];
                
                // strip out punctuation for first, last, company, division and put them into the searchField for an indexed search
                var search_field = WebSqlStoreInit.stripPunctuation(e.first_name) + WebSqlStoreInit.stripPunctuation(e.last_name) + WebSqlStoreInit.stripPunctuation(e.company_name) + WebSqlStoreInit.stripPunctuation(e.division);
                
                var sql = "INSERT OR REPLACE INTO tblDirectory(firstName, lastName, email, workPhone, mobilePhone, company, division, title, searchField) VALUES ('"
                                + e.first_name + "', '" +  e.last_name + "', '" +  e.email + "', '" +  e.work_phone + "', '" + e.mobile_phone + "', '" + e.company_name + "', '" + e.division + "', '" + e.title + "', '" +  search_field + "')";
                tx.executeSql(sql, [],
                        function() {
                            console.log('INSERT success' + e.firstName);
                        },
                        function(tx, error) {
                            alert('INSERT error: ' + error.message);
                        });
            }
        },
        function(error) {app.showAlert("Transaction Error in addData: " + error.message, "addData");},
        function() {
            // finished inserting data, now update the tblAdmin which, when completed, will show the apps
            WebSqlStoreInit.addAdminData(tx);
             }
        ); // transaction
    }, // addData
    
    // DO WE NEED THIS NOW??? I DON'T THINK SO...
    // check to see if the data needs to be updated
    checkTableDate: function checkTableDate(tx){
        var self = this;
        var twoWeeksInSeconds = 1209600000;
        var rightNow = Date.now();
         db.transaction(
                    function(tx) {
                        var selectDateUpdateSQl = "SELECT value FROM tblAdmin WHERE key = 'dateUpdated'";
                        tx.executeSql(selectDateUpdateSQl, [], function(tx, results) {
                                      hasAdminRows = results.rows.length;
                                      if (hasAdminRows == 0) {
                                        // UH-OH, we have data in but, don't know the date of it. Clear everything out and start all over again?
                                        app.showAlert("No date in database", "checkTableDate");
                                      } else {
                                        app.showSpinner(1,'Checking integrity of data');
                                        var tblAdminValues = results.rows.item(0);
                                        var tblAdminDate = parseInt(tblAdminValues.value);
                                        // app.showAlert("rightNow: " + rightNow + " > " + (twoWeeksInSeconds + tblAdminDate), "checkTableDate");
                                        // if rightNow is greater than twoWeeks + dateUpdated, the table needs to be updated
                                        if (parseInt(rightNow) > parseInt(twoWeeksInSeconds + tblAdminDate)) {
                                            alert("updating");
                                            // need to update data
                                            app.showSpinner(1,'Updating data, please wait.');
                                            // delete data, set hasRows to 0 for other functions, grab new data from JSON call, insert employees, update tblAdmin and then showApps
                                            // directory sync is included on index.html so, we can just use that function
                                            DirectorySync.resyncDatabase();
                                            //self.deleteData();
                                            //hasRows = 0;
                                            //employees = self.getEmployees(); 
                                        } else {
                                            // ALL OK, data was updated less than two weeks ago
                                            console.log("Data is OK");
                                            // app.animateOutLoginForm();
                                            app.showApps();    
                                        } // else from date check
                                      } // else from has rows
                        }); // execulteSQL
                    }, 
                    function(error) {
                        console.log("Transaction Error in check table: " + error.message, "checkTableDate");
                    },
                    function() {
                        // we have no errors so, the the date is good
                        return 1;
                    }
        ); // end transaction
    }, // end checkTableDate
    
    // get all the necessary admin data into the db
    addAdminData: function addAdminData(tx) {
        var self = this;
        db.transaction( function(tx) {
            
            // get the date updated in as of today; i like the JS version better than the PHP
            var todayInSeconds = Date.now();
            //date1 = new Date ();
            //todayInSeconds = date1.setMonth(-1); // set back one month for testing
            
            var insertAdminData = "INSERT OR REPLACE INTO tblAdmin(key,value,description) VALUES('dateUpdated', '" + todayInSeconds + "','Last Time Updated: ');";
            tx.executeSql(insertAdminData, null,
                    function() {
                        console.log('INSERT INTO tblAdmin data success for SQL');
                        return 1;
                    },
                    function(tx, error) {
                        app.showAlert('INSERT INTO tblAdmin data ERROR: ' + error.message, "addAdminData");
                        return 0;
                    }); // end executeSql insertAdminData
            }, // transaction
            function(error) {app.showAlert("Transaction Error in addAdminData data: " + error.message, "addAdminData"); return 0;},
            function() {
                // finished adding the admin data, now show the apps
                console.log('addAdminData success for transaction');
                app.showSpinner(0,'');
                app.showApps();
                return 1;
                }
            ); // end transaction
        
            // we are going to take the values of tableAdminSQLJSON and iterate over them, inserting into tblAdmin
            for(var i=0;i<tableAdminSQLJSON.length;i++){
                // json should look like this --> ('value','value','value')
                // the key will only have letters and numbers
                var sqlRegex = /('[0-9A-Za-z]+',\s*'[0-9A-Za-z\.\s:\\\\]+',\s*'[0-9A-Za-z\.\s:\\\\\/\/]+')/;
                var valueForSQL = tableAdminSQLJSON[i];
                // validate that this is just SQL
                if (!sqlRegex.test(valueForSQL)) {
                    app.showAlert("regex does not match " + valueForSQL, "addAdminData");
                    return 0;
                }
                var insertAdminData = "INSERT OR REPLACE INTO tblAdmin(key,value,description) VALUES" + valueForSQL + ";";
                console.log(insertAdminData);
                tx.executeSql(insertAdminData, null,
                        function() {
                            console.log('INSERT INTO tblAdmin data success for SQL');
                            return 1;
                        },
                        function(tx, error) {
                            app.showAlert('INSERT INTO tblAdmin data ERROR: ' + error.message, "addAdminData");
                            return 0;
                        }); // end executeSql insertAdminData
                                
            } // end for
            
            
        return 0;
    }, // end addAdminData
        
    // clear out the tblDirectory
    deleteData: function deleteData() {
        // app.showAlert("made it to delete data","deleteData");
        db.transaction( function(tx) {
            var sql = "DELETE FROM tblDirectory ";
            tx.executeSql(sql, null,
                    function() {
                        console.log('Delete data success for SQL');
                    },
                    function(tx, error) {
                        app.showAlert('Delete data for SQL: ' + error.message, "deleteData");
                    });
        },
        function(error) {app.showAlert("Transaction Error in delete data: " + error.message, "deleteData");},
        function() {
            console.log('Delete data success for transaction');
            hasRows = 0; 
            return 1;
        });
    }, // end deleteData

    // return the offline apps from tblAdmin
    getAppType: function getAppType(appType) {
        var appArray = []; // to hold offline app object values
        db.transaction(
                        function(tx) {
                            // these array's will need to be a hash of objects because there are many rows with the same name 'offline'
                        // get the offline apps
                        var selectAppTypeSQL = "SELECT value, description FROM tblAdmin WHERE key = '" + appType + "'";
                        tx.executeSql(selectAppTypeSQL, [], function(tx, results) {
                                      hasOfflineRows = results.rows.length;
                                        for (var i = 0; i < hasOfflineRows; i++) {
                                            var tblAdminValues = results.rows.item(i);
                                            // we don't really have associative arrays in javascript so, create an object and add that into the array
                                            var dbObject = {"appName": tblAdminValues.value, "appLink" : tblAdminValues.description };
                                            appArray.push(dbObject);
                                            
                                        } // for loop
                        }); // execulteSQL
                        },
                        function(error) {
                            console.log("Error in getAppType SQL " + appType + " " + error.message);
                        },
                        function() {
                            // we have completed the select so, send the array on to app.showAppType to display
                            app.showAppType(appArray);
                        }
        ); // end transaction
    }, // getOfflineApps
    
    // string out all the punctuaion from the stringToStrip and return the strippedString
    stripPunctuation: function(stringToStrip) {
        // [^\w\s] is anything that's not a digit, letter, whitespace, or underscore
        // \s+
        var stripppedString = stringToStrip.replace(/[^\w\s]|_/g, "")
                                                              .replace(/\s+/g, " ");
        
        return stripppedString;
    }
    
    // initialized in index.js with WebSqlStoreInit.checkTable() once we have a successful app.loginToPortal
    // clear out data for testing
    // this.deleteData();
    // checkTable will increment the hasRows var if if finds rows in the database which means we have data already
    // this.checkTable();
} // end WebSqlStoreInit
