import fs from "node:fs";

const source = fs.readFileSync("wrapper.html", "utf8");
const marker = 'goog.script.init("';
let position = source.indexOf(marker);
if (position < 0) throw new Error("Google Apps Script init payload not found");
position += marker.length;

let raw = "";
while (position < source.length) {
  if (source[position] === '"') break;
  if (source[position] === "\\") {
    raw += source[position++];
    if (position < source.length) raw += source[position++];
  } else {
    raw += source[position++];
  }
}

function decodeJavaScriptString(value) {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\\") {
      output += value[index];
      continue;
    }
    const escape = value[++index];
    if (escape === "x") {
      output += String.fromCharCode(parseInt(value.slice(index + 1, index + 3), 16));
      index += 2;
    } else if (escape === "u") {
      output += String.fromCharCode(parseInt(value.slice(index + 1, index + 5), 16));
      index += 4;
    } else if (escape === "n") output += "\n";
    else if (escape === "r") output += "\r";
    else if (escape === "t") output += "\t";
    else if (escape === "b") output += "\b";
    else if (escape === "f") output += "\f";
    else output += escape;
  }
  return output;
}

const payload = JSON.parse(decodeJavaScriptString(raw));
fs.writeFileSync("index.html", payload.userHtml);
const normalized = payload.userHtml.replaceAll("\\/", "/");
const urls = [...new Set([...normalized.matchAll(/https:\/\/[^\"'\s<>]+/g)].map((match) => match[0]))];
fs.writeFileSync("asset-urls.txt", urls.join("\n"));
console.log(`Extracted ${payload.userHtml.length} HTML characters and ${urls.length} URLs.`);
