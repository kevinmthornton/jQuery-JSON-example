// connect to get JSON info

var ecarAppUrl = '?page=switch_to_app&id=ecar';

var Ecar = {
    // 1) get ECAR records for this user
    getRecords: function() {
        var self = this;
        // this refers to the Ecar object but, once we get into the function inside of the $.getJSON call, that will no longer be the case
        // hence, we need to set up this or the Ecar object and set it to self BEFORE we get inside of $.getJSON
        // !!! self is no longer used because we are executing this from a callBack through the init method so we can check the login
        // var self = this; 
        // get the JSON and execute a callback funciton; this is an asyncronous request and will execute while other requests are occuring; this causes an ordering problem
        $.getJSON(mobile_bridge_href + ecarAppUrl, function(data){
            // console.log(data); // mobile_bridge_href + '?page=switch_to_app&id=ecar || status: ' + data.status
            if(data.tasks.length > 0) {
                // use $.map to filter out what we need
                self.carRecords = $.map(data.tasks, function(allCars){
                    return {
                        user: data.requesting_user_account,  // the user is sent in the top level
                        carTitle: allCars.project_title,
                        carID:  allCars.car_id,
                        carAmount:   allCars.usd_amount,
                        carDetailsUrl: allCars.json_details_url,
                        carDetailsStatus: allCars.status
                    }
                }); // close off map
                
                // got records, now send off to display
                Ecar.displayECARs(self.carRecords);
            } else {
                var noEcarText = "<p class='paddingFive'>You are not currently assigned any tasks's. </p>";
                $("#carDetails").append(noEcarText);
            }
        }); // close off getJSON
    }, // end getRecords
    
    // 2) display list of CARs
    displayECARs: function(carRecords) {
        var self = this; // assign to the Ecar object for later use
        $('#carList').show();
        $('#carDetails').hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        $("#carApproveForm").hide();
        $("#carRejectForm").hide();
        $("#carForwardForm").hide();
        $("#carRecallForm").hide();
        $("#carTerminateForm").hide();
        $('#navECARsLink').hide();
        $('#navSearchECARsLink').show();
        // identify the template via jQuery and take it all in via .html()
        var template = $('#current-cars').html();
        var templatePart = '';
        // we want to look through the template and replace all instances of {{title}} with the value of title from our object array
        // we dont' want to go into the DOM, just reference jQuery functions; do this with $.
        // the each statement takes two paramaters what you are going to iterate over and the callback to work on each item
        // each content item will be passed to the callback, in this case an anonymous function passing two paramaters the index and the value of that index(obj)
        
        $.each(carRecords, function(index,obj) {
            // format the amount portion correctly
            var formattedMoney = self.formatMoney(obj.carAmount);
            
            var taskColor = "#ffffff";
            if (obj.carDetailsStatus == "REJECTED") {
                taskColor = "#ffff66";
            } 
            
            if (obj.carDetailsStatus == "RECALLED") {
                taskColor = "#009900";
            }
            
            // search for the regex of {{title}} and replace globally; you can stack these replaces
            templatePart += template.replace(/{{carTitle}}/ig, obj.carTitle)
                                    .replace(/{{carID}}/ig, obj.carID)
                                    .replace(/{{carStatus}}/ig, obj.carDetailsStatus)
                                    .replace(/{{carDetailsUrl}}/ig, obj.carDetailsUrl)
                                    .replace(/{{taskColor}}/ig, taskColor)
                                    ;
        });// each
        
        // write out the template part and access the DOM only once
        $("#currentCARS").append(templatePart);

        
        
        // format the SEARCH FORM
        // get the JSON which will have search_form_markup as a base64 string
        // $.getJSON(mobile_bridge_href + '?page=switch_to_app&id=ecar&app_page=mobile_search', function(data){
        //    var searchFormDecoded = window.atob(data.search_form_markup);
        //    $('#searchForm').append(searchFormDecoded);
        //}); // close off getJSON
        //
        //$('#searchFormDiv').show();
        
        
        
    },
    
    // 3) we were passed in a car_id, detected at the bottom of ecar.html, so, get the details of this CAR
    getECARDetails: function(carURL) {
        var self = this;
        // get the JSON and execute a callback funciton; this is an asyncronous request and will execute while other requests are occuring; this is an ordering problem
        // use the carURL passed in to attach to the mobile_bridge_href; this carURL will be generated from the JSON passed off of the server
        $.getJSON(mobile_bridge_href + carURL, function(data){
            // grab the carID off of the display_name string
            var carID  = data.display_name.substring(data.display_name.indexOf('-') +1);
             // create our carRecord object with data passed in
            self.carRecord = {
                carID:  carID,
                carDisplayName: data.display_name,
                carOriginator: data.originator,
                carType: data.car_type,
                carComments: data.comments,
                carPlantID: data.plant_car_id,
                carPlant:data.plant.name,
                carDivision: data.plant.division,
                carRush: data.rush,
                carRushReason: data.rush_reason,
                carVersion: data.version,
                carStatus: data.status,
                carCurrentApproverName: data.current_approver_name,
                carITPolicyNumber: data.it_policy_number,
                carSecondOriginator: data.originator_2 ,
                carOwner: data. car_owner,
                carCurrency: data.currency_unit ,
                carAmount:   data.amount,
                carNPV: data.npv ,
                carIRR: data.irr ,
                carIsBudgeted: data.is_budgeted ,
                carPurpose: data.purpose ,
                carExchangeRate: data.exchange_rate ,
                carEquatedUSDAmount: data.equated_usd_amount ,
                carProjectTitle: data.project_title ,
                carForConsulting: data.for_consulting ,
                carIsImportExport: data.is_import_export ,
                carIsLease: data.is_lease
            };
             
            // map out array of attachments
            self.carAttachments = $.map(data.attachments, function(allCarAttachments){
                return {
                    carAttachmentID: allCarAttachments.id,
                    carAttachmentFilename:  allCarAttachments.filename,
                    carAttachmentUploadBy:   allCarAttachments.uploadedby,
                    carAttachmentCreationDate:   allCarAttachments.createdat,
                    carAttachmentModifyDate:   allCarAttachments.modifiedat,
                    carAttachmentURL:   allCarAttachments.download_url
                }
            }); // close off attatchments map
            
            // map out array of approvers
            self.carApprovers = $.map(data.approvers, function(allCarApprovers){
                return {
                    carApproversID: allCarApprovers.id,
                    carApproversCreationDate: allCarApprovers.createdat,
                    carApproversModifyDate: allCarApprovers.modifiedat,
                    carApproversName: allCarApprovers.approvername,
                    carApproversStatus: allCarApprovers.status,
                    carApproversCloseDate: allCarApprovers.closedat,
                    carApproversComments: allCarApprovers.comments,
                    carApproversDelegatedTo: allCarApprovers.delegatedto,
                    carApproversIsClosed: allCarApprovers.isclosed,
                    carApproversPRPID: allCarApprovers.prpid,
                    carApproversPriority: allCarApprovers.priority,
                    carApproversVersion: allCarApprovers.version,
                    carApproversApproverPriority: allCarApprovers.approverpriority,
                    carApproversLevelName: allCarApprovers.levelname,
                    carApproversRushReason: allCarApprovers.rushreason,
                    carApproversRush: allCarApprovers.rush,
                    carApproversLastReminderDate: allCarApprovers.lastremindedat,
                    carApproversIsInternal: allCarApprovers.isinternal,
                    carApproversApproverGroup: allCarApprovers.approvergroup,
                    carApproversCommentHashHistory: allCarApprovers.commenthashistory
                 }
            }); // close off approvers map
            
            // now display all the details, sending in arrays 
            self.displayECARDetails(self.carRecord, self.carAttachments, self.carApprovers);
        }); // close off getJSON > anonymous callback function   
    }, // end getCARDetails
    
    // now display all the details from the call in the getCARDetails function
    displayECARDetails: function(carDetails, carAttachmentArray, carApproversArray) {
        // becuase #carDetails is a SCRIPT, there is no show/hide; it's is just nothing until it is appended too
        var self = this;
        app.showSpinner(1,"Data Loading");
        $('#carList').hide();
        $('#searchFormDiv').hide();
        $('#navSearchECARsLink').hide();
        $('#navECARsLink').show();

        // get the template from the script tag in ecar.html -> this is based on Handlebars JS    
        var template = $('#car-details').html();
        
        // formatting of data:: get string yes, no, N/A for database values; format amounts into currency units
        var formattedMoney = this.formatMoney(carDetails.carAmount, carDetails.carCurrency);
        var formattedRush = this.formatString(carDetails.carRush);
        var formattedRushReason = this.formatString(carDetails.carRushReason);
        var formattedITPolicyNumber = this.formatString(carDetails.carITPolicyNumber);
        var formattedSecondOriginator = this.formatString(carDetails.carSecondOriginator);
        var formattedBudgeted = this.formatString(carDetails.carIsBudgeted);
        var formattedEquatedAmount = this.formatMoney(carDetails.carEquatedUSDAmount, carDetails.carCurrency);
        var formattedConsulting = this.formatString(carDetails.carForConsulting);
        var formattedImpExp = this.formatString(carDetails.carIsImportExport);
        var formattedLease = this.formatString(carDetails.carIsLease);
        
        // do the replacements in the template for the top section of the carDetails DIV
        var templatePart = template.replace(/{{carDisplayName}}/ig, carDetails.carDisplayName)
                                .replace(/{{carID}}/ig, carDetails.carID)
                                .replace(/{{carOriginator}}/ig, carDetails.carOriginator)
                                .replace(/{{carType}}/ig, carDetails.carType)
                                .replace(/{{carComments}}/ig, carDetails.carComments)
                                .replace(/{{carPlant}}/ig, carDetails.carPlant)
                                .replace(/{{carDivision}}/ig, carDetails.carDivision)
                                .replace(/{{carRush}}/ig, formattedRush)
                                .replace(/{{carRushReason}}/ig, formattedRushReason)
                                .replace(/{{carStatus}}/ig, carDetails.carStatus)
                                .replace(/{{carCurrentApproverName}}/ig, carDetails.carCurrentApproverName)
                                .replace(/{{carITPolicyNumber}}/ig, formattedITPolicyNumber)
                                .replace(/{{carSecondOriginator}}/ig, formattedSecondOriginator)
                                .replace(/{{carOwner}}/ig, carDetails.carOwner)
                                .replace(/{{carCurrency}}/ig, carDetails.carCurrency)
                                .replace(/{{carAmount}}/ig, formattedMoney)
                                .replace(/{{carNPV}}/ig, carDetails.carNPV)
                                .replace(/{{carIRR}}/ig, carDetails.carIRR)
                                .replace(/{{carIsBudgeted}}/ig, formattedBudgeted)
                                .replace(/{{carPurpose}}/ig, carDetails.carPurpose)
                                .replace(/{{carExchangeRate}}/ig, carDetails.carExchangeRate)
                                .replace(/{{carEquatedUSDAmount}}/ig, formattedEquatedAmount)
                                .replace(/{{carProjectTitle}}/ig, carDetails.carProjectTitle)
                                .replace(/{{carForConsulting}}/ig, formattedConsulting)
                                .replace(/{{carIsImportExport}}/ig, formattedImpExp)
                                .replace(/{{carIsLease}}/ig, formattedLease)
                                ;
        // attach to the template
        $("#carDetails").append(templatePart);
        
        // HAS to be after this .append or will now function properly
        // check status, if rejected, show ONLY the terminate button, otherwise, show all three
        if(carDetails.carStatus == "REJECTED") {
            $('#carDetailsActionButtons').hide();
            $('#carTerminateDiv').show();
        } else if(carDetails.carStatus == "RECALLED") {
            $('#carDetailsActionButtons').hide();
        } else {
            $('#carDetailsActionButtons').show();
        }
        
        // attachments
        if (carAttachmentArray.length > 0) {
            var templateAttachment = $('#car-attachments').html();
            var templateAttachmentPart = '';
            
            // iterate over the array and replace
            $.each(carAttachmentArray, function(index,obj) {
                var formattedCreationDate = self.formatDate(obj.carAttachmentCreationDate);
                var formattedModifyDate = self.formatDate(obj.carAttachmentModifyDate);
                templateAttachmentPart += templateAttachment.replace(/{{carAttachmentFilename}}/ig, obj.carAttachmentFilename)
                                        .replace(/{{carAttachmentUploadBy}}/ig, obj.carAttachmentUploadBy)
                                        .replace(/{{carAttachmentCreationDate}}/ig, formattedCreationDate)
                                        .replace(/{{carAttachmentModifyDate}}/ig, formattedModifyDate)
                                        .replace(/{{carAttachmentURL}}/ig, mobile_bridge_href + obj.carAttachmentURL)
                                        .replace(/{{carAttachmentID}}/ig, obj.carAttachmentID)
                                        ;
            });// each
            
            // this is pretty cool. I take the array length and append it to Attachments, then create an image dynamically at the same time
            // as creating an A HREF with text/href attributes and append all that to the empty h4 tag in carAttachments
            var attachmentPullDownArrowText = "Attachments: " + carAttachmentArray.length;
            
            // HA! This chaining is soooooo cool
            $('<img />').attr({
                src:'iconArrowDownSmall.gif',
                width:23,
                height:23
              }).appendTo($('<a />', {
                href:'javascript:Ecar.displayAttachments()',
                text: attachmentPullDownArrowText
              }).appendTo($('#carAttachments h4')));
            
            // attach to the template              
            $("#carAttachmentsList").append(templateAttachmentPart );
            // hidden unless we have attachments to show
            $('#carAttachments').show();
        } // end if car attachments
        
        //approvers
         if (carApproversArray.length > 0) {
            var templateApprovers = $('#car-approvers').html();
            var templateApproversPart = '';
            $.each(carApproversArray, function(index,objApp) {
                // dates come in differently for the approvers; space seperated so split and then send first array field to formatDate()
                var splitCloseDate = objApp.carApproversCloseDate.split(/ /);
                var formattedCloseDate = self.formatDate(splitCloseDate[0]);
                // get yes, no, N/A for database values
                var formattedStatus = objApp.carApproversStatus;
                var formattedComments = objApp.carApproversComments;
                
                templateApproversPart += templateApprovers.replace(/{{carApproversName}}/ig, objApp.carApproversName)
                                        .replace(/{{carApproversTimestamp}}/ig, formattedCloseDate)
                                        .replace(/{{carApproversComments}}/ig, formattedComments)
                                        .replace(/{{carApproversVersion}}/ig, objApp.carApproversVersion)
                                        .replace(/{{carApproversLevelName}}/ig, objApp.carApproversLevelName)
                                        .replace(/{{carApproversStatus}}/ig, formattedStatus)
                                        ;
            });// each
            
            /*
                var splitCreationDate = objApp.carApproversCreationDate.split(/ /);
                var formattedCreationDate = self.formatDate(splitCreationDate[0]);
                var splitModifiedDate = objApp.carApproversModifyDate.split(/ /);
                var formattedModifiedDate = self.formatDate(splitModifiedDate[0]);
                var splitLastReminderDate = objApp.carApproversLastReminderDate.split(/ /);
                var formattedLastReminderDate = self.formatDate(splitLastReminderDate[0]);
                
                var formattedDelegated = self.formatString(objApp.carApproversDelegatedTo);
                var formattedClosed = self.formatString(objApp.carApproversIsClosed);
                var formattedPriority = self.formatString(objApp.carApproversPriority);
                var formattedRush = self.formatString(objApp.carApproversRush);
                var formattedRushReason = self.formatString(objApp.carApproversRushReason);
                var formattedInternal = self.formatString(objApp.carApproversIsInternal);
                var formattedGroup = self.formatString(objApp.carApproversApproverGroup);
                var formattedHashHistory = self.formatString(objApp.carApproversCommentHashHistory);
                
                .replace(/{{carApproversCreationDate}}/ig, formattedCreationDate)
             .replace(/{{carApproversDelegatedTo}}/ig, formattedDelegated)
                                       .replace(/{{carApproversIsClosed}}/ig, formattedClosed)
                                       .replace(/{{carApproversPRPID}}/ig, objApp.carApproversPRPID)
                                       .replace(/{{carApproversPriority}}/ig, formattedPriority)
                                       .replace(/{{carApproversApproverPriority}}/ig, objApp.carApproversApproverPriority)
                                       
                                       .replace(/{{carApproversRush}}/ig, formattedRush)
                                       .replace(/{{carApproversRushReason}}/ig, formattedRushReason)
                                       .replace(/{{carApproversLastReminderDate}}/ig, formattedLastReminderDate)
                                       .replace(/{{carApproversIsInternal}}/ig, formattedInternal)
                                       .replace(/{{carApproversApproverGroup}}/ig, formattedGroup)
                                       .replace(/{{carApproversCommentHashHistory}}/ig, formattedHashHistory)
            */
            // create the link at the top of the DIV for the drop down
             var approverPullDownArrowText = "Approvers: " + carApproversArray.length;            
            $('<img />').attr({
                src:'iconArrowDownSmall.gif',
                width:23,
                height:23
              }).appendTo($('<a />', {
                href:'javascript:Ecar.displayApprovers()',
                text: approverPullDownArrowText
              }).appendTo($('#carApprovers h4')));
            
            // attach to the template
             $("#carApproversList").append(templateApproversPart);
            // hidden unless we have attachments to show
            $('#carApprovers').show();
        } // end if car attachments
        
        // doesn't work. JS just runs this through too fast and you never see it 
        app.showSpinner(0,'');
    }, // end display ecar details
    
    // show the attachments by clicking on the link and scroll down 100 pixels
    displayAttachments: function(){
        $("#carAttachmentsList").slideToggle(400);
        $('html,body').animate({scrollTop: $('#carAttachmentsList').offset().top + 100}, 500);
    }, // end display car attachments
    
    /*
     OLD - http://precisio-j23fd5.precastcorp.com?page=switch_to_app&id=ecar&app_page=mobile_show_file&att_id=20
     attachmentURL will be passed in from the link in displayAttachments()
     go out to the attachmentURL and get the json data which contains:
     file_name --> which has the extension
     file_content --> this is the binary data of the file
     mime-type --> what type of file is this? so we can send out once the file is compiled
    
    $.getJSON(attachmentURL, function(attachmentData){
            var fileName = attachmentData.file_name;
            var binaryContent = attachmentData.file_content;
            var mimeType = attachmentData.mime_type;

        }); // close off getJSON 
    */
    
    // NEW stream directly to file- http://precisio-j23fd5.precastcorp.com?page=switch_to_app&id=ecar&app_page=mobile_stream_file&att_id=20
    getAttachment: function(attachmentURL) {
        console.log(attachmentURL);
        $('html, body').animate({scrollTop:(0)}, '600');
        $('#attachmentPopUpDiv').css({'width' : $(window).width()});
        $('#attachmentPopUpFrame').attr('src', attachmentURL);
        $('#attachmentPopUpDiv').show();
    },
    
    closeAttachmentPopUpDiv: function() {
        $('#attachmentPopUpDiv').hide();    
    },
    
    // show the approvers and scroll down 100 pixels
    displayApprovers: function(){
        $("#carApproversList").slideToggle(400);
        $('html,body').animate({scrollTop: $('#carAttachmentsList').offset().top + 300}, 500);
    }, // end display car attachments
    
    
    // navigate back to the details page if you are on one of the actions and want to go back
    displayCARDetailsNav: function(carID) {
        var localCarDetailsLink = "ecar.html" + ecarAppUrl + "&app_page=mobile_car_details&car_id=" + carID;
        $("#navECARDetailsLink").attr("href", localCarDetailsLink);
        $("#navECARDetailsLink").show();
    },
    
    // set up the display comments box for approving the CAR
    displayApproveCAR: function(carID) {
        // hide all the other information about this CAR     
        $("#carDetails").hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        Ecar.displayCARDetailsNav(carID);  // show the back to details nav link
        
        // parse through the form and replace {{carID}} with values
        var templateApproveCar = $('#car-approve-template').html();
        var templateApproveCarPart = '';
        templateApproveCarPart += templateApproveCar.replace(/{{carID}}/ig, carID)
        $("#carApproveForm").append(templateApproveCarPart);
        // now show a form form commenting on this rejection
        $("#carApproveForm").show();
    },
    
    // this will go out to the server with an approve call on the ID
    approveCAR: function(carID, comments) {
        app.showSpinner(1,'Approving, please wait...');
        // ajax call to ecar server and wait for reply
         var ecarURL = mobile_bridge_href + ecarAppUrl;
        
        $.ajax({
            url: ecarURL,
            dataType: 'json',
            data: {car_id: carID, comments: comments, action_type: "APPROVE", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CAR Approval");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been approved
                    $('#approveCARButton').addClass('msgText').html('Approved');
                    $('#rejectCARButton').hide();
                    $('#forwardCARButton').hide(); 
                    //$("#carApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#carApproveForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CAR Approval");
            });
    }, // end approveCAR
   
   // set up the display comments box for approving the CAR
    displayRecallCAR: function(carID) {
        // hide all the other information about this CAR     
        $("#carDetails").hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        Ecar.displayCARDetailsNav(carID);  // show the back to details nav link
        
        // parse through the form and replace {{carID}} with values
        var templateRecallCar = $('#car-recall-template').html();
        var templateRecallCarPart = '';
        templateRecallCarPart += templateRecallCar.replace(/{{carID}}/ig, carID)
        $("#carRecallForm").append(templateRecallCarPart);
        // now show a form form commenting on this rejection
        $("#carRecallForm").show();
    },
    
    // this will go out to the server with an recall call on the ID
    recallCAR: function(carID, comments) {
        app.showSpinner(1,'Approving, please wait...');
        // ajax call to ecar server and wait for reply
        var ecarURL = mobile_bridge_href + ecarAppUrl;
        
        $.ajax({
            url: ecarURL,
            dataType: 'json',
            data: {car_id: carID, comments: comments, action_type: "RECALL", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CAR Recall");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been recalld
                    $('#recallCARButton').addClass('msgText').html('Recalled');
                    $('#rejectCARButton').hide();
                    $('#forwardCARButton').hide();
                    $('#recallCARButton').hide();
                    //$("#carRecallForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#carRecallForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CAR Approval");
            });
    }, // end recallCAR
    
    // display the reject car form
    displayRejectCAR: function(carID) {
        // hide all the other information about this CAR     
        $("#carDetails").hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        Ecar.displayCARDetailsNav(carID);  // show the back to details nav link
        
        // parse through the form and replace {{carID}} with values
        var templateRejectCar = $('#car-reject-template').html();
        var templateRejectCarPart = '';
        templateRejectCarPart += templateRejectCar.replace(/{{carID}}/ig, carID)
        $("#carRejectForm").append(templateRejectCarPart);
        // now show a form with commenting on this rejection
        $("#carRejectForm").show();
    },
    
    // reject this CAR; 
    rejectCAR: function(carID, comments) {
        // must have comments in for this to submit
        if (comments.length == 0) {
            app.showAlert('Please enter your comments for this rejection.');
            return;
        }
        
        var ecarURL = mobile_bridge_href + ecarAppUrl;
        $.ajax({
            url: ecarURL,
            dataType: 'json',
            data: {car_id: carID, comments: comments, action_type: "REJECT", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CAR Reject");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been rejected
                    $('#approveCARButton').hide();
                    $('#rejectCARButton').hide();
                    $('#forwardCARButton').hide(); 
                    //$("#carApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#carRejectForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CAR Reject");
            });
        
    }, // end rejectCAR
    
    displayForwardCAR: function(carID) {
        $("#carDetails").hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        Ecar.displayCARDetailsNav(carID);  // show the back to details nav link
        
        // parse through the form and replace {{carID}} with values
        var templateForwardCar = $('#car-forward-template').html();
        var templateForwardCarPart = '';
        templateForwardCarPart += templateForwardCar.replace(/{{carID}}/ig, carID)
        $("#carForwardForm").append(templateForwardCarPart);
        // now show a form form commenting on this rejection
        $("#carForwardForm").show();
        
    }, // end displayForwardCAR
    
    forwardCAR: function(carID, comments, emailsPassedIn) {
        // both comments and email are required
        if (comments.length == 0) {
            app.showAlert('Please enter your comments for this forward.');
            return;
        }
        if (emailsPassedIn.length == 0) {
            app.showAlert('Please enter an email address for this forward.');
            return;
        }
        
        // i don't know if this is one email address or many so, don't want to do a regex
        if (emailsPassedIn.indexOf("@") <= 0) {
            app.showAlert('Please enter a valid email address for this forward.');
            return;    
        }
        // emailAddress COULD be a comma seperated list but, doesn't have to be
        // check to see if emailsPassedIn has a comma, if it does, this is a list
        if (emailsPassedIn.indexOf(",") >= 0) {
            // create a new array to be filled in with valid email addresses
            var validEmailAddresses = [];
            // this is a comma separated string so, parse out all email addresses
            var commaSeparatedEmails = emailsPassedIn.split(",");
            
            
            var arrayLength = commaSeparatedEmails.length;
            var y = 0;
            for (var i = 0; i < arrayLength; i++) {
                // validatedomain returns either a blank entry or the email address passed in if it is valid
                var emailValue = this.validatedomain(commaSeparatedEmails[i]);
                // test to see if this email is not blank and therefore a valid address
                if (emailValue.length != 0) {
                    validEmailAddresses[y] = emailValue;
                    y++;                      
                }
            } // end for
        } else {
            // only one email was sent in so check it
            validEmailAddresses = this.validatedomain(emailsPassedIn);
        }
        
        // check to see if we have valid emails in the array
        if (validEmailAddresses.length == 0) {
            // we have no valid email addresses in our array
            app.showAlert("Please enter a valid  email address to use.");
        } else {
            // OK, made it through all of the checks to the ajax call
            // app.showAlert("Email is good: " + validEmailAddresses);
            
            var ecarURL = mobile_bridge_href + ecarAppUrl;
            $.ajax({
            url: ecarURL,
            dataType: 'json',
            data: {car_id: carID, comments: comments, action_type: "FORWARD", app_page: "mobile_action", forwarded_users: validEmailAddresses},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CAR Forward");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been rejected
                    $('#approveCARButton').hide();
                    $('#rejectCARButton').hide();
                    $('#forwardCARButton').hide(); 
                    //$("#carApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#carForwardForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CAR Forward");
            });
        } // end else if valid emails
    }, // end forwardCar
    
    // set up the display comments box for approving the CAR
    displayTerminateCAR: function(carID) {
        // hide all the other information about this CAR     
        $("#carDetails").hide();
        $('#carAttachments').hide();
        $('#carApprovers').hide();
        Ecar.displayCARDetailsNav(carID);  // show the back to details nav link
        
        // parse through the form and replace {{carID}} with values
        var templateTerminateCar = $('#car-terminate-template').html();
        var templateTerminateCarPart = '';
        templateTerminateCarPart += templateTerminateCar.replace(/{{carID}}/ig, carID)
        $("#carTerminateForm").append(templateTerminateCarPart);
        // now show a form form commenting on this rejection
        $("#carTerminateForm").show();
    },
    
    // this will go out to the server with an terminate call on the ID
    terminateCAR: function(carID, comments) {
        app.showSpinner(1,'Terminating, please wait...');
        // ajax call to ecar server and wait for reply
        var ecarURL = mobile_bridge_href + ecarAppUrl;
        
        $.ajax({
            url: ecarURL,
            dataType: 'json',
            data: {car_id: carID, comments: comments, action_type: "TERMINATE", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CAR Termination");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been terminated
                    $('#terminateCARButton').addClass('msgText').html('Terminated');
                    $('#rejectCARButton').hide();
                    $('#forwardCARButton').hide(); 
                    //$("#carTerminateForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#carTerminateForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CAR Termination");
            });
    }, // end terminateCAR
    
    //*** SEARCH ***//
    submitCARSearch: function(formKeysValues) {
        var searchURL = '?page=switch_to_app&id=ecar&app_page=mobile_search';
        
        // go through the input fields getting the name and value
        $.each( formKeysValues, function( i, formObjects ) {
            searchURL += '&' + formObjects.name + "=" + formObjects.value;
          });
        
        // MUST HAVE for search to return results
        searchURL += '&searchform=Search'
        
        console.log(searchURL);
        
        $.ajax({
               url:mobile_bridge_href + searchURL,
               dataType: 'json',
               type:'POST'
               }).done(function(returnedSearchJSONData) {
                 //console.log(returnedSearchJSONData);
                 // map the returned search results into the carRecords and send to 
                 self.carRecords = $.map(returnedSearchJSONData.results, function(allCars){
                    return {
                        carTitle: allCars.project_title,
                        carID:  allCars.car_id,
                        carAmount:   allCars.usd_amount,
                        carDetailsUrl: allCars.json_details_url,
                        carDetailsStatus: allCars.status
                    }
                }); // close off map
                 
                Ecar.displayECARs(self.carRecords);
                 
                }).fail(function() {
                     app.showAlert("ajax called failed", "Search ECAR");
                });
    },
    
    // show the pop up search form 
    showSearchForm: function() {
        $('#searchFormDiv').show(); 
    },
    
    // close the form from the top right X button
    closeSearchForm: function() {
        $('#searchFormDiv').hide();    
    },
    
    // FORMATTING and helper functions //
    
    // is this a  domain email address?
    validatedomain: function(emailPassedIn) {
        var emailParts = emailPassedIn.split("@");
        var domain = emailParts[1];
        if (domain.length == 0) {
            return "";
        } else {
            switch (domain) {
                case "proprietary.com":
                   
                    // it was ONE of these so, is OK
                    return emailPassedIn;
                default:
                    // not a  domain name so return nothing
                    return "";
            } // switch
        }  // else
    },
    
    // format dates into mm/dd/yyyy
    formatDate: function(datePassedIn) {
        var formattedDate = new Date(datePassedIn);
        var returnedDate = formattedDate.getMonth() + "/" + formattedDate.getDate() + "/" + formattedDate.getFullYear();
        return returnedDate;
        
    }, // end format date
    
    // pass in the amount and currency type
    formatMoney: function(amount, currency) {
        var currencySymbol = '&#36;'; 
        if (currency === 'Euro') {
            currencySymbol = '&euro;';
        } else if (currency ==='Pound') {
            currencySymbol = '&pound;';
        }
        
        // this will be passed as a string so, have to cast it
        var localAmount = parseInt(amount);
        var choppedAmount = localAmount.toFixed(2); // substring(0, amount.indexOf(".") +3);
        d =  "."; 
        t = ",";
        j = (j = choppedAmount.length) > 3 ? j % 3 : 0;
        return currencySymbol + (j ? choppedAmount.substr(0, j) + t : "") + choppedAmount.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t); 
    }, // end format money
    
    // format the JSON data a little nicer
    formatString: function(passedString){
        if (passedString === "") {
            return "N/A";
        } else if (passedString === '1') {
            return "Yes";
        }  else if (passedString === '0') {
            return "No";
        }  else if (passedString === true) {
            return "Yes";
        }  else if (passedString === false) {
            return "No";
        }
        // default return
        return "N/A";
    }, // end format string
    
    // initialize this: do they have access? if not, go back to login. if so, get the current user's records
    init: function() {
        // do they have the proper login?
        // pass in the callback that you want to execute if they have a proper login
        // if they don't, then the checkLogin funciton will send them back to reconnect
        // app.checkLogin(Ecar.getRecords);
        Ecar.getRecords();
    }
    
} // end Ecar

// listen for the form search submit outside of the Ecar object and pass the entire form serialized into Ecar.submitCARSearch
$( "#searchForm" ).submit(function( event ) {
            Ecar.submitCARSearch($( this ).serializeArray());
            $('#searchFormDiv').hide(); 
            event.preventDefault();
          });

 
/*

https://api.jquery.com/jQuery.ajax/

.done vs. success:
The nice thing about done is that the return value of $.ajax is now a deferred promise that can be bound to anywhere else in your application.
So let's say you want to make this ajax call from a few different places. Rather than passing in your success function as an option to the function
that makes this ajax call, you can just have the function return $.ajax itself and bind your callbacks with .done, .fail, .then. .always is a callback
that will run whether the request succeeds or fails. done will only be triggered on success.

For example:

function xhr_get(url) {
  return $.ajax({
    url: url,
    type: 'get',
    dataType: 'json',
    beforeSend: showLoadingImgFunction
  })
  .always(function() {
    // remove loading image
  })
  .fail(function() {
    // handle request failures
  });
} // end function

xhr_get('/index.html').done(function(data) {
  // do stuff with index data
});

xhr_get('/id.html').done(function(data) {
  // do stuff with id data
});

*/


