// user.js

// this should allow google ids, etc, per settings in config.js.


//  for 61b, this is a simple user-id system where the user picks the username

// this all takes place in a dialog.




///////////////// user object


var USER = function() {
	this.username = this.readCookie("llab-username");
	if (this.username == "") {
		this.username = "anonymous";
	}
	this.section = this.readCookie("llab-section");
	if (this.section == "" || this.section == null) {
		this.section = 1;
	}
	
	this.dialoghtml = $(this.getDialogHTML());
	this.hiderdiv = $('<div id="user_hider_div"></div>');
}

USER.prototype.setUserName = function(username) {
	// very secure, natch
	this.username = username;
	this.createCookie("llab-username", username, 365);
}

USER.prototype.getUserName = function() {
	return this.username;
}

USER.prototype.isSet = function() {
	return (this.username != null && this.username != "anonymous" && this.username != "");
}

USER.prototype.setSection = function(section) {
	this.section = section;
	this.createCookie("llab-section", section);
}


USER.prototype.showDialog = function() {
	$("#user_hider_div").fadeIn("slow");
	$('#user-dialog').fadeIn("slow");
}


USER.prototype.hideDialog = function() {
	$("#user_hider_div").fadeOut("slow");
	$('#user-dialog').fadeOut("slow");
}


//////













//// cookies



// someday my framework will come, but for now, stolen blithely from http://www.quirksmode.org/js/cookies.html
USER.prototype.createCookie = function(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

USER.prototype.readCookie = function(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

USER.prototype.eraseCookie = function(name) {
	createCookie(name,"",-1);
}



USER.prototype.getDialogHTML = function() {
	template = 
	'<div id="user-dialog">' +
	    '<p>Enter your username and section</p>' +
	    '<div class="username">' +
	       'Username: ' +
	       '<input name="username" type="text" width="80">' +
	    '</div>' +
   	    '<div class="section">' +
	       'Section: ' +
	       '<input name="section" type="text" width="80">' +
	    '</div>' +
	    '<div class="closebutton">' +
	       '<input type="button" value="OK" onClick="llab.user.user.hideDialog();"/>' + 
	    '</div>' +
	'</div>';
	return template;
}


llab.user = {};
llab.user.user = new USER();

$(document).ready(function() {
	llab.user.user.dialoghtml.appendTo($("body")).hide();
	//$("#user-dialog").hide();
	llab.user.user.hiderdiv.appendTo($("body")).hide();
	//$("#user_hider_div").hide();
});

llab.loaded['user'] = true;
