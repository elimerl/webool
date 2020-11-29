const fs = require('fs')
const path = require('path')
const uglify = require('uglify-js')
let outjs = ``
function escape(s) {
    return ('' + s)
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
        .replace(/\n/g, '')
}

function unescape(s) {
    s = ('' + s)
        .replace(/\\x3E/g, '>')
        .replace(/\\x3C/g, '<')
        .replace(/\\x22/g, '"')
        .replace(/\\x27/g, "'")
        .replace(/\\x26/g, '&')
        .replace(/\\u00A0/g, '\u00A0')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');

    return s.replace(/\\\\/g, '\\');
}

fs.readdirSync('node').forEach((a) => {
    const p = path.join('node', a)
    if (fs.statSync(p).isFile() && p.split('.').pop() === 'ts') {
        outjs += `
        // extra libraries
        fetch('https://cdn.jsdelivr.net/npm/@types/node@14.14.10/${a}').then(res => res.text())
        .then((libSource)=> {
            console.log("Loaded ${a}");
            var libUri = 'ts:@types/node/${a}';
        monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
        // When resolving definitions and references, the editor will try to use created models.
        // Creating a model for the library allows "peek definition/references" commands to work with the library.
        monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));
    `
    }
})
outjs += `console.log('Loaded all types for Node!');}) }) }) }) }) }) }) }) }) }) }) }) }) }) }) })})})})})})})})})})})})})})})})})})})})})})})})})})})})})})`
fs.writeFileSync('./monaco.js', outjs)