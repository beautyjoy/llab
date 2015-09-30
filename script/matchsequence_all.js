/*
 * every matchsequence javascript from wise
 * with lots of small tweaks by nate, here and there, to rip out node.js, etc.
 */

/*
 * Copyright (c) 2009 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author: Hiroki Terashima
 */




// TODO move everything in llab namespace, yo.
///////////////
/// from the stock HTML page, with nate additions to build html

// namespace for everything -- eventually!
llab.ms = {} // namespace stuff

/* 
 * TODO
 * - grab the latest code from wise?  Really?  Hm.
 * - redo dom, removing all ID usage to classes.  Will need to pass in msdiv
 *   in lots of functions, sure. Fix CSS to reflect this
 * - move to .matchsequence-data format to input content
 *   need to write .matchsequence-data -> msjson
 *   add css/background img for .matchsequence-data, etc., ala brainstorm
 * - use jsrender to build .matchsequence domtree, banishing the evil 
 *   in mstemplatediv and throughout the original wisecode 
 */

// TODO refactor code to change everywhere these is called, when removing ids
llab.ms.removeClassFromElement = function(id, cls) {
    $("#" + id).removeClass(cls);
}
llab.ms.addClassToElement = function(id, cls) {
    $("#" + id).addClass(cls);
}


$(document).ready(function() {
    // first get the msdiv template
    llab.ms.nodes = [];
    $.get(llab.empty_matchsequence_div_URL, function(mstemplate) {
        $("div.matchsequence-data").each(function(i, msdatadiv) {
            // copy/instantiate template
            var msdiv = $(mstemplate).clone();
            $(msdiv).attr("indexOnPage", i);
            //attach .matchsequence templatediv after datadiv
            $(msdatadiv).after(msdiv);
            // get the ms specification and pass to buildTheDiv()
            llab.ms.getSpecificationAndBuild(i, msdatadiv, msdiv);
        });
    }, "html").fail(function(jqXHR, textStatus, error) {
        // TODO make better
        $(".matchsequence-data").addClass("remote-data-error")
           .append("<hr><p>Failed to retrievie Match & Sequence template. "
                   + "I blame the patriarchy.</p><p>Error: "+error+"</p>");
    });

});


// may need to go out
llab.ms.getSpecificationAndBuild = function(i, msdatadiv, msdiv) {
    // TODO use .matchsequence-data div, yo.
    // hack for now!!
    var msspec =  llab_ms_myModels[i];
    // this is the callback when using ajax:
    llab.ms.buildTheDiv(msspec, i, msdiv, msdatadiv);
}


llab.ms.buildTheDiv = function(msspec, i, msdiv, msdatadiv) {
    // build the wise stuff and go...
    var ms = new MS(msspec, i, msdiv);
    llab.ms.nodes[i] = ms;
    $(msdiv).find(".checkAnswerButton").click(function(event) {
        var i = $(this).parents(".matchsequence").attr("indexOnPage");
        llab.ms.nodes[i].checkAnswer(event);
    });
    ms.render();
    $(msdatadiv).hide(125);
    $(msdiv).show(125)
}

// unused -- removed the help links.  MatchSequendceInfoBox is a nice doc page, though
//llab.ms.newWin = null;
//llab.ms.popUp = function(strURL, strType, strHeight, strWidth){
//    if (llab.ms.newWin != null && !llab.ms.newWin.closed) 
//        llab.ms.newWin.close();
//    var strOptions = "";
//    if (strType == "console") 
//        strOptions = "resizable,height=" +
//        strHeight +
//        ",width=" +
//        strWidth;
//    if (strType == "fixed") 
//        strOptions = "status,height=" +
//        strHeight +
//        ",width=" +
//        strWidth;
//    if (strType == "elastic") 
//        strOptions = "toolbar,menubar,scrollbars," +
//        "resizable,location,height=" +
//        strHeight +
//        ",width=" +
//        strWidth;
//    llab.ms.newWin = window.open(strURL, 'newWin', strOptions);
//    llab.ms.newWin.focus();
//}



// ///////////////////////////////////////////
// /// from matchsequencedraganddrop.js



llab.ms.renderDragAndDrop = function(ms) {
    $('#play ul').sortable({
        connectWith : 'ul',
        stop : function(e, ui) {
            /* update the match sequence */
            ms.addOrderingToChoices();
            ms.saveState();
            ms.enableCheckAnswerButton();
        }
    });
    $('#play ul').disableSelection();
};







// ///////////////////////////////////////////////////////////
// /// from matchsequencebucket.js

function MSBUCKET(bucketObj) {
    if (bucketObj) {
        this.isTargetBucket = true;
        this.obj = bucketObj;
        this.identifier = this.obj.identifier;
        this.text = this.obj.name; // bucket header that students will see, can
        // be html
        this.choices = [];
    } else {
        this.isTargetBucket = false;
        this.identifier = "sourceBucket";
        this.text = "Choices";
        this.choices = [];
    }
}

/**
 * Shuffles the choices in the bucket
 */
MSBUCKET.prototype.shuffle = function() {
    this.choices.shuffle();
};

/**
 * If prototype 'shuffle' for array is not found, create it
 */
if (!Array.shuffle) {
    Array.prototype.shuffle = function() {
        for (var rnd, tmp, i = this.length; i; rnd = parseInt(Math.random() * i), tmp = this[--i], this[i] = this[rnd], this[rnd] = tmp)
            ;
    };
};







// /////////////////////////////////////////////////////
// // from matchsequencechoice.js

function MSCHOICE(choiceObj, bucket) {
    if (choiceObj) {
        this.obj = choiceObj;
        this.identifier = choiceObj.identifier;
        this.text = choiceObj.value; // choice text that students will see,
                                        // can be html
        this.bucket = bucket;
    } else {
        this.bucket = bucket;
    }
    ;
};





///////////////////////////////////////////
//  from matchsequencestate.js

// TODO  get state working for real.

function MSSTATE() {
    this.type = "ms";
    this.sourceBucket = null;
    this.buckets = [];
}

/**
 * Get the student work in human readable form. This is used in
 * the grading tool to display the student work to the teacher.
 * @return the student work in human readable form.
 */
MSSTATE.prototype.getStudentWork = function(){
    var text = "";
    
    //loop through all the target buckets
    for(var h=0;h<this.buckets.length;h++){
        var bucket = this.buckets[h];
        //get the text for the bucket
        var bucketText = bucket.text;

        /*
         * each bucket will be represented as following
         * 
         * ([bucketText]: choice1Text, choice2Text)
         */
        text += "([" + bucketText + "]: ";
        
        var choicesText = "";
        
        //loop through the choices
        for(var g=0;g<bucket.choices.length;g++){
            //if this is not the first choice, add a comma to separate them
            if(choicesText != "") {
                choicesText += ", ";
            }
            
            //add the bucket text
            choicesText += bucket.choices[g].text;
        };
        
        text += choicesText;
        
        //close the bucket and add a new line for easy reading
        text += ")<br>";
    };
    return text;
};

/**
 * Create a MSSTATE that we can jsonify. This means removing
 * cycling references such as the the choices pointing to
 * the bucket that they are in, and the bucket pointing
 * to the choices that are in it
 * @return
 */
MSSTATE.prototype.getJsonifiableState = function() {
    //make a new MSSTATE
    var msState = new MSSTATE();
    
    //set the buckets into our new MSSTATE
    msState.buckets = this.buckets;
    
    //loop through all the buckets
    for(var x=0; x<msState.buckets.length; x++) {
        //get a bucket
        var bucket = msState.buckets[x];
        
        //loop through all the choices that are in the bucket
        for(var y=0; y<bucket.choices.length; y++) {
            //get a choice
            var choice = bucket.choices[y];
            
            //remove the reference to the bucket
            choice.bucket = null;
        }
    }
    
    //return the MSSTATE
    return msState;
};



/**
 * Creates a MSSTATE from the stateJSONObj
 * @param stateJSONObj a JSON object representing a MSSTATE
 * @return a populated MSSTATE
 */
MSSTATE.prototype.parseDataJSONObj = function(stateJSONObj) {
    //create a new MSSTATE object
    var msState = new MSSTATE();

    //get the buckets from the json
    msState.buckets = stateJSONObj.buckets;
    
    //return the MCSTATE object
    return msState;
};










// ///////////////////////////////////////////////////////////////////////////////////////////////////
// ///////// From matchsequence.js

/**
 * MatchSequence (MS) object. Given xmldocument, will create a new instance of
 * the MatchSequence object and populate its attributes. Does not render
 * anything on the screen (see MS.render() for rendering).
 */

// TODO
//    feedback?  this checks for 'showFeedback', which isn't in the json, but ignores 'hasInlineFeedback' I think.
function MS(ms_json, indexOnPage, msdiv) {
    this.content = ms_json;
    this.indexOnPage = indexOnPage;
    this.msdiv = msdiv;
    $(msdiv).attr('indexOnPage', indexOnPage);
    this.title = String(ms_json.assessmentItem.title);
    if (this.title !== "undefined" && this.title !== "null" && this.title != "") {
        $(msdiv).find(".title").html(this.title);
    }
    
    this.attempts = [];
    this.feedbacks = this.content.assessmentItem.responseDeclaration.correctResponses;
    this.choices = [];
    this.sourceBucket = undefined;
    this.buckets = []; // includes only targetbuckets
    this.customCheck = undefined;
    this.displayLayout = this.content.displayLayout;
    this.logLevel = this.content.logLevel;
    this.showFeedback = true;
    this.ddList = []; // list of all draggable nodes

    // set whether to display feedback to the student when they submit their
    // answer
    if (this.content.showFeedback != null) {
        this.showFeedback = this.content.showFeedback;
    }

    this.states = [];
    // if(node.studentWork != null) {
    // this.states = node.studentWork;
    // }

    /* set custom check function if it has been defined */
    if (this.content.customCheck) {
        this.customCheck = new Function('states', this.content.customCheck);
    }
    ;

    /* instantiate sourcebucket */
    this.sourceBucket = new MSBUCKET();

    /* instantiate choices */
    for (var i = 0; i < this.content.assessmentItem.interaction.choices.length; i++) {
        var choice = new MSCHOICE(
                this.content.assessmentItem.interaction.choices[i],
                this.sourceBucket);
        this.choices.push(choice);
        this.sourceBucket.choices.push(choice); // to start out, put all choices
        // in sourcebucket
    }
    ;

    /* shuffle choices if required */
    if (this.content.assessmentItem.interaction.shuffle) {
        this.sourceBucket.shuffle();
    }
    ;

    /* instantiate target buckets */
    for (var i = 0; i < this.content.assessmentItem.interaction.fields.length; i++) {
        this.buckets.push(new MSBUCKET(
                this.content.assessmentItem.interaction.fields[i]));
    }
    ;

    // load the student's previous work
    this.loadStudentWork();
};

/**
 * Retrieves an array of choice identifiers that are supposed to be in the
 * target bucket in order to be correct
 * 
 * @param bucketId
 *            the id of the target bucket we want the list of correct choices
 *            for
 */
MS.prototype.getCorrectChoicesForBucket = function(bucketId) {
    var correctChoices = [];

    // loop through all the feedbacks
    for (var x = 0; x < this.feedbacks.length; x++) {
        // get a feedback
        var feedback = this.feedbacks[x];

        /*
         * check that the target field identifier matches the bucketId and check
         * that this feedback is for the correct instance
         */
        if (feedback.fieldIdentifier == bucketId && feedback.isCorrect) {
            // put the choice id into our array
            correctChoices.push(feedback.choiceIdentifier);
        }
    }

    return correctChoices;
};

/**
 * Loads the student's previous work from the last time they visited the step.
 * Parses through the student state and places choices in the target buckets and
 * removes the choices from the source bucket.
 */
MS.prototype.loadStudentWork = function() {
    // all states should contain non-empty values for ms
    var latestState = this.states[this.states.length - 1];

    // check that there is a latest state, if not, we don't need to do anything
    if (latestState != null) {
        // get the target buckets from the student state
        var targetBuckets = latestState.buckets;

        // loop through the target buckets
        for (var x = 0; x < targetBuckets.length; x++) {
            // get a target bucket
            var targetBucket = targetBuckets[x];

            // get the id of the target bucket
            var targetBucketId = targetBucket.identifier;

            // get the choices that are in the target bucket
            var choices = targetBucket.choices;

            // loop through the choices that are in the target bucket
            for (var y = 0; y < choices.length; y++) {
                // get a choice
                var choice = choices[y];

                // get the id of the choice
                var choiceId = choice.identifier;

                /*
                 * put the choice into the MS's target bucket that has the given
                 * targetBucketId
                 */
                this.putChoiceInBucket(choiceId, targetBucketId);

                /*
                 * remove the choice from the MS's source bucket because in the
                 * contructor all of the choices are initially placed in the
                 * source bucket
                 */
                this.removeFromSourceBucket(choiceId);
            }
        }
    }
};

/**
 * Remove the choice from the source bucket
 * 
 * @param choiceId
 *            the id of the choice to remove
 */
MS.prototype.removeFromSourceBucket = function(choiceId) {
    // loop through the choices in the source bucket
    for (var x = 0; x < this.sourceBucket.choices.length; x++) {
        // get a choice
        var choice = this.sourceBucket.choices[x];

        // see if the choice identifier matches
        if (choice.identifier == choiceId) {
            // remove the choice from the source bucket
            this.sourceBucket.choices.splice(x, 1);
        }
    }
};

/**
 * Puts a choice into a bucket
 * 
 * @param choiceId
 *            the id of the choice
 * @param bucketId
 *            the id of the bucket
 */
MS.prototype.putChoiceInBucket = function(choiceId, bucketId) {
    // get the bucket object
    var bucket = this.getTargetBucketById(bucketId);

    // get the choice object
    var choice = this.getChoiceById(choiceId);

    // make sure both are not null
    if (bucket != null && choice != null) {
        // put the choice into the bucket
        bucket.choices.push(choice);
    }
};

/**
 * Retrieves a choice object given the choiceId
 * 
 * @param choiceId
 *            the id of the choice
 * @return a choice object or null if the choiceId was not found
 */
MS.prototype.getChoiceById = function(choiceId) {
    // loop through the choices
    for (var x = 0; x < this.choices.length; x++) {
        // get a choice
        var choice = this.choices[x];

        // compare the ids
        if (choice.identifier == choiceId) {
            // the ids matched so we will return the choice object
            return choice;
        }
    }

    // if the choiceId was not found, return null
    return null;
};

/**
 * Retrieves a target bucket object given the bucketId
 * 
 * @param bucketId
 *            the id of a target bucket
 * @return a target bucket object or null if the bucketId was not found
 */
MS.prototype.getTargetBucketById = function(bucketId) {
    // loop through the target buckets
    for (var x = 0; x < this.buckets.length; x++) {
        // get a bucket
        var bucket = this.buckets[x];

        // compare the ids
        if (bucket.identifier == bucketId) {
            // the ids matched so we will return the bucket object
            return bucket;
        }
    }

    // if the bucketId was not found, return null
    return null;
};

/**
 * Adds orderings to choices within the targetbuckets Iterates through all of
 * the target buckets and adds ordering to the choices. Iterates through all
 * sourcebuckets and removes ordering from the choices.
 */
MS.prototype.addOrderingToChoices = function() {
    if (!this.content.assessmentItem.interaction.ordered) {
        return;
    }

    var state = this.getState();

    /* go through the sourcebucket and remove any ordering */
    for (var i = 0; i < state.sourceBucket.choices.length; i++) {
        addOrderToChoice(state.sourceBucket.choices[i].identifier, "");
    }

    /* now go through the targetbuckets */
    for (var i = 0; i < state.buckets.length; i++) {
        var bucket = state.buckets[i];
        for (var j = 0; j < bucket.choices.length; j++) {
            addOrderToChoice(bucket.choices[j].identifier, j + 1);
        }
    }
};

/**
 * It is implicitly assumed that this function will only be called if this is.
 * MatchSequence
 */
function addOrderToChoice(identifier, orderNumber) {
    $('#' + identifier + ' .orderNumber').html(orderNumber);
};

/**
 * Renders choices and buckets with DD abilities MS must have been instantiated
 * already (ie this.choices should be populated)
 */
MS.prototype.render = function() {
    // render the prompt
    var promptdiv = $(".matchsequence .prompt").html(this.content.assessmentItem.interaction.prompt)

    var bucketsHtml = "";
    var choicesBucketHtml = "";
    document.getElementById('play').innerHTML = "";

    // layout is vertical or horizontal
    var displayLayout = this.displayLayout;

    if (displayLayout == "horizontal") {
        bucketsHtml += "<table>";
        bucketsHtml += "<tr>";
        // add the html for the target bucket(s)

        // loop through the target buckets
        for (var x = 0; x < this.buckets.length; x++) {
            // get a target bucket
            var currentBucket = this.buckets[x];

            // add the html for the target bucket
            bucketsHtml += this.getBucketHtml(currentBucket, displayLayout,
                    true, this.buckets.length);
        }
        bucketsHtml += "</tr>";
        bucketsHtml += "</table>";

        bucketsHtml += "<table>";
        bucketsHtml += "<tr>";
        // add the html for the source bucket(s)
        bucketsHtml += this.getBucketHtml(this.sourceBucket, displayLayout,
                false);
        bucketsHtml += "</tr>";
        bucketsHtml += "</table>";
    } else {
        choicesBucketHtml = this.getBucketHtml(this.sourceBucket);
        bucketsHtml += "<table><tr><td><div id=\"choicesColumn\">"
                + choicesBucketHtml + "</div></td>";
        bucketsHtml += "<td><div id=\"bucketsAndFeedbackColumn\">";
        for (var i = 0; i < this.buckets.length; i++) {
            var currentBucket = this.buckets[i];
            var currentBucketHtml = this.getBucketHtml(currentBucket);
            bucketsHtml += currentBucketHtml;
        }
        ;
        bucketsHtml += "</div></td></tr></table>";
    }

    document.getElementById('play').innerHTML = bucketsHtml;

    /* enables jquery drag and drop */
    // MOVED this here from above
    llab.ms.renderDragAndDrop(this);
    

    // check if we want to display the submit button
    if (this.showFeedback) {
        // display the number of attempts above the submit button
        this.displayNumberAttempts("This is your", "attempt", this.attempts);
    } else {
        // hide the feedback and number of attempts display
        $('#feedbackDiv').hide();
        $('#numberAttemptsDiv').hide();
    }

};


/*
 *  NATE ADD, pulled from nodehelpers
 */
/**
 * Updates text in div with id numberAttemptsDiv with info on number of
 * attempts. The text will generally follow the format:
 * This is your ___ attempt.  Or This is your ___ revision.
 * part1 example: This is your
 * part2 example: attempt
 * part2 example2: revision
 */
MS.prototype.displayNumberAttempts = function(part1, part2, states) {
    var nextAttemptNum = states.length + 1;
    var nextAttemptString = "";
    if (nextAttemptNum == 1) {
        nextAttemptString = "1st";      
    } else if (nextAttemptNum == 2) {
        nextAttemptString = "2nd";      
    } else if (nextAttemptNum == 3) {
        nextAttemptString = "3rd";      
    } else {
        nextAttemptString = nextAttemptNum + "th";      
    }
    var numAttemptsDiv = document.getElementById("numberAttemptsDiv");
    var numAttemptsDivHtml = part1 + " " + nextAttemptString + " " + part2 +".";
    numAttemptsDiv.innerHTML = numAttemptsDivHtml;
};



/**
 * Check if the author only wants to allow one choice per target bucket
 * 
 * @return true if we are only allowing one choice per target bucket false if we
 *         are allowing multiple choices per target bucket
 */
MS.prototype.allowOnlyOneChoicePerTargetBucket = function() {
    // check if this parameter was set in the json content
    if (this.content.allowOnlyOneChoicePerTargetBucket != null
            && this.content.allowOnlyOneChoicePerTargetBucket == true) {
        // only allow one choice
        return true;
    } else {
        // allow multiple choices
        return false;
    }
};

/**
 * Given a MSBUCKET object, returns a HTML-representation of the bucket as a
 * string. All the choices in the buckets are list items
 * <li>.
 */
MS.prototype.getBucketHtml = function(bucket, displayLayout, targetBucket,
        totalNumTargetBuckets) {
    var bucketHtml = "";

    var bucketName = "bucket_ul";
    var bucketClass = "bucket_ul";

    if (!targetBucket) {
        // this is a source bucket
        bucketClass += " sourceBucket";
    }

    if (displayLayout == "horizontal") {
        var choicesInBucketHtml = "";
        var tempChoicesInRowHtml = "";

        // the max number of choices in a row for the source bucket
        var maxChoicesPerRow = 4;
        var numChoicesInRow = 0;

        /*
         * the default width and height for the target buckets. there may be
         * multiple buckets. these dimensions will accomodate up to 4 target
         * buckets without the buckets going off the screen
         */

        // var targetWidth = 150;
        var targetWidth = 700 / totalNumTargetBuckets - 25;
        var targetHeight = 125;

        // loop through all the choices
        for (var x = 0; x < bucket.choices.length; x++) {
            var choice = bucket.choices[x];
            var choiceText = choice.text;
            var choiceId = bucket.choices[x].identifier;

            var choiceLi = "";
            // create the td for the choice
            if (this.content.assessmentItem.interaction.ordered) {
                choiceLi = "<li id="
                        + choiceId
                        + " class=\"choice draggable horizontalLi\"><div class=\"orderNumber\"></div>"
                        + choiceText + "</li>";
            } else {
                choiceLi = "<li id=" + choiceId
                        + " class=\"choice draggable horizontalLi\">"
                        + choiceText + "</li>";
            }
            ;

            // wrap the choice in td if it is in the source bucket
            if (!targetBucket) {
                // choice is in source bucket
                tempChoicesInRowHtml += choiceLi;
            } else {
                // choice is in target bucket
                tempChoicesInRowHtml += choiceLi;
            }

            // increment the number of choices in the current tr
            numChoicesInRow++;

            // check if we've hit the max choices per row, only do this for
            // source buckets
            if (!targetBucket && numChoicesInRow >= maxChoicesPerRow) {
                /*
                 * we have hit the max choices per row so we will end this tr so
                 * subsequent td's will start on a new row
                 */
                choicesInBucketHtml += tempChoicesInRowHtml;

                // reset the html and counter
                tempChoicesInRowHtml = "";
                numChoicesInRow = 0;
            }
        }

        /*
         * check if there were any remaining choices that we haven't added to
         * the choices bucket html
         */
        if (tempChoicesInRowHtml != "") {
            if (!targetBucket) {
                // wrap in tr if choice is in source bucket
                choicesInBucketHtml += tempChoicesInRowHtml;
            } else {
                // choice is in target bucket, don't wrap in tr
                choicesInBucketHtml += tempChoicesInRowHtml;
            }

        }

        // check if there were any choices
        if (!targetBucket && choicesInBucketHtml != "") {
            // this is a source bucket and there were choices so we will put
            // them in a table
            choicesInBucketHtml = choicesInBucketHtml;
        }

        // start the td, this will be the outermost element
        bucketHtml += "<td>";

        // start the bucketblock
        bucketHtml += "<div class=\"bucketblock\">";

        // add the label for the bucket
        bucketHtml += "<div class=\"bucketlabel\" >" + bucket.text + "</div>";

        var bucketUlStyle = "";

        // check if this is a target bucket
        if (targetBucket) {
            // this is a target bucket, we will give it the necessary dimensions
            bucketUlStyle = "style='overflow:auto; width:" + targetWidth
                    + "px; height: " + targetHeight + "px;'";
        }

        // create the bucket and add any necessary choices
        bucketHtml += "<div class=\"bucket\"><ul name=\"" + bucketName
                + "\" class=\"" + bucketClass + "\" id=" + bucket.identifier
                + " " + bucketUlStyle + ">" + choicesInBucketHtml
                + "</ul></div>";

        // add the feedback div
        bucketHtml += "<div id=\"feedbackdiv_" + bucket.identifier
                + "\"></div>";

        // close the bucketblock
        bucketHtml += "</div>";

        // end the td, this is the outermost element
        bucketHtml += "</td>";
    } else {
        var choicesInBucketHtml = "";
        for (var j = 0; j < bucket.choices.length; j++) {
            var choice = bucket.choices[j];
            var choiceText = choice.text;
            var choiceId = bucket.choices[j].identifier;

            if (this.content.assessmentItem.interaction.ordered) {
                choicesInBucketHtml += "<li id="
                        + choiceId
                        + " class=\"choice draggable\"><div class=\"orderNumber\"></div>"
                        + choiceText + "</li>";
            } else {
                choicesInBucketHtml += "<li id=" + choiceId
                        + " class=\"choice draggable\">" + choiceText + "</li>";
            }
            ;
        }
        ;

        bucketHtml += "<div class=\"bucketblock\">";
        bucketHtml += "<div class=\"bucketlabel\" >" + bucket.text + "</div>";
        bucketHtml += "<table id='bucketTable'><tr><td>";
        bucketHtml += "<div class=\"bucket\"><ul name=\"" + bucketName
                + "\" class=\"" + bucketClass + "\" id=" + bucket.identifier
                + ">" + choicesInBucketHtml + "</ul></div></td>";
        bucketHtml += "<td><div id=\"feedbackdiv_" + bucket.identifier
                + "\"></div></td></tr>"
        bucketHtml += "</table></div>";
    }

    return bucketHtml;
};

/**
 * Returns current state of the MS
 */
MS.prototype.getState = function() {
    var state = new MSSTATE();
    var bucketElements = document.getElementsByTagName('ul');
    for (var i = 0; i < bucketElements.length; i++) {
        var currentBucketIdentifier = bucketElements[i].getAttribute('id');
        if (currentBucketIdentifier) {// if it doesn't have one, then it is
            // probably a feedback div so no further
            // processing is desired
            var currentBucketCopy = this.getBucketCopy(currentBucketIdentifier);
            var choicesInCurrentBucket = bucketElements[i]
                    .getElementsByTagName('li');
            for (var j = 0; j < choicesInCurrentBucket.length; j++) {
                /* filter out elements with null ids */
                if (choicesInCurrentBucket[j].getAttribute('id')) {
                    currentBucketCopy.choices.push(this
                            .getChoiceCopy(choicesInCurrentBucket[j]
                                    .getAttribute('id')));
                }
            }

            if (currentBucketIdentifier == 'sourceBucket') {
                state.sourceBucket = currentBucketCopy;
            } else {
                state.buckets.push(currentBucketCopy);
            }
        }
    }
    return state;
};

/**
 * Gets the bucket with the specified identifier
 */
MS.prototype.getBucket = function(identifier) {
    if (this.sourceBucket.identifier == identifier) {
        return this.sourceBucket;
    }
    ;
    for (var i = 0; i < this.buckets.length; i++) {
        if (this.buckets[i].identifier == identifier) {
            return this.buckets[i];
        }
        ;
    }
    ;
    return null;
};

/**
 * Gets the choice with the specified identifier
 */
MS.prototype.getChoice = function(identifier) {
    for (var i = 0; i < this.choices.length; i++) {
        if (this.choices[i].identifier == identifier) {
            return this.choices[i];
        }
        ;
    }
    ;
    return null;
};

/**
 * Given an identifier string, returns a new MSCHOICE instance of a MSCHOICE
 * with the same identifier.
 */
MS.prototype.getChoiceCopy = function(identifier) {
    var original = this.getChoice(identifier);
    var copy = new MSCHOICE(null, original.bucket);
    copy.identifier = original.identifier;
    copy.text = original.text;
    copy.dom = original.dom;
    return copy;
};

/**
 * Given an identifier string, returns a new MSBUCKET instance of a MSBUCKET
 * with the same identifier.
 */
MS.prototype.getBucketCopy = function(identifier) {
    var original = this.getBucket(identifier);
    var copy = new MSBUCKET();
    copy.isTargetBucket = original.isTargetBucket;
    copy.identifier = identifier;
    copy.choices = [];
    copy.text = original.text;
    return copy;
};

/**
 * Gets the current state of the MatchSequence and provides appropriate
 * feedback. If the sourcebucket is not empty, then the student is not
 * considered to be finished and does not check if the state is correct.
 */
// Nate was here, killing joy
MS.prototype.checkAnswer = function() {
    
    
    
    var butt = $(this.msdiv).find(".checkAnswerButton");
    
    // using 0 length as false, >0 as true...
    if (butt.find(".disabledLink").length ) {
        return;
    }

    this.attempts.push(null);

    if (!this.showFeedback) {
        // we are not showing feedback
        // TODO -- need a state that shows inline feedback but not overall feedback

        // disable the check answer button
        this.disableCheckAnswerButton();

        // get the student data
        var state = this.getState();

        // save the student data
        // TODO
        // eventManager.fire('pushStudentWork', state.getJsonifiableState());
    } else if (this.customCheck != null) {
        var feedback = this.customCheck(this.getState());
        var message;
        if (feedback.getSuccess()) {
            message = "<font color='008B00'>" + feedback.getMessage()
                    + "</font>";
            this.setChoicesDraggable(false);
            //document.getElementById('checkAnswerButton').className = 'disabledLink';
            this.disableCheckAnswerButton();
        } else {
            message = "<font color='8B0000'>" + feedback.getMessage()
                    + "</font>";
            this.displayNumberAttempts("This is your", "attempt", this.attempts);
        }
        document.getElementById("feedbackDiv").innerHTML = message;
    } else {
        var state = this.getState(); // state is a MSSTATE instance
        // clean out old feedback
        for (var i = 0; i < state.buckets.length; i++) {
            var bucket = state.buckets[i];
            var feedbackDivElement = document.getElementById('feedbackdiv_'
                    + bucket.identifier);
            feedbackDivElement.innerHTML = ""; // clean out old feedback
        }

        var numCorrectChoices = 0;
        var numWrongChoices = 0;
        var numUnusedChoices = state.sourceBucket.choices.length;

        // loop through all the choices in the source bucket
        for (var x = 0; x < state.sourceBucket.choices.length; x++) {
            // get a source choice
            var sourceBucketChoice = state.sourceBucket.choices[x];

            // make the source choice incorrect
            llab.ms.removeClassFromElement(sourceBucketChoice.identifier, "correct");
            llab.ms.removeClassFromElement(sourceBucketChoice.identifier, "wrongorder");
            llab.ms.addClassToElement(sourceBucketChoice.identifier, "incorrect");
        }

        // loop through all the target buckets
        for (var i = 0; i < state.buckets.length; i++) {
            var bucket = state.buckets[i];
            var feedbackDivElement = document.getElementById('feedbackdiv_'
                    + bucket.identifier);
            var feedbackHTMLString = "";

            // loop through all the choices in the target bucket
            for (var j = 0; j < bucket.choices.length; j++) {
                // get feedback object for this choice in this bucket
                var feedback = this.getFeedback(bucket.identifier,
                        bucket.choices[j].identifier, j);

                if (feedback) {
                    if (feedback.isCorrect) {
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "incorrect");
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "wrongorder");
                        llab.ms.addClassToElement(bucket.choices[j].identifier,
                                "correct");
                        feedbackHTMLString += "<li class=\"feedback_li correct\">"
                                + bucket.choices[j].text
                                + ": "
                                + feedback.feedback + "</li>";
                        numCorrectChoices++;
                    } else {
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "correct");
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "wrongorder");
                        llab.ms.addClassToElement(bucket.choices[j].identifier,
                                "incorrect");
                        // llab.ms.removeClassFromElement("resetWrongChoicesButton",
                        // "disabledLink");
                        feedbackHTMLString += "<li class=\"feedback_li incorrect\">"
                                + bucket.choices[j].text
                                + ": "
                                + feedback.feedback + "</li>";
                        numWrongChoices++;
                    }
                } else {/*
                         * it could be that there is no feedback because it is
                         * in the wrong order
                         */
                    if (this.content.assessmentItem.interaction.ordered
                            && this.isInRightBucketButWrongOrder(
                                    bucket.identifier,
                                    bucket.choices[j].identifier, j)) { // correct
                        // bucket,
                        // wrong
                        // order
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "correct");
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "incorrect");
                        llab.ms.addClassToElement(bucket.choices[j].identifier,
                                "wrongorder");
                        feedbackHTMLString += "<li class=\"feedback_li wrongorder\">"
                                + bucket.choices[j].text
                                + ": Correct box but wrong order.</li>";
                        numWrongChoices++;
                    } else {/*
                             * this should never be the case, but it could be
                             * that no default feedback was created
                             */
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "correct");
                        llab.ms.removeClassFromElement(bucket.choices[j].identifier,
                                "wrongorder");
                        llab.ms.addClassToElement(bucket.choices[j].identifier,
                                "incorrect");
                        feedbackHTMLString += "<li class=\"feedback_li incorrect\">"
                                + bucket.choices[j].text
                                + ": "
                                + "NO FEEDBACK"
                                + "</li>";
                        numWrongChoices++;
                    }
                }
            }

            if (feedbackHTMLString != "") {
                feedbackDivElement.innerHTML = "<ul class=\"feedback_ul\">"
                        + feedbackHTMLString + "</ul>";
            }
        }

        // add the number of unused choices to the number of wrong choices
        numWrongChoices += numUnusedChoices;

        // update feedback div
        var feedbackDiv = document.getElementById("feedbackDiv");
        if (numWrongChoices == 0) {
            feedbackDiv.innerHTML = "Congratulations! You've completed this question.";
            this.setChoicesDraggable(false);
            this.disableCheckAnswerButton();
        } else {
            this.displayNumberAttempts("This is your", "attempt", this.attempts);
            var totalNumChoices = numCorrectChoices + numWrongChoices;
            feedbackDiv.innerHTML = "You have correctly placed "
                    + numCorrectChoices + " out of " + totalNumChoices
                    + " choices.";
        }

        var tries = document.getElementById('numberAttemptsDiv');

        // // fire the event to push this state to the global view.states object
        // eventManager.fire('pushStudentWork', state.getJsonifiableState());
    }
    ;
};

/**
 * Returns true if the choice is in the right bucket but is in wrong order in
 * that bucket.
 */
MS.prototype.isInRightBucketButWrongOrder = function(bucketIdentifier,
        choiceIdentifier, choiceOrderInBucket) {
    var isInRightBucketAndRightOrder = false;
    var isInRightBucket = false;
    for (var i = 0; i < this.feedbacks.length; i++) {
        if (this.content.assessmentItem.interaction.ordered) {
            if (this.feedbacks[i].fieldIdentifier == bucketIdentifier
                    && this.feedbacks[i].choiceIdentifier == choiceIdentifier
                    && this.feedbacks[i].order == choiceOrderInBucket
                    && this.feedbacks[i].isCorrect) {
                isInRightBucketAndRightOrder = true;
            } else if (this.feedbacks[i].fieldIdentifier == bucketIdentifier
                    && this.feedbacks[i].choiceIdentifier == choiceIdentifier
                    && this.feedbacks[i].isCorrect
                    && this.feedbacks[i].order != choiceOrderInBucket) {
                isInRightBucket = true;
            }
            ;
        }
        ;
    }
    ;
    return isInRightBucket && !isInRightBucketAndRightOrder;
};

/**
 * Returns FEEDBACK object based for the specified choice in the specified
 * bucket choiceOrderInBuckets is integer representing which order the choice is
 * in within its bucket.
 */
MS.prototype.getFeedback = function(bucketIdentifier, choiceIdentifier,
        choiceOrderInBucket) {
    for (var i = 0; i < this.feedbacks.length; i++) {
        if (this.content.assessmentItem.interaction.ordered) {
            if (this.feedbacks[i].fieldIdentifier == bucketIdentifier
                    && this.feedbacks[i].choiceIdentifier == choiceIdentifier
                    && this.feedbacks[i].order == choiceOrderInBucket) {
                return this.feedbacks[i];
            } else if (this.feedbacks[i].fieldIdentifier == bucketIdentifier
                    && this.feedbacks[i].choiceIdentifier == choiceIdentifier
                    && !this.feedbacks[i].isCorrect) {
                return this.feedbacks[i];
            }
        } else {
            if (this.feedbacks[i].fieldIdentifier == bucketIdentifier
                    && this.feedbacks[i].choiceIdentifier == choiceIdentifier) {
                return this.feedbacks[i];
            }
        }
    }
    return null;
}

/**
 * enables or disables dragging of all choices
 */
MS.prototype.setChoicesDraggable = function(setDraggable) {
    if (setDraggable) {
        for (var i = 0; i < this.ddList.length; i++) {
            this.ddList[i].set("lock", false);
        }
    } else {
        for (var i = 0; i < this.ddList.length; i++) {
            this.ddList[i].set("lock", true);
        }
    }
}

/**
 * Resets to original state
 */
MS.prototype.reset = function() {
    enableCheckAnswerButton();
    this.render();
}

/**
 * Resets to original state
 */
MS.prototype.resetWrongChoices = function() {
    var isResetWrongChoicesDisabled = hasClass("resetWrongChoicesButton",
            "disabledLink");

    if (isResetWrongChoicesDisabled) {
        return;
    }

    enableCheckAnsweButton();

    // TODO  wha
    console.log('not implemented yet, will reset all answers for now');

    this.render();
}

/**
 * Create a MSSTATE and save it to the node visit
 * 
 * @return
 */
MS.prototype.saveState = function() {
    if (this.logLevel == "high") {
        // get the current state
        var state = this.getState();

        // fire the event to push this state to the global view.states object
        // TODO
        // eventManager.fire('pushStudentWork', state.getJsonifiableState());
    }
};

/**
 * Enables/Disables the check answer button
 */
MS.prototype.enableCheckAnswerButton = function() {
    $(this.msdiv).find('.checkAnswerButton').removeClass('disabledLink');
};
MS.prototype.disableCheckAnswerButton = function() {
    $(this.msdiv).find('.checkAnswerButton').addClass('disabledLink');
};