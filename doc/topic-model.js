/* LLAB JSON Object Defintion for a "topic" file.
 * Encoded as a JS Object because JSON doesn't support comments.
 * Requirements:
 *
 *
 */
topicModel = {
    title: 'Topic Title',
    type: 'topic',
    path: '/bjc-r/...', // File Name Should be from the root of the web server
    contents: [
        {
            type: 'resource',
            content: 'Hello',
            url: '/bjc-r/...'
        },
        {...}
    ]
}