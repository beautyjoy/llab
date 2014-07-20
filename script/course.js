/*
 * course.js
 *
 * loaded on course pages
 * Modifies the links on a course page so that queries are properly passed along
 *
 * Depends on:
 *      llab loader
 *      jQuery
 */

'use strict';

 /* Create the Query string for links to each topic within a course. */
llab.editURLs = function() {
    var query = {};

    // Set the 'course' attribute
    if (document.location.pathname.indexOf(llab.courses_path) !== -1) {
        query['course'] = document.location.pathname;
    }

    // TODO: only really supports one container per file.
    // Build the Query string from container attributes
    $(".topic_container").each(function() {
        var attrs = this.attributes,
            i = 0;
        for (; i < attrs.length; i++) {
            if (attrs[i].name != "class") {
                console.log(attrs[i]);
                query[attrs[i].name] = query[attrs[i].value];
            }
        }
    });

    // FIXME -- this is most surely buggy
    $(".topic_link a").each(function() {
        console.log(this);
        this.href += '?' + llab.queryString.stringify(query);
        console.log(this);
    });
};

$(document).ready(function() {
    llab.editURLs();
});