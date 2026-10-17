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
Done: Sections 3.1, 3.2, 3.5, the Main FVS Routine list entry, and the Chapter 11 input workflow and examples now describe DSNIN/STANDSQL/TREESQL/%StandID% and the FVS_StandInit/FVS_TreeInit convention.
- [M] `STDIDENT` usage in the revised landscape example was not checked against a test keyword file.

### Chapter 11 (Database Input and Output Extension)
Done: column mapping table, FVS_Summary/FVS_Summary2/FVS_TreeList column lists, table list additions (FVS_InvReference, FVS_FIAVBC_*, FVS_Error, FVS_PotFire_Cond), directory structure, output keywords, workflow, FVS_Cases columns, practical examples (MGMTID instead of GROUPS, EndSQL, Variant).
- [L] Column meanings for SSCD, ActPt, PRESCRIPTION, TOPOCODE, WDLND_STEMS are not documented in the code; the text points to the database user's guide or gives a generic label.
- [M] The dbsinit header lists FVS_Summary_East and FVS_Summary2_East, but no routine in `dbsqlite`/`vdbsqlite` creates them (only FVS_PotFire_East exists); they appear to belong to the ODBC `dbs` extension and were left out.
- [L] Metric-unit conversions, the Common SQL Errors and Performance sections, and the GIS and climate examples are generic or illustrative and were not verified.
- [L] THINBTA field values in the Treatment Optimization example were not checked.

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
Done (Batches 1-2): NATCRZ, BGCFVS and SYSTEM keyword statements removed; stop points 1-6, ECSTATUS, ECCALC, second FMKILL, RDMN2/RDTRP/FMSDIT added; FIA-VBC and DBS summary calls added; VARMRT variant list (ACD, WS added); end-of-cycle flow; tree list compression thresholds (40%, 70%/30%, MXRR/2); CWCALC locations (VIE, HI, LS). Verified as written: MORTS 55%/85% SDI thresholds, 0.1" QMD tolerance, 10 passes, 1 ft2 BA tolerance; 1/300-acre plots; minimum 50 plots (MINREP default; ESTAB keyword minimum 20); NC 5-year small-tree basis; BREAK in GGCOM.
Open:
- [M] SYSTEM keyword: not found in the base keyword table (`base/keywds.f`); only `metric/ppbase/ppin.f` lists it. Statements removed (about 85% confident).
- [M] VARMRT callers per grep: acd, ca, cr, ec, oc, sn, vls (CS/LS/NE), ws. OC calls VARMRT; the text lists variants without OC.
- [L] ESNUTR/ESTAB internals (ESETPR, ESPREP, ESTOCK, ESPADV/ESPSUB/ESPXCS, ESSUBH, ESGENT) not read line by line.
- [L] DISPLY database summary calls and FIA-VBC "when requested" conditions are only confirmed for the FIA-VBC early-return checks.
- [M] ECCALC is described as running when the economics extension is active; the condition in GRADD was not confirmed.
