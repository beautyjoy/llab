/*
* Used by content pages (/cur) to have a single script reference that will
* load all necessary libraries.
*
* Also, the llab object and llab.rootURL is made in bjc-main.js as well, if this file isn't used.
*
*/

// NOTE: this is built in library.js if not built here (because this file isn't used, say)
llab = {};
llab.loaded = {};  // keys are true if that script file is loaded (script file should set key to true)




/// If loader.js isn't used (for topic.html, for instance), you will need to duplicate
/// these loads below.  The stages reflect required ordering.

llab.paths = {};
llab.paths.stage_complete_functions = [];
llab.paths.links = [];
llab.paths.links.push('http://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.0/normalize.min.css');
llab.paths.links.push('http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/smoothness/jquery-ui.min.css');
for (var i=0; i < llab.paths.links.push(llab.paths.css_files.length; i++) {
  llab.paths.links.push(llab.paths.css_files[i]);
};


llab.paths.scripts = [];



///////////////// stage 0
//
llab.paths.scripts[0] = ["lib/jquery-1.9.1.min.js", "script/library.js"];
llab.loaded['library'] = false;
llab.paths.stage_complete_functions[0] = function() {
return (( typeof jQuery == 'function') && 
        ( llab.loaded['library'])
    );
}


////////// stage 1
// all these scripts depend on jquery, loaded in stage 0
// all quiz item types should get loaded here
llab.paths.scripts[1] = ["lib/jquery-ui.1.10.2.min.js", "script/quiz/multiplechoice.js"];

llab.loaded['multiplechoice'] = false;
llab.paths.stage_complete_functions[1] = function() {
	return ((llab.loaded['multiplechoice'] ) && 
	        (typeof jQuery.ui !== 'undefined')
	);
}


/////////  stage 2
// bjc-quiz.js depends on each of the quiz item types having loaded
// bjc-curriculum depends on jquery-ui

llab.paths.scripts[2] = ["script/quiz.js", "script/curriculum.js"];
llab.paths.stage_complete_functions[2] = function() {
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
		if (llab.paths.stage_complete_functions[stage_num]()) {
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

