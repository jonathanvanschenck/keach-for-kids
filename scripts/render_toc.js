const { readFile, writeFile, readdir } = require("fs/promises");
const { join } = require("path");

const fm = require("front-matter");

const [ cat ] = process.argv.slice(2);

const title = {
    keach: "Keach's Catechism",
    cfyc: "Catechism for Young Children",
}[cat];
const description = {
    keach: `A catechism based on the 1677 Baptist Confession (later the 1689 London Baptist Confession of Faith),
written by Benjamin Keach. This documument largely mirrors the Heidelburg and Westmister catechisms, with the primary
deviations being for Baptist particulars. This version follows the later (118 question) text and adapts the language into
modern English. Scriptural references are rendered in the English Standard Version.`,
    cfyc: `A catechism adapting the Westminster Shorter Catechism written by Joseph Engles
in 1840 (Fully titled: 'Catechism for Young Children: Being an Introduction to the Shorter
Catechism'). This document was created for use with very young children, for whom the Shorter
Catechism would be too opaque, simplifying many of the ideas and language. We re-adapt this
catechism for the same purpose using modern English phrasology. Additionally, several
questions ([126](/cfyc/questions/126), [127](cfyc/questions/127), [129](cfyc/questions/129)
and [130](cfyc/questions/130)) are given two adaptations: one for Baptists and one for
Presbyterians.`,
}[cat];

const QPATH = join(__dirname, `../questions/${cat}`);
const OPATH = join(__dirname, `../tocs/${cat}.md`);

!async function() {
    const f = await readdir(QPATH).then(files => {
        return files.map(f => ({
            name: f,
            path: join(QPATH,f),
        })).sort((a,b) => a.name >= b.name ? 1 : b.name >= a.name ? -1 : 0);
    }).then(files => {
        return Promise.all(files.map(async (f) => {
            const md = await readFile(f.path).then(d => fm(d.toString()).attributes);
            f.title = `Question ${md.question}`;
            f.question = md.question;
            f.completed = md.completed;
            f.vpath = md.permalink
            return f;
        }));
    });


    const done = f.filter(ff => ff.completed).length;
    const total = f.length;

    const out = `---
permalink: "/${cat}"
---
# ${title}
${description}

## Table of Contents

<div>
  <span style="margin-right: 1rem;">Adaptation Progress:</span>
  <progress value="${done}" max="${total}"></progress>
  <span style="margin-left: 1rem;">${(100*done/total).toFixed(1)}%</span>
</div>

| Link | Adapted |
| :----: | :---------: |
${
    f.map(ff => {
        return `| [${ff.title}](${ff.vpath}) | ${ff.completed ? "\u2705" : "\u26D4"} |`
    }).join("\n")
}`;

    await writeFile(OPATH, out);

}();
