const { readFile, writeFile } = require("fs/promises");
const { join } = require("path");

const { parse } = require("yaml");

const [ cat ] = process.argv.slice(2);

const QPATH = join(__dirname, `../questions/${cat}`);
const IPATH = join(__dirname, `../data/${cat}.yaml`);
const PPATH = join(__dirname, `../printable/${cat}.md`);
const TPATH = join(__dirname, `../tocs/${cat}.md`);

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

!async function() {
    const f = await readFile(IPATH).then(data => {
        return parse(data.toString());
    });


    // Table of Contents
    const tout = [];
    // Front-matter
    tout.push(`---`);
    tout.push(`permalink: ${join("/",cat)}`);
    tout.push(`---`);

    // Heading
    tout.push(`# ${title}`);
    tout.push(`${description}`);
    tout.push(``); // extra line for paragraph break
    const plink = join("/",cat,"full");
    tout.push(`For a printable page, [click here](${plink})`);


    // Printable
    const pout = [];
    // Front-matter
    pout.push(`---`);
    pout.push(`permalink: ${plink}`);
    pout.push(`---`);

    // Heading
    pout.push(`# ${title}`);
    pout.push(`${description}`);
    pout.push(`\n---`); // Extra line

    const promises = [];
    for ( const d of f.questions.sort((a,b) => a.number - b.number) ) {
        d.permalink = join("/",cat,"questions",(d.number).toString());

        const path = join(QPATH, d.number.toString().padStart(3,"0") + ".md");

        const out = [];

        // Front-matter
        out.push(`---`);
        out.push(`question: ${d.number}`);
        out.push(`completed: ${d.completed}`);
        out.push(`permalink: ${d.permalink}`);
        if ( d.number > 1 ) out.push(`previous: ${join("/",cat,"questions",(d.number-1).toString())}`);
        if ( d.number < f.questions.length ) out.push(`next: ${join("/",cat,"questions",(d.number+1).toString())}`);
        out.push(`---`); // Extra line

        // Heading
        out.push(`# Question ${d.number}`);
        out.push(`\n---`); // Extra line
        const color = d.completed ? "#e8e8e8" : "#fb8151";
        pout.push(`## <a id="q-${d.number}" style="pointer-events: fill; color: ${color}; margin-right: 5px;">Question ${d.number}</a><a href="${plink}#q-${d.number}"><img src="/assets/svg/permalink.svg"/></a><a href="${d.permalink}" style="margin-left: 5px;"><img src="/assets/svg/link.svg"/></a>`);

        // Adaptation
        if ( d.adapt_baptist ) {
            out.push(`## Modern Adaptation (Baptist)`);
            out.push(`**Question: ${d.adapt_baptist.Q}**`);
            out.push(``); // Extra line for new paragraph
            out.push(`*Answer: ${d.adapt_baptist.A}*`);
            out.push(`\n---`); // Extra line

            pout.push(`### Baptist`);
            pout.push(`**Question: ${d.adapt_baptist.Q}**`);
            pout.push(``); // Extra line for new paragraph
            pout.push(`*Answer: ${d.adapt_baptist.A}*`);
            pout.push(``); // Extra line

            out.push(`## Modern Adaptation (Presbyterian)`);
            out.push(`**Question: ${d.adapt_presby.Q}**`);
            out.push(``); // Extra line for new paragraph
            out.push(`*Answer: ${d.adapt_presby.A}*`);
            out.push(`\n---`); // Extra line

            pout.push(`### Presbyterian`);
            pout.push(`**Question: ${d.adapt_presby.Q}**`);
            pout.push(``); // Extra line for new paragraph
            pout.push(`*Answer: ${d.adapt_presby.A}*`);
            pout.push(``); // Extra line
             
        } else {
            out.push(`## Modern Adaptation`);
            out.push(`**Question: ${d.adapt.Q}**`);
            out.push(``); // Extra line for new paragraph
            out.push(`*Answer: ${d.adapt.A}*`);
            out.push(`\n---`); // Extra line

            pout.push(`**Question: ${d.adapt.Q}**`);
            pout.push(``); // Extra line for new paragraph
            pout.push(`*Answer: ${d.adapt.A}*`);
            pout.push(``); // Extra line
        }

        // Scriptures
        if ( d.scriptures?.length ) {
            out.push(`## Scriptural References`);
            pout.push(`### Scriptural References`);
            for ( const s of d.scriptures ) {
                out.push(`### ${s.ref_str} (${s.version}) <a href="${s.bgw_link}"><img src="/assets/svg/link.svg"/></a>`);
                pout.push(`#### ${s.ref_str} (${s.version}) <a href="${s.bgw_link}"><img src="/assets/svg/link.svg"/></a>`);
                for ( const t of s.verses ) {
                    out.push(`> <sup>${t.verse}</sup>${t.text}`);
                    pout.push(`> <sup>${t.verse}</sup>${t.text}`);
                }
                out.push(``); // Extra line
                pout.push(``); // Extra line
            }
            out.push(`\n---`); // Extra line
        }

        // Traditional Form
        out.push(`## Traditional Formulation`);
        out.push(`**Question: ${d.trad.Q}**`);
        out.push(``); // Extra line for new paragraph
        out.push(`*Answer: ${d.trad.A}*`);
        out.push(`\n---`); // Extra line

        // Adaptation Commentary
        out.push(`## Adaptation Commentary`);
        out.push(`${d.notes}`);

        promises.push(writeFile(path,out.join("\n")));

        pout.push(`\n---`); // Extra line
    }

    promises.push(writeFile(PPATH,pout.join("\n")));


    const done = f.questions.filter(ff => ff.completed).length;
    const total = f.questions.length;

    tout.push(`## Table of Contents`);
    tout.push(``);
    tout.push(`<div>`);
    tout.push(`  <span style="margin-right: 1rem;">Adaptation Progress:</span>`);
    tout.push(`  <progress value="${done}" max="${total}"></progress>`);
    tout.push(`  <span style="margin-left: 1rem;">${(100*done/total).toFixed(1)}%</span>`);
    tout.push(`</div>`);
    tout.push(``);
    tout.push(`| Link | Adapted |`);
    tout.push(`| :----: | :---------: |`);
    for ( const d of f.questions ) {
        tout.push(`| :----: | :---------: |`);
        tout.push(`| [Question ${d.number}](${d.permalink}) | ${d.completed ? "\u2705" : "\u26D4"} |`);
    }

    promises.push(writeFile(TPATH,tout.join("\n")));

    await Promise.all(promises);


// "### {} ({}) <a href=\"{}\"><img src=\"/assets/svg/link.svg\"/></a>\n".format(

// 
//     const done = f.filter(ff => ff.completed).length;
//     const total = f.length;
// 
//     const out = `---
// permalink: "/${cat}/printable"
// ---
// ${
//     f.map(ff => {
//         return `| [${ff.title}](${ff.vpath}) | ${ff.completed ? "\u2705" : "\u26D4"} |`
//     }).join("\n")
// }`;
// 
//     await writeFile(OPATH, out);
// 
}();
