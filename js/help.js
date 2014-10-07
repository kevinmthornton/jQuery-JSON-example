/* js help file*/

var help = {
    urlParam: function(name){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    return vars;
    },
    
    showNoInternet : function() {
        $("#noInternet").show();
    },
    
    showNoVPN : function() {
        $("#noVPN").show();
    },
    
    showNoData : function() {
        $("#noData").show();
    },
    
    showAll : function() {
        this.showNoInternet();
        this.showNoVPN();
    },
    
    initialize: function (){
      // grab the msg off of the URL
      var msg = this.urlParam()["msg"];
      // app.showAlert('msg: ' + msg, 'Help Initialize');
      if (msg == "noVPN") {
        this.showNoVPN();
      } else if (msg == "noInternet") {
        this.showNoInternet();
      } else if (msg == "noData") {
        this.showNoData();
      }else {
        this.showAll();
      }
    }       
    
    
} // end var help