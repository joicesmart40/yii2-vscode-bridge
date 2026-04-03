'use strict';

function parseIdeStub(content, sourceUri) {
  const components = [];
  const blockPattern = /(\/\*\*[\s\S]*?\*\/)\s*class\s+([A-Za-z_]\w*)/g;
  let blockMatch;

  while ((blockMatch = blockPattern.exec(content)) !== null) {
    const docblock = blockMatch[1];
    const className = blockMatch[2];
    if (className === 'Yii') {
      continue;
    }

    const blockStartLine = content.slice(0, blockMatch.index).split(/\r?\n/).length - 1;
    const propertyPattern = /@property(?:-read|-write)?\s+([^\s]+)\s+\$([A-Za-z_]\w*)/g;
    let propertyMatch;

    while ((propertyMatch = propertyPattern.exec(docblock)) !== null) {
      const relativeLine = docblock.slice(0, propertyMatch.index).split(/\r?\n/).length - 1;
      components.push({
        name: propertyMatch[2],
        type: normalizePhpDocType(propertyMatch[1]),
        sourceKind: 'ide.php',
        sourceUri,
        line: blockStartLine + relativeLine,
        detail: `${className}: ${propertyMatch[0].trim()}`
      });
    }
  }

  return components;
}

function normalizePhpDocType(rawType) {
  if (!rawType) {
    return undefined;
  }

  return rawType.replace(/^\|+|\|+$/g, '').replace(/\\\\/g, '\\').trim();
}

module.exports = {
  parseIdeStub
};
