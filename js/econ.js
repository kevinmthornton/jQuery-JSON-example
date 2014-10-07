// connect to get JSON info

var econAppUrl = '?page=switch_to_app&id=econ';

var Econ = {
    // 1) get ECON records for this user
    getRecords: function() {
        var self = this;
        // this refers to the Econ object but, once we get into the function inside of the $.getJSON call, that will no longer be the case
        // hence, we need to set up this or the Econ object and set it to self BEFORE we get inside of $.getJSON
        // !!! self is no longer used because we are executing this from a callBack through the init method so we can check the login
        // var self = this; 
        // get the JSON and execute a callback funciton; this is an asyncronous request and will execute while other requests are occuring; this causes an ordering problem
        $.getJSON(mobile_bridge_href + econAppUrl, function(data){
            // console.log(data); // mobile_bridge_href + '?page=switch_to_app&id=econ || status: ' + data.status
            if(data.tasks.length > 0) {
                // use $.map to filter out what we need
                self.conRecords = $.map(data.tasks, function(allCons){
                    return {
                        user: data.requesting_user_account,  // the user is sent in the top level
                        conTitle: allCons.project_title,
                        conID:  allCons.con_id,
                        conAmount:   allCons.usd_amount,
                        conDetailsUrl: allCons.json_details_url,
                        conDetailsStatus: allCons.status
                    }
                }); // close off map
                
                // got records, now send off to display
                Econ.displayECONs(self.conRecords);
            } else {
                var noEconText = "<p class='paddingFive'>You are not currently assigned any tasks's. </p>";
                $("#conDetails").append(noEconText);
            }
        }); // close off getJSON
    }, // end getRecords
    
    // 2) display list of CONs
    displayECONs: function(conRecords) {
        var self = this; // assign to the Econ object for later use
        $('#conList').show();
        $('#conDetails').hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        $("#conApproveForm").hide();
        $("#conRejectForm").hide();
        $("#conForwardForm").hide();
        $("#conRecallForm").hide();
        $("#conTerminateForm").hide();
        $('#navECONsLink').hide();
        $('#navSearchECONsLink').show();
        // identify the template via jQuery and take it all in via .html()
        var template = $('#current-cons').html();
        var templatePart = '';
        // we want to look through the template and replace all instances of {{title}} with the value of title from our object array
        // we dont' want to go into the DOM, just reference jQuery functions; do this with $.
        // the each statement takes two paramaters what you are going to iterate over and the callback to work on each item
        // each content item will be passed to the callback, in this case an anonymous function passing two paramaters the index and the value of that index(obj)
        
        $.each(conRecords, function(index,obj) {
            // format the amount portion correctly
            var formattedMoney = self.formatMoney(obj.conAmount);
            
            var taskColor = "#ffffff";
            if (obj.conDetailsStatus == "REJECTED") {
                taskColor = "#ffff66";
            } 
            
            if (obj.conDetailsStatus == "RECALLED") {
                taskColor = "#009900";
            }
            
            // search for the regex of {{title}} and replace globally; you can stack these replaces
            templatePart += template.replace(/{{conTitle}}/ig, obj.conTitle)
                                    .replace(/{{conID}}/ig, obj.conID)
                                    .replace(/{{conStatus}}/ig, obj.conDetailsStatus)
                                    .replace(/{{conDetailsUrl}}/ig, obj.conDetailsUrl)
                                    .replace(/{{taskColor}}/ig, taskColor)
                                    ;
        });// each
        
        // write out the template part and access the DOM only once
        $("#currentCONS").append(templatePart);

        
        
        // format the SEARCH FORM
        // get the JSON which will have search_form_markup as a base64 string
        // $.getJSON(mobile_bridge_href + '?page=switch_to_app&id=econ&app_page=mobile_search', function(data){
        //    var searchFormDecoded = window.atob(data.search_form_markup);
        //    $('#searchForm').append(searchFormDecoded);
        //}); // close off getJSON
        //
        //$('#searchFormDiv').show();
        
        
        
    },
    
    // 3) we were passed in a con_id, detected at the bottom of econ.html, so, get the details of this CON
    getECONDetails: function(conURL) {
        var self = this;
        // get the JSON and execute a callback funciton; this is an asyncronous request and will execute while other requests are occuring; this is an ordering problem
        // use the conURL passed in to attach to the mobile_bridge_href; this conURL will be generated from the JSON passed off of the server
        $.getJSON(mobile_bridge_href + conURL, function(data){
            // grab the conID off of the display_name string
            var conID  = data.display_name.substring(data.display_name.indexOf('-') +1);
             // create our conRecord object with data passed in
            self.conRecord = {
                conID:  conID,
                conDisplayName: data.display_name,
                conOriginator: data.originator,
                conType: data.con_type,
                conComments: data.comments,
                conPlantID: data.plant_con_id,
                conPlant:data.plant.name,
                conDivision: data.plant.division,
                conRush: data.rush,
                conRushReason: data.rush_reason,
                conVersion: data.version,
                conStatus: data.status,
                conCurrentApproverName: data.current_approver_name,
                conITPolicyNumber: data.it_policy_number,
                conSecondOriginator: data.originator_2 ,
                conOwner: data. con_owner,
                conCurrency: data.currency_unit ,
                conAmount:   data.amount,
                conNPV: data.npv ,
                conIRR: data.irr ,
                conIsBudgeted: data.is_budgeted ,
                conPurpose: data.purpose ,
                conExchangeRate: data.exchange_rate ,
                conEquatedUSDAmount: data.equated_usd_amount ,
                conProjectTitle: data.project_title ,
                conForConsulting: data.for_consulting ,
                conIsImportExport: data.is_import_export ,
                conIsLease: data.is_lease
            };
             
            // map out array of attachments
            self.conAttachments = $.map(data.attachments, function(allConAttachments){
                return {
                    conAttachmentID: allConAttachments.id,
                    conAttachmentFilename:  allConAttachments.filename,
                    conAttachmentUploadBy:   allConAttachments.uploadedby,
                    conAttachmentCreationDate:   allConAttachments.createdat,
                    conAttachmentModifyDate:   allConAttachments.modifiedat,
                    conAttachmentURL:   allConAttachments.download_url
                }
            }); // close off attatchments map
            
            // map out array of approvers
            self.conApprovers = $.map(data.approvers, function(allConApprovers){
                return {
                    conApproversID: allConApprovers.id,
                    conApproversCreationDate: allConApprovers.createdat,
                    conApproversModifyDate: allConApprovers.modifiedat,
                    conApproversName: allConApprovers.approvername,
                    conApproversStatus: allConApprovers.status,
                    conApproversCloseDate: allConApprovers.closedat,
                    conApproversComments: allConApprovers.comments,
                    conApproversDelegatedTo: allConApprovers.delegatedto,
                    conApproversIsClosed: allConApprovers.isclosed,
                    conApproversPRPID: allConApprovers.prpid,
                    conApproversPriority: allConApprovers.priority,
                    conApproversVersion: allConApprovers.version,
                    conApproversApproverPriority: allConApprovers.approverpriority,
                    conApproversLevelName: allConApprovers.levelname,
                    conApproversRushReason: allConApprovers.rushreason,
                    conApproversRush: allConApprovers.rush,
                    conApproversLastReminderDate: allConApprovers.lastremindedat,
                    conApproversIsInternal: allConApprovers.isinternal,
                    conApproversApproverGroup: allConApprovers.approvergroup,
                    conApproversCommentHashHistory: allConApprovers.commenthashistory
                 }
            }); // close off approvers map
            
            // now display all the details, sending in arrays 
            self.displayECONDetails(self.conRecord, self.conAttachments, self.conApprovers);
        }); // close off getJSON > anonymous callback function   
    }, // end getCONDetails
    
    // now display all the details from the call in the getCONDetails function
    displayECONDetails: function(conDetails, conAttachmentArray, conApproversArray) {
        // becuase #conDetails is a SCRIPT, there is no show/hide; it's is just nothing until it is appended too
        var self = this;
        app.showSpinner(1,"Data Loading");
        $('#conList').hide();
        $('#searchFormDiv').hide();
        $('#navSearchECONsLink').hide();
        $('#navECONsLink').show();

        // get the template from the script tag in econ.html -> this is based on Handlebars JS    
        var template = $('#con-details').html();
        
        // formatting of data:: get string yes, no, N/A for database values; format amounts into currency units
        var formattedMoney = this.formatMoney(conDetails.conAmount, conDetails.conCurrency);
        var formattedRush = this.formatString(conDetails.conRush);
        var formattedRushReason = this.formatString(conDetails.conRushReason);
        var formattedITPolicyNumber = this.formatString(conDetails.conITPolicyNumber);
        var formattedSecondOriginator = this.formatString(conDetails.conSecondOriginator);
        var formattedBudgeted = this.formatString(conDetails.conIsBudgeted);
        var formattedEquatedAmount = this.formatMoney(conDetails.conEquatedUSDAmount, conDetails.conCurrency);
        var formattedConsulting = this.formatString(conDetails.conForConsulting);
        var formattedImpExp = this.formatString(conDetails.conIsImportExport);
        var formattedLease = this.formatString(conDetails.conIsLease);
        
        // do the replacements in the template for the top section of the conDetails DIV
        var templatePart = template.replace(/{{conDisplayName}}/ig, conDetails.conDisplayName)
                                .replace(/{{conID}}/ig, conDetails.conID)
                                .replace(/{{conOriginator}}/ig, conDetails.conOriginator)
                                .replace(/{{conType}}/ig, conDetails.conType)
                                .replace(/{{conComments}}/ig, conDetails.conComments)
                                .replace(/{{conPlant}}/ig, conDetails.conPlant)
                                .replace(/{{conDivision}}/ig, conDetails.conDivision)
                                .replace(/{{conRush}}/ig, formattedRush)
                                .replace(/{{conRushReason}}/ig, formattedRushReason)
                                .replace(/{{conStatus}}/ig, conDetails.conStatus)
                                .replace(/{{conCurrentApproverName}}/ig, conDetails.conCurrentApproverName)
                                .replace(/{{conITPolicyNumber}}/ig, formattedITPolicyNumber)
                                .replace(/{{conSecondOriginator}}/ig, formattedSecondOriginator)
                                .replace(/{{conOwner}}/ig, conDetails.conOwner)
                                .replace(/{{conCurrency}}/ig, conDetails.conCurrency)
                                .replace(/{{conAmount}}/ig, formattedMoney)
                                .replace(/{{conNPV}}/ig, conDetails.conNPV)
                                .replace(/{{conIRR}}/ig, conDetails.conIRR)
                                .replace(/{{conIsBudgeted}}/ig, formattedBudgeted)
                                .replace(/{{conPurpose}}/ig, conDetails.conPurpose)
                                .replace(/{{conExchangeRate}}/ig, conDetails.conExchangeRate)
                                .replace(/{{conEquatedUSDAmount}}/ig, formattedEquatedAmount)
                                .replace(/{{conProjectTitle}}/ig, conDetails.conProjectTitle)
                                .replace(/{{conForConsulting}}/ig, formattedConsulting)
                                .replace(/{{conIsImportExport}}/ig, formattedImpExp)
                                .replace(/{{conIsLease}}/ig, formattedLease)
                                ;
        // attach to the template
        $("#conDetails").append(templatePart);
        
        // HAS to be after this .append or will now function properly
        // check status, if rejected, show ONLY the terminate button, otherwise, show all three
        if(conDetails.conStatus == "REJECTED") {
            $('#conDetailsActionButtons').hide();
            $('#conTerminateDiv').show();
        } else if(conDetails.conStatus == "RECALLED") {
            $('#conDetailsActionButtons').hide();
        } else {
            $('#conDetailsActionButtons').show();
        }
        
        // attachments
        if (conAttachmentArray.length > 0) {
            var templateAttachment = $('#con-attachments').html();
            var templateAttachmentPart = '';
            
            // iterate over the array and replace
            $.each(conAttachmentArray, function(index,obj) {
                var formattedCreationDate = self.formatDate(obj.conAttachmentCreationDate);
                var formattedModifyDate = self.formatDate(obj.conAttachmentModifyDate);
                templateAttachmentPart += templateAttachment.replace(/{{conAttachmentFilename}}/ig, obj.conAttachmentFilename)
                                        .replace(/{{conAttachmentUploadBy}}/ig, obj.conAttachmentUploadBy)
                                        .replace(/{{conAttachmentCreationDate}}/ig, formattedCreationDate)
                                        .replace(/{{conAttachmentModifyDate}}/ig, formattedModifyDate)
                                        .replace(/{{conAttachmentURL}}/ig, mobile_bridge_href + obj.conAttachmentURL)
                                        .replace(/{{conAttachmentID}}/ig, obj.conAttachmentID)
                                        ;
            });// each
            
            // this is pretty cool. I take the array length and append it to Attachments, then create an image dynamically at the same time
            // as creating an A HREF with text/href attributes and append all that to the empty h4 tag in conAttachments
            var attachmentPullDownArrowText = "Attachments: " + conAttachmentArray.length;
            
            // HA! This chaining is soooooo cool
            $('<img />').attr({
                src:'iconArrowDownSmall.gif',
                width:23,
                height:23
              }).appendTo($('<a />', {
                href:'javascript:Econ.displayAttachments()',
                text: attachmentPullDownArrowText
              }).appendTo($('#conAttachments h4')));
            
            // attach to the template              
            $("#conAttachmentsList").append(templateAttachmentPart );
            // hidden unless we have attachments to show
            $('#conAttachments').show();
        } // end if con attachments
        
        //approvers
         if (conApproversArray.length > 0) {
            var templateApprovers = $('#con-approvers').html();
            var templateApproversPart = '';
            $.each(conApproversArray, function(index,objApp) {
                // dates come in differently for the approvers; space seperated so split and then send first array field to formatDate()
                var splitCloseDate = objApp.conApproversCloseDate.split(/ /);
                var formattedCloseDate = self.formatDate(splitCloseDate[0]);
                // get yes, no, N/A for database values
                var formattedStatus = objApp.conApproversStatus;
                var formattedComments = objApp.conApproversComments;
                
                templateApproversPart += templateApprovers.replace(/{{conApproversName}}/ig, objApp.conApproversName)
                                        .replace(/{{conApproversTimestamp}}/ig, formattedCloseDate)
                                        .replace(/{{conApproversComments}}/ig, formattedComments)
                                        .replace(/{{conApproversVersion}}/ig, objApp.conApproversVersion)
                                        .replace(/{{conApproversLevelName}}/ig, objApp.conApproversLevelName)
                                        .replace(/{{conApproversStatus}}/ig, formattedStatus)
                                        ;
            });// each
            
            /*
                var splitCreationDate = objApp.conApproversCreationDate.split(/ /);
                var formattedCreationDate = self.formatDate(splitCreationDate[0]);
                var splitModifiedDate = objApp.conApproversModifyDate.split(/ /);
                var formattedModifiedDate = self.formatDate(splitModifiedDate[0]);
                var splitLastReminderDate = objApp.conApproversLastReminderDate.split(/ /);
                var formattedLastReminderDate = self.formatDate(splitLastReminderDate[0]);
                
                var formattedDelegated = self.formatString(objApp.conApproversDelegatedTo);
                var formattedClosed = self.formatString(objApp.conApproversIsClosed);
                var formattedPriority = self.formatString(objApp.conApproversPriority);
                var formattedRush = self.formatString(objApp.conApproversRush);
                var formattedRushReason = self.formatString(objApp.conApproversRushReason);
                var formattedInternal = self.formatString(objApp.conApproversIsInternal);
                var formattedGroup = self.formatString(objApp.conApproversApproverGroup);
                var formattedHashHistory = self.formatString(objApp.conApproversCommentHashHistory);
                
                .replace(/{{conApproversCreationDate}}/ig, formattedCreationDate)
             .replace(/{{conApproversDelegatedTo}}/ig, formattedDelegated)
                                       .replace(/{{conApproversIsClosed}}/ig, formattedClosed)
                                       .replace(/{{conApproversPRPID}}/ig, objApp.conApproversPRPID)
                                       .replace(/{{conApproversPriority}}/ig, formattedPriority)
                                       .replace(/{{conApproversApproverPriority}}/ig, objApp.conApproversApproverPriority)
                                       
                                       .replace(/{{conApproversRush}}/ig, formattedRush)
                                       .replace(/{{conApproversRushReason}}/ig, formattedRushReason)
                                       .replace(/{{conApproversLastReminderDate}}/ig, formattedLastReminderDate)
                                       .replace(/{{conApproversIsInternal}}/ig, formattedInternal)
                                       .replace(/{{conApproversApproverGroup}}/ig, formattedGroup)
                                       .replace(/{{conApproversCommentHashHistory}}/ig, formattedHashHistory)
            */
            // create the link at the top of the DIV for the drop down
             var approverPullDownArrowText = "Approvers: " + conApproversArray.length;            
            $('<img />').attr({
                src:'iconArrowDownSmall.gif',
                width:23,
                height:23
              }).appendTo($('<a />', {
                href:'javascript:Econ.displayApprovers()',
                text: approverPullDownArrowText
              }).appendTo($('#conApprovers h4')));
            
            // attach to the template
             $("#conApproversList").append(templateApproversPart);
            // hidden unless we have attachments to show
            $('#conApprovers').show();
        } // end if con attachments
        
        // doesn't work. JS just runs this through too fast and you never see it 
        app.showSpinner(0,'');
    }, // end display econ details
    
    // show the attachments by clicking on the link and scroll down 100 pixels
    displayAttachments: function(){
        $("#conAttachmentsList").slideToggle(400);
        $('html,body').animate({scrollTop: $('#conAttachmentsList').offset().top + 100}, 500);
    }, // end display con attachments
    
    /*
     OLD - http://precisio-j23fd5.precastcorp.com?page=switch_to_app&id=econ&app_page=mobile_show_file&att_id=20
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
    
    // NEW stream directly to file- http://precisio-j23fd5.precastcorp.com?page=switch_to_app&id=econ&app_page=mobile_stream_file&att_id=20
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
        $("#conApproversList").slideToggle(400);
        $('html,body').animate({scrollTop: $('#conAttachmentsList').offset().top + 300}, 500);
    }, // end display con attachments
    
    
    // navigate back to the details page if you are on one of the actions and want to go back
    displayCONDetailsNav: function(conID) {
        var localConDetailsLink = "econ.html" + econAppUrl + "&app_page=mobile_con_details&con_id=" + conID;
        $("#navECONDetailsLink").attr("href", localConDetailsLink);
        $("#navECONDetailsLink").show();
    },
    
    // set up the display comments box for approving the CON
    displayApproveCON: function(conID) {
        // hide all the other information about this CON     
        $("#conDetails").hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        Econ.displayCONDetailsNav(conID);  // show the back to details nav link
        
        // parse through the form and replace {{conID}} with values
        var templateApproveCon = $('#con-approve-template').html();
        var templateApproveConPart = '';
        templateApproveConPart += templateApproveCon.replace(/{{conID}}/ig, conID)
        $("#conApproveForm").append(templateApproveConPart);
        // now show a form form commenting on this rejection
        $("#conApproveForm").show();
    },
    
    // this will go out to the server with an approve call on the ID
    approveCON: function(conID, comments) {
        app.showSpinner(1,'Approving, please wait...');
        // ajax call to econ server and wait for reply
         var econURL = mobile_bridge_href + econAppUrl;
        
        $.ajax({
            url: econURL,
            dataType: 'json',
            data: {con_id: conID, comments: comments, action_type: "APPROVE", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CON Approval");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been approved
                    $('#approveCONButton').addClass('msgText').html('Approved');
                    $('#rejectCONButton').hide();
                    $('#forwardCONButton').hide(); 
                    //$("#conApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#conApproveForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CON Approval");
            });
    }, // end approveCON
   
   // set up the display comments box for approving the CON
    displayRecallCON: function(conID) {
        // hide all the other information about this CON     
        $("#conDetails").hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        Econ.displayCONDetailsNav(conID);  // show the back to details nav link
        
        // parse through the form and replace {{conID}} with values
        var templateRecallCon = $('#con-recall-template').html();
        var templateRecallConPart = '';
        templateRecallConPart += templateRecallCon.replace(/{{conID}}/ig, conID)
        $("#conRecallForm").append(templateRecallConPart);
        // now show a form form commenting on this rejection
        $("#conRecallForm").show();
    },
    
    // this will go out to the server with an recall call on the ID
    recallCON: function(conID, comments) {
        app.showSpinner(1,'Approving, please wait...');
        // ajax call to econ server and wait for reply
         var econURL = mobile_bridge_href + econAppUrl;
        
        $.ajax({
            url: econURL,
            dataType: 'json',
            data: {con_id: conID, comments: comments, action_type: "RECALL", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CON Recall");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been recalld
                    $('#recallCONButton').addClass('msgText').html('Recalled');
                    $('#rejectCONButton').hide();
                    $('#forwardCONButton').hide();
                    $('#recallCONButton').hide();
                    //$("#conRecallForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#conRecallForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CON Approval");
            });
    }, // end recallCON
    
    // display the reject con form
    displayRejectCON: function(conID) {
        // hide all the other information about this CON     
        $("#conDetails").hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        Econ.displayCONDetailsNav(conID);  // show the back to details nav link
        
        // parse through the form and replace {{conID}} with values
        var templateRejectCon = $('#con-reject-template').html();
        var templateRejectConPart = '';
        templateRejectConPart += templateRejectCon.replace(/{{conID}}/ig, conID)
        $("#conRejectForm").append(templateRejectConPart);
        // now show a form with commenting on this rejection
        $("#conRejectForm").show();
    },
    
    // reject this CON; 
    rejectCON: function(conID, comments) {
        // must have comments in for this to submit
        if (comments.length == 0) {
            app.showAlert('Please enter your comments for this rejection.');
            return;
        }
        
        var econURL = mobile_bridge_href + econAppUrl;
        $.ajax({
            url: econURL,
            dataType: 'json',
            data: {con_id: conID, comments: comments, action_type: "REJECT", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CON Reject");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been rejected
                    $('#approveCONButton').hide();
                    $('#rejectCONButton').hide();
                    $('#forwardCONButton').hide(); 
                    //$("#conApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#conRejectForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CON Reject");
            });
        
    }, // end rejectCON
    
    displayForwardCON: function(conID) {
        $("#conDetails").hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        Econ.displayCONDetailsNav(conID);  // show the back to details nav link
        
        // parse through the form and replace {{conID}} with values
        var templateForwardCon = $('#con-forward-template').html();
        var templateForwardConPart = '';
        templateForwardConPart += templateForwardCon.replace(/{{conID}}/ig, conID)
        $("#conForwardForm").append(templateForwardConPart);
        // now show a form form commenting on this rejection
        $("#conForwardForm").show();
        
    }, // end displayForwardCON
    
    forwardCON: function(conID, comments, emailsPassedIn) {
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
            
            var econURL = mobile_bridge_href + econAppUrl;
            $.ajax({
            url: econURL,
            dataType: 'json',
            data: {con_id: conID, comments: comments, action_type: "FORWARD", app_page: "mobile_action", forwarded_users: validEmailAddresses},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CON Forward");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been rejected
                    $('#approveCONButton').hide();
                    $('#rejectCONButton').hide();
                    $('#forwardCONButton').hide(); 
                    //$("#conApproveForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#conForwardForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CON Forward");
            });
        } // end else if valid emails
    }, // end forwardCon
    
    // set up the display comments box for approving the CON
    displayTerminateCON: function(conID) {
        // hide all the other information about this CON     
        $("#conDetails").hide();
        $('#conAttachments').hide();
        $('#conApprovers').hide();
        Econ.displayCONDetailsNav(conID);  // show the back to details nav link
        
        // parse through the form and replace {{conID}} with values
        var templateTerminateCon = $('#con-terminate-template').html();
        var templateTerminateConPart = '';
        templateTerminateConPart += templateTerminateCon.replace(/{{conID}}/ig, conID)
        $("#conTerminateForm").append(templateTerminateConPart);
        // now show a form form commenting on this rejection
        $("#conTerminateForm").show();
    },
    
    // this will go out to the server with an terminate call on the ID
    terminateCON: function(conID, comments) {
        app.showSpinner(1,'Terminating, please wait...');
        // ajax call to econ server and wait for reply
        var econURL = mobile_bridge_href + econAppUrl;
        
        $.ajax({
            url: econURL,
            dataType: 'json',
            data: {con_id: conID, comments: comments, action_type: "TERMINATE", app_page: "mobile_action"},
            type:'POST'
            }).done(function(d) {
                if(d.status == 'ERROR') {
                    app.showAlert("Error: " + d.err_msg, "CON Termination");
                } else if (d.status == "SUCCESS") {
                    // OK, this has been terminated
                    $('#terminateCONButton').addClass('msgText').html('Terminated');
                    $('#rejectCONButton').hide();
                    $('#forwardCONButton').hide(); 
                    //$("#conTerminateForm").hide();
                    app.showSpinner(0,'');
                    // append the d.status_msg to the div after you have cleared it out
                     $("#conTerminateForm").html('').append("<p class='paddingFive'>" + d.status_msg + "</p>");
                }
            }).fail(function() {
                app.showSpinner(0,'');
                app.showAlert("Call to server failed, please try again.", "CON Termination");
            });
    }, // end terminateCON
    
    //*** SEARCH ***//
    submitCONSearch: function(formKeysValues) {
        var searchURL = '?page=switch_to_app&id=econ&app_page=mobile_search';
        
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
                 // map the returned search results into the conRecords and send to 
                 self.conRecords = $.map(returnedSearchJSONData.results, function(allCons){
                    return {
                        conTitle: allCons.project_title,
                        conID:  allCons.con_id,
                        conAmount:   allCons.usd_amount,
                        conDetailsUrl: allCons.json_details_url,
                        conDetailsStatus: allCons.status
                    }
                }); // close off map
                 
                Econ.displayECONs(self.conRecords);
                 
                }).fail(function() {
                     app.showAlert("ajax called failed", "Search ECON");
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
        // app.checkLogin(Econ.getRecords);
        Econ.getRecords();
    }
    
} // end Econ

// listen for the form search submit outside of the Econ object and pass the entire form serialized into Econ.submitCONSearch
$( "#searchForm" ).submit(function( event ) {
            Econ.submitCONSearch($( this ).serializeArray());
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


