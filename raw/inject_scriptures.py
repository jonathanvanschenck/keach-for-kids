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

out = "questions:\n"

for q in Q[:]:
    scr = q["scriptures"]

    print("Rendering question {}".format(q["number"]))
    refs = bsw.reference.parse_reference_string(scr) if scr != "" else []
    ranges = [ bsw.query(r.to_string(), "ESV", True) for r in refs ]


    obj = dict(
        number = q["number"],
        adapt = dict(
            Q = "",
            A = "",
        ),
        notes = "\n",
        trad = dict(
            Q = q["Q"],
            A = q["A"],
        ),
        scriptures = [dict(
            ref_str = ref.to_string(),
            is_single_verse = ref.is_single_verse,
            book = ref.start.book,
            chapter = ref.start.chapter,
            start_version = ref.start.verse,
            end_version = ref.end.verse,
            version = ran[0].version,
            bgw_link =  "https://biblegateway.com/passage/?search={}+{}%3A{}&version=ESV".format(ref.book.replace(" ","+"), ref.start.chapter, ref.start.verse) if ref.is_single_verse else \
                        "https://biblegateway.com/passage/?search={}+{}%3A{}-{}&version=ESV".format(ref.book.replace(" ","+"), ref.start.chapter, ref.start.verse, ref.end.verse),
            text = [dict(
                verse = v.verse,
                text = v.text
            ) for v in ran]
        ) for ref,ran in zip(refs, ranges)]
    )

    out = out + "  -".format(**obj) + "\n"
    out = out + "    number: {}".format(obj["number"]) + "\n"
    out = out + "    completed: false".format() + "\n"
    out = out + "    trad:".format() + "\n"
    out = out + "      Q: \"{}\"".format(obj["trad"]["Q"].replace('"','\\"')) + "\n"
    out = out + "      A: \"{}\"".format(obj["trad"]["A"].replace('"','\\"')) + "\n"
    out = out + "    adapt:".format() + "\n"
    out = out + "      Q: \"{}\"".format(obj["adapt"]["Q"].replace('"','\\"')) + "\n"
    out = out + "      A: \"{}\"".format(obj["adapt"]["A"].replace('"','\\"')) + "\n"
    out = out + "    notes: |-\n".format()
    out = out + "      No Change.\n\n"
    out = out + "    scriptures:".format() + "\n"
    for s in obj["scriptures"]:
        out = out + "      -".format() + "\n"
        out = out + "        ref_str: \"{}\"".format(s["ref_str"]) + "\n"
        # out = out + "        is_single_verse: {}".format(s["is_single_verse"]) + "\n"
        # out = out + "        book: \"{}\"".format(s["book"]) + "\n"
        # out = out + "        chapter: {}".format(s["chapter"]) + "\n"
        # out = out + "        start_version: {}".format(s["start_version"]) + "\n"
        # out = out + "        end_version: {}".format(s["end_version"]) + "\n"
        out = out + "        version: \"{}\"".format(s["version"]) + "\n"
        out = out + "        bgw_link: \"{}\"".format(s["bgw_link"]) + "\n"
        out = out + "        verses:".format() + "\n"
        for t in s["text"]:
            out = out + "          -".format() + "\n"
            out = out + "            verse: {}".format(t["verse"]) + "\n"
            out = out + "            text: \"{}\"".format(t["text"].replace('"','\\"')) + "\n"

fp = "../data/{}.yaml".format(cat)
with open(fp, "w") as f:
    f.write(out)
