/*
 * course.js
 * 
 * loaded on course pages.
 * can depend on jquery and library.js
 */

 /* hide items and pass on course name. */
llab.editURLs = function() {
	
	
	
    $(".topic_container").each(function() {
        var args = "";
        var attributes = this.attributes;
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].name != "class") {
                args += "&" + attributes[i].name + "=" + attributes[i].value;
            }
        }
        $(this).find(".topic_link").each(function(){
            $(this).find("a")[0].href = $(this).find("a")[0].href + args;
        });
    });
    $("a").each(function() {
        if (document.location.href.indexOf(llab.courses_path) == -1) {
            this.href + "&course=" + document.location.href;
        } else {
            this.href = this.href + "&course=" + document.location.href.split("?")[0].split("/").pop();
        }
    });
}

llab.addTitle = function() {
    // insert main div
    if ($("#full").length == 0) {
        $(document.body).wrapInner('<div id="full"></div>');
	}

    // add header div
	$("#full").prepend($(document.createElement("div")).attr({"class":"header"}).html(document.title));

}
 
 $(document).ready(function() {
    llab.editURLs();
    llab.addTitle();
 });