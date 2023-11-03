const { readFile, writeFile, readdir } = require("fs/promises");
const { join } = require("path");

const fm = require("front-matter");

const QPATH = join(__dirname, "../Questions");
const OPATH = join(__dirname, "../index.md");

!async function() {
    const f = await readdir(QPATH).then(files => {
        return files.map(f => ({
            name: f,
            path: join(QPATH,f),
        })).sort((a,b) => a.name >= b.name ? 1 : b.name >= a.name ? -1 : 0);
    }).then(files => {
        return Promise.all(files.map(async (f) => {
            const md = await readFile(f.path).then(d => fm(d.toString()).attributes);
            f.title = md.title;
            f.question = md.question;
            f.completed = md.completed;
            f.vpath = md.permalink
            return f;
        }));
    });


    const done = f.filter(ff => ff.completed).length;
    const total = f.length;

    const out = `---
title: Keach for Kids
permalink: "/"
---
# Keach for Kids
An adaptation of Keach's Catechism in modern English for young children.

## Table of Contents

<div>
  <span>Adaptation Progress:</span>
  <progress value="${done}" max="${total}"></progress>
  <span style="margin-left: 1rem;">${(100*done/total).toFixed(1)}%</span>
</div>

| Link | Completed |
| :----: | :---------: |
${
    f.map(ff => {
        return `| [${ff.title}](${ff.vpath}) | ${ff.completed ? "\u2705" : "\u26D4"} |`
    }).join("\n")
}`;

    await writeFile(OPATH, out);

}();
