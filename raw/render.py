import json
import biblescrapeway as bsw
import re
from sys import argv


cat = argv[1]

Q = []
with open("./{}.json".format(cat)) as f:
    Q = json.load(f)


use_scripts = False
for q in Q:
    if q["scriptures"] != "":
        use_scripts = True
        break

for q in Q:
    scr = q["scriptures"]

    name = "{:0>3}.md".format(q["number"])
    fp = "../questions/{}/{}".format(cat,name)
    print(f"Rendering question {fp}")
    refs = bsw.reference.parse_reference_string(scr) if scr != "" else []
    ranges = [ bsw.query(r.to_string(), "ESV", True) for r in refs ]

    out = ""
    out = out + "---\n"
    out = out + "title: \"Question {number}\"\n".format(**q)
    out = out + "question: {number}\n".format(**q)
    out = out + "catechism: {}\n".format(cat)
    out = out + "completed: false\n"
    out = out + "layout: question\n"
    out = out + "permalink: \"/{}/questions/{}\"\n".format(cat,q["number"])
    if q["number"] < len(Q):
        out = out + "next: \"/{}/questions/{}\"\n".format(cat,q["number"]+1)
    if q["number"] > 1:
        out = out + "previous: \"/{}/questions/{}\"\n".format(cat,q["number"]-1)
    out = out + "---\n"
    out = out + "# Question {number}\n".format(**q)
    out = out + "---\n"
    out = out + "## Modern Adaptation\n"
    out = out + "<strong>\n"
    out = out + "    Question:\n"
    out = out + "</strong>\n"
    out = out + "\n"
    out = out + "<em>\n"
    out = out + "    Answer:\n"
    out = out + "</em>\n"
    out = out + "\n"
    out = out + "---\n"
    if use_scripts:
        out = out + "## Scriptural References\n"
        for ref,ran in zip(refs, ranges):
            out = out + "### {} ({}) <a href=\"{}\"><img src=\"/assets/svg/link.svg\"/></a>\n".format(
                ref.to_string(),
                ran[0].version,
                "https://biblegateway.com/passage/?search={}+{}%3A{}&version=ESV".format(ref.book.replace(" ","+"), ref.start.chapter, ref.start.verse) if ref.is_single_verse else \
                "https://biblegateway.com/passage/?search={}+{}%3A{}-{}&version=ESV".format(ref.book.replace(" ","+"), ref.start.chapter, ref.start.verse, ref.end.verse)
            )
            for v in ran:
                out = out + "> <sup>{}</sup>{}\n".format(v.verse, v.text)
            out = out + "\n"
        out = out + "---\n"

    out = out + "## Traditional Formulation\n"
    out = out + "<strong>\n"
    out = out + "    Question: {Q}\n".format(**q)
    out = out + "</strong>\n"
    out = out + "\n"
    out = out + "<em>\n"
    out = out + "    Answer: {A}\n".format(**q)
    out = out + "</em>\n"
    out = out + "\n"
    out = out + "---\n"
    out = out + "## Adaptation Commentary\n"



    with open(fp, "w") as f:
        f.write(out)
