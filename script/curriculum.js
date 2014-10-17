/** curriculum.js
 *
 *  sets up a curriculum page -- either local or external.
 *
 *  Dependencies:
 *      jQuery
 *      library.js
 *      (Bootsrap) - optional, needed for looks, if missing code will still run
 */

llab.file = "";
llab.step = NaN;
llab.url_list = [];

var FULL = llab.selectors.FULL,
    hamburger = llab.fragments.hamburger;

llab.secondarySetUp = function() {

    // FIXME -- this needs to be called on EVERY page.
    llab.setupTitle();

    // This stuff should only happen on curriculum pages

    llab.step = parseInt(llab.getQueryParameter("step"));

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
    llab.file = llab.getQueryParameter("topic");

    // We don't have a topic file, so we should exit.
    if (llab.file === "" || isNaN(llab.step)) {
        return;
    }

    var ajaxURL = llab.rootURL + "topic/" + llab.file;
    $.ajax({
        url: ajaxURL,
        type: "GET",
        contentType: 'text/plain; charset=UTF-8',
        dataType: "text",
        cache: true,
        success: llab.processLinks,
        error: function(jqXHR, status, error) {
            // TODO: We should push errors to Google Analytics
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
llab.processLinks = function(data, status, jqXHR) {
    /* NOTE: DO NOT REMOVE THIS CONDITIONAL WITHOUT SERIOUS TESTING
     * FOR SOME REASON llab.file gets reset with the ajax call.
     */
    if (llab.file === '') {
        llab.file = llab.getQueryParameter("topic");
    }

    // Get the URL parameters as an object
    var params = llab.getURLParameters(),
        course = params.course,
        maxItemLen = 35,  // TODO: Replace this with CSS.
        topicArray = data.split("\n"),
        pageStep = 0,
        url = document.URL,
        // TODO: Move this to a dropdown function
        list = $(document.createElement("ul")).attr(
        { 'class': 'dropdown-menu dropdown-menu-right',
          'role' : "menu",  'aria-labeledby' : "Topic-Navigation-Menu"}),
        itemContent,
        ddItem,
        line,
        isHidden,
        lineClass;

    // This is necessary to make sure that each new URL has the right
    // step number. (We don't need to delete / re-create other properties)
    delete params.step;

    var i = 0, len = topicArray.length;
    for (; i < len; i+= 1) {
        line = llab.stripComments($.trim(topicArray[i]));

        // Skip is this line is hidden in URL params.
        lineClass = line.slice(0, line.indexOf(":"));
        isHidden = params.hasOwnProperty('no' + lineClass) &&
            params['no' + lineClass];
        if (isHidden) { continue; }

        // Line is a title.
        if (line.indexOf("title:") !== -1) {
            /* Create a link back to the main topic. */
            url = llab.topic_launch_page + "?";
            url += llab.QS.stringify(params);

            itemContent = line.slice(line.indexOf(":") + 1);
            itemContent = llab.truncate($.trim(itemContent), maxItemLen);

            // Create a special Title link and add a separator.
            itemContent = "<span class='main-topic-link'>" + itemContent + "</span>";
            ddItem = llab.dropdownItem(itemContent, url);
            // Note: Add to top of list!
            list.prepend(llab.fragments.bootstrapSep);
            list.prepend(ddItem);

            continue;
        }

        // If we don't have a link, skip this line.
        // FOR NOW -- eventually we should add these to the dropdown as well
        hasLink = line.indexOf("[") !== -1 && line.indexOf("]") !== -1;
        if (!hasLink) { continue; }

        // Grab the link title between : [
        itemContent = line.slice(line.indexOf(":") + 1, line.indexOf("["));
        itemContent = llab.truncate($.trim(itemContent), maxItemLen);
        // Grab the link betweem [ and ]
        url = (line.slice(line.indexOf("[") + 1, line.indexOf("]")));

        // Content References an external resource
        if (url.indexOf("//") !== -1) {
            url = llab.empty_topic_page_path + "?" + llab.QS.stringify(
            $.extend({}, params, {
                src: url,
                step: pageStep,
                title: itemContent
            }));
        } else { // Content reference is local
            if (url.indexOf(llab.rootURL) === -1 && url.indexOf("..") === -1) {
                url = llab.rootURL + (url[0] === "/" ? '' : "/") + url;
            }
            url += url.indexOf("?") !== -1 ? "&" : "?";
            url += llab.QS.stringify($.extend({}, params, {
                step: pageStep
            }));
        }

        llab.url_list.push(url);

        // Make the current step have an arrow in the dropdown menu
        if (pageStep === llab.step) {
            itemContent = "<span class='current-step-link'>" + itemContent + "</span>";
        }

        ddItem = llab.dropdownItem(itemContent, url);
        list.append(ddItem);
        pageStep += 1;

    } // end for loop

    if (course !== "") {
        // FIXME -- there could be more options
        if (course.indexOf("://") === -1) {
            course = llab.courses_path + course;
        }
        itemContent = "<span class='course-link-list'>" + llab.strings.goMain + "</span>";
        ddItem = llab.dropdownItem(itemContent, course);
        list.prepend(ddItem);
    }
    // Setup the nav button links and build the dropdown.
    llab.setButtonURLs();
    llab.buildDropdown();
    // FIXME -- will break on pages with multiple dropdowns (future)
    $('.dropdown').append(list);
    // Set the max-height of the dropdown list to not exceed window height
    // This is particularly important for smaller screens.
    $('.dropdown-menu').css('max-height', $(window).height() - 100);

    if (document.URL.indexOf(llab.empty_topic_page_path) !== -1) {
        llab.addFrame();
    }

    // FIXME -- this doesn't belong here.
    llab.indicateProgress(llab.url_list.length, llab.step);

    // FIXME -- not sure this really belongs here as well.
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
    // Special Case for Snap! in titles.
    document.title = document.title.replace('snap', 'Snap!');

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
        botHTML = "<div class='container-fluid'><div class='row'>" +
        	   "<div class='col-xs-12 col-md-8 progress-bar-bottom progress-bar-info'><div class='.col-xs-6 .col-md-4 bottom-nav " +
                      "btn-group'></div></div></div></div>",
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
    }

    forward = $('.forwardbutton');
    back    = $('.backbutton');

    // Disable the back button
    if (llab.step === 0) {
        back.each(function(i, item) {
            $(item).addClass('disabled')
                   .attr('href', '#');
        });
    } else {
        back.each(function(i, item) {
            $(item).removeClass('disabled')
                   .attr('href', llab.url_list[llab.step - 1])
                   .click(llab.goBack);
        });
    }

    // Disable the forward button
    if (llab.step >= llab.url_list.length - 1) {
        forward.each(function(i, item) {
            $(item).addClass('disabled')
                   .attr('href', '#');
        });
    } else {
        forward.each(function(i, item) {
            $(item).removeClass('disabled')
                   .attr('href', llab.url_list[llab.step + 1])
                   .click(llab.goForward);
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
 *  Note, these steps are 0 indexed!
 */
llab.indicateProgress = function(numSteps, currentStep) {
    var progress = $(llab.selectors.PROGRESS),
        width = progress.width(),
        // TODO: This neeeds to be a global selector!!
        btns = $('.bottom-nav').width(),
        pctMargin, result; // result stores left-offset of background image.

    /* This works as long as the buttons are on the RIGHT of the image to be
     * moved. The image on the last step will be moved at most the % width of
     * the buttons.
     */
    pctMargin = (btns / width) * 100;
    result = (currentStep + 1) /  (numSteps + 1); // Handle 0 indexing
    result = result * (100 - pctMargin);
    result = result + "% 2px";
    progress.css("background-position", result);
};

// Setup the nav and parse the topic file.
$(document).ready(llab.secondarySetUp);

