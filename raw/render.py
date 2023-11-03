import json
import biblescrapeway as bsw
import re

Q = []
with open("./keach.json") as f:
    Q = json.load(f)


for q in Q:
    scr = q["scriptures"]

    name = "Question_{:0>3}.md".format(q["number"])
    fp = "../Questions/{}".format(name)
    print(f"Rendering question {name}")
    refs = bsw.reference.parse_reference_string(scr) if scr != "" else []
    ranges = [ bsw.query(r.to_string(), "ESV", True) for r in refs ]

    out = ""
    out = out + "---\n".format(**q)
    out = out + "title: \"Question {number}\"\n".format(**q)
    out = out + "question: {number}\n".format(**q)
    out = out + "completed: false\n".format(**q)
    out = out + "layout: question\n".format(**q)
    out = out + "permalink: \"/question/{}\"\n".format(q["number"])
    if q["number"] < len(Q):
        out = out + "next: \"/question/{}\"\n".format(q["number"]+1)
    if q["number"] > 1:
        out = out + "previous: \"/question/{}\"\n".format(q["number"]-1)
    out = out + "tags:\n".format(**q)
    out = out + "  - question/{number}\n".format(**q)
    out = out + "---\n".format(**q)
    out = out + "# Question {number}\n\n".format(**q)
    out = out + "## Question\n".format(**q)
    out = out + "\n\n".format(**q)
    out = out + "## Answer\n".format(**q)
    out = out + "\n\n".format(**q)
    out = out + "## Scriptural References\n".format(**q)
    for ref,ran in zip(refs, ranges):
        out = out + "### {} ({})\n".format(ref.to_string(), ran[0].version)
        for v in ran:
            out = out + "> <sup>{}</sup>{}\n".format(v.verse, v.text)
        out = out + "\n"

    out = out + "# Traditional Formulation\n".format(**q)
    out = out + "## Question\n".format(**q)
    out = out + "{Q}\n\n".format(**q)
    out = out + "## Answer\n".format(**q)
    out = out + "{A}\n\n".format(**q)

    out = out + "## Adaptation Commentary\n".format(**q)



    with open(fp, "w") as f:
        f.write(out)
