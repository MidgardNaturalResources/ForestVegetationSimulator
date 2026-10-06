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

### Batch E: stale references [H]
- Section cross-references use legacy numbering ("section 8.0", "2.1.5", etc.) and do not match `number_sections` output.
- SourceForge URLs (open-fvs wiki, FVSOnline code) should point to current GitHub locations.
- The intro section roadmap (Rmd ~l.67) refers to the old chapter plan.

## Other open items
- [M] `ICL6` comment conflict: `CONTRL.F77` says ADDFILE reference; `fvs.f` sets -99 at completion. The table keeps "-99 = complete".
- [H] `common/ARRAYS.F77` comment for `IND` is inverted ("IF IND(I)=1, TREE I IS THE LARGEST TREE"); `rdpsrt.f` shows IND(1) is the largest. Code comment, not edited.
- Section 12 `db-all-tables` (database output table list) has not been audited. Higher priority given SQLite use.
- Cycle phase chapters (Ch. 4 onward) not yet compared with the code.
- Interface repo `rfvsOverview.Rmd` stop-point fixes and replacement stop-points PNG are with another session.
