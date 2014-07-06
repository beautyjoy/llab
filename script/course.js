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

 /* hide items and pass on course name. */
llab.editURLs = function() {
    $(".topic_container a").each(function() {
        var args = "";
        var attributes = this.attributes;
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].name != "class") {
                args += "&" + attributes[i].name + "=" + attributes[i].value;
            }
        }
        $(this).find(".topic_link").each(function() {
            $(this).find("a")[0].href = $(this).find("a")[0].href + args;
        });
    });
    
    // FIXME -- this is most surely buggy
    $("a").each(function() {
        if (document.location.href.indexOf(llab.courses_path) == -1) {
            this.href + "&course=" + document.location.href;
        } else {
            this.href = this.href + "&course=" + document.location.href.split("?")[0].split("/").pop();
        }
    });
};

$(document).ready(function() {
    lab.editURLs();
});