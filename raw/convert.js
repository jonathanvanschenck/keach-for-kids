const { readFileSync, writeFileSync } = require("fs");


const string = readFileSync("./keach.txt").toString();


const questions = [];
let question = {};
for ( const line of string.split("\n") ) {
    // Match Q
    if ( line.match(/^Q/) ) {
        const [ _, num, quest ] = line.match(/^Q\.\s*(\d+)\.\s*(.*)/)
        question.number = parseInt(num);
        question.Q = quest.trim();
    }
    if ( line.match(/^A/) ) {
        const [ _, ans, scripts ] = line.match(/^A\.\s*(.*)\(([^)]*)\)\s*$/) ?? line.match(/^A\.\s*(.*)$/)
        question.A = ans.trim();
    
        // Convert paired references into a range for bsw
        const scripts_parsed = scripts?.replace(/(:|\s)(\d+),(\d+)(;|$)/g,(_,head,d1,d2,term) => {
            return `${head}${d1}-${d2}${term}`
        });

        question.scriptures = scripts_parsed ?? "";
        questions.push(question);
        question = {};
    }
}

writeFileSync("./keach.json", JSON.stringify(questions,null,4));
