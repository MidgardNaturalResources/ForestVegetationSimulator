# Open Questions

Open items for `ModelStructure_FVS.Rmd` and related documentation. Confidence: [H] verified in code, [M] partly verified, [L] suspected.

## Pre-cycle accuracy pass (Chapters 1-3)

### Batch C: variant dependence
- [M] CRATET call order is variant specific. In IE, FINDAG is called only for species 18, 20, 21, before DGDRIV. The text places FINDAG after DGDRIV for all trees.
- [M] Check RCON entry points (DGCONS, HTCONS, REGCON, MORCON, CRCONS), the MBACAL skip for bare ground, and the SDICHK call in another variant (e.g. sn, ec, oc).

### Batch D: needs verification
- [L] GENRPT: "over 200 reports converts the scratch file to a permanent file" (no `200` found in `base/genrpt.f`).
- [M] Table 3-1 unit numbers vs BLKDAT and extension DATA statements (scripted comparison). Spot checks agree. BGC rows may be obsolete.
- [M] Table 3-2 default suffixes vs FILOPN.
- [M] Section 3.4 event monitor flow (EVIF, EVCOMP, EVTHEN/EVEND in EVTACT): names exist, flow not read line by line.
- [M] Section 3.5 flow: DBSIN, DBSSTANDIN/DBSTREESIN, INTREE; PROCESS keyword behavior (INTREE "at least once" logic, `initre.f` ~l.269).
- [M] BGCIN appears only as a stub (`base/exbgc.f`). Decide whether to remove it from the keyword-routine list (~65% it should go).
- [M] Section 3.7 says FVS calls NATCRZ for cycle 0 output. No such call in `fvs.f` or base routines (only `canada/on/cuts.f`). About 85% likely wrong.
- [M] DFBINV: the code comment says "dead DFB/acre". The wording "Douglas-fir beetle: dead trees per acre" is about 70% likely correct.
- [M] `DBSCASE(2)` (updates sampling weight and groups in the cases table) is not described yet.

### SQLite-first rewrite
Most users use SQLite input and output. Planned changes:
- Section 3.1: put the database path first (keyword file still required; stand and tree data from the database).
- Section 3.5: lead with DATABASE, DBSIN, the stand and tree SQL queries, and the call chain into INTREE; describe flat files as the alternative. Make the DATABASE-before-STDINFO ordering rule prominent.
- Section 3.2: describe what DBSINIT initializes (read `dbsqlite/` and `vdbsqlite/` first).
- Main FVS Routine list: the "process all keyword record requests" entry needs the same emphasis.

### Batch E: stale references
- Done: internal section-number references converted to named links; introduction roadmap rewritten; SourceForge URLs replaced with the GitHub wiki / Interface repo pages (page existence verified).
- Done: table captions no longer carry section numbers; Suppose/DOS sentence replaced with the FVSOnline (fvsOL) description.
- [H] Remaining: the Literature Cited URL `http://forsys.cfr.washington.edu/winsvs/manual.pdf` (McGaughey 2002, SVS 3.30) is dead (host does not resolve). A candidate replacement is `https://www.fs.usda.gov/fmsc/ftp/fvs/docs/gtr/WinSVS3_3.pdf` (found by search, not verified from this environment). [M] The `rFVS` vs. `Suppose` comparison and the "About this Guide" Suppose paragraph have not been reviewed.
- [M] The GitHub wiki Stop-Restart and FVS-Command-Line pages describe stop point 5 as "after growth and mortality are computed but before they are applied" and do not list `fvsRun`, `--stoppoint` year semantics, or minor stops as tested in code. The wiki may need its own correction; the Rmd text follows the code.

## Other open items
- [M] `ICL6` comment conflict: `CONTRL.F77` says ADDFILE reference; `fvs.f` sets -99 at completion. The table keeps "-99 = complete".
- [H] `common/ARRAYS.F77` comment for `IND` is inverted ("IF IND(I)=1, TREE I IS THE LARGEST TREE"); `rdpsrt.f` shows IND(1) is the largest. Code comment, not edited.
- Section 12 `db-all-tables` (database output table list) has not been audited. Higher priority given SQLite use.
- Interface repo `rfvsOverview.Rmd` stop-point fixes and replacement stop-points PNG are with another session.

## Cycle phase (Chapter 4) vs code
Done (Batch 1): NATCRZ and BGCFVS removed, stop points 1-6 added, FIA-VBC and DBS summary calls added, VARMRT variant list (ACD, WS added), end-of-cycle flow corrected.
Open:
- [H] Add to the GRINCR description in sequence: SSTAGE, RDMN2/RDTRP (sets LTRIP), FMSDIT, ECSTATUS before/after thinning.
- [H] Add ECCALC (economics) and the second FMKILL call to the GRADD sequence.
- [L] MORTS constants not confirmed in code: 55% density-mortality threshold, 0.1" QMD tolerance, 10 iterations, 1 ft2 basal area tolerance.
- [L] ESNUTR/ESTAB constants: 1/300-acre plots, minimum 50 plots, 0.001 TPA threshold, compress to 1/2 MAXTRE, "30% of MAXTRE" test; ESNUTR/ESTAB internals not read line by line.
- [L] Small-tree step: 5-year sub-cycling, NC variant 5-year basis, `BREAK(i)` in GGCOM.
- [L] "FVS finds and runs SYSTEM keyword calls" (end-of-cycle section): no SYSTEM handling found in `fvs.f`, `tregro.f`, `gradd.f`; location not found.
- [L] CWCALC "two versions (NI and LS directories)".
- [M] DBSSUMRY2/DBSCARBBIOSUMRY and FIA-VBC conditions ("when requested") not confirmed beyond the early-return checks.
