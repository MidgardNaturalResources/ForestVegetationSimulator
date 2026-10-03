# NC Variant: sitset.f Technical Reference

## 1. Overview

The `SITSET` subroutine performs one-time initialization of site productivity, stand density limits, and volume configuration for all 12 species in the NC (North Coast / Klamath) variant of FVS. It runs during setup after keyword processing.

**Subroutine call chain:**

```
SITSET
  |-- ECOCLS     (Region 6 only: ecoclass-based defaults)
  |-- SICHG      (convert reference site index to adjusted ages per species)
  |-- HTCALC     (evaluate reference species' height-age curve at each adjusted age)
  |-- VOLEQDEF   (look up default volume equation IDs)
  |-- NVBEQDEF   (NVB volume equation lookup, method 10)
```

**Key branching:** Region 5 forests use hardcoded defaults. Region 6 forests (IFOR=4 Siskiyou, IFOR=7 BLM) use ecoclass-driven defaults via `ECOCLS`.

---

## 2. Inputs

### COMMON Block Variables

| Variable | Source | Type | Description |
|----------|--------|------|-------------|
| `MAXSP` | PRGPRM.F77 | INTEGER | 12 -- number of species in the NC variant |
| `SITEAR(MAXSP)` | PLOT.F77 | REAL | Site index array per species; may be pre-set by SITECODE keyword |
| `SDIDEF(MAXSP)` | PLOT.F77 | REAL | Max SDI per species; may be pre-set by SDIMAX keyword |
| `ISISP` | PLOT.F77 | INTEGER | Site species index (species of reference for site index) |
| `IFOR` | PLOT.F77 | INTEGER | Forest code (4=Siskiyou, 7=BLM are Region 6; others are Region 5) |
| `KODFOR` | PLOT.F77 | INTEGER | Full forest code (region*100 + forest number) |
| `BAMAX` | CONTRL.F77 | REAL | Maximum basal area set by user |
| `PMSDIU` | PLOT.F77 | REAL | Percent of max SDI at which stand reaches upper management zone |
| `PCOM` | VARCOM.F77 | CHARACTER*8 | Plant community / ecoclass code |
| `CALCSDI` | CONTRL.F77 | CHARACTER*7 | SDI calculation method ("ZEIDE", "REINEKE", or blank) |
| `METHB(MAXSP)` | CONTRL.F77 | INTEGER | Board-foot volume method per species (999 = not yet set) |
| `METHC(MAXSP)` | CONTRL.F77 | INTEGER | Cubic-foot volume method per species (999 = not yet set) |

### Local DATA Arrays

| Array | Size | Description |
|-------|------|-------------|
| `C5(12)` | MAXSP | Default SDI max values for Region 5 forests: 365, 561, 570, 800, 515, 576, 406, 785, 1000, 365, 785, 1052 |
| `C6(12)` | MAXSP | Default SDI max values for Region 6 forests: 624, 647, 547, 759, 588, 706, 382, 759, 800, 571, 759, 1052 |
| `FORMAX` | scalar | Hard ceiling on SDI: 850. No species can exceed this default maximum |

### NC Species List

| Index | Code | Common Name |
|-------|------|-------------|
| 1 | OS | Other Softwoods |
| 2 | SP | Sugar Pine |
| 3 | DF | Douglas-fir |
| 4 | WF | White Fir |
| 5 | MA | Pacific Madrone |
| 6 | IC | Incense Cedar |
| 7 | BO | Black Oak |
| 8 | TO | Tanoak |
| 9 | RF | Red Fir |
| 10 | PP | Ponderosa Pine |
| 11 | OH | Other Hardwoods |
| 12 | RW | Redwood |

---

## 3. sitset.f steps

### Block 1: Count Keyword-Set Values (lines 59-67)

Loops through all species and counts how many already have `SITEAR` or `SDIDEF` set by user keywords. Stores counts in `NSISET` and `NSDSET`. These counts determine whether the subroutine needs to compute defaults.

### Block 2: Site Species and Site Index Defaults (lines 72-122)

Two branches based on Forest Service region:

**Region 6 forests (IFOR=4 or IFOR=7), lines 72-117:**
- If `CALCSDI` is blank, disables Zeide SDI method (`LZEIDE = .FALSE.`)
- Calls `ECOCLS` in a loop to look up the plant community code (`PCOM`) and retrieve default site species, site index values, and SDI maximums for each species in that ecoclass
- For each species returned: sets `SITEAR` if not user-set and no keywords were provided (`NSISET=0`); sets `SDIDEF` if not already set; caps SDI at `FORMAX` (850)

**Region 6 fallback (lines 127-130):** If `ECOCLS` never identified a site species, defaults to species 3 (DF), SI = 90.

**Region 5 forests (all others), lines 118-122:**
- Defaults site species to species 3 (DF)
- Defaults site index to 90


sitset.f` currently derives a default site index for every species that
wasn't set via the `SITECODE` keyword by always evaluating the *reference*
species' own height-age curve (`HTCALC` is always called with `ISISP`, never
the target species `ISPC` — confirmed identical in PN and SO). The only
differentiation between species comes from `SICHG`'s breast-height-age
adjustment, not from any real biological relationship between species. 


### Block 3: Site Index Translation Pipeline (lines 134-153)

This is the core site index computation. Three steps:

1. `SICHG(ISISP, SITEAR(ISISP), SIAGE)` -- converts the reference species' site index into adjusted ages for all 12 species
2. Loop calling `HTCALC(SITEAR(ISISP), ISISP, SIAGE(ISPC), SI(ISPC))` for each species -- evaluates the reference species' height-age curve at each adjusted age
3. Any species still without a `SITEAR` value gets the computed `SI` value


**File:** `nc/sichg.f`

**Purpose:** Given a reference species and its site index, compute the equivalent age at which to evaluate the height curve for every species. This handles the fact that different species measure site index using different age bases (breast-height age vs. total tree age).

### Inputs and Output

| Parameter | Direction | Description |
|-----------|-----------|-------------|
| `ISISP` | IN | Reference site species (1-12) |
| `SSITE` | IN | Site index of the reference species |
| `SIAGE(12)` | OUT | Adjusted age for each species to use in height calculation |

### Data Arrays

| Array | Values | Description |
|-------|--------|-------------|
| `REFLOC(12)` | B, T, B, B, B, B, B, B, B, T, B, B | Age type per species: Breast-height or Total |
| `IREFAG(12)` | all 50 | Base reference age for all species |
| `A(12)` | 10, 12, 10, 10, 3, 10, 6, 4, 10, 12, 4, 10 | Intercept for years-to-BH calculation |
| `B(12)` | -0.08, -0.05, -0.08, -0.07, -0.02, -0.05, -0.05, -0.03, -0.06, -0.05, -0.03, -0.08 | Slope for years-to-BH calculation |
| `SIMIN(12)` | 50, 40, 50, 30, 50, 30, 30, 50, 30, 40, 50, 50 | Lower bound for site index clamping |
| `SIMAX(12)` | 150, 120, 150, 130, 100, 130, 70, 90, 130, 120, 90, 150 | Upper bound for site index clamping |

### Age Type Summary

| Species | Code | REFLOC | Age Type |
|---------|------|--------|----------|
| 1 | OS | B | Breast-height |
| 2 | SP | **T** | **Total** |
| 3 | DF | B | Breast-height |
| 4 | WF | B | Breast-height |
| 5 | MA | B | Breast-height |
| 6 | IC | B | Breast-height |
| 7 | BO | B | Breast-height |
| 8 | TO | B | Breast-height |
| 9 | RF | B | Breast-height |
| 10 | PP | **T** | **Total** |
| 11 | OH | B | Breast-height |
| 12 | RW | B | Breast-height |

Only species 2 (SP) and 10 (PP) use total tree age. All others use breast-height age.

### Algorithm

For each of the 12 species:

**Step 1 -- Determine direction (IDIFF):**
- Reference is BH, target is BH: `IDIFF = 0` (no adjustment)
- Reference is BH, target is Total: `IDIFF = +1` (add years-to-BH)
- Reference is Total, target is BH: `IDIFF = -1` (subtract years-to-BH)

**Step 2 -- Compute years-to-breast-height (only when IDIFF != 0):**
```
TEMSI clamped to [SIMIN(ISISP), SIMAX(ISISP)]
SPREAD = SIMAX(ISISP) - SIMIN(ISISP)
RELSI  = 100.0 * (TEMSI - SIMIN(ISISP)) / SPREAD     (normalized 0-100)
AGE2BH = A(I) + B(I) * RELSI
```

Higher site index produces lower AGE2BH (trees on better sites reach breast height faster).

**Step 3 -- Final age:**
```
SIAGE(I) = IREFAG(I) + AGE2BH * IDIFF
         = 50 + AGE2BH * IDIFF
```

**Note:** NC normalizes site index to a relative 0-100 scale (`RELSI`) before computing AGE2BH. This differs from the PN variant, which uses the raw site index value directly.

---

## 5. Deep Dive: HTCALC (Height Calculation)

**File:** `nc/htcalc.f`

**Purpose:** Calculate the expected height given a site index, species, and age. Used by `sitset.f` to compute equivalent site indices, and elsewhere in FVS for potential height growth.

### Inputs and Output

| Parameter | Direction | Description |
|-----------|-----------|-------------|
| `SINDX` | IN | Site index value |
| `ISPC` | IN | Species number (determines which curve to use) |
| `AG` | IN | Age to evaluate |
| `HGUESS` | OUT | Computed height |

### Species-Curve Groupings

| CASE | Species | Curve Source | Equation Form |
|------|---------|-------------|--------------|
| 1, 3, 12 | OS, DF, RW | King (1966) | Polynomial ratio: `(AG^2)/(a + b*AG + c*AG^2) + 4.5` where a, b, c depend on `Z = 2500/(SI-4.5)` |
| 4, 6, 9 | WF, IC, RF | Dolph (1987) | Two-component: `X1 = 38.0202*AG^(-1.05213)*exp(0.009557*AG)`, `X2 = 101.843*(1-exp(-0.001442*AG^1.679))`, `H = (SI-69.91+X1*X2)/X1 + 4.5` |
| 5 | MA | Porter & Wiant (1965) | Reciprocal: `SI / (0.375 + 31.233/AG)` |
| 7 | BO | Powers (1972) | Sqrt-age: `SI*(1+0.322*(sqrt(AG)-sqrt(50))) - 6.413*(sqrt(AG)-sqrt(50))`, scaled by **0.80** |
| 8, 11 | TO, OH | Wiant | Reciprocal: `SI / (0.204 + 39.787/AG)`, scaled by **0.85** |
| 2, 10 | SP, PP | Powers & Oliver (1978) | Chapman-Richards: `(1.88*SI-7.178) * (1-exp(-0.025*AG))^(0.001*SI+1.64)` |

### Critical Behavior in sitset.f Context

In `sitset.f` (line 145), HTCALC is called as:

```fortran
CALL HTCALC(SINDX, ISISP, AG, SI(ISPC), JOSTND, DEBUG)
```

The second argument is `ISISP` (the reference species), **not** `ISPC` (the loop variable). This means HTCALC always enters the reference species' CASE branch. The species-specific curves (and their built-in scale factors like the 0.85 for TO/OH) are only used when that species is the reference, not when it is the target of translation.

---

### How SICHG and HTCALC Work Together

The site index translation pipeline in `sitset.f` (lines 134-153) works as follows:

```
Reference species (ISISP) with site index (SITEAR(ISISP))
         |
         v
    SICHG(ISISP, SITEAR(ISISP), SIAGE)
         |  Computes SIAGE(1..12): the age at which each species'
         |  height should be evaluated, adjusted for BH vs Total age.
         |  For same-type species: SIAGE = 50 (no adjustment).
         |  For different-type species: SIAGE = 50 +/- AGE2BH.
         v
    For each species I = 1..12:
        HTCALC(SITEAR(ISISP), ISISP, SIAGE(I), SI(I))
         |  Evaluates the REFERENCE SPECIES' height curve at the
         |  adjusted age. The result IS the equivalent site index
         |  for species I.
         v
    If SITEAR(I) == 0: SITEAR(I) = SI(I)
```

**Key insight:** The height at a given age on the reference species' curve becomes the site index for the target species. The only differentiation between target species comes from the age adjustment in SICHG, which only produces different ages when species have different age base types (breast-height vs. total). All breast-height species receive the same equivalent site index. Only total-age species (SP, PP) receive a different value.

---

### Block 4: SDI Max Defaults (lines 157-172)

For each species still missing an `SDIDEF`, three paths:

1. **If user set `BAMAX`:** Derives SDI using `SDIDEF = BAMAX / (0.5454154 * (PMSDIU/100))` (Reineke relationship between basal area and SDI)
2. **If Region 6 (IFOR=4 or 7):** Scales proportionally from the site species' SDI using C6 ratios: `SDIDEF(I) = SDIDEF(K) * (C6(I)/C6(K))`. Caps at `FORMAX`.
3. **Otherwise (Region 5):** Uses the hardcoded `C5` array values directly.

### Block 5: Print SDI Table (lines 174-189)

Writes a formatted table of species codes and their SDI max values to the output file, 10 species per row. If any SDI values were capped at `FORMAX`, prints a warning note.

### Block 6: Merchantability Specs (lines 193-221)

Sets default minimum merchantable DBH and top diameter for volume calculations using `SELECT CASE` on Forest Service region:

| Forest | Min DBH | Top Diameter |
|--------|---------|-------------|
| IFOR=4 (Siskiyou) | 9.0 | 4.5 |
| IFOR=5,7 (Simpson, BLM) | 9.0 | 5.0 |
| All others | 9.0 | 6.0 |

Only fills values not already set by keyword (the `LE. 0` guards).

### Block 7: Volume Method Defaults (lines 231-239)

Sets `METHB` and `METHC` to 6 for all species where they haven't been set by keyword (still at the 999 initialization value). Both R5 and R6 forests get the same default.

### Block 8: Volume Equation Lookup (lines 243-281)

- Extracts internal forest number and region from `KODFOR`
- For private land (region 8), remaps to region 5, forest 10
- Loops through all species, calling `VOLEQDEF` to get default volume equation IDs for methods 6 or 9
- For method 10 (NVB), calls `NVBEQDEF` instead
- Stores results in `VEQNNC` (cubic) and `VEQNNB` (board-foot) arrays

### Block 9: Output Tables (lines 285-296)

- If input data used FIA species codes, writes a translation table
- Writes the volume equation table showing cubic-foot and board-foot equation IDs for all species

---





## Worked Examples

### Example 1: WF (species 4) Reference, SI = 80

**Step 1: SICHG(4, 80, SIAGE)**

Reference age type: `REFLOC(4) = 'B'` (breast-height)

For all breast-height species (1, 3-9, 11-12): `IDIFF = 0`, `SIAGE = 50`

For total-age species 2 (SP) and 10 (PP): `IDIFF = +1`
```
SIMIN(4) = 30, SIMAX(4) = 130, TEMSI = 80 (within bounds)
SPREAD = 130 - 30 = 100
RELSI  = 100 * (80 - 30) / 100 = 50.0

Species 2: AGE2BH = A(2) + B(2)*50.0 = 12.0 + (-0.05)*50.0 = 9.5
           SIAGE(2) = 50 + 9.5 * (+1) = 59.5

Species 10: AGE2BH = A(10) + B(10)*50.0 = 12.0 + (-0.05)*50.0 = 9.5
            SIAGE(10) = 50 + 9.5 * (+1) = 59.5
```

Result: `SIAGE = [50, 59.5, 50, 50, 50, 50, 50, 50, 50, 59.5, 50, 50]`

The 9.5-year adjustment represents the estimated time for trees to grow from ground level to breast height (4.5 ft) on a site of this quality.

**Step 2: HTCALC(80, 4, AG, SI) for each species**

HTCALC always enters `CASE(4,6,9)` (the Dolph White Fir curve).

**For AG = 50** (species 1, 3, 4, 5, 6, 7, 8, 9, 11, 12):
```
X1 = 38.0202 * 50^(-1.05213) * exp(0.009557 * 50)
   = 38.0202 * 0.01633 * 1.6128 = 1.001

X2 = 101.843 * (1 - exp(-0.001442 * 50^1.679259))
   = 101.843 * (1 - 0.3574) = 65.45

HGUESS = (80 - 69.91 + 1.001 * 65.45) / 1.001 + 4.5
       = 75.60 / 1.001 + 4.5 = 80.0
```

**For AG = 59.5** (species 2 and 10):
```
X1 = 38.0202 * 59.5^(-1.05213) * exp(0.009557 * 59.5)
   = 38.0202 * 0.01358 * 1.7658 = 0.912

X2 = 101.843 * (1 - exp(-0.001442 * 59.5^1.679259))
   = 101.843 * (1 - 0.2536) = 76.01

HGUESS = (80 - 69.91 + 0.912 * 76.01) / 0.912 + 4.5
       = 79.37 / 0.912 + 4.5 = 91.6
```

**Final result:**

| Spc# | Code | SIAGE | Equivalent SI |
|------|------|-------|--------------|
| 1 | OS | 50.0 | 80.0 |
| 2 | SP | 59.5 | 91.6 |
| 3 | DF | 50.0 | 80.0 |
| 4 | WF | 50.0 | 80.0 |
| 5 | MA | 50.0 | 80.0 |
| 6 | IC | 50.0 | 80.0 |
| 7 | BO | 50.0 | 80.0 |
| 8 | TO | 50.0 | 80.0 |
| 9 | RF | 50.0 | 80.0 |
| 10 | PP | 59.5 | 91.6 |
| 11 | OH | 50.0 | 80.0 |
| 12 | RW | 50.0 | 80.0 |

All 10 breast-height species receive SI = 80 (identical to the reference). Only SP and PP receive a different value (91.6), reflecting the 9.5-year age adjustment from breast-height to total age basis.

### Example 2: MA (species 5) Reference, SI = 65

The same structural pattern holds. `REFLOC(5) = 'B'`, so only SP (2) and PP (10) get age adjustments. HTCALC always enters `CASE(5)` (Madrone / Porter & Wiant curve).

**SICHG:**
```
SIMIN(5) = 50, SIMAX(5) = 100, SPREAD = 50
RELSI = 100 * (65 - 50) / 50 = 30.0
AGE2BH = 12.0 + (-0.05) * 30.0 = 10.5
SIAGE(2) = SIAGE(10) = 50 + 10.5 = 60.5
```

**HTCALC:**
```
AG = 50:   HGUESS = 65 / (0.375 + 31.233/50)  = 65 / 1.000 = 65.0
AG = 60.5: HGUESS = 65 / (0.375 + 31.233/60.5) = 65 / 0.891 = 72.9
```

Result: 10 breast-height species get SI = 65.0; SP and PP get SI = 72.9.

---

## 8. Documentation vs Code Discrepancies

Cross-referencing the FVS-NC User Guide (Section 3.4) against the source code reveals several discrepancies.

### 8a. The 0.85 TO/OH Adjustment Factor

**User documentation states:** "For tanoak and other hardwood, the site index estimate is adjusted by multiplying the site index estimate by an adjustment factor of 0.85."

**Code reality:** The 0.85 factor exists inside `HTCALC` at `CASE(8,11)` (line 71), but `sitset.f` always passes `ISISP` (the reference species) to HTCALC, not the target species. The `SELECT CASE` therefore always enters the reference species' curve branch. The 0.85 factor is only applied when TO or OH IS the reference species -- not when they are the target of site index translation.

When DF or WF is the reference species, TO and OH receive the same site index as all other breast-height species, with no 0.85 reduction applied.

**Comparison with PN variant:** The PN variant handles this correctly by applying species-specific post-processing scale factors in `sitset.f` itself (lines 128-154), after HTCALC returns. For example:
```fortran
IF(ISPC.EQ.27 .AND. ISISP.NE.27) SI = SI * 0.85
```
The NC variant lacks this post-processing step.

### 8b. Age Type Classification

**User documentation (Table 3.4.1)** lists MA, TO, and OH as TTA (total tree age) curves in Region 6.

**Code (sichg.f REFLOC array)** marks these species as 'B' (breast-height age):
```
REFLOC = 'B','T','B','B','B','B','B','B','B','T','B','B'
```

Only SP (2) and PP (10) are marked as 'T' (total age).

The documentation footnote states: "Height at BHA 50 should be entered even though the original site curve was a TTA curve." This suggests the discrepancy is intentional -- the original published curves for MA, TO, OH use total tree age, but the FVS implementation has been calibrated to accept breast-height age input. The documentation table describes the original published curves, while the code reflects the FVS adaptation.

### 8c. R5 Site Class Species Adjustment Factors

The user documentation (Table 3.4.1.2) shows species-specific adjustment factors for Region 5 site class conversion (e.g., MA=0.57, BO=0.57, TO=0.57, OH=0.57, OS=0.90, SP=0.90). These factors are applied in a separate code path when converting R5 site class codes (0-7) to site index values. This conversion is not handled within `sitset.f` and is not detailed here.

---

## 9. Comparison with PN Variant

| Feature | NC Variant | PN Variant |
|---------|-----------|-----------|
| **Species count** | 12 (MAXSP=12) | 39 (MAXSP=39) |
| **SICHG reference age** | Uniform: all 50 | Species-specific: 20, 50, or 100 |
| **SICHG AGE2BH input** | Normalized RELSI (0-100 scale) | Raw site index value |
| **SICHG total-age species** | SP (2), PP (10) | LP (11), RA (22) |
| **HTCALC curve groups** | 6 cases | 14 cases |
| **HTCALC call in sitset** | Always passes ISISP (reference species) | Always passes ISISP (reference species) |
| **Post-processing in sitset** | None | Species-specific scale factors (0.23 to 1.50) for 15 species |
| **SDI defaults** | C5/C6 arrays with proportional scaling from reference species | Copies reference species' SDI to all unset species |
| **BAMAX relationship** | Derives SDI from BAMAX: `SDI = BAMAX/(0.5454*(PMSDIU/100))` | Derives BAMAX from SDI: `BAMAX = SDI*(PMSDIU/100)*0.54542` |
| **R5/R6 branching** | ECOCLS for R6 only; R5 uses hardcoded DF/SI=90 | All forests use ECOCLS (all PN forests are R6) |
| **Default site species** | Species 3 (DF), SI = 90 | Species 16 (DF), SI = 100 |
| **FORMAX (SDI ceiling)** | 850 | 950 |

The HTCALC call pattern (always using the reference species' curve) is consistent across both variants. The key architectural difference is that PN compensates for this by applying post-processing scale factors in `sitset.f`, while NC does not.

---

## 10. Reference

### Source Files
- `nc/sitset.f` -- main subroutine
- `nc/sichg.f` -- site index age conversion
- `nc/htcalc.f` -- height-age curve evaluation

### Common Block Includes
- `PRGPRM.F77` -- program parameters (MAXSP, etc.)
- `CONTRL.F77` -- control variables (BAMAX, CALCSDI, METHB, METHC, etc.)
- `PLOT.F77` -- plot-level variables (SITEAR, SDIDEF, ISISP, IFOR, KODFOR, etc.)
- `VARCOM.F77` -- variant common (PCOM, etc.)
- `VOLSTD.F77` -- volume standards

### User Documentation
- FVS-NC User Guide, Section 3.4: Site Index
- FVS-NC User Guide, Section 3.4.1: Region 5 Site Class
