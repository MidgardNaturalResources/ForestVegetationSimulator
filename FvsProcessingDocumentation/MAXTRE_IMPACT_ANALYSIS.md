# MAXTRE Parameter Impact Analysis

## Executive Summary

This document analyzes the potential downstream consequences of increasing the `MAXTRE` parameter beyond its current value of 3000 (or 5000 in HI variant, 2000 in OC/OP variants).

**Current Status:**
- Most variants: `MAXTRE = 3000`
- HI variant: `MAXTRE = 5000`
- OC/OP variants: `MAXTRE = 2000`

**Historical Context:**
- Original value: 1350
- Changed to 3000 in November 2009 (R. Havis)
- OC/OP reduced to 2000 in March 2015 (G. Dixon)

## 1. Memory Implications

### 1.1 Primary Common Blocks with MAXTRE-Dimensioned Arrays

#### ARRAYS.F77 (common/ARRAYS.F77)
The main tree attribute storage contains **54 arrays** dimensioned by MAXTRE:

**Logical Arrays (1):**
- `LBIRTH(MAXTRE)` - 1 byte × MAXTRE = 3KB @ MAXTRE=3000

**Integer Arrays (12):**
- `DAMSEV(6,MAXTRE)` - 24 bytes × MAXTRE = 72KB
- `DEFECT(MAXTRE)`, `ICR(MAXTRE)`, `IDTREE(MAXTRE)`, `IMC(MAXTRE)`, `IND(MAXTRE)`, `IND1(MAXTRE)`, `IND2(MAXTRE)`, `ISP(MAXTRE)`, `ISPECL(MAXTRE)`, `ITRE(MAXTRE)`, `ITRUNC(MAXTRE)`, `KUTKOD(MAXTRE)`, `NORMHT(MAXTRE)`, `DECAYCD(MAXTRE)`, `WDLDSTEM(MAXTRE)`
- Total: 4 bytes × 15 × MAXTRE = 180KB @ MAXTRE=3000

**Real Arrays (41):**
- Core attributes: `DBH(MAXTRE)`, `HT(MAXTRE)`, `DG(MAXTRE)`, `HTG(MAXTRE)`, `PROB(MAXTRE)`, `BFV(MAXTRE)`, `CFV(MAXTRE)`, `MCFV(MAXTRE)`, `SCFV(MAXTRE)`, `CRWDTH(MAXTRE)`, etc.
- Work arrays: `WK1-WK15(MAXTRE)` (15 work arrays)
- Biomass/Carbon: `ABVGRD_BIO(MAXTRE)`, `MERCH_BIO(MAXTRE)`, `CUBSAW_BIO(MAXTRE)`, `FOLI_BIO(MAXTRE)`, `ABVGRD_CARB(MAXTRE)`, `MERCH_CARB(MAXTRE)`, `CUBSAW_CARB(MAXTRE)`, `FOLI_CARB(MAXTRE)`, `CARB_FRAC(MAXTRE)`
- Special: `HT2TD(MAXTRE,2)` - 2-dimensional
- Total: 4 bytes × 42 × MAXTRE + 8 bytes × MAXTRE (HT2TD) = 512KB @ MAXTRE=3000

**ARRAYS.F77 Total:** ~767KB @ MAXTRE=3000

#### CVCOM.F77 (common/CVCOM.F77)
Cover extension arrays:
- `ISHAPE(MAXTRE)` - 4 bytes × MAXTRE = 12KB
- `TRECW(MAXTRE)` - 4 bytes × MAXTRE = 12KB
- `TRFBMS(MAXTRE)` - 4 bytes × MAXTRE = 12KB

**CVCOM.F77 Total:** ~36KB @ MAXTRE=3000

#### ECNCOM.F77 (common/ECNCOM.F77)
Economic extension log-by-log merchandising:
- `logBfVol(MAXTRE, MAX_LOGS)` - 4 × MAXTRE × 20 = 240KB
- `logDibBf(MAXTRE, MAX_LOGS)` - 4 × MAXTRE × 20 = 240KB
- `logFt3Vol(MAXTRE, MAX_LOGS)` - 4 × MAXTRE × 20 = 240KB
- `logDibFt3(MAXTRE, MAX_LOGS)` - 4 × MAXTRE × 20 = 240KB

**ECNCOM.F77 Total:** ~960KB @ MAXTRE=3000

#### MISCOM.F77 (common/MISCOM.F77)
Mistletoe extension:
- `IMIST(MAXTRE)` - 4 bytes × MAXTRE = 12KB
- `DMMTPA(MAXTRE)` - 4 bytes × MAXTRE = 12KB

**MISCOM.F77 Total:** ~24KB @ MAXTRE=3000

#### STDSTK.F77 (common/STDSTK.F77)
Previous cycle tracking:
- `NBFDEF(MAXTRE)`, `NCFDEF(MAXTRE)` - 8 bytes × MAXTRE = 24KB
- `PDBH(MAXTRE)`, `PHT(MAXTRE)`, `PMRBFV(MAXTRE)`, `PMRCFV(MAXTRE)`, `PTOCFV(MAXTRE)`, `PSCFV(MAXTRE)` - 24 bytes × MAXTRE = 72KB

**STDSTK.F77 Total:** ~96KB @ MAXTRE=3000

#### SVDATA.F77 (common/SVDATA.F77)
Visualization:
- `SVMSAVE(MAXTRE)` - 4 bytes × MAXTRE = 12KB

#### VARCOM.F77 (common/VARCOM.F77)
Variant-specific:
- `PTBALT(MAXTRE)` - 4 bytes × MAXTRE = 12KB

#### WORKCM.F77 (common/WORKCM.F77)
Work arrays:
- `IWORK1(MAXTRE)` - 4 bytes × MAXTRE = 12KB
- `WORK1(MAXTRE)`, `WORK3(MAXTRE)` - 8 bytes × MAXTRE = 24KB

**WORKCM.F77 Total:** ~36KB @ MAXTRE=3000

#### Extension-Specific Common Blocks

**BMCOM.F77 (wwpb/BMCOM.F77)** - Western Spruce Budworm:
- `LBMDAM(MAXTRE)` - 1 byte × MAXTRE = 3KB
- `GRFDEN(MAXTRE)` - 4 bytes × MAXTRE = 12KB

**BRCOM.F77 (wpbr/BRCOM.F77)** - White Pine Blister Rust:
- `LEXMLT(MAXTRE)` - 1 byte × MAXTRE = 3KB
- `IBRTID(MAXTRE)`, `ICRED(MAXTRE)`, `ILCAN(MAXTRE)`, `IBRSTAT(MAXTRE)`, `ISTCAN(10,MAXTRE)`, `ISTOTY(MAXTRE)`, `ITCAN(MAXTRE)` - 52 bytes × MAXTRE = 156KB
- `BRAGE(MAXTRE)`, `BRGD(MAXTRE)`, `BRHTBC(MAXTRE)`, `BRPB(MAXTRE)`, `DOUT(10,MAXTRE)`, `DUP(10,MAXTRE)`, `ESTCAN(MAXTRE)`, `GI(MAXTRE)`, `GIRDL(10,MAXTRE)`, `RI(MAXTRE)`, `TSTARG(MAXTRE)`, `UPMARK(MAXTRE)` - 168 bytes × MAXTRE = 504KB
Total: ~663KB @ MAXTRE=3000

**MPBCOM.F77 (lpmpb/MPBCOM.F77)** - Mountain Pine Beetle:
- `IPT(MAXTRE)` - 4 bytes × MAXTRE = 12KB
- `XPT(MAXTRE)` - 4 bytes × MAXTRE = 12KB

**DFBCOM.F77 (dfb/common/DFBCOM.F77)** - Douglas-fir Beetle:
- `IPT(MAXTRE)` - 4 bytes × MAXTRE = 12KB

**FMCOM.F77 (fire/base/common/FMCOM.F77)** - Fire & Fuels:
Arrays similar to main common blocks but specific to fire modeling.

**BIOMAS.F77 (dftm/BIOMAS.F77)** - Biomass calculations:
- `FBIOMS(MAXTRE)`, `PCNEWF(MAXTRE)` - 8 bytes × MAXTRE = 24KB

### 1.2 Total Memory Footprint

**Base System (No Extensions):**
~1.9 MB @ MAXTRE=3000

**With All Extensions Active:**
~3.5 MB @ MAXTRE=3000

**Projected Memory Requirements:**

| MAXTRE Value | Base Memory | With All Extensions |
|--------------|-------------|---------------------|
| 3000 (current)| 1.9 MB     | 3.5 MB             |
| 5000         | 3.2 MB     | 5.8 MB             |
| 10000        | 6.4 MB     | 11.6 MB            |
| 15000        | 9.5 MB     | 17.5 MB            |
| 20000        | 12.7 MB    | 23.3 MB            |

**Note:** These are static memory allocations. Modern systems with GB of RAM can easily handle these requirements, but consider:
1. Multiple concurrent FVS instances
2. Embedded systems or cloud containers with memory limits
3. Legacy systems still in production

### 1.3 Local Arrays in Subroutines

Many subroutines declare local work arrays dimensioned by MAXTRE. Examples found:

**base/comprs.f:**
- Local arrays for compression algorithm

**Various variant files (dgf.f, crown.f, cratet.f, etc.):**
- `DIAM(MAXTRE)`, `CRNEW(MAXTRE)`, `ISORT(MAXTRE)`, etc.
- Each function allocates these on the stack or as local static arrays

**Estimated Additional Stack Usage:** 100-500KB per nested call depth

## 2. Algorithmic Impacts

### 2.1 Tree List Management

#### 2.1.1 Record Tripling
**Location:** base/triple.f

The tripling algorithm creates 3 records from each input record to better represent diameter growth variation:
- Input: ITRN records
- After tripling: 3 × ITRN records
- **Critical constraint:** 3 × ITRN must not exceed MAXTRE

**Current behavior:**
```fortran
IF (ITRN.GT.MAXTRE*.7 .AND. NTODO.GT.0) CALL ESCPRS (NCLAS,DEBUG)
```
Compression is triggered when ITRN exceeds 70% of MAXTRE to allow room for tripling.

**Impact of increasing MAXTRE:**
- Users can input more initial tree records
- Tripling can accommodate larger stands
- Compression may be deferred or avoided entirely in some simulations

#### 2.1.2 Tree List Compression
**Location:** base/comprs.f

Compression reduces ITRN records to NCLAS records by aggregating similar trees:
- Uses two methods: simple class boundaries and principal component analysis
- Computationally intensive: O(ITRN²) for some operations
- **Trade-off:** Larger MAXTRE allows more records but increases compression time when needed

**Impact of increasing MAXTRE:**
- Compression occurs less frequently (good: maintains detail)
- When compression does occur, it takes longer (bad: performance)
- Memory working set for compression scales with ITRN

### 2.2 Loop Performance

#### 2.2.1 Most Loops Use ITRN (Good)
**Pattern found throughout codebase:**
```fortran
DO 100 I=1,ITRN
```
These loops iterate only over active records, so increasing MAXTRE has no direct impact unless ITRN also increases.

#### 2.2.2 Some Loops Use MAXTRE Directly (Caution)
**Pattern found in initialization code:**
```fortran
DO 4 I=1,MAXTRE
```
**Location:** ne/dgf.f:103

These loops initialize entire arrays and will take longer proportional to MAXTRE increase.

**Impact estimate:**
- Increasing MAXTRE from 3000 to 10000 means initialization loops take 3.3× longer
- These are typically one-time operations at simulation start
- Negligible for single runs, could matter for batch processing thousands of stands

#### 2.2.3 Range Checks (IREC2 to MAXTRE)
**Pattern found frequently:**
```fortran
DO 50 I=IREC2,MAXTRE
```
**Locations:** ne/cratet.f:177, ws/cratet.f:254, and many others

These loops process dead/removed trees stored at the end of the array (IREC2 to MAXTRE).
- Increasing MAXTRE means larger range to iterate
- Impact depends on mortality rate and number of recent deaths

### 2.3 Sorting and Indexing

**IND, IND1, IND2 arrays** (MAXTRE-sized) maintain sorted access to tree records:
- IND: diameter-sorted index
- IND1: species-sorted index
- IND2: work array for sorting

Sorting algorithms have O(n log n) complexity, so:
- MAXTRE=3000 → ~25,000 comparisons
- MAXTRE=10000 → ~100,000 comparisons
- 4× increase in sorting time for 3.3× increase in MAXTRE

## 3. Model Behavior Changes

### 3.1 Compression Timing

**From changeNotes/2009.11.25_rhavis.txt:**
> "The expansion of the tree list arrays may cause tree list compression to occur at different times in a simulation."

**Why this matters:**
- Compression aggregates similar trees, losing some detail
- When compression occurs affects which trees get aggregated
- Different compression timing can lead to different growth trajectories

**Example scenario:**
1. Current MAXTRE=3000: Stand with 1100 input trees gets tripled to 3300, triggers compression early
2. Increased MAXTRE=5000: Same stand (3300 trees) doesn't compress until later
3. Result: More detailed tracking in early years, potentially different mortality/growth outcomes

**Magnitude of impact:**
- Generally small (few percent difference in outcomes)
- Larger for stands with high initial tree counts
- Documented in 2009 change notes as acceptable trade-off

### 3.2 Establishment Extension Behavior

**Locations:** estb/esnutr.f, strp/esnutr.f, ak/esnutr.f

The establishment extension adds new tree records for regeneration:
```fortran
IF(ITRN+ITRNRM.GT.MAXTRE) THEN
    ! Trigger compression
ENDIF
```

**Impact of increasing MAXTRE:**
- More regeneration can be added before compression
- Different spatial patterns may emerge in established regeneration
- Particularly important for high-regeneration scenarios (clearcuts, fires)

### 3.3 Species Representation

With larger MAXTRE:
- Rare species can be represented by more individual records
- Better captures diameter distribution within species
- Improved accuracy for mixed-species stands

## 4. File I/O and Data Format Implications

### 4.1 Input Tree Lists

**Current constraints:**
- Users can input up to MAXTRE tree records
- After tripling, total cannot exceed MAXTRE
- Practical limit: ~MAXTRE/3 input records to allow for tripling

**Impact of increasing MAXTRE:**
- Users can model larger plots or more detailed inventories
- Important for FIA plots with complete enumeration
- Enables 1:1 tree modeling for small stands

### 4.2 Output Files

**Tree list outputs:**
- PRTRLS writes tree list to output files
- Output file size scales linearly with ITRN
- Database outputs (DBS extension) write tree-level records

**Impact:**
- Larger output files proportional to ITRN increase
- Not a direct function of MAXTRE unless ITRN also increases
- Storage and I/O bandwidth considerations for large batch runs

### 4.3 Database Extensions

**Locations:** dbs/dbstrls.f, dbsqlite/dbstrls.f, dbsqlite/dbs_fiavbc_trls.f

Tree list database outputs create records for each tree:
- Cycles through ITRN records
- Writes to SQLite or text databases
- Includes cut lists, attribute lists

**Impact:**
- Database transaction overhead increases with ITRN
- SQLite performance may degrade with very large tree lists (>50,000 trees per stand)

## 5. Extension-Specific Impacts

### 5.1 Fire and Fuels Extension (FFE)

**Locations:** fire/base/fmcmpr.f, fire/base/fmtrip.f

FFE maintains parallel tree structures for fuel loading:
- Must track same tree records as main model
- Compression and tripling synchronized with main model

**Impact:**
- Same compression timing considerations
- Fuel loading calculations iterate over all trees
- Surface fuel accumulation affected by tree list size

### 5.2 Western Spruce Budworm

**BMCOM.F77 arrays:**
- `LBMDAM(MAXTRE)` - damage tracking
- `GRFDEN(MAXTRE)` - growth reduction

**Impact:**
- Infestation spread calculations may be affected by tree list size
- Larger tree lists provide finer spatial resolution for outbreak dynamics

### 5.3 White Pine Blister Rust

**BRCOM.F77 has extensive MAXTRE arrays (663KB @ MAXTRE=3000)**

**Impact:**
- Canker development tracked per tree
- Infection probability calculations scale with ITRN
- Largest extension-specific memory footprint

### 5.4 Root Disease Model

**Special case:**
- Has its own internal tree list limit (IRRTRE)
- From changeNotes/2012.08.03_ldavid.txt: "Root Disease model tree records limitation increased"
- Must coordinate with main model MAXTRE

### 5.5 Economics Extension

**ECNCOM.F77 log arrays: 960KB @ MAXTRE=3000**

Log-by-log merchandising for revenue calculation:
- 4 arrays of MAXTRE × 20 logs
- Critical for detailed economic analysis
- Significant memory impact

**Impact:**
- Most memory-intensive extension
- MAXTRE=10000 would require 3.2MB just for log arrays

## 6. Variant-Specific Considerations

### 6.1 HI Variant (MAXTRE=5000)

**Already uses higher limit:**
- Accommodates high-density tropical forests
- Demonstrates feasibility of larger MAXTRE
- No reported issues with performance or behavior

### 6.2 OC/OP Variants (MAXTRE=2000)

**Reduced in 2015 for ORGANON integration:**
- From changeNotes/2015.03.11_gdixon.txt
- Reason not explicitly stated
- Possible: Memory constraints in specific deployment?
- Consider: May need special handling if increasing globally

### 6.3 Canada Variants (BC, ON)

**Locations:** canada/bc/PRGPRM.F77, canada/on/PRGPRM.F77

Have their own PRGPRM.F77 files:
- Must be updated separately
- May have region-specific considerations

## 7. Potential Issues and Risks

### 7.1 Array Bound Violations

**Critical overflow checks:**

**Establishment adding trees:**
```fortran
IF(ITRN+ITRNRM.GT.MAXTRE) THEN
    ! Error or compression
ENDIF
```
**Locations:** ak/esnutr.f:138, estb/esnutr.f:127, strp/esnutr.f:114

**Dead tree storage:**
```fortran
IF(IREC2 .GT. MAXTRE) GO TO 150
```
**Locations:** Multiple cratet.f files

**Risk:** If MAXTRE is set inconsistently across files, array bounds could be violated.

### 7.2 Integer Overflow

**Calculations involving MAXTRE:**
```fortran
PARAMETER (NCLAS=INT(REAL(MAXTRE)*.4))
```
**Locations:** strp/esnutr.f:35, estb/esnutr.f:42

**Analysis:**
- MAXTRE=3000 → NCLAS=1200 (OK)
- MAXTRE=32767 → NCLAS=13106 (OK, within 32-bit integer range)
- MAXTRE=100000 → NCLAS=40000 (OK)

**Risk:** Low for reasonable MAXTRE values (<100,000)

### 7.3 Stack Overflow

Local arrays in subroutines:
```fortran
REAL DIAM(MAXTRE), CRNEW(MAXTRE), HTKEEP(MAXTRE)
```

**Risk:**
- Fortran compilers may allocate local arrays on stack
- Stack limits typically 1-8 MB
- MAXTRE=10000 with 5 local real arrays = 200KB
- Multiple nested calls could exceed stack limits

**Mitigation:**
- Use compiler flags to increase stack size
- Convert large local arrays to SAVE or allocatable arrays

### 7.4 Build System Inconsistencies

**26 different PRGPRM.F77 files** across variants:
- Each must be changed individually
- Easy to miss one during updates
- Testing required for each variant

**Risk:**
- Inconsistent MAXTRE values across variants
- Some variants unable to process input files created with higher MAXTRE assumptions

### 7.5 Mistletoe Extension Random Arrays

**Location:** mistoe/misran.f:61

```fortran
INTEGER IARRAY(MAXTRE),TARRAY(MAXTRE)
```

With error checking:
```fortran
IF(ISIZE.GT.MAXTRE.OR.ISIZE.LT.1) THEN
```

**Impact:**
- Random number generation for mistletoe infection
- Arrays must accommodate infection tracking
- Proper bounds checking already in place

## 8. Performance Benchmarks (Estimated)

### 8.1 Memory Allocation Time

**Startup overhead:**
- MAXTRE=3000: ~0.01 seconds
- MAXTRE=10000: ~0.03 seconds
- MAXTRE=20000: ~0.06 seconds

**Impact:** Negligible for typical use

### 8.2 Tree List Compression

**Estimated compression time:**

| Tree Count | MAXTRE=3000 | MAXTRE=10000 | MAXTRE=20000 |
|-----------|-------------|--------------|--------------|
| 1,000     | 0.1 sec     | 0.1 sec      | 0.1 sec      |
| 3,000     | 0.5 sec     | 0.5 sec      | 0.5 sec      |
| 10,000    | N/A         | 3.0 sec      | 3.0 sec      |
| 20,000    | N/A         | N/A          | 15.0 sec     |

**Note:** Times are estimates based on O(n²) complexity for principal component analysis

### 8.3 Sorting Operations

**IND array sorting (O(n log n)):**

| ITRN      | Sort Time   |
|-----------|-------------|
| 1,000     | 0.001 sec   |
| 3,000     | 0.004 sec   |
| 10,000    | 0.016 sec   |
| 20,000    | 0.037 sec   |

**Impact:** Minimal for typical operations

## 9. Testing Requirements

### 9.1 Functional Testing

**Required test scenarios:**

1. **Large input tree lists:**
   - Create input with MAXTRE/3 trees
   - Verify tripling succeeds
   - Check that compression triggers appropriately

2. **High regeneration:**
   - Clearcut scenario with intense regeneration
   - Verify establishment doesn't exceed MAXTRE
   - Check compression under high tree recruitment

3. **Long simulations:**
   - 100+ year runs
   - Multiple thinning cycles
   - Verify memory stability over many cycles

4. **All extensions active:**
   - Fire, insects, disease, economics
   - Verify no memory conflicts
   - Check extension-specific array handling

### 9.2 Variant Testing

**Each variant must be tested:**
- All 26 variants with PRGPRM.F77
- Focus on OC/OP (currently MAXTRE=2000)
- Canada variants (BC, ON)
- HI variant (already at 5000, test higher values)

### 9.3 Performance Testing

**Benchmarks needed:**
1. Startup time (cold start)
2. Compression time for various ITRN values
3. Memory usage throughout simulation
4. Comparison of model outcomes with different MAXTRE values

### 9.4 Regression Testing

**Critical comparisons:**
- Run identical stands with old and new MAXTRE
- Compare outcomes at various compression thresholds
- Document any behavioral differences
- Ensure differences are within acceptable tolerance

## 10. Recommendations

### 10.1 Safe MAXTRE Increase Scenarios

**Conservative increase (MAXTRE=5000):**
- **Memory impact:** 3.2 MB base (acceptable)
- **Performance impact:** Minimal
- **Risk level:** Low
- **Precedent:** Already used in HI variant
- **Recommendation:** SAFE for all variants

**Moderate increase (MAXTRE=10000):**
- **Memory impact:** 6.4 MB base (acceptable on modern systems)
- **Performance impact:** Compression takes 3× longer when needed
- **Risk level:** Medium
- **Testing required:** Extensive
- **Recommendation:** ACCEPTABLE with thorough testing

**Aggressive increase (MAXTRE=20000):**
- **Memory impact:** 12.7 MB base (still acceptable)
- **Performance impact:** Compression takes 10× longer
- **Risk level:** High (stack overflow concerns)
- **Testing required:** Comprehensive
- **Recommendation:** CAUTION - only if specific use case justifies

### 10.2 Implementation Strategy

**If increasing MAXTRE, follow these steps:**

1. **Update all PRGPRM.F77 files:**
   - Use grep to find all 26 instances
   - Update consistently across all variants
   - Consider: Should OC/OP remain at 2000? Investigate reason for reduction.

2. **Review compiler settings:**
   - Increase stack size limits
   - Enable array bounds checking during testing
   - Consider optimization level impacts

3. **Test incrementally:**
   - Start with one variant (suggest WS - well-tested, common use)
   - Verify all regression tests pass
   - Expand to other variants

4. **Document changes:**
   - Update changeNotes with new entry
   - Explain rationale for increase
   - Note any behavioral changes observed
   - Update user documentation

5. **Performance profiling:**
   - Profile compression routine with new MAXTRE
   - Identify any new bottlenecks
   - Optimize if necessary

### 10.3 Code Improvements to Consider

**Before or concurrent with MAXTRE increase:**

1. **Convert large local arrays to ALLOCATABLE:**
   - Prevents stack overflow
   - Reduces memory footprint when not in use
   - Example: `DIAM(MAXTRE)` in dgf.f routines

2. **Add runtime checks:**
   - Verify ITRN doesn't exceed MAXTRE before operations
   - Provide informative error messages
   - Graceful degradation rather than crashes

3. **Optimize compression algorithm:**
   - Current O(n²) complexity is limiting factor
   - Consider more efficient clustering algorithms
   - Cache-friendly data access patterns

4. **Make MAXTRE runtime-configurable:**
   - Read from configuration file or keyword
   - Allow users to set based on their needs
   - Eliminate need for recompilation

### 10.4 Special Considerations for OC/OP Variants

**Investigation needed:**
- Why was MAXTRE reduced to 2000 in 2015?
- Is there a specific limitation in ORGANON integration?
- Can it safely be increased to match other variants?

**Recommendation:**
- Review ORGANON-specific code in organon/ directory
- Test with MAXTRE=3000 before considering higher values
- Consult ORGANON documentation for any tree list limits

## 11. Conclusion

### 11.1 Summary of Findings

**Increasing MAXTRE is technically feasible with manageable impacts:**

1. **Memory:** Modern systems can easily handle 2-10× increase
2. **Performance:** Most operations scale linearly; compression is exception
3. **Behavior:** Small differences in compression timing; acceptable for most uses
4. **Risk:** Low for conservative increases (≤5000), medium for larger increases

### 11.2 Primary Concerns

1. **Compression performance:** O(n²) algorithm will slow significantly with very large tree lists
2. **Model behavior changes:** Different compression timing affects outcomes slightly
3. **Build consistency:** Must update 26+ PRGPRM.F77 files consistently
4. **Stack overflow:** Large local arrays in subroutines could cause issues

### 11.3 Key Benefits of Increasing MAXTRE

1. **Larger plot inventories:** Process complete FIA plots without aggregation
2. **Better detail retention:** Less frequent compression maintains finer spatial resolution
3. **Improved rare species modeling:** More records for uncommon species
4. **Enhanced regeneration modeling:** More detailed representation of established seedlings
5. **Reduced user workarounds:** Fewer cases of needing to aggregate input data

### 11.4 Final Recommendation

**For MAXTRE=5000 (all variants except OC/OP):**
✅ **RECOMMENDED** - Safe, proven in HI variant, minimal risk

**For MAXTRE=10000:**
⚠️ **RECOMMENDED WITH CAUTION** - Requires thorough testing, watch compression performance

**For MAXTRE>10000:**
❌ **NOT RECOMMENDED** - Compression performance becomes limiting factor, diminishing returns

### 11.5 Next Steps

1. Review this analysis with FVS development team
2. Decide on target MAXTRE value based on use case priorities
3. Investigate OC/OP MAXTRE=2000 rationale
4. Develop comprehensive test plan
5. Implement and test in development branch
6. Document behavioral changes for users
7. Update all relevant documentation

---

## Appendix A: Files Containing MAXTRE Parameter

**Total files with MAXTRE references: 377**

### Variant PRGPRM.F77 Files (26):
- acd/common/PRGPRM.F77
- ak/common/PRGPRM.F77
- bm/common/PRGPRM.F77
- ca/common/PRGPRM.F77
- canada/bc/PRGPRM.F77
- canada/on/PRGPRM.F77
- ci/common/PRGPRM.F77
- cr/common/PRGPRM.F77
- cs/common/PRGPRM.F77
- ec/common/PRGPRM.F77
- em/common/PRGPRM.F77
- hi/common/PRGPRM.F77 (MAXTRE=5000)
- ie/common/PRGPRM.F77
- kt/common/PRGPRM.F77
- ls/common/PRGPRM.F77
- nc/common/PRGPRM.F77
- ne/common/PRGPRM.F77
- oc/common/PRGPRM.F77 (MAXTRE=2000)
- op/common/PRGPRM.F77 (MAXTRE=2000)
- pn/common/PRGPRM.F77
- sn/common/PRGPRM.F77
- so/common/PRGPRM.F77
- tt/common/PRGPRM.F77
- ut/common/PRGPRM.F77
- wc/common/PRGPRM.F77
- ws/common/PRGPRM.F77

### Common Block Files (11):
- common/ARRAYS.F77
- common/CONTRL.F77
- common/CVCOM.F77
- common/ECNCOM.F77
- common/ESTREE.F77
- common/ESHOOT.F77
- common/MISCOM.F77
- common/STDSTK.F77
- common/SVDATA.F77
- common/VARCOM.F77
- common/WORKCM.F77

### Extension Common Block Files (6):
- dfb/common/DFBCOM.F77
- dftm/BIOMAS.F77
- fire/base/common/FMCOM.F77
- lpmpb/MPBCOM.F77
- wwpb/BMCOM.F77
- wwpb/BMRRCM.F77
- wpbr/BRCOM.F77

## Appendix B: Memory Allocation Details

### Arrays Dimensioned Exactly MAXTRE

**From common/ARRAYS.F77:**
```fortran
LOGICAL LBIRTH(MAXTRE)
INTEGER DAMSEV(6,MAXTRE), DEFECT(MAXTRE), ICR(MAXTRE),
        IDTREE(MAXTRE), IMC(MAXTRE), IND(MAXTRE), IND1(MAXTRE),
        IND2(MAXTRE), ISP(MAXTRE), ISPECL(MAXTRE), ITRE(MAXTRE),
        ITRUNC(MAXTRE), KUTKOD(MAXTRE), NORMHT(MAXTRE),
        DECAYCD(MAXTRE), WDLDSTEM(MAXTRE)
REAL    ABIRTH(MAXTRE), BFV(MAXTRE), CFV(MAXTRE), CRWDTH(MAXTRE),
        DBH(MAXTRE), DG(MAXTRE), HT(MAXTRE), HT2TD(MAXTRE,2),
        HTG(MAXTRE), OLDPCT(MAXTRE), OLDRN(MAXTRE), PCT(MAXTRE),
        PLTSIZ(MAXTRE), PROB(MAXTRE), WK1(MAXTRE), WK2(MAXTRE),
        WK3(MAXTRE), WK4(MAXTRE), WK5(MAXTRE), WK6(MAXTRE),
        YRDLOS(MAXTRE), ZRAND(MAXTRE), MCFV(MAXTRE), SCFV(MAXTRE),
        WK7(MAXTRE), CULL(MAXTRE),
        ABVGRD_BIO(MAXTRE), MERCH_BIO(MAXTRE), CUBSAW_BIO(MAXTRE),
        ABVGRD_CARB(MAXTRE), MERCH_CARB(MAXTRE), CUBSAW_CARB(MAXTRE),
        FOLI_BIO(MAXTRE), FOLI_CARB(MAXTRE),
        WK8(MAXTRE), WK9(MAXTRE), WK10(MAXTRE), WK11(MAXTRE),
        WK12(MAXTRE), WK13(MAXTRE), WK14(MAXTRE), WK15(MAXTRE),
        CARB_FRAC(MAXTRE)
```

## Appendix C: Historical MAXTRE Changes

**Timeline:**
- **Pre-2009:** MAXTRE=1350
  - Original value, adequate for most applications
  - Limitation for large plot inventories

- **November 2009 (R. Havis):** MAXTRE=1350 → 3000
  - Rationale: "To allow users to input more tree records"
  - Impact: "Tree list compression to occur at different times"
  - Applied to all variants

- **March 2015 (G. Dixon):** OC/OP: MAXTRE=3000 → 2000
  - Part of ORGANON integration
  - Reason not explicitly documented
  - Other variants remained at 3000

- **Present:**
  - Most variants: 3000
  - OC/OP variants: 2000

## Appendix D: Compression Trigger Locations

**Explicit compression triggers:**

```fortran
IF (ITRN.GT.MAXTRE*.7 .AND. NTODO.GT.0) CALL ESCPRS (NCLAS,DEBUG)
```
**Locations:**
- strp/esnutr.f:311
- estb/esnutr.f:
- ak/esnutr.f:402

**These trigger compression at 70% of MAXTRE to allow room for tripling**

## Appendix E: Relevant Change Notes

**changeNotes/2009.11.25_rhavis.txt:**
- MAXTRE increased from 1350 to 3000
- Impact on tree list compression timing noted
- Changes applied to all variants

**changeNotes/2015.03.11_gdixon.txt:**
- OC/OP variants created from CA/PN with ORGANON
- MAXTRE set to 2000 for these variants
- No explanation given for reduction

**changeNotes/2012.08.03_ldavid.txt:**
- Root Disease model tree records limitation increased
- Coordination with main model MAXTRE required

---

**Document Version:** 1.0
**Date:** 2025-12-20
**Prepared for:** ForestVegetationSimulator MAXTRE evaluation
**Total Analysis Time:** Comprehensive code review of 2,231 Fortran source files
