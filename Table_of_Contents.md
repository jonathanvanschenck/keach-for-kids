# Table of Contents

```dataviewjs
const qs = dv.pages("#question").sort(a => a.question).map((p) => {
    return p.completed;
});

const done = qs.filter(x => x).length;
const total = qs.length;

const span = dv.el("span","")
span.appendChild(
    dv.el("span","Completion Rate: ",{ attr: { value:done, max: total } })
);
span.appendChild(
    dv.el("progress","",{ attr: { value:done, max: total } })
);
span.appendChild(
    dv.el("span", `${(100*done/total).toFixed(1)}%`, { attr: { style: "margin-left: 1rem;"}})
)
```

```dataviewjs
const d = dv.pages("#question").sort(a => a.question).map((p) => {
    const completed = p.completed;
    return [
        p.file.link, 
        completed ? "\u2705" : "\u26D4",
    ];
})

dv.table(["Link", "Completed"],d)
```

