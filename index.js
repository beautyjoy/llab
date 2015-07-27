// This is the node version of llab.
// It is expected to only be called from node (for now)

var llab = {};
var lib = require('./script/library.js')
var topic = require('./script/topic.js');

// A rather horifying way to extend the llab object...
// I feel ashamed of myself.
for (var prop in lib) {
    llab[prop] = lib[prop];
}
for (var prop in topic.topic) {
    llab[prop] = topic.topic[prop];
}

module.exports = llab;