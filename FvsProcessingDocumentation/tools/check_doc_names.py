#!/usr/bin/env python3
"""Check ModelStructure_FVS.Rmd (and the figure data) against the FVS source tree.

Run after syncing the branch with the upstream repository:

    python3 -I FvsProcessingDocumentation/tools/check_doc_names.py            # report
    python3 -I FvsProcessingDocumentation/tools/check_doc_names.py --update-baseline

Checks
  1. Documented names: every code-like name in the documentation (routines, keywords, arrays,
     API functions) is looked up in the source tree. Names that do not appear anywhere in the code
     are "unresolved". The unresolved names recorded in baseline.json (acronyms, author names,
     words that are not code) are ignored; only NEW unresolved names are reported.
  2. Code inventory: routines, source files and keyword table entries are compared with
     baseline.json. Removed, moved and added items are listed; for removed items the places in
     the documentation that mention them are shown.
  3. Facts: statements in facts.json (parameter values, call sites, source list membership counts)
     are re-tested against the source tree.
  4. Appendix A: the directory rows in the Appendix A tables are compared with the repository.

Exit status is 1 when anything needs attention, 0 otherwise. After the documentation has been
brought up to date, run with --update-baseline so the next sync is compared with this one.
Only the Python standard library is used.
"""
import argparse
import fnmatch
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOC_DIR = os.path.dirname(HERE)
ROOT = os.path.dirname(DOC_DIR)
BASELINE = os.path.join(HERE, "baseline.json")
FACTS = os.path.join(HERE, "facts.json")
DOC_FILES = [
    os.path.join(DOC_DIR, "ModelStructure_FVS.Rmd"),
    os.path.join(DOC_DIR, "figures", "fvs_sequence_data.js"),
]
CODE_EXT = (".f", ".f90", ".for", ".f77", ".c", ".cpp", ".h", ".inc")
CODE_EXT_UP = (".F77", ".F", ".F90")
# top-level directories that are not part of the FVS code base
SKIP_DIRS = {".git", ".github", "archive", "working", "tests", "FvsProcessingDocumentation",
             "changeNotes"}

ROUTINE_RE = re.compile(
    r"^\s{6}\s*(?:[A-Za-z*0-9()=,\s]*?\s)?(SUBROUTINE|FUNCTION|ENTRY|BLOCK\s+DATA)\s+([A-Za-z_]\w*)",
    re.IGNORECASE)
BIND_RE = re.compile(r"bind\s*\(\s*c\s*,\s*name\s*=\s*[\"'](\w+)[\"']", re.IGNORECASE)
WORD_RE = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")
DOC_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9_]{2,}")
QUOTED_RE = re.compile(r"'([A-Za-z0-9_\-]{2,})'")


def walk_code():
    """Yield (relative path, absolute path) for every source file."""
    for top in sorted(os.listdir(ROOT)):
        if top in SKIP_DIRS or top.startswith("."):
            continue
        base = os.path.join(ROOT, top)
        if os.path.isfile(base):
            continue
        for dp, dn, fn in os.walk(base):
            dn[:] = [d for d in dn if not d.startswith(".")]
            for f in fn:
                if f.endswith(CODE_EXT) or f.endswith(CODE_EXT_UP):
                    p = os.path.join(dp, f)
                    yield os.path.relpath(p, ROOT).replace(os.sep, "/"), p


def read(path):
    with open(path, encoding="utf-8", errors="replace") as fh:
        return fh.read()


def scan_code():
    words = set()          # every identifier appearing in the code (upper case)
    routines = {}          # routine name -> sorted list of files defining it
    files = []
    for rel, ab in walk_code():
        files.append(rel)
        text = read(ab)
        words.update(w.upper() for w in WORD_RE.findall(text))
        for line in text.splitlines():
            m = ROUTINE_RE.match(line)
            if m:
                kind = m.group(1).upper().split()[0]
                name = m.group(2).upper()
                if kind == "BLOCK":
                    name = "BLOCKDATA:" + name
                routines.setdefault(name, set()).add(rel)
        for m in BIND_RE.finditer(text):
            routines.setdefault(m.group(1).upper(), set()).add(rel)
    return words, {k: sorted(v) for k, v in routines.items()}, sorted(files)


def read_keywords():
    path = os.path.join(ROOT, "base", "keywds.f")
    if not os.path.exists(path):
        return []
    text = read(path)
    keys = []
    for line in text.splitlines():
        if line[:1] in ("C", "c", "*"):
            continue
        keys.extend(QUOTED_RE.findall(line))
    return sorted(set(k.upper() for k in keys))


def doc_tokens():
    """Code-like names in the documentation -> list of (file, line number)."""
    found = {}
    for path in DOC_FILES:
        if not os.path.exists(path):
            continue
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        for n, line in enumerate(read(path).splitlines(), 1):
            for tok in DOC_TOKEN_RE.findall(line):
                up = tok.upper()
                code_like = (tok.isupper() and len(tok) >= 3) or \
                            ("_" in tok) or \
                            (tok[0].islower() and any(c.isupper() for c in tok[1:]) and tok.lower().startswith("fvs"))
                if code_like and not up.isdigit():
                    found.setdefault(up, []).append((rel, n))
    return found


def mentions(name, limit=6):
    """Where the documentation mentions a name (any case)."""
    pat = re.compile(r"\b" + re.escape(name) + r"\b", re.IGNORECASE)
    out = []
    for path in DOC_FILES:
        if not os.path.exists(path):
            continue
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        for n, line in enumerate(read(path).splitlines(), 1):
            if pat.search(line):
                out.append("%s:%d" % (rel, n))
                if len(out) >= limit:
                    return out
    return out


def check_facts():
    problems = []
    if not os.path.exists(FACTS):
        return ["facts.json is missing"]
    facts = json.load(open(FACTS, encoding="utf-8"))
    for f in facts:
        fid = f["id"]
        flags = re.IGNORECASE | re.MULTILINE
        if f["type"] == "regex_in_file":
            path = os.path.join(ROOT, f["file"])
            if not os.path.exists(path):
                problems.append("%s: file %s not found (%s)" % (fid, f["file"], f["doc"]))
                continue
            if not re.search(f["regex"], read(path), flags):
                problems.append("%s: pattern not found in %s (%s)" % (fid, f["file"], f["doc"]))
        elif f["type"] == "count_files":
            n = 0
            for dp, dn, fn in os.walk(os.path.join(ROOT, f["dir"])):
                for name in fn:
                    if fnmatch.fnmatch(name, f["glob"]):
                        if re.search(f["regex"], read(os.path.join(dp, name)), flags):
                            n += 1
            if n != f["expected"]:
                problems.append("%s: %d files match, expected %d (%s)" % (fid, n, f["expected"], f["doc"]))
    return problems


def check_appendix_a():
    """Compare the 'FVS/...' directory rows of Appendix A with the repository."""
    rmd = DOC_FILES[0]
    text = read(rmd)
    i = text.find("# Appendix A")
    j = text.find("# Appendix B")
    if i < 0 or j < 0:
        return ["Appendix A headings not found"]
    listed = set(m.group(1).lower() for m in re.finditer(r'"FVS/([A-Za-z0-9_/.]+)"', text[i:j]))
    problems = []
    real_lower = {}
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if not d.startswith(".")]
        rel = os.path.relpath(dp, ROOT).replace(os.sep, "/")
        if rel == ".":
            continue
        real_lower[rel.lower()] = rel
    for d in sorted(listed):
        if d not in real_lower:
            problems.append("listed in Appendix A but not in the repository: FVS/%s" % d)
    ignore_top = {d.lower() for d in SKIP_DIRS} | {"metric"}
    expected_levels = set()
    for d in listed:
        parts = d.split("/")
        for k in range(1, len(parts) + 1):
            expected_levels.add("/".join(parts[:k]))
    for low, rel in sorted(real_lower.items()):
        top = low.split("/")[0]
        if top in ignore_top or low in listed or low in expected_levels:
            continue
        depth = low.count("/")
        parent = "/".join(low.split("/")[:-1])
        # a new top-level directory, or a new subdirectory of a directory that Appendix A lists in detail
        if depth == 0 or (parent in listed and any(x.startswith(parent + "/") for x in listed)):
            if low not in ("tests",) and not low.startswith("fire/cfim"):
                problems.append("in the repository but not in Appendix A: %s" % rel)
    return problems


def build_inventory():
    words, routines, files = scan_code()
    return words, {
        "routines": routines,
        "files": files,
        "keywords": read_keywords(),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--update-baseline", action="store_true",
                    help="record the current code inventory and unresolved names as the new baseline")
    args = ap.parse_args()

    words, inv = build_inventory()
    tokens = doc_tokens()
    unresolved = sorted(t for t in tokens if t not in words)

    if args.update_baseline:
        out = dict(inv)
        out["unresolved_doc_names"] = unresolved
        json.dump(out, open(BASELINE, "w", encoding="utf-8"), indent=1, sort_keys=True)
        print("baseline written: %d routines, %d files, %d keywords, %d unresolved documentation names"
              % (len(inv["routines"]), len(inv["files"]), len(inv["keywords"]), len(unresolved)))
        return 0

    if not os.path.exists(BASELINE):
        print("baseline.json is missing; run with --update-baseline first")
        return 1
    base = json.load(open(BASELINE, encoding="utf-8"))
    attention = 0

    print("# Documentation check against the source tree\n")

    # 1. documented names that no longer resolve
    new_unres = [t for t in unresolved if t not in set(base.get("unresolved_doc_names", []))]
    print("## 1. Documented names not found in the code (new since baseline): %d" % len(new_unres))
    for t in new_unres:
        print("- %s  (%s)" % (t, ", ".join("%s:%d" % x for x in tokens[t][:4])))
    attention += len(new_unres)

    # 2. inventory differences
    b_routines = base["routines"]
    removed = sorted(set(b_routines) - set(inv["routines"]))
    added = sorted(set(inv["routines"]) - set(b_routines))
    moved = sorted(r for r in set(b_routines) & set(inv["routines"]) if b_routines[r] != inv["routines"][r])
    print("\n## 2. Code inventory changes since baseline")
    print("Routines removed: %d" % len(removed))
    for r in removed:
        m = mentions(r.split(":")[-1])
        print("- %s  (was in %s)%s" % (r, ", ".join(b_routines[r][:2]),
                                       "  DOCUMENTED AT: " + ", ".join(m) if m else ""))
    print("Routines moved to different files: %d" % len(moved))
    for r in moved:
        m = mentions(r.split(":")[-1])
        print("- %s: %s -> %s%s" % (r, ", ".join(b_routines[r][:2]), ", ".join(inv["routines"][r][:2]),
                                    "  DOCUMENTED AT: " + ", ".join(m) if m else ""))
    print("Routines added: %d" % len(added))
    for r in added[:200]:
        print("- %s  (%s)" % (r, ", ".join(inv["routines"][r][:2])))
    if len(added) > 200:
        print("- ... %d more" % (len(added) - 200))
    kw_removed = sorted(set(base["keywords"]) - set(inv["keywords"]))
    kw_added = sorted(set(inv["keywords"]) - set(base["keywords"]))
    print("Keywords removed: %s" % (", ".join(kw_removed) or "none"))
    print("Keywords added: %s" % (", ".join(kw_added) or "none"))
    f_removed = sorted(set(base["files"]) - set(inv["files"]))
    f_added = sorted(set(inv["files"]) - set(base["files"]))
    print("Source files removed: %d, added: %d" % (len(f_removed), len(f_added)))
    for f in f_removed[:100]:
        print("- removed: %s" % f)
    for f in f_added[:100]:
        print("- added: %s" % f)
    attention += len(removed) + len(moved) + len(kw_removed) + len(kw_added)

    # 3. facts
    problems = check_facts()
    print("\n## 3. Facts that no longer hold: %d" % len(problems))
    for p in problems:
        print("- " + p)
    attention += len(problems)

    # 4. Appendix A
    ap_problems = check_appendix_a()
    print("\n## 4. Appendix A directory differences: %d" % len(ap_problems))
    for p in ap_problems:
        print("- " + p)
    attention += len(ap_problems)

    print("\nItems needing attention: %d" % attention)
    return 1 if attention else 0


if __name__ == "__main__":
    sys.exit(main())
