/*
* Single script reference for content pages
* 
*/




/*
 * CONFIG
 */

CONFIG_FILE_PATH = "/llab-website-test/llab/config.js";

/*
 * END CONFIG
 */











// NOTE: this is built in library.js if not built here (because this file isn't used, say)
llab = {};
llab.loaded = {};  // keys are true if that script file is loaded (script file should set key to true)


llab.paths = {};
llab.paths.stage_complete_functions = [];
llab.paths.scripts = [];  // holds the scripts to load, in stages below
llab.paths.css_files = [];  
llab.rootURL = "";  // to be overridden in config.js
llab.install_directory = "";  // to be overridden in config.js




///////////////////////// 
///////////////////////// stage 0
llab.paths.scripts[0] = [];
llab.paths.scripts[0].push(CONFIG_FILE_PATH);

llab.loaded['config'] = false;
llab.paths.stage_complete_functions[0] = function() {
	return ( llab.loaded['config'] );
}





/////////////////
///////////////// stage 1
llab.paths.scripts[1] = [];
llab.paths.scripts[1].push("lib/jquery-1.9.1.min.js");
llab.paths.scripts[1].push("script/library.js");

llab.loaded['library'] = false;
llab.paths.stage_complete_functions[1] = function() {
return (( typeof jQuery == 'function') && 
        ( llab.loaded['library'])
    );
}



////////////////////
//////////////////// stage 2
// all these scripts depend on jquery, loaded in stage 1
// all quiz item types should get loaded here
llab.paths.scripts[2] = [];
llab.paths.scripts[2].push("lib/jquery-ui.1.10.2.min.js");
llab.paths.scripts[2].push("script/quiz/multiplechoice.js");

llab.loaded['multiplechoice'] = false;
llab.paths.stage_complete_functions[2] = function() {
	return ((llab.loaded['multiplechoice'] ) && 
	        (typeof jQuery.ui !== 'undefined')
	);
}




////////////////
////////////////  stage 3
// quiz.js depends on each of the quiz item types having loaded
// curriculum depends on jquery-ui
llab.paths.scripts[3] = [];
llab.paths.scripts[3].push("script/quiz.js");
llab.paths.scripts[3].push("script/curriculum.js");


llab.paths.stage_complete_functions[3] = function() {
	// the last stage, no need to wait
	return true;
}




//////////////

llab.initialSetUp = function() {
	var headElement = document.getElementsByTagName('HEAD').item(0);
	var apath;
	var tag;
	var i;
	var src;

	
	// start the process
	loadScriptsAndLinks(0);



	function getTag(name, src, type) {
		var tag;
		//console.log("Dealing with tag " + name + " with src " + src + " of type " + type);
		 
		tag = document.createElement(name);
		if (src.substring(0, 7) !== "http://") {
			src = llab.rootURL + llab.install_directory + src;
		}
		if (name === "link") {
			tag.href = src;
		} else {
			tag.src = src;
		}
		tag.type = type;
		return tag;
	}


	function loadScriptsAndLinks(stage_num) {
		var i;
		var tag;

		//console.log("starting script load stage " + stage_num);		
		
		// load css files
		while (llab.paths.css_files.length != 0) {
			tag = getTag("link", llab.paths.css_files.shift(), "text/css");
			tag.rel = "stylesheet";
			tag.media = "screen";
			headElement.appendChild(tag);
		}
		
		// load scripts
		llab.paths.scripts[stage_num].forEach(function(scriptfile) {
			var tag;
			tag = getTag("script", scriptfile, "text/javascript");
			headElement.appendChild(tag);
		});
		if ((stage_num + 1) < llab.paths.scripts.length) {
			proceedWhenComplete(stage_num);
		}
	}
	
	function proceedWhenComplete(stage_num) {
		if (llab.paths.stage_complete_functions[stage_num]()) {
			if ((stage_num + 1) < llab.paths.scripts.length) {
				loadScriptsAndLinks(stage_num + 1);
			}
		} else {
			//console.log("waiting on stage " + stage_num);
			setTimeout(function() {proceedWhenComplete(stage_num)}, 50);
		}
	}

};

llab.initialSetUp();

