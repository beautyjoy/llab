/*
* Used by to insert script and link tags in html pages, as the sole
* reference to a llab script.  
* This is slow; we recommend that build systems do this whenever possible and 
* remove all links to this script.
*
* Also, the llab object and llab.rootURL is made in library.js as well, if this file isn't used.
*
*/


// NOTE: this is built in library.js if not built here...
var bjc = {};
// rootURL also spec'ed in library.js
// TODO refactor this llab.curricPath.  Remove leading / maybe? ??
llab.rootURL = "/bjc-r";
// Path to llab scripts.  This is relative to the curriculum path!
llab.llabPath = "admin"
llab.loaded = {};  // keys are true if that file is loaded.


// TODO these paths are all relative to llab, not rootURL/curriculum.  Is that right??!

llab.paths = {};
llab.paths.links = ["/lib/normalize.css", "/lib/jquery-ui-1.10.2-smoothness.css", "/css/llab-default.css", "/css/from-mvle.css"];

llab.paths.scripts = [];
llab.paths.complete_funs = [];

///////////////// stage 0
//
llab.paths.scripts[0] = ["/lib/jquery-1.9.1.min.js", "/script/library.js"];
llab.loaded['bjc-library']= false;
llab.paths.complete_funs[0] = function() {
	return (( typeof jQuery == 'function') && 
	        ( llab.loaded['bjc-library'])
	);
}


////////// stage 1
// all these scripts depend on jquery, loaded in stage 0
// all quiz item types should get loaded here, because quiz.js depends on them
llab.paths.scripts[1] = ["/lib/jquery-ui.1.10.2.min.js", "/script/quiz/multiplechoice.js"];

llab.loaded['multiplechoice'] = false;
llab.paths.complete_funs[1] = function() {
	return ((llab.loaded['multiplechoice'] ) && 
	        (typeof jQuery.ui !== 'undefined')
	);
}


/////////  stage 2
// quiz.js depends on each of the quiz item types having loaded
// curriculum.js depends on jquery-ui

llab.paths.scripts[2] = ["/script/quiz.js", "/script/curriculum.js"];
llab.paths.complete_funs[2] = function() {
	// the last stage, no need to ever wait
	return true;
}


llab.initialSetUp = function() {
	var headElement = document.getElementsByTagName('HEAD').item(0);
	var apath;
	var tag;
	var i;
	var src;

	// add links
	for ( i = 0; i < llab.paths.links.length; i++) {
		tag = getTag("link", llab.paths.links[i], "text/css");
		tag.rel = "stylesheet";
		tag.media = "screen";
		headElement.appendChild(tag);
	}
	
	// load scripts, starting at stage 0
	loadScripts(0);



	function getTag(name, src, type) {
		var tag;
		tag = document.createElement(name);
		if (src.substring(0, 7) !== "http://") {
			src = llab.rootURL + src;
		}
		if (name === "link") {
			tag.href = src;
		} else {
			tag.src = src;
		}
		tag.type = type;
		return tag;
	}


	function loadScripts(stage_num) {
		var i;

		//console.log("starting script load stage " + stage_num);
		// load scripts
		for ( i = 0; i < llab.paths.scripts[stage_num].length; i++) {
			tag = getTag("script", llab.paths.scripts[stage_num][i], "text/javascript");
			headElement.appendChild(tag);
		}
		if ((stage_num + 1) < llab.paths.scripts.length) {
			proceedWhenComplete(stage_num);
		}
	}
	
	function proceedWhenComplete(stage_num) {
		if (llab.paths.complete_funs[stage_num]()) {
			if ((stage_num + 1) < llab.paths.scripts.length) {
				loadScripts(stage_num + 1);
			}
		} else {
			//console.log("waiting on stage " + stage_num);
			setTimeout(function() {proceedWhenComplete(stage_num)}, 50);
		}
	}

};

llab.initialSetUp();

