/*
 * Common functions for any llab page
 * 
 * CANNOT RELY ON JQUERY OR ANY OTHER LLAB LIBRARY
 */

if (typeof llab === 'undefined') {
    // if loader.js wasn't used, we'll do this here in the first one
    llab = {};
    llab.loaded = {};
}










/////////////////


llab.CORSproxy = "www.corsproxy.com";

llab.CORSCompliantServers = [];
llab.CORSCompliantServers.push("llab.berkeley.edu");
llab.CORSCompliantServers.push("llab.eecs.berkeley.edu");
llab.CORSCompliantServers.push("snap.berkeley.edu");
llab.CORSCompliantServers.push("inst.eecs.berkeley.edu");
llab.CORSCompliantServers.push("cs10.berkeley.edu");


////

llab.snapRunURLBase = "http://snap.berkeley.edu/snapsource/snap.html#open:";

// returns the current domain with a cors proxy if needed

llab.getSnapRunURL = function(targeturl) {

	if (targeturl != null) {   

		if (targeturl.substring(0, 7) == "http://") {
			// pointing to some non-local resource... maybe a published cloud project?  do nothing!!
			return targeturl;

		} else {
			// internal resource!
			var finalurl = llab.snapRunURLBase + "http://";
			var currdom = document.domain;
			console.log(currdom);
			// why not, for the devs out there...
			if (currdom == "localhost") {
				currdom = "llab.berkeley.edu";
			}
			if (llab.CORSCompliantServers.indexOf(currdom) == -1) {
				finalurl = finalurl + llab.CORSproxy + "/";
			}
			if (targeturl.indexOf("..") != -1 || targeturl.indexOf(llab.rootURL) == -1) {
				var path = window.location.pathname;
				path = path.split("?")[0];
				path = path.substring(0, path.lastIndexOf("/") + 1)
				currdom = currdom + path;
			}
			finalurl = finalurl + currdom + targeturl;

			return finalurl;
		}
	}

	return currdom;

}



//TODO put this in the llab namespace
/** Returns the value of the URL parameter associated with NAME. */
function getParameterByName(name) {
	/*name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	var results = window.location.search.match(regex);
	console.log(results);*/
	var results = [];
	var strings = window.location.search.substring(1).split("&");
    for (var i = 0; i < strings.length; i++) {
        var temp = strings[i].split("=");
        if (temp[0] == name) {
            results.push(temp[1]);
        }
    }
	if (results.length == 0)
        return "";
	else if (results.length == 1) {
        return results[0];
	} else {
        //console.log(decodeURIComponent(results[1].replace(/\+/g, " ")));
        //return decodeURIComponent(results[1].replace(/\+/g, " "));
        return results;
    }
}



/** Strips comments off the line. */
llab.stripComments = function(line) {
	var index = line.indexOf("//");
	if (index != -1 && line[index - 1] != ":") {
		line = line.slice(0, index);
	}
	return line;
}



/** Google Analytics Tracking
 * To make use of this code, the two ga() functions need to be called
 *  on each page that is loaded, which means this file must be loaded. 
 */

// TODO -- use boolean llab.GAuse 

llab.GAfun =  function(i,s,o,g,r,a,m) {
    i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  };

llab.GA = function() {
        llab.GAfun(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    }
// GA Function Calls -- these do the real work!: 
// ga('create', llab.GACode, llab.GAUrl);
// ga('send', 'pageview');




/////////////////////  END
llab.loaded['library'] = true;
