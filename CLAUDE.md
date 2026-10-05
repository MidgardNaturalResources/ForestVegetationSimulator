# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Chat parameters
- Technical
- Do not anticipate follow-up questions or provide context.
- Explicitly acknowledge uncertainty. Provide probability estimates rather than binary claims where appropriate
- When making code changes, briefly state what was modified but omit explanatory closing remarks about benefits or reasoning.
- Ask questions as plain text. Do not use the question widget.

# Making changes
Do not edit a file until I have told you to make that specific change.

## Not approval
- **Answering a question you asked.** If you ask "does it show tags or a list?", my reply
  is information, not an instruction to act on it.
- **Reporting a problem, or describing what I am seeing.** Naming a symptom is not ordering
  a fix.
- **Asking why something is the way it is.** "Why is this a function?" is a question. It is
  not permission to delete or modify it.
- **Approval of one change.** It covers that change only. It does not extend to anything
  adjacent, related, or that you noticed along the way.

## Approval
- A direct instruction to make the change.
- "Yes", "proceed", or "do it" in reply to a specific proposal you made.

## Scope
- Change only what was asked. Do not rename, reformat, restructure or improve anything
  else, including things you believe are wrong.
- Do not delete code, comments, UI elements or output I did not ask you to remove.
- Do not add features, options, buttons, formatting or defensive handling I did not ask
  for.
- If the requested change needs a second change to work, say so and wait. 
- When you spot something that could be an error or needs attention, say what it is in a sentence or two, then stop. Do not fix it.


# Overview

Forest Vegetation Simulator (FVS): an individual-tree, distance-independent forest growth model maintained by the USDA Forest Service FMSC. The code is mostly fixed-form Fortran 77 (`.f`, `.F77` includes, a few `.for`/`.F`) with C/C++ for SQLite output (`dbsqlite`), the FOFEM fire code (`fire/fofem`), and the R/API glue (`base/apisubsc.c`). Each geographic *variant* (e.g. `ak`, `sn`, `pn`) is a separately compiled program. Further docs live on the [project wiki](https://github.com/USDAForestService/ForestVegetationSimulator/wiki) (build instructions, repository protocols).

## Build

All building happens in `bin/`, using GNU make and `gfortran`/`gcc` (Linux, macOS, or Windows with MinGW; `mingw64=1` selects the cross-prefix toolchain).

```
cd bin
make FVSak          # one variant -> bin/FVSak (executable) and bin/FVSak.so (shared lib, .dll on Windows)
make US             # all US variants
make Canada         # FVSbc and FVSon
make all            # every FVS*_sourceList.txt
make clean          # removes *_buildDir and built binaries
```

- The target name must match a `bin/FVS<xx>_sourceList.txt` file. Adding a variant also requires a per-variant rule in `bin/makefile` and an entry in its `USprgs`/`CANprgs` list (`tests/makefile` has matching `USDirs`/`CanDirs` lists).
- `bin/CMakeLists.txt` is an older, partial alternative (generates a per-variant `*_CmakeDir`); the makefile is the primary path.
- Compiler flags (in `bin/makefile`) include `-ffpe-trap=invalid,zero,underflow,overflow,denormal`, so floating-point exceptions abort the run. Don't add `-O2` expecting a speedup; the makefile notes it barely helps and slows compiles.
- The build copies every file in the source list into `FVS<xx>_buildDir/` and compiles there, so include files are resolved by flat name (case sensitive on Linux). Edit the originals, never the copies.

## Tests

Regression tests live in `tests/FVS<xx>/` (each has a `makefile`, a `.key` keyword file, a `.tre` tree file, and a `*.sum.save` baseline). They run the built binaries from `bin/` and `diff` the summary output against the saved baseline, ignoring `-999` lines. The diff is run with `-` prefixed so a mismatch is printed but does not fail make; read the output.

```
cd tests
make US                         # or: make Canada, make all
make FVSak.test                 # one variant
cd FVSak && make akt01          # a single test within a variant
make clean                      # or: make FVSak.clean
```

`tests/APIviaR` exercises the shared-library API from R. `tests/test.py` is a small file-comparison helper. Run FVS directly with `bin/FVSak --keywordfile=x.key`; `--stoppoint=<code>,<year>,<file>` and `--restart=<file>` support stop/restart (see `tests/FVSak/makefile`).

## Architecture

**Variants are assembled from shared directories via source lists.** `bin/FVS<xx>_sourceList.txt` is the authoritative list of every file compiled into variant `xx`. A typical variant combines:

- `<xx>/` and `<xx>/common/`: variant-specific growth, mortality, regeneration, and site routines (e.g. `dgf.f`, `htgf.f`, `morts.f`, `sitset.f`). These are the files that differ per geography, and many have the same name across variants, so a source list picks exactly one set.
- `base/`: the variant-independent core (keyword processing, projection cycle, tree list handling, reports, the API entry points).
- `common/`: shared `.F77` COMMON-block include files (`PRGPRM.F77`, `CONTRL.F77`, `ARRAYS.F77`, ...). Variant-specific includes in `<xx>/common/` override or supplement these. `PRGPRM.F77` holds array dimensions and differs per variant.
- Extension modules, each usually split into a variant-independent directory and a `v`-prefixed directory of variant-linking stubs: `fire` (FFE, with `fire/fofem` C code), `estb`/`vestb` (establishment), `covr`/`vcovr` (cover model), `dbsqlite`/`vdbsqlite` (database I/O), `strp`/`vstrp`, `volume`/`vvolume` and `volume/NVEL` (National Volume Estimator Library), `econ`, `clim`, `organon`/`vorganon`, `mistoe` (dwarf mistletoe), `wpbr`, `wsbwe`, `lpmpb`, `dfb`, `dftm`, `rd`, and similar. The `v*` directories (also `vbase`) hold the routines that depend on a variant's own data and are what make an extension "variant aware".
- `canada/` and `metric/`: Canadian variants (BC, ON) and metric-unit versions of base and extension routines, pulled in by `FVSbc`/`FVSon` source lists instead of their imperial counterparts.

Consequences for changes:

- A new or renamed file only gets compiled if it is added to every relevant `bin/FVS*_sourceList.txt`. Shared-code edits can affect many variants; check which source lists reference the file (`grep -l <file> bin/*_sourceList.txt`) and rebuild and test those variants.
- `.F77` include files are shared across variants by path; changing a COMMON block layout means editing each variant's copy where one exists.
- Each variant produces both a standalone executable (`main.o` included) and a shared library (`main.o` excluded) exposing the C/R API (`base/apisubs.f`, `base/apisubsc.c`).

**Other directories.** `archive/` and `working/` hold retired and scratch material, and `changeNotes/` holds dated per-developer change logs. None are part of normal builds. Variant additions are tracked in git history (for example, the recent HI variant commits show every file a new variant touches: its directory, a source list, a `tests/` directory, and the makefile).

## Conventions

- Fixed-form Fortran 77: code in columns 7-72; the build uses `gfortran -cpp`, so `#ifdef` preprocessing is available.
- Include directives use uppercase names with the exact on-disk casing (e.g. `INCLUDE 'PRGPRM.F77'`); a past fix addressed casing of `wdbkwtdata.inc` includes, so match case exactly.
- Work is in the public domain (CC0); see `Contributing.md`. `.github/CODEOWNERS` assigns review ownership.
