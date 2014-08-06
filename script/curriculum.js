/** curriculum.js
 *
 *  sets up a curriculum page -- either local or external.
 *
 *  Dependencies:
 *      jQuery
 *      library.js
 *      (Bootsrap) - optional, needed for looks, if missing code will still run
 */


// TODO: These need to be moved to a better place:
// These are common strings that need not be build and should be reused!
llab.selectors = {};
llab.fragments = {};
llab.strings = {};
llab.strings.goMain = 'Go to the Course Page';
// &#8230; is ellipsis
llab.strings.clickNav = 'Click here to navigate&nbsp;&nbsp;';
//
llab.fragments.bootstrapSep = '<li class="divider list_item" role="presentation"></li>';
llab.fragments.bootstrapCaret = '<span class="caret"></span>';
llab.fragments.hamburger = '<span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>';
// LLAB selectors for common page elements
llab.selectors.FULL = '.full';
llab.selectors.NAVSELECT = '.llab-nav';
llab.selectors.PROGRESS = '.full-bottom-bar';


llab.file = "";
llab.step = NaN;
llab.url_list = [];

var FULL = llab.selectors.FULL,
    hamburger = llab.fragments.hamburger;

llab.secondarySetUp = function() {

    llab.step = parseInt(llab.getQueryParameter("step"));

    // Currently title requires llab.step work work properly.
    llab.setupTitle();

    // fix snap links so they run snap
    $("a.run").each(function(i) {
        $(this).attr("target", "_blank");
        $(this).attr('href', llab.getSnapRunURL(this.getAttribute('href')));
    });

    // make the vocab box if necessary
    // FIXME -- performance
    if ($("span.vocab").length > 0) {
        if ($("div.vocab").length === 0) {
            // it might already exist, in order to have a 'topX' class inserted.
            $(FULL).append('<div class="vocab"></div>');
        }
        var vocabDiv = $("div.vocab");
        $("span.vocab").each(function(i) {
            if (!(this.getAttribute('term'))) {
                this.setAttribute('term', this.innerHTML);
            }
            vocabDiv.append('<a href="' + llab.rootURL +
                '/glossary/view.html?term=' + this.getAttribute('term') +
                '" target="_vocab">' + this.getAttribute('term') + '</a>');
        });
    }

    // make the help box if necessary
    // FIXME -- performance
    var helpSpans = $("span.help");
    if (helpSpans.length > 0) {
        // TODO clean this up
        $(FULL).append('<div class="help"></div>');
        var helpDiv = $("div.help");
        helpSpans.each(function(i) {
            if (!(this.getAttribute('topic'))) {
                this.setAttribute('topic', this.innerHTML);
            }
            helpDiv.append('<p><a href="' + llab.rootURL +
            '/help/view.html?topic=' + this.getAttribute('topic') +
            '" target="_help">' + this.getAttribute('topic') + '</a></p>');
        });
    }

    // move anything that belongs in to the margin there, if necessary
    // these are the 4 class of divs that matter.
    // FIXME -- poor performace
    var marginSelector = ["div.key", "div.warning", "div.help", "div.vocab"];
    if ($(marginSelector.join(',')).length > 0) {
        // add the two columns.
        $(FULL).wrapInner('<div id="mainCol"></div>').prepend('<div id="marginCol"></div>');
        // this moves the divs over.  Perhaps it could do some smarter ordering
        // always put vocab at the bottom, for instance.
        var marginCol = $("#marginCol").get(0);
        $.each(marginSelector, function(i, divclass) {
            $(divclass).appendTo(marginCol);
        });
    }

    // Get the topic file and step from the URL
    var topicFile = llab.getQueryParameter("topic");

    // We don't have a topic file, so we should exit.
    if (topicFile === "" || isNaN(llab.step)) {
        return;
    }

    if (llab.getQueryParameter("step") === "") {
        // TODO -- this shouldn't happen, but we could intelligently find
        // which step this should be
    }

    if (typeof topicFile == "object") {
        llab.file = topicFile[1];
    } else {
        llab.file = topicFile;
    }

    $.ajax({
        url : llab.rootURL + "/topic/" + llab.file,
        type : "GET",
        dataType : "text",
        cache : true, // cache the topic page.
        success: llab.processLinks,
        error: function(jqXHR, status, error) {
            console.log('Error Accessing Topic: ' + llab.file);
            console.log('Error: ' + error);
            console.log('Status: ' + status);
        }
    });
}; // close secondarysetup();

/**
 *  Processes just the hyperlinked elements in the topic file,
 *  and creates navigation buttons.
 *  FIXME: This should share code with llab.topic!
 */
llab.processLinks = function(data, ignored1, ignored2) {
    // FIXME----- THERE IS A MAJOR BUG WHERE THE TOPIC IS SOMETIMES NOT DEFINED
    // THIS LEADS TO LINKS NOT WORKING
    // Also we are missing and encodeURI() are a title somewhere...
    var hidden = [];
    var hiddenString = "";

    // URL Options
    var temp = window.location.search.substring(1).split("&");

    var i;
    for (i = 0; i < temp.length; i++) {
        var param = temp[i].split("="); // param = [OPTION, VALUE]
        if (param[0].substring(0, 2) == "no" && param[1] == "true") {
            hidden.push(param[0].substring(2));
            hiddenString += ("&" + temp[i]);
        }
    } // end for loop

    // Get the URL parameters as an object
    var params = llab.getURLParameters();
    // Filter only the hidden ones.
    for (var opt in params) {
        if (opt.substring(0, 2) !== "no" && params[opt] !== 'true') {
            delete opt;
        }
    }

    var textLength = 35,
        course = llab.getQueryParameter("course"),
        lines = data.split("\n"),
        num = 0,
        url = document.URL,
        list = $(document.createElement("ul")).attr(
        { 'class': 'dropdown-menu dropdown-menu-right',
          'role' : "menu",  'aria-labelledby' : "Topic-Navigation-Menu"}),
        text,
        list_item,
        line,
        used;

    // FIXME -- cache length
    for (i = 0; i < lines.length; i++) {
        line = llab.stripComments($.trim(lines[i]));

        // Skip is this line is hidden in URL params.
        used = hidden.indexOf(line.slice(0, line.indexOf(":"))) === -1;
        if (!used) { continue; }

        // Line is a title.
        if (line.indexOf("title:") !== -1) {
            /* Create a link back to the main topic. */
            url = (llab.topic_launch_page + "?topic=" + llab.file +
                  hiddenString + "&course=" + course);

            text = line.slice(line.indexOf(":") + 1);
            text = llab.truncate($.trim(text), textLength);

            // Create a special Title link and add a separator.
            text = "<span class='main-topic-link'>" + text + "</span>";
            list_item = llab.dropdownItem(text, url);
            // Note: Add to top of list!
            list.prepend(llab.fragments.bootstrapSep);
            list.prepend(list_item);

            continue;
        }

        // TODO:  Check if we have a title for this link?
        // This also isn't a very robust check...
        // If we don't have a link, skip this line.
        var hasLink = line.indexOf("[") !== -1 && line.indexOf("]") !== -1;
        if (!hasLink) {
            continue;
        }

        // Grab the link title between : [
        text = line.slice(line.indexOf(":") + 1, line.indexOf("["));
        text = llab.truncate($.trim(text), textLength);
        // Grab the link betweem [ and ]
        url = (line.slice(line.indexOf("[") + 1, line.indexOf("]")));

        // Content References an external resource
        if (url.indexOf("http") !== -1) {
            url = (llab.empty_topic_page_path + "?" + "src=" +  url + "&" +
                  "topic=" + llab.file + "&step=" + num + "&title=" + text +
                  hiddenString + "&course=" + course);
        } else {
            if (url.indexOf(llab.rootURL) === -1 && url.indexOf("..") === -1) {
                url = llab.rootURL + (url[0] === "/" ? '' : "/") + url;
            }
            url += url.indexOf("?") !== -1 ? "&" : "?";
            url += "topic=" + llab.file + "&step=" + num + hiddenString;
            url += "&course=" + course;
        }

        llab.url_list.push(url);

        // Make the current step have an arrow in the dropdown menu
        if (num === llab.step) {
            text = "<span class='current-step-link'>" + text + "</span>";
        }

        list_item = llab.dropdownItem(text, url);
        list.append(list_item);
        num += 1;
    } // end for loop

    if (course !== "") {
        if (course.indexOf("http://") === -1) {
            course = llab.courses_path + course;
        }
        text = "<span class='course-link-list'>" + llab.strings.goMain + "</span>";
        list_item = llab.dropdownItem(text, course);
        list.prepend(list_item);
    }

    // Setup the nav button links and build the dropdown.
    llab.setButtonURLs();
    llab.buildDropdown();
    // FIXME -- will break on pages with multiple dropdowns (future)
    $('.dropdown').append(list);

    // FIXME -- shouldn't special case this
    if (document.URL.indexOf(llab.empty_topic_page_path) !== -1) {
        llab.addFrame();
    }

    llab.indicateProgress(llab.url_list.length, llab.step);

    // FIXME -- not sure this really belongs here...
    llab.addFeedback(document.title, llab.file, course);
}; // end processLinks()


// Create an iframe when loading from an empty curriculum page
// Used for embedded content. (Videos, books, etc)
llab.addFrame = function() {
    var source = llab.getQueryParameter("src");

    // FIXME -- Performace + Cleanup
    $(FULL).append('<a href=' + source +
        ' target="_">Open page in new window</a><br /><br />');
    $(FULL).append('<div id="cont"></div>');

    var frame = $(document.createElement("iframe")).attr(
        {'src': source, 'class': 'step_frame'} );

    $("#cont").append(frame);
};

// Setup the entire page title. This includes creating any HTML elements.
// This should be called EARLY in the load process!
// FIXME: lots of stuff needs to be pulled out of this function
llab.setupTitle = function() {
    // TODO: rename / refactor location
    $(document.head).append('<meta name="viewport" content="width=device-width, initial-scale=1">');

    if (typeof llab.titleSet !== 'undefined' && llab.titleSet) {
        return;
    }

    // Create .full before adding stuff.
    if ($(FULL).length === 0) {
        $(document.body).wrapInner('<div class="full"></div>');
    }

    // Work around when things are oddly loaded...
    if ($(llab.selectors.NAVSELECT).length !== 0) {
        $(llab.selectors.NAVSELECT).remove();
    }

    // Create the header section and nav buttons
    llab.createTitleNav();

    // create Title tag, yo
    if (llab.getQueryParameter("title") !== "") {
        document.title = decodeURIComponent(llab.getQueryParameter("title"));
    }

    // Set the header title to the page title.
    var titleText = document.title;
    if (titleText) {
        // FIXME this needs to be a selector
        $('.navbar-brand').html(titleText);
        $('.title-small-screen').html(titleText);
    }

    // Clean up document title if it contains HTML
    document.title = $(".navbar-brand").text();

    // FIXME -- Not great on widnow resize
    // Needs to be refactored, and window listener added
    $(document.body).css('padding-top', $('.llab-nav').height() + 15);
    window.onresize = function(event) {
        $(document.body).css('padding-top', $('.llab-nav').height() +
        15);
    };
    llab.titleSet = true;
};

// Create the 'sticky' title header at the top of each page.
llab.createTitleNav = function() {
    // FIXME -- clean up!!
    var topHTML = ('' +
        '<nav class="llab-nav navbar navbar-default navbar-fixed-top" role="navigation">' +
        '<div class="nav navbar-nav navbar-left navbar-brand"></div></nav>' +
        '<div class="title-small-screen"></div>'),
        botHTML = "<div class='full-bottom-bar'><div class='bottom-nav " +
                      "btn-group'></div></div>",
        navHTML = '<div class="nav navbar-nav navbar-right">' +
                  '<ul class="nav-btns btn-group"></ul></div>',
        topNav = $(llab.selectors.NAVSELECT),
        buttons = "<a class='btn btn-default backbutton arrow'>back</a>" +
                   "<a class='btn btn-default forwardbutton arrow'>next</a>";

    if (topNav.length === 0) {
        $(document.body).prepend(topHTML);
        topNav = $(llab.selectors.NAVSELECT);
        topNav.append(navHTML);
    }

    // Don't add anything else if we don't know the step...
    // FIXME -- this requires a step as a URL param currently.
    // FUTURE - We should separate the rest of this function if necessary.
    if (isNaN(llab.step)) {
        return;
    }

    // TODO: selector...
    $('.nav-btns').append(buttons);
    if ($(llab.selectors.PROGRESS).length === 0) {
        $(FULL).append(botHTML);
        $('.bottom-nav').append(buttons);
    }

    llab.setButtonURLs();
};


// Create the navigation dropdown
llab.buildDropdown = function() {
    // TODO -- cleanup use selectors for classes

    var dropwon, list_header;
    // Container div for the whole menu (title + links)
    dropdown = $(document.createElement("div")).attr(
        {'class': 'dropdown inline'});

    // build the list header
    list_header = $(document.createElement("button")).attr(
        {'class': 'navbar-toggle btn btn-default dropdown-toggle list_header',
         'type' : 'button', 'data-toggle' : "dropdown" });
    list_header.append(hamburger);

    // Add Header to dropdown
    dropdown.append(list_header);
    // Insert into the top div AFTER the backbutton.
    dropdown.insertAfter($('.navbar-default .navbar-right .backbutton'));
};

/** Build an item for the navigation dropdown
 *  Takes in TEXT and a URL and reutrns a list item to be added
 *  too an existing dropdown */
llab.dropdownItem = function(text, url) {
    var link, item;
    // li container
    item = $(document.createElement("li")).attr(
        {'class': 'list_item', 'role' : 'presentation'});
    link = $(document.createElement("a")).attr(
        {'href': url, 'role' : 'menuitem'});
    link.html(text);
    item.append(link);
    return item;
};

// Create the Forward and Backward buttons, properly disabling them when needed
llab.setButtonURLs = function() {
    // No dropdowns for places that don't have a step.
    if (isNaN(llab.step)) {
        return;
    }

    // TODO REFACTOR THIS
    var forward = $('.forwardbutton');
        back    = $('.backbutton');

    var buttonsExist = forward.length !== 0 && back.length !== 0;

    if (!buttonsExist & $(llab.selectors.NAVSELECT) !== 0) {
        // freshly minted buttons. MMM, tasty!
        llab.createTitleNav();
        forward = $('.forwardbutton');
        back    = $('.backbutton');
    }

    forward = $('.forwardbutton');
    back    = $('.backbutton');

    // Disable the back button
    if (llab.step === 0) {
        back.each(function(i, item) {
            $(this).addClass('disabled');
            $(this).attr('href', '#');
        });
    } else {
        back.each(function(i, item) {
            $(this).removeClass('disabled');
            $(this).attr('href', llab.url_list[llab.step - 1]);
            $(this).click(llab.goBack);
        });
    }

    // Disable the forward button
    if (llab.step >= llab.url_list.length - 1) {
        forward.each(function(i, item) {
            $(this).addClass('disabled');
            $(this).attr('href', '#');
        });
    } else {
        forward.each(function(i, item) {
            $(this).removeClass('disabled');
            $(this).attr('href', llab.url_list[llab.step + 1]);
            $(this).click(llab.goForward);
        });
    }
};

// TODO: Update page content and push URL onto browser back button
llab.goBack = function() {
    window.location.href = llab.url_list[llab.step - 1];
};

llab.goForward = function() {
    window.location.href = llab.url_list[llab.step + 1];
};

llab.addFeedback = function(title, topic, course) {
    // Prevent Button on small devices
    if (screen.width < 1024) {
        return;
    }


    // TODO: Make this config
    var surveyURL = 'https://getfeedback.com/r/sPesM45m?PAGE=pageRep&TOPIC=topicRep&COURSE=courseRep&URL=urlRep';
    surveyURL = surveyURL.replace(/pageRep/g, encodeURIComponent(title))
                          .replace(/topicRep/g, encodeURIComponent(topic))
                          .replace(/courseRep/g, encodeURIComponent(course))
                          .replace(/urlRep/g, encodeURIComponent(document.URL));

    var button = $(document.createElement('button')).attr(
            {   'class': 'btn btn-primary btn-xs feedback-button',
                'type': 'button',
                'data-toggle': "collapse",
                'data-target': "#fdbk" }).text('Feedback'),
        innerDiv = $(document.createElement('div')).attr(
            {   'id': "fdbk",
                'class': "collapse feedback-panel panel panel-primary"
            }),
        feedback = $(document.createElement('div')).attr(
            {'class' : 'page-feedback'}).append(button, innerDiv);

    // Delay inserting a frame until the button is clicked.
    // Reason 1: Performance
    // Reason 2: GetFeedback tracks "opens" and each load is an open
    button.click('click', function(event) {
        if ($('#feedback-frame').length === 0) {
            var frame = $(document.createElement('iframe')).attr(
            {
                'frameborder': "0",
                'id': 'feedback-frame',
                'width': "300",
                'height': "200",
                'src': surveyURL
            });
            $('#fdbk').append(frame);
        }
    });
    $(document.body).append(feedback);
};

/**
 *  Positions an image along the bottom of the lab page, signifying progress.
 *  numSteps is the total number of steps in the lab
 *  currentStep is the number of the current step
 *  totalWidth is the width of the entire bottom bar
 *  buttonWidth is the combined width of the two nav buttons.
 */
llab.indicateProgress = function(numSteps, currentStep) {
    var progress = $(llab.selectors.PROGRESS),
        width = progress.width(),
        btns = $('bottom-nav').width(),
        result; // result stores left-offset of background image.

    width -= btns;
    if (currentStep < numSteps - 1) {
        result = (currentStep * (width / (numSteps - 1)) + 1) / (width - 10);
        // Result is always a min of 1%.
        result = (result < 0.01) ? 1 : (result * 100);
        result = result + "%";
    } else {
        var picWidth = progress.css("background-size");
        picWidth = Number(picWidth.slice(0, picWidth.indexOf("px")));
        // the 4 is just to add a bit of space
        result = width - picWidth - 4 + "px";
    }

    result = result + " 2px";
    progress.css("background-position", result);
};

// Setup the nav and parse the topic file.
$(document).ready(llab.secondarySetUp);

