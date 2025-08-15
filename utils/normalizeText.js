module.exports = function normalizeText(s = "") {
  // Normalize Unicode then replace “smart” punctuation with ASCII. It's a problem of encoding between
  // the database and the browser, so it is a fix.
  return s
    .normalize('NFC')
    .replace(/[\u2018\u2019\u02BC]/g, "'")      // ‘ ’ ʼ → '
    .replace(/[\u201C\u201D]/g, '"')            // “ ” → "
    .replace(/\u2013/g, '-')                    // – → -
    .replace(/\u2014/g, '--')                   // — → --
    .replace(/\u2026/g, '...');                 // … → ...
}