/*

  Renders Topic pages

  Special lines start with

  title:
  this replaces the page <title> and the main heading with the value
  { }
  this draws a box around the stuff in between the braces

  topic: the title for each topic

  heading: a smaller heading. may also use h1, h2, etc.

  learning-goal:
  puts values of adjacent lines that start with this as items in learning goals list.
  a blank line or other non learning-goal: line will end the list

  big-idea:
  same as above, for a big ideas list

  <4 spaces>
  if a line starts with four/eight/twelve spaces (tab characters also work),
  it will have an added class stuck in it called 'indent1', 'indent2', etc.
  The line will be treated as any other line otherwise

  raw-html:
  all following lines until a blank line are just raw html that stuck on the page.
  (Michael claims that a blank line is actually not necessary)

  other currently supported classes: quiz, assignment, resource, forum, video, extresource.

  Other lines get their own <div> with the class as specified in the string before the colon
  Can also specify some actual html tags before the colon (e.g. h1)
  Anything in a [] is stuck as the target of a link

  You may hide particular classes by passing URL parameters.
  For instance, to hide all videos, simply add the parameter (without the quotes) "novideo=true".
  It'll end up looking something like this:
  topic.html?topic=berkeley_bjc/intro/broadcast-animations-music.topic&novideo=true&noreading=true

*/

/* The allowed tags for easy entry.
 * e.g.   h1: Some Text [maybe/a/link/too]
 */
llab.tags = ["h1", "h2", "h3", "h4", "h5", "h6"];
llab.topicKeywords = {};
llab.topicKeywords.resources = ["quiz", "assignment", "resource", "forum", "video", "extresource", "reading", "group"];
llab.topicKeywords.headings = ["h1", "h2", "h3", "h4", "h5", "h6", "heading"];
llab.topicKeywords.info = ["big-idea", "learning-goal"]

llab.matchesArray = function(line, A) {
    var matches = A.map(function(s) {return line.match(s);});
    return llab.any(matches.map(function(m) {return m != null;}));
}

llab.getKeyword = function(line, A) {
    var matches = A.map(function(s) {return line.match(s);});
    return A[llab.which(matches.map(function(m) {return m != null;}))];
}

llab.getContent = function(line) {
    var result = {};
    var sepIdx = line.indexOf(':');
    var content = line.slice(sepIdx + 1);
    var sliced = content.split(/\[|\]/);
    result.text = sliced[0];
    result.url = sliced[1];
    return result;
}


llab.renderFull = function(data, ignored1, ignored2) {
    var FULL   = llab.selectors.FULL,
        params = llab.getURLParameters(),
        course = params.course;


    llab.file = llab.topic;

    data = data.replace(/(\r)/gm,""); // normalize line endings
    var lines = data.split("\n");
    var topics = {topics: []};
    var line, topic_model, item, list, text, content, section, indent;
    var in_topic = false;
    var raw = false;
    var url = document.URL;
    for (var i = 0; i < lines.length; i++) {
        line = llab.stripComments(lines[i]);
	line = $.trim(line);
        if (line.length && !raw) {
            if (line.slice(0, 6) === "title:") {
		topics.title = line.slice(6);
            } else if (line.slice(0, 8) == "raw-html") {
                raw = true;
            } else if (line[0] == "{") {
		topic_model = {type: 'topic', url: '', contents: []}; // TODO: Figure out url
		topics.topics.push(topic_model);
		section = {title: '', contents: [], type: 'section'};
		topic_model.contents.push(section);
            } else if (line.slice(0, 6) == "topic:") {
		topic_model.title = line.slice(6);
            } else if (llab.matchesArray(line, llab.topicKeywords.headings)) {
		headingType = llab.getKeyword(line, llab.topicKeywords.headings);
		if (section.contents.length == 0) {
		    section.title = llab.getContent(line)['text'];
		} else {
		    section = {title: llab.getContent(line)['text'], contents: [], type: 'section'};
                    topic_model.contents.push(section);
		}
		section.headingType = headingType;
            } else if (line[0] == "}") {
		// shouldn't matter
            } else if (llab.matchesArray(line, llab.topicKeywords.info)) {
		tag = llab.getKeyword(line, llab.topicKeywords.info);
		content = llab.getContent(line)['text'];
		indent = llab.indentLevel(line);
		item = {type: tag, contents: content, indent: indent};
                section.contents.push(item);
            } else if (llab.matchesArray(line, llab.topicKeywords.info) || true) { // dumb way to handle lines without a known tag
		tag = llab.getKeyword(line, llab.topicKeywords.resources);
                indent = llab.indentLevel(line);
		content = llab.getContent(line);
		item = {type: tag, indent: indent, contents: content.text, url: content.url};
		section.contents.push(item);
		if (item.type == undefined) {
		    console.log("#################");
		    console.log(line);
		    console.log(line.length);
		}
            }
        } else if (line.length == 1) {
            raw = false;
        } else if (raw) {
            var raw_html = "";
            while (line.length > 1 && line.slice[0] != "}") {
                raw_html += " " + line;
                i++;
                line = lines[i];
            }
            topic.append(raw_html);
            raw = false;
	}
    }
    llab.topics = topics; // TODO: this is for testing purposes
    document.write("<pre>\n" + JSON.stringify(llab.topics, null, '\t') + "\n</pre>") // testing
}



/* Returns the indent class of this string,
 * depending on how far it has been indented
 * on the line. */
llab.indentLevel = function(s) {
    var len = s.length;
    var count = 0;
    for (var i = 0; i < len; i++) {
        if (s[i] == " ") {
            count++;
        } else if (s[i] == "\t") {
            count += 4;
        } else {
            break;
        }
    }
    return Math.floor(count/4);
}


/* Returns true iff S is an allowed html tag. */
llab.isTag = function(s) {
    return llab.tags.indexOf(s) !== -1;
}

llab.displayTopic = function() {
    llab.file = llab.getQueryParameter("topic");

    if (llab.file) {
        $.ajax({
            url : llab.topics_path + llab.file,
            type : "GET",
            dataType : "text",
            cache : true,
            success : llab.renderFull
        });
    } else {
        document.getElementsByTagName(llab.selectors.FULL).item(0).innerHTML = "Please specify a file in the URL.";
    }
}

// Make a call to build a topic page.
// Be sure that content is set only on pages that it should be
$(document).ready(function() {
    var url = document.URL,
        isTopicFile = (url.indexOf("topic.html") !== -1 ||
            // FIXME -- this may be broken.
            url.indexOf("empty-topic-page.html") !== -1);

    if (isTopicFile) {
        llab.displayTopic();
    }
});


// Stuff I need to add later
junk = function() {
    if (course) {
	if (course.indexOf("://") === -1) {
            course = llab.courses_path + course;
	}
	$(FULL).append($(document.createElement("a")).attr(
            {"class":"course_link", "href": course }
	).html(llab.strings.goMain));
    }
}


/*
  Error checking (do this after building page, so it won't slow it down?)

  Check the link targets if present - if they aren't there (give a 404),
  put a "broken" class on the link to render in red or something

  Maybe be smart about a mistyped youtube target?  dunno.

  Be forgiving:

  if there is no closing brace, put one there when another one opens or the page ends

  No error checking:

  No error checking on class name before the colon - it could be misspelled

  if no colon at all, just put no class on the div

*/
