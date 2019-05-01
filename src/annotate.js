import { parse } from 'node-html-parser';

// heavy lifiting of finding / replacing
function parseNode(nodeString, names, hash) {
  console.log(`parsing: ${nodeString}`);
  let toReplace = nodeString.split(/\W+/).filter(str => names.includes(str));

  if (toReplace.length) {
    let reg = '\\b' + toReplace.join('\\b|\\b') + '\\b';
    let text = nodeString.replace(new RegExp(`\\b${reg}\\b`, 'gi'), (m) => {
      return `<a href='${hash[m]}'>${m}</a>`;
    });

    console.log(`new string ${text}`);
    return text;
  }
}

function parseTree(node, names, hash) {
  if (node.tagName === 'a') { return; }

  if (node.childNodes.length > 1) {
    node.childNodes.map((child) => {
      if (child.tagName !== 'a') { // pre-emptively skip if it's a link
        parseTree(child, names, hash);
      }
    });
  } else if (node.childNodes.length === 1) {
    if (node.childNodes[0].nodeType === 3) { // text node
      let newText = parseNode(node.childNodes[0].rawText, names, hash);
      if (newText) {
        node.childNodes[0].rawText = newText;
      }
    } else {
      parseTree(node.childNodes[0], names, hash);
    }
  } else {
    // no children.... what kind of node are we? text most likely...
    let newText = parseNode(node.rawText, names, hash);
    if (newText) {
      node.rawText = newText;
    }
  }
}

module.exports = function annotate(html, names, urls, callback) {
  // maybe parallel
  const hash = names.reduce((map, name, i) => { map[name] = urls[i]; return map }, {});

  // in case it's not valid html and just text
  if (!html.startsWith('<')) {
    let newText = parseNode(html, names, hash);
    newText ? callback(newText) : callback(html);
  } else {
    var root = parse(html);

    parseTree(root, names, hash);

    callback(root.toString());
  }
}
