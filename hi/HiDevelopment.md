# HI Variant Development Log

## Overview
This document tracks the development of the Hawaii (HI) variant for the Forest Vegetation Simulator (FVS), including the addition of six new Hawaiian species.

## New Species Added

The following six Hawaiian species are being added to the HI variant:

| Common Name | Binomial | USDA Plants Code | FIA Code |
|-------------|----------|------------------|----------|
| Koa | Acacia koa | ACKO | 301 |
| Ohia | Metrosideros polymorpha | MEPO5 | 671 |
| Forest sandalwood | Santalum freycinetianum | SAFR4 | 515 |
| Mountain sandalwood | Santalum paniculatum | SAPA7 | 516 |
| Haleakala sandalwood | Santalum haleakalae | SAHA3 | 517 |
| Kauaʻi sandalwood | Santalum pyrularium | SAFRP | 518 |

## Array Position Strategy

The new species codes and parameters are inserted in arrays after species 'WI' (array position 37) and before species 'OT' (currently array position 38-39). This maintains OT as the MAXSP value, which represents the default species code.

**New array positions:**
- Positions 1-37: Existing species (unchanged)
- Position 38: Koa (ACKO)
- Position 39: Ohia (MEPO5)
- Position 40: Forest sandalwood (SAFR4)
- Position 41: Mountain sandalwood (SAPA7)
- Position 42: Haleakala sandalwood (SAHA3)
- Position 43: Kauaʻi sandalwood (SAFRP)
- Position 44: '   ' (blank species code)
- Position 45: 'OT ' (other species - default)

## Equation Parameters

All equation parameters that reference species or species group will utilize the species=OT values or the group that contains the OT species.

## Changes Made

### hi/common/PRGPRM.F77
- **Line 9**: Changed `PARAMETER (MAXTRE=3000)` to `PARAMETER (MAXTRE=6000)`
  - Doubles maximum tree records from 3000 to 6000
  - MAXTP1 (line 10) automatically updates to 6001 (MAXTRE+1)
- **Line 12**: Changed `PARAMETER (MAXSP =39)` to `PARAMETER (MAXSP =45)`
  - Increases maximum species count from 39 to 45 to accommodate the 6 new Hawaiian species
- **Line 13**: Changed `PARAMETER (MAXCYC=40)` to `PARAMETER (MAXCYC=80)`
  - Doubles maximum projection cycles from 40 to 80
  - MAXCY1 (line 14) automatically updates to 81 (MAXCYC+1)

### hi/blkdat.f
Added six new Hawaiian species to all species arrays after position 37 (WI) and before the blank/OT positions:

**Species Code Arrays:**
- **Lines 131-138**: Updated species list comments to document the 6 new species
- **Lines 140-147**: **JSP** array - Added 2-letter FVS codes: 'AK ', 'LE ', 'IF ', 'IM ', 'IH ', 'IK '
- **Lines 149-156**: **FIAJSP** array - Added FIA codes: '301', '671', '515', '516', '517', '518'
- **Lines 158-165**: **PLNJSP** array - Added USDA Plants codes: 'ACKO  ', 'MEPO5 ', 'SAFR4 ', 'SAPA7 ', 'SAHA3 ', 'SAFRP '
- **Lines 165-179**: **NSP** array - Added extended codes with suffixes (AK1-3, LE1-3, IF1-3, IM1-3, IH1-3, IK1-3)

**Numerical Parameter Arrays (using OT species values):**
- **Line 70**: **XMIN** - Changed `9*1.0` to `7*1.0, 6*1.0, 2*1.0` (added 6 values of 1.0)
- **Line 72**: **HHTMAX** - Changed `17*20.0` to `23*20.0` (added 6 values of 20.0)
- **Line 189**: **HT1** - Changed `6*5.152` to `12*5.152` (added 6 values of 5.152)
- **Line 195**: **HT2** - Changed `6*-13.576` to `12*-13.576` (added 6 values of -13.576)
- **Line 206**: **SIGMAR** - Changed `6*0.5357` to `12*0.5357` (added 6 values of 0.5357)
- **Lines 219, 225, 230, 234, 240**: **HTT1** multi-dimensional array:
  - HTT1(ISPC,1): Changed `6*0.0994` to `12*0.0994` (constant coefficient)
  - HTT1(ISPC,2): Changed `6*4.9767` to `12*4.9767` (DBH coefficient)
  - HTT1(ISPC,3): Changed `21*0.0` to `27*0.0` (CR coefficient)
  - HTT1(ISPC,4): Changed `20*0.0` to `26*0.0` (DBH squared coefficient)
  - HTT1(ISPC,5): Changed `20*0.0` to `26*0.0` (managed/unmanaged dummy)
  - HTT1(ISPC,6-9): Changed `156*0.0` to `180*0.0` (unused parameters, 45 species × 4)
- **Line 83**: **OCURHT** - Changed `624*0.0` to `720*0.0` (16 × 45 = 720; was hardcoded for MAXSP=39)
- **Line 87**: **OCURNF** - Changed `780*0.0` to `900*0.0` (20 × 45 = 900; was hardcoded for MAXSP=39)

### hi/bratio.f
Added six new Hawaiian species to bark ratio function:

- **Line 22**: Changed `INTEGER JBARK(39)` to `INTEGER JBARK(45)` (array dimension)
- **Lines 18-19**: Updated species list comments to include the 6 new species codes
- **Lines 26-31**: **JBARK** array - Added 6 values of `10` (mapping to master species 108=LP, same as OT)

### hi/ccfcal.f
Added six new Hawaiian species to Crown Competition Factor (CCF) calculation:

- **Line 70**: Changed `INTEGER INDCCF(39)` to `INTEGER INDCCF(45)` (array dimension)
- **Lines 33-34**: Updated species list comments to include the 6 new species (AK, LE, IF, IM, IH, IK)
- **Lines 74-79**: **INDCCF** array - Added 6 values of `10` (mapping to CCF equation 10=SMITH TABLE 1, same as OT)

### hi/cratet.f
**No changes needed.** This file uses MAXSP-dimensioned arrays that automatically accommodate 45 species after the PRGPRM.F77 change. The species-specific exponential transformation logic (lines 352-354, 447-449) appropriately excludes the new Hawaiian species (38-43), consistent with OT (45) behavior.

### hi/cubrds.f
Created from wc/cubrds.f (BLOCK DATA for cubic and board foot volume equation defaults). All DATA statements had hardcoded counts for MAXSP=39; updated for MAXSP=45. Source list updated from `../wc/cubrds.f` to `../hi/cubrds.f`.

- **CFVEQS, CFVEQL, BFVEQS, BFVEQL**: 7×MAXSP coefficient arrays — changed `273*0.0` to `315*0.0` (7 × 45 = 315)
- **ICTRAN, IBTRAN**: MAXSP integer flag arrays — changed `39*0` to `45*0`
- **CTRAN, BTRAN**: MAXSP real transition size arrays — changed `39*0.0` to `45*0.0`

### hi/crown.f
Added six new Hawaiian species to crown ratio calculations:

- **Line 66**: **IMAP** array - Changed `6*14` to `12*14` (added 6 values mapping new species to coefficient group 14, same as OT)
- **Lines 72-73**: Updated species order comments to include the 6 new species (AK, LE, IF, IM, IH, IK)

### hi/cwcalc.f
Added six new Hawaiian species to crown width calculations:

- **Line 72**: Changed **PNMAP** array dimension from 39 to 45 (Pacific Coast variant)
- **Lines 234-237**: **PNMAP** DATA array - Added 6 values of '12205' (mapping new species to PP/Ponderosa Pine equation, same as OT)

### hi/dgbnd.f
**No changes needed.** This file uses SELECT CASE logic where species 17 (Redwood) has special handling, and all other species use the default bounding function. The new Hawaiian species (38-43) correctly fall into the CASE DEFAULT block, using the same diameter growth bounding logic as OT (45). SIZCAP arrays are MAXSP-dimensioned and automatically accommodate 45 species.

### hi/dgdriv.f
**No changes needed.** This file uses MAXSP-dimensioned arrays throughout (STDRAT, CORTEM, PSIGSQ, NUMCAL) that automatically accommodate 45 species after the PRGPRM.F77 change. The DATA statement at line 94 (`DATA PSIGSQ/ MAXSP * 0.0898 /`) uses the MAXSP parameter and will automatically initialize all 45 elements. All loops use MAXSP bounds (lines 146, 344, 350, 672), and there is no species-specific logic requiring modification.

### hi/dgf.f
Added six new Hawaiian species to diameter growth function:

- **Lines 85-90**: Updated species order comments to include the 6 new species (AK, LE, IF, IM, IH, IK)
- **Line 106**: Changed `MAPSPC(39)` to `MAPSPC(45)` (array dimension)
- **Lines 117-120**: **MAPSPC** DATA array - Added 7 values of `14` (6 new Hawaiian species + OT, mapping to coefficient group 14=WA/PB/GC/AS/CW/J/DG/HT/CH/WI, same as OT). Total: 45 values.

### hi/dubscr.f
Added six new Hawaiian species to crown ratio dubbing function:

- **Line 17**: Updated species list comments to include the 6 new species (AK, LE, IF, IM, IH, IK) in group 5
- **Line 45**: Changed `IMAP(39)` to `IMAP(45)` (array dimension)
- **Line 48**: **IMAP** DATA array - Changed `6*5` to `12*5` (mapping new species to coefficient group 5, constant ICR=5, same as OT)

### hi/ecocls.f
**No changes needed.** This file sets default MAX SDI values, site indices, and site species by plant association (ecoclass code). It contains hardcoded data for 75 Pacific Northwest plant associations. The file references species by FVS sequence number only within specific plant association definitions, and no Hawaiian plant associations are defined. The file does not contain species arrays that need to accommodate 45 species.

### hi/essprt.f
**No changes needed.** This file handles stump sprouting computations by variant and species. For the PN variant, there are four entry points with SELECT CASE logic on species (ISPC):
1. **ESSPRT** (lines 488-510): Determines sprout TPA - CASE DEFAULT assigns `PREM = PREM * 1.`
2. **ESASID** (lines 731-732): Returns aspen index - no species logic
3. **NSPREC** (lines 1076-1098): Determines number of sprout records - CASE DEFAULT assigns `NMSPRC = 1`
4. **SPRTHT** (lines 1445-1455): Determines sprout height - CASE DEFAULT assigns `HTSPRT = 0.5 + 0.5*IAG`

All new Hawaiian species (38-43) correctly fall into CASE DEFAULT blocks, receiving appropriate default sprouting behavior.

### hi/essubh.f
**No changes needed.** This file assigns heights to subsequent and planted tree records created by the establishment model. The logic uses a simple IF/ELSE structure (lines 79-97): Species 17 (Redwood) receives special handling with a fixed height of 2.0 feet, while all other species fall into the ELSE block and receive standard seedling height calculations via the SMHGDG subroutine. The new Hawaiian species (38-43) correctly fall into the ELSE block.

### hi/findag.f
Added six new Hawaiian species to age calculation function:

- **Line 44**: **MAPHD** DATA array - Changed `2*6` to `8*6` (mapping 6 new species + blank + OT to height-diameter ratio coefficient group 6, same as OT)
- AGMAX and MAPHD arrays are MAXSP-dimensioned and automatically accommodate 45 species

### hi/fmbrkt.f
Added six new Hawaiian species to fire-caused mortality bark thickness function:

- **Lines 58-63**: **B1** DATA array - Added 6 values of `0.044` for the new Hawaiian species (Koa, Ohia, Forest sandalwood, Mountain sandalwood, Haleakala sandalwood, Kauai sandalwood), using the same bark thickness coefficient as OT
- B1 array is MAXSP-dimensioned and automatically accommodates 45 species

### hi/fmcba.f
Added six new Hawaiian species to fire fuel loading function:

- **FULIVE** DATA array (lines 149-158): Added 6 species with values `0.25, 0.25` (live fuel loading for established stands, using QA values)
- **FULIVI** DATA array (lines 192-201): Added 6 species with values `0.18, 1.32` (live fuel loading for initializing stands, using QA values)
- **FUINIE** DATA array (lines 237-246): Added 6 species with 11 fuel size class values `0.2, 0.6, 2.4, 3.6, 5.6, 0.0, 0.0, 0.0, 0.0, 1.4, 16.8` (initial fuel loading for established stands, using AS values)
- **FUINII** DATA array (lines 282-291): Added 6 species with 11 fuel size class values `0.1, 0.4, 5.0, 2.2, 2.3, 0.0, 0.0, 0.0, 0.0, 0.8, 5.6` (initial fuel loading for initializing stands, using AS values)
- All arrays are MAXSP-dimensioned and automatically accommodate 45 species

### hi/fmcblk.f
Added six new Hawaiian species to fire model biomass grouping (BLOCK DATA file):

- **Lines 27-36**: **BIOGRP** DATA array - Extended from 39 to 45 values
  - Added 6 values of `6` for new Hawaiian species (positions 38-42), mapping to Jenkins biomass equation group 6 (Aspen/Alder/Cottonwood/Willow hardwoods)
  - Position 44 (blank) assigned group 2, position 45 (OT) assigned group 6
- BIOGRP array is MAXSP-dimensioned and automatically accommodates 45 species

### hi/formcl.f
Added six new Hawaiian species to form class calculations for volume estimation:

- **Lines 31-36**: Updated species order comments to include the 6 new species (AK, LE, IF, IM, IH, IK)
- **Lines 40-64**: **OLYMFC** DATA array (5 dimensions) - Extended each dimension from 39 to 45 values:
  - Dimensions 1-2: Added `6*84., 84., 84.` (form class values for new species, blank, and OT)
  - Dimension 3: Added `6*80., 84., 80.`
  - Dimension 4: Added `6*79., 84., 79.`
  - Dimension 5: Added `6*78., 84., 78.`
- **Lines 68-92**: **SIUSFC** DATA array (5 dimensions) - Extended each dimension from 39 to 45 values:
  - Dimensions 1-2: Added `6*84., 84., 84.`
  - Dimension 3: Added `6*80., 80., 80.`
  - Dimension 4: Added `6*79., 79., 79.`
  - Dimension 5: Added `6*78., 78., 78.`
- **Line 98**: **BLM708** DATA array - Added `6*74., 74., 74.`
- **Line 104**: **BLM709** DATA array - Added `6*78., 78., 78.`
- **Line 110**: **BLM712** DATA array - Added `6*74., 74., 74.`
- All arrays are MAXSP-dimensioned and automatically accommodate 45 species

### hi/fmcrow.f
Added six new Hawaiian species to crown fuel weight calculations:

- **Lines 98-105**: Updated species mapping comment table to include the 6 new species (KOA, OHIA, FOREST SANDALWOOD, MOUNTAIN SANDALWOOD, HALEAKALA SANDALWOOD, KAUAI SANDALWOOD)
  - All new species map to quaking aspen equation 41 (eastern crown equation)
- **Line 111**: **ISPMAP** DATA array - Extended from 39 to 45 values, added `6*41, 0, 41`
  - Maps new species (positions 38-43) to equation 41 (quaking aspen, eastern)
  - Position 44 (blank) maps to 0, position 45 (OT) maps to 41
- **Line 166**: Updated CASE statement to include new species positions 38-43 and 45
  - These species use eastern crown equations (FMCROWE) rather than western equations (FMCROWW)
- ISPMAP array is MAXSP-dimensioned and automatically accommodates 45 species

### hi/fmvinit.f
Added six new Hawaiian species to fire model initialization parameters:

- **Line 430**: Updated CASE statement from `(16,38)` to `(16,44)` - blank species (position 44) now uses Douglas-fir parameters
- **Line 558**: Updated CASE statement from `(24,39)` to `(24,38,39,40,41,42,43,45)` - all Hawaiian species (38-43) and OT (45) use paper birch parameters
  - Wood density: 29.9 lb/ft³
  - Leaf lifetime: 1 year (deciduous)
  - Time to fall for dead crown components: 1-15 years by size class
  - All down after 50 years
  - Hardwood species (LSW = .FALSE.)
- **Line 820**: Updated decay rate class CASE from `(21:24,26,27,34:39)` to `(21:24,26,27,34:43,45)` - extends hardwood decay rate class 4 (fast) to include new species
- All parameter arrays are MAXSP-dimensioned and automatically accommodate 45 species

### hi/htcalc.f
Added six new Hawaiian species to potential height calculations:

- **Lines 86-87**: Updated comment to include Hawaiian species (AK, LE, IF, IM, IH, IK) in miscellaneous species list
- **Line 89**: Updated CASE statement from `(8,17,21,23:27,29,31:37,39)` to `(8,17,21,23:27,29,31:43,45)` - extends range to include new species
  - All Hawaiian species and OT use Curtis curves (FOR. SCI. 20:307-316) for height-age-site relationships
- **Line 189**: Updated blank species comment from ISPC = 38 to ISPC = 44

### hi/htdbh.f
Added six new Hawaiian species to height-diameter relationship coefficients:

- **Lines 28-29**: Updated array dimensions from 39 to 45 for OLYMPC, SIUSLW, MTHOOD, and WILLAM arrays
- **Lines 71-78**: Updated species list comments to include Hawaiian species with scientific names (ACKO, MELE2, SAFR4, SAPA7, SAHA2, SAELC)
- **Lines 83-111**: Extended OLYMPC DATA arrays (3 parameter arrays) to 45 species
  - All new Hawaiian species (38-43) use OT coefficient values: 1709.7229, 5.8887, -0.2286
  - Blank (44) and OT (45) also use these values
- **Lines 115-143**: Extended SIUSLW DATA arrays (3 parameter arrays) to 45 species
- **Lines 147-175**: Extended MTHOOD DATA arrays (3 parameter arrays) to 45 species
- **Lines 179-207**: Extended WILLAM DATA arrays (3 parameter arrays) to 45 species
- All forests use the same height-diameter coefficients for Hawaiian species and OT
- **Build fix**: The 3rd-parameter arrays (coefficient c) in all four forests used `6*(-0.2286)` repeat syntax which is invalid in FORTRAN 77 — parentheses are not allowed in DATA repeat constants. Expanded to explicit values: `-0.2286, -0.2286, -0.2286, -0.2286, -0.2286, -0.2286, -0.2286, -0.2286`

### hi/sichg.f
Added six new Hawaiian species to site index adjustment arrays:

- **Line 29**: **A** DATA array - Extended from `9*11.56252/` to `15*11.56252/` (age to breast height coefficient)
- **Line 35**: **B** DATA array - Extended from `9*-0.05586/` to `15*-0.05586/` (age to breast height coefficient)
- **Line 37**: **REFLOC** DATA array - Extended from `17*'B'/` to `23*'B'/` (reference age location = breast height)
- **Line 40**: **REFAGE** DATA array - Extended from `9*100/` to `15*100/` (reference age = 100 years)
- All arrays are MAXSP-dimensioned and automatically accommodate 45 species
- All new Hawaiian species use OT values for site index adjustment parameters

### hi/sitset.f
No changes needed - all arrays and loops already use MAXSP, which automatically accommodates 45 species.

### hi/htgf.f
Added six new Hawaiian species to height growth shade tolerance arrays:

- **Lines 103-110**: Updated species shade tolerance comment table to include Hawaiian species (AK, LE, IF, IM, IH, IK) - all assigned INTM (intermediate) tolerance
- **Line 114**: **RHR** DATA array - Extended from `15.0, 15.0/` to `6*15.0, 15.0, 15.0/` (shade tolerance coefficient)
- **Line 122**: **RHYXS** DATA array - Extended from `0.10, 0.10/` to `6*0.10, 0.10, 0.10/` (shade tolerance coefficient)
- **Line 123**: **RHM** DATA array - Uses MAXSP*1.10, automatically accommodates 45 species
- **Line 131**: **RHB** DATA array - Extended from `-1.45, -1.45/` to `6*-1.45, -1.45, -1.45/` (shade tolerance coefficient)
- All new Hawaiian species use OT shade tolerance values (INTM - intermediate tolerance)

### hi/regent.f
Added six new Hawaiian species to small tree regeneration arrays:

- **Line 108**: Updated comment to include Hawaiian species abbreviations (AK, LE, IF, IM, IH, IK)
- **Line 109**: **IRDMAP** DATA array - Extended from `12, 12, 12  /` to `12, 6*12, 12, 12  /` (diameter equation coefficient pointer - all new species use group 12)
- **Line 112**: **DGMAX** DATA array - Extended from `39*5.0` to `45*5.0` (maximum diameter growth = 5.0 inches)
- **Line 113**: **XMAX** DATA array - Extended from `22*4.0` to `28*4.0` (upper end of averaging range = 4.0 inches DBH)
- **Line 114**: **XMIN** DATA array - Extended from `28*2.0` to `34*2.0` (lower end of averaging range = 2.0 inches DBH)
- **Line 117**: **DIAM** DATA array - Extended from `7*0.2` to `13*0.2` (bud width for seedlings = 0.2 inches)
- **Line 118**: **DGMIN** DATA array - Extended from `22*3.0` to `28*3.0` (minimum DBH for diameter model = 3.0 inches)
- All new Hawaiian species use OT parameter values for small tree regeneration

### hi/spctrn.f
Added six new Hawaiian species to species translation table:

- **Line 30**: **MAXASPT** PARAMETER - Updated from 442 to 448 to accommodate 6 new species entries
- **Lines 1192-1199**: Added DATA array for entries 443-448 (first 10 columns) - FVS alpha codes, FIA codes, and PLANTS symbols
  - AK (Koa): ALFA='AK', FIA='301', PLNT='ACKO' (Acacia koa)
  - LE (Ohia): ALFA='LE', FIA='671', PLNT='MELE2' (Metrosideros polymorpha)
  - IF (Forest sandalwood): ALFA='IF', FIA='515', PLNT='SAFR4' (Santalum freycinetianum)
  - IM (Mountain sandalwood): ALFA='IM', FIA='516', PLNT='SAPA7' (Santalum paniculatum)
  - IH (Haleakala sandalwood): ALFA='IH', FIA='517', PLNT='SAHA2' (Santalum haleakalae)
  - IK (Kauaʻi sandalwood): ALFA='IK', FIA='518', PLNT='SAELC' (Santalum ellipticum)
- **Lines 1201-1208**: Added DATA array for entries 443-448 (remaining 11 columns) - Variant mappings
  - For PN variant (column 14, used by HI): Maps to AK, LE, IF, IM, IH, IK respectively
  - For all other variants: Maps to OT (other species)
- This enables species code translation from FIA codes, PLANTS symbols, or FVS alpha codes to variant-specific codes

### hi/morts.f
Added six new Hawaiian species to mortality model arrays:

- **Line 80**: **MORTMAP** array dimension - Updated from 39 to 45
- **Line 97**: **MCLASS** DATA array - Extended from `5, 1, 5/` to `5, 6*5, 1, 5/` (mortality class = 5 for all new species)
- **Line 107**: **BETA** DATA array - Extended from `0.216823, 0.216823/` to `6*0.216823, 0.216823, 0.216823/` (mortality coefficient = 0.216823)
- **Line 110**: **PSP** DATA array - Extended from `7*0.0` to `13*0.0` (species parameter = 0.0)
- **Line 111**: **PMSC** DATA array - Extended from `39*.317888` to `45*.317888` (mortality constant = 0.317888)
- **Line 117**: **MORTMAP** DATA array - Extended from `4, 1,1/` to `4, 6*1, 1,1/` (mortality equation pointer = 1 for all new species)
- **BM0-BM5 DATA arrays**: Each extended with 6 values using OT parameter values for the new Hawaiian species (positions 38-43), plus blank (44) and OT (45). New Hawaiian species values: BM0=-4.13412, BM1=-1.13736, BM2=0.0, BM3=-0.823305, BM4=0.0307749, BM5=0.00991005
- **Build fix (BM0-BM5)**: Initial edit incorrectly replaced the closing two lines of each array with a single line, dropping species-specific values at positions 33-37. Restored from source: BM0 (-4.072781265, -3.020345211 ×3, -2.0), BM1 (-0.176433475, 0.0 ×3, -0.5), BM2 (0.0 ×4, 0.015), BM3 (-1.729453975, -8.467882343 ×3, -3.0), BM4 (0.0, 0.013966388 ×3, 0.015), BM5 (0.012525642, 0.009461545 ×3, 0.01). All arrays verified at 45 values.
- All new Hawaiian species use OT parameter values for mortality prediction

### hi/smhgdg.f
Added six new Hawaiian species to seedling height and diameter growth arrays:

- **Line 58**: **DMAX** DATA array - Extended from `0.000, 5.373/` to `6*5.373, 0.000, 5.373/` (maximum diameter = 5.373 inches)
- **Line 68**: **BETA** DATA array - Extended from `0.000000, 0.163500/` to `6*0.163500, 0.000000, 0.163500/` (growth coefficient = 0.163500)
- **Lines 181-204**: **ALPHA** 2D array - Added DATA statements for positions 38-45
  - J=38-43: Six new Hawaiian species use OT coefficients (same as J=45)
  - J=44: Blank position with all zeros
  - J=45: OT coefficients (2.44730, 0.00000, 0.00000, 0.00980, 0.00000, -0.35750, -0.17100, 0.00000, -0.18790, -0.01100)
- All new Hawaiian species use OT parameter values for small tree height and diameter growth prediction

### hi/r6crwd.f
Added six new Hawaiian species to Region 6 crown width mapping arrays:

- **Lines 90-92**: Updated **MAPWC** and **MAPOP** array dimensions from 39 to 45
- **Lines 174-175**: Updated WC/PN variant species comment to include Hawaiian species (AK, LE, IF, IM, IH, IK)
- **Lines 178-179**: Updated surrogate comment to indicate DF equation used for all new Hawaiian species
- **Line 185**: **MAPWC** DATA array - Extended from `16, 16, 16, 16,  1/` to `16, 16, 16,  6*1, 16,  1/`
  - All new Hawaiian species (positions 38-43) map to crown width equation 1 (Douglas-fir)
- **Lines 230-231**: Updated OP variant species comment to include Hawaiian species
- **Lines 234-235**: Updated OP surrogate comment to include new Hawaiian species
- **Line 241**: **MAPOP** DATA array - Extended from `16, 16, 16, 16,  1/` to `16, 16, 16,  6*1, 16,  1/`
- All new Hawaiian species use Douglas-fir crown width equation

### hi/rdblk1pn.f
Created from rd/rdblk1pn.f (BLOCK DATA for root disease extension defaults). IRTSPC array maps variant species to root disease model species indices. Source list updated from `../rd/rdblk1pn.f` to `../hi/rdblk1pn.f`.

- **IRTSPC**: Extended from 39 to 45 values. All six new Hawaiian species (positions 38-43) map to index 40 (NH = other hardwoods), same as OT. Blank (44) and OT (45) also map to 40.
- Updated variant header comment from PN/39 species to HI/45 species
- Updated species comment block for positions 38-45

### hi/common/ESPARM.F77
No changes needed - NSPSPE parameter (number of sprouting species) remains at 14 since new Hawaiian species are not sprouting species

### hi/misintpn.f
Added six new Hawaiian species to mistletoe model arrays:

- **Lines 64-69**: **ACSP** DATA array - Updated species codes to include 'AK','LE','IF','IM','IH','IK','**','OT'
- **Line 77**: **AFIT** DATA array - Extended from `0, 0, 0/` to `6*0, 0, 0/` (none of new species affected by mistletoe)
- **Lines 114-126**: **ADGP** DATA array - Added 6 rows of diameter growth rates (all 1.0, no mistletoe impact)
- **Lines 181-191**: **AHGP** DATA array - Added 6 rows of height growth rates (all 1.0, no mistletoe impact)
- **Line 195**: **APMC** DATA array - Updated range from `I=1,39` to `I=1,45`
- **Lines 231-239**: **APMC** DATA array - Added 6 rows of mortality coefficients (all 0.0, no mistletoe impact)
- All new Hawaiian species use OT parameter values indicating no mistletoe susceptibility

### hi/voleqdef.f
Modified SUBROUTINE R6_EQN to support Hawaiian species volume equations:

**Volume Equation Assignments:**
- **Koa (FIA 301)**: H00SN2W301
- **Ohia (FIA 671)**: H00SN2W671
- **Forest sandalwood (FIA 515)**: 616BEHW999 (follows OT logic)
- **Mountain sandalwood (FIA 516)**: 616BEHW999 (follows OT logic)
- **Haleakala sandalwood (FIA 517)**: 616BEHW999 (follows OT logic)
- **Kauaʻi sandalwood (FIA 518)**: 616BEHW999 (follows OT logic)

**Changes Made:**

1. **Lines 936-945**: Added validation for Hawaiian equation format
   - Added check for VOLEQ prefix 'H00SN2W' in user-supplied equation validation (SPEC=9999)
   - Allows H00SN2W### format equations to be validated

2. **Lines 826**: FIA array dimension remains at 53 elements
   - Array dimension: `INTEGER FIA(53)` (unchanged)
   - Sandalwood species not added to FIA array since they are handled explicitly

3. **Lines 1123-1137**: Added explicit handling for all six Hawaiian species in westside variants
   - Added `ELSE IF(SPEC.EQ.301)` block to assign 'H00SN2W301' for Koa
   - Added `ELSE IF(SPEC.EQ.671)` block to assign 'H00SN2W671' for Ohia
   - Added `ELSE IF(SPEC.EQ.515 .OR. SPEC.EQ.516 .OR. SPEC.EQ.517 .OR. SPEC.EQ.518)` block to assign '616BEHW999' for all four sandalwood species
   - LAST remains at 53 for binary search of FIA array

**How R6_EQN Works:**

The subroutine takes variant (VAR), forest (FORST), district (DIST), and species (SPEC) as inputs and returns the appropriate volume equation (VOLEQ).

**Data Objects:**
- **VAR**: FVS variant code ('PN' for Hawaii variant)
- **FORST**: 2-character forest code
- **DIST**: 2-character district code
- **SPEC**: FIA species code (integer)
- **VOLEQ**: 10-character volume equation string (OUTPUT)
- **ERRFLAG**: Error flag (OUTPUT, 1=species not found)
- **FIA(53)**: Array of FIA codes in sorted order for binary search (Hawaiian species not included)
- **EQNUMI(87)**: INGY equation strings for specific forest/species combinations
- **EQNUMF(41)**: Flewelling taper equations for Douglas-fir and Western Hemlock
- **EQNUM(44)**: BLM/BIA/Industry equation strings (validation only)
- **EQNUMC(39)**: Canadian INGY equations (not used in westside path)
- **EQNUMD(15)**: Direct volume estimator equations (not used in westside path)

**Logic Flow for Westside Variants (VAR='PN'):**

1. **Forest/species-specific INGY equations** (lines 1005-1113): Check for specialized equations by forest and species
   - If found: Set DONEI index and assign VOLEQ = EQNUMI(DONEI)

2. **Forest/species-specific Flewelling equations** (implied in forest checks): For Douglas-fir (202) and Western Hemlock (263)
   - If found: Set DONEF index and assign VOLEQ = EQNUMF(DONEF)

3. **Hawaiian species special handling** (lines 1127-1137):
   - If SPEC=301 (Koa): VOLEQ = 'H00SN2W301'
   - If SPEC=671 (Ohia): VOLEQ = 'H00SN2W671'
   - If SPEC=515, 516, 517, or 518 (Sandalwood species): VOLEQ = '616BEHW999' (same as OT)

4. **Default Behre's hyperbola equations** (lines 1139-1170): Binary search FIA(53) array
   - For all other species, searches FIA array and constructs equation: '616BEHW' + FIA code
   - If species not found: ERRFLAG=1, VOLEQ='616BEHW000'

**Result:**
- Koa and Ohia use custom Hawaiian volume equations (H00SN2W format)
- Four sandalwood species use the same equation as OT (616BEHW999)
- All six Hawaiian species handled explicitly before the binary search, ensuring correct volume equation assignment

### bin/FVShi_sourceList.txt
Created from bin/FVSpn_sourceList.txt with file paths updated to point to hi/ directory where HI-specific source files exist. Placed in bin/ because the build is invoked from bin/ and all variant source lists reside there.

- **39 paths updated to `../hi/`**: All source files with HI-specific versions
  - 18 from `../pn/` (variant-specific files: blkdat.f, bratio.f, ccfcal.f, crown.f, dgf.f, ecocls.f, forkod.f, formcl.f, grinit.f, grohed.f, habtyp.f, htcalc.f, htdbh.f, pvref6.f, sichg.f, sitset.f, common/ESPARM.F77, common/PRGPRM.F77)
  - 21 from other variant directories (../wc/, ../vie/, ../vwc/, ../vso/, ../vstrp/, ../volume/NVEL/, ../fire/pn/, ../mistoe/)
- **1 retained `../fire/pn/` path**: fmsfall.f (no hi/ equivalent exists)
- **All shared directories unchanged**: ../common/, ../base/, ../vbase/, ../dbsqlite/, ../pg/, ../strp/, ../volume/ (except voleqdef.f), ../clim/, ../covr/, ../econ/, ../rd/, ../fire/base/, ../fire/vbase/, ../fire/fofem/, ../mistoe/ (except misintpn.f), and others
- Relative paths (../hi/, ../common/, etc.) resolve identically from bin/ as from hi/ since both are siblings under the repo root.

### bin/makefile
Added FVShi to the standard build in bin/makefile. Two modifications made:

- **USprgs list (line 76)**: Added `FVShi` in alphabetical order between `FVSem` and `FVSie`
- **FVShi build rule (lines 134-135)**: Added target rule modeled on the FVSpn rule:
  ```makefile
  FVShi$(SLIBSUFX) FVShi$(PRGSUFX)  : $(addsuffix _sourceList.txt,FVShi) $(shell cat $(addsuffix _sourceList.txt,FVShi))
  	$(MAKE) --file=makefile FVShi.setup
  ```
- All other rules and logic unchanged
