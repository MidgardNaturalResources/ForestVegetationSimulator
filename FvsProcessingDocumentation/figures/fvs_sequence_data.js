/* Data for the interactive FVS processing sequence figure.
   Sequence order, subroutine names and stop point locations were taken from the FVS source
   (base/fvs.f, base/tregro.f, base/grincr.f, base/gradd.f, vbase/initre.f and the routines they call).
   Descriptions follow "Model Structure of the Forest Vegetation Simulator" (Dixon and Crookston). */
(function () {
  var stops = {
    1: "Start of each cycle, in GRINCR, before the pre-thinning event monitor call",
    2: "In GRINCR, after the pre-thinning event monitor call, before CUTS",
    3: "In GRINCR, after thinning (CUTS), before the post-thinning event monitor call",
    4: "In GRINCR, after the post-thinning event monitor call, before growth is estimated",
    5: "In GRADD, after the disturbance and pest adjustments, before UPDATE applies growth and mortality",
    6: "In GRADD, after UPDATE and the density statistics, before regeneration establishment",
    7: "In FVS (cycle 0), after the input data are read and prepared, before calibration (CRATET)"
  };

  /* ---------- Initialization phase (section 3.0) ---------- */
  var processKeywords = {
    kind: "start", label: "Process keywords", subs: ["INITRE", "KEYRDR"], sec: "3.2",
    desc: "FVS calls INITRE once for each stand. INITRE gives every model control parameter a value in three steps: defaults are assigned, keyword records are processed, and parameters that depend on other settings are filled in.",
    steps: [
      { label: "Set default values", subs: ["GRINIT", "OPINIT", "ESINIT"], sec: "3.2",
        desc: "GRINIT (variant-specific) sets the default conditions for the stand, including species-specific, output and site variables. The extensions that are part of the variant add their own initializers, such as ESINIT (regeneration establishment) and FMINIT (fire and fuels). Block data routines such as BLKDAT and ESBLKD load their values at compile time." },
      { label: "Read a keyword record", subs: ["KEYRDR", "FNDKEY"], sec: "3.3",
        desc: "KEYRDR reads and decodes one keyword record and, unless the PARMS format is used, checks its parameter fields and fills in missing values. FNDKEY finds the keyword in the keyword table. Processing then branches on the type of keyword. The loop repeats until the PROCESS keyword.",
        steps: [
          { label: "Set a parameter once", sec: "3.3.1.1",
            desc: "Keywords such as BAMAX or DEFECT only replace a default value. INITRE stores the value, echoes the record to the main output file unless NOECHO is in effect, and is finished with the record." },
          { label: "Transfer control until END", subs: ["EVUSRV"], sec: "3.3.1.2",
            desc: "Keywords such as COMPUTE (event monitor, EVUSRV) or FMIN (fire and fuels) hand control to the keyword processor of another component. Control returns to INITRE at the END record. Records in between are handled by that component, and some of them are scheduled." },
          { label: "Schedule an activity", subs: ["OPNEW", "OPNEWC"], sec: "3.3.1.3",
            desc: ["The activity is posted to the activity schedule table, by OPNEW, or by OPNEWC when the PARMS format is used. With PARMS, parameter checking waits until the activity is retrieved.",
                   "Later, the subroutine responsible for the activity (for example CUTS for thinnings) retrieves it with OPFIND and OPGET and marks it DONE, NOT DONE, or DELETED OR CANCELLED with OPDONE."] },
          { label: "Event monitor: IF / THEN / ENDIF", subs: ["EVIF", "EVCOMP", "EVTHEN", "EVEND"], sec: "3.4.1",
            desc: "IF calls EVIF, which compiles the logical expression with EVCOMP. THEN calls EVTHEN, which links the event number to the activities that follow. ENDIF calls EVEND, which closes the event. Expression compilation is described in section 7.0." },
          { label: "Define variables: COMPUTE", subs: ["EVUSRV", "ALGEXP", "EVMKV"], sec: "3.4.2",
            desc: "EVUSRV compiles the expressions that define user variables, using ALGEXP to read each expression and EVMKV to create the variable." }
        ] },
      { label: "Set dependent parameters", subs: ["SITSET", "HABTYP", "FORKOD", "TRNSLO", "TRNASP", "LBDSET"], sec: "3.2.1",
        desc: "After the keywords are processed, SITSET (variant-specific) gives values to parameters that depend on other settings, such as species site index or maximum SDI when only some species were entered. Habitat type, forest code, slope and aspect are translated into the indexes and units used by the growth equations, and the stand label set is written." }
    ]
  };

  var readInput = {
    label: "Read input data", subs: ["INTREE", "DBSIN"], sec: "3.5", stop: 7,
    desc: "Stand and tree data come from ASCII files, from a database, or both. A keyword record file is required, a tree data file is optional. This box also covers the preparation FVS does before stop point 7.",
    steps: [
      { label: "Read tree records", subs: ["INTREE", "DAMCDS", "BASDAM", "LNKCHN", "SPCTRN"], sec: "3.5.1",
        desc: "INTREE reads tree records when INITRE meets the TREEDATA keyword, or at PROCESS if none have been read yet. Damage and severity codes are stored by DAMCDS and BASDAM for later processing, LNKCHN places each record in the sort, and SPCTRN converts unrecognized species codes." },
      { label: "Read from a database", subs: ["DBSIN", "DBSSTANDIN", "DBSTREESIN"], sec: "3.5.1",
        desc: "The DATABASE keyword calls DBSIN, which reads the database keyword records. STANDSQL calls DBSSTANDIN for stand data and TREESQL calls DBSTREESIN for tree data, and INTREE then processes the retrieved records. Where the DATABASE sequence is placed matters: database values replace values already set by earlier keywords." },
      { label: "Process damage codes", subs: ["DAMPRO", "TRESOR"], sec: "3.5.1",
        desc: "DAMPRO processes the insect and disease damage codes for the extensions. TRESOR matches tree identification numbers to tree record indexes for the extensions." },
      { label: "Too few trees? Request regeneration", subs: ["ESEZCR"], sec: "3.5",
        desc: "If there are not enough projectable tree records, INITRE calls ESEZCR (an entry in ESINIT), which sets flags so the full establishment model predicts advanced regeneration to start the run. The partial establishment model sets the flags but predicts no regeneration, so the run proceeds with no trees unless PLANT or NATURAL keywords add some." },
      { label: "Set up the projection", subs: ["OPEXPN", "OPCYCL", "OPLIST", "SETUP", "NOTRE"], sec: "3.6.1",
        desc: ["FVS defines the cycle boundaries in the IY array and processes the option lists of the insect, disease and economics extensions. OPEXPN duplicates activities scheduled for all cycles, OPCYCL assigns activities to cycles, and OPLIST writes the activity schedule to the main output file.",
               "SETUP builds the index pointers for the species sort. NOTRE expands the inventory data to a per-acre basis. The extensions' inventory initializers (for example RDMN1, MPSDLP, DFBINV) run here. OPCSET then sets the option pointers to the cycle 0 activities, and stop point 7 follows."] }
    ]
  };

  /* ---------- Calibration (CRATET) ---------- */
  var initialChars = {
    label: "Compute initial stand characteristics", subs: ["SDICLS", "CRATET", "MBACAL", "MAICAL", "RCON"], sec: "3.6.2.1",
    desc: "CRATET (variant-dependent) directs calibration. First SDICLS computes the maximum stand density index, needed to fill in missing crown ratios in variants that use a Weibull crown model.",
    steps: [
      { label: "Identify the site species", subs: ["MBACAL"], sec: "3.6.2.1",
        desc: "MBACAL finds the species with the plurality of basal area (the site species), which some variants use as a growth predictor." },
      { label: "Compute mean annual increment", subs: ["MAICAL"], sec: "3.6.2.1",
        desc: "MAICAL computes the stand mean annual increment, used as a growth predictor by some variants. It is skipped in a bare ground run." },
      { label: "Load site-dependent terms", subs: ["RCON", "DGCONS", "HTCONS", "REGCON", "MORCON", "CRCONS"], sec: "3.6.2.1",
        desc: "Terms that stay constant for a stand projection (habitat type, site index, slope, aspect, elevation) are aggregated once into vectors subscripted by species. RCON calls the entry points DGCONS (in DGF), HTCONS (HTGF), REGCON (REGENT), MORCON (MORTS) and CRCONS (CROWN)." }
    ]
  };
  var backdate = {
    label: "Backdate densities", subs: ["DENSE"], sec: "3.6.2.1",
    desc: ["FVS is a forward-projecting model. To calibrate, the stand is backdated to its condition about 10 years earlier, projected forward with the growth and mortality functions, compared with the observed stand, and the growth functions are scaled to match.",
           "CRATET calls DENSE with LBKDEN true so that DENSE backdates the stand. DENSE also computes average height, crown competition factor, relative density by species and point basal area in larger trees, adjusted for non-stockable points."]
  };
  var calibrate = {
    label: "Compute calibration statistics", subs: ["CRATET"], sec: "3.6.2",
    desc: "The rest of CRATET. Calibration improves projections in most cases and can be turned off with the NOCALIB keyword.",
    steps: [
      { label: "Identify dead tree records", sec: "3.6.2.2",
        desc: "Records coded as recent mortality (history code 7) or older mortality (code 9) are held at the bottom of the tree arrays. CRATET counts recent mortality by species, writes it to the main output file, and removes the dead records from the species-ordered pointers. The records are still needed for height dubbing, the fire snag list and the tree list output." },
      { label: "Calibrate height-diameter, dub heights", sec: "3.6.2.3",
        desc: "For each species with at least 3 measured heights, the intercept of the height-diameter equation is adjusted (unless calibration is off). Heights missing from live and dead records, and broken or dead top heights, are then estimated." },
      { label: "Add dead trees to the snag list", subs: ["FMSSEE"], sec: "3.6.2.4",
        desc: "FMSSEE passes the dead trees to the fire and fuels extension snag list." },
      { label: "Dub missing crown ratios", subs: ["CROWN", "DUBSCR"], sec: "3.6.2.5",
        desc: "CROWN controls dubbing of crown ratios missing from live and dead records, calling DUBSCR for some small and dead trees." },
      { label: "Calibrate growth equations", subs: ["AVHT40", "DGDRIV", "DGF", "FINDAG", "REGENT"], sec: "3.6.2.6",
        desc: ["The scale factor for the large-tree diameter growth and small-tree height growth functions is a multiplier that weights the median ratio of observed to predicted growth against 1.0. The weight depends on how closely the residual variation matches that of the model data.",
               "AVHT40 computes top height (the mean height of the 40 largest-diameter trees) where needed. DGDRIV with DGF predicts diameter growth for the backdated stand, and only trees above the threshold diameter calibrate the large-tree model. FINDAG estimates tree age for the variants that use it, and REGENT then scales the small-tree height growth model."] },
      { label: "Compute inventory statistics, check SDI", subs: ["PCTILE", "DIST", "COMP", "DENSE", "SDICHK"], sec: "3.6.2.6",
        desc: "With the backdated stand finished, CRATET computes percentiles, distributions and composition and calls DENSE for the initial inventory values needed for output, then counts records with dwarf mistletoe. In variants that use SDI, SDICHK resets the maximum SDI, and prints a message, if the inventory SDI exceeds it." }
    ]
  };
  var finishInit = {
    label: "Finish initialization and write initial output", subs: ["ESFLTR", "CWIDTH", "VOLS", "EXTREE", "STATS", "DISPLY"], sec: "3.7",
    desc: "The last initialization tasks in FVS: compute the remaining tree and stand variables, initialize the extensions, and write the initial stand and tree conditions.",
    steps: [
      { label: "Flag best trees for regeneration", subs: ["ESFLTR"], sec: "3.7.1",
        desc: "ESFLTR collects understory and overstory densities and flags inventory trees as best trees for the regeneration establishment model." },
      { label: "Compute crown width and volume", subs: ["CWIDTH", "CWCALC", "VOLS", "PCTILE", "DIST"], sec: "3.7.1",
        desc: "CWIDTH (using CWCALC) estimates crown widths for all records. VOLS computes initial volumes, then PCTILE and DIST find the percentile points of the volume distributions." },
      { label: "Select example trees, cover model", subs: ["EXTREE", "CVBROW", "CVCNOP"], sec: "3.7.1",
        desc: "EXTREE assigns example trees to the Attributes of Selected Sample Trees table. If the cover extension is active, shrub density, browse and canopy cover are computed." },
      { label: "Describe the input sample", subs: ["STATS"], sec: "3.7.1",
        desc: "STATS computes and prints statistics on the distribution of stand attributes among sample plots, when the STATS keyword is used." },
      { label: "Write initial stand tables", subs: ["DISPLY", "MISPRT", "PRTRLS", "SVSTART"], sec: "3.7.1",
        desc: "DISPLY writes the initial stand statistics to the main output file. MISPRT writes dwarf mistletoe information, PRTRLS writes the initial tree list and SVSTART creates the initial stand visualization." },
      { label: "Purge dead trees, start extensions", subs: ["RDMN1", "RDPR", "BRSETP", "BRPR", "EVTSTV"], sec: "3.7.1",
        desc: "Dead trees from the inventory are purged by resetting the dead tree pointer IREC2 to MAXTRE+1, which frees their storage. The root disease and blister rust models are initialized, and the type 1 event monitor variables are initialized. The logical LSTART is then set false, ending the initialization phase." }
    ]
  };



  /* ---------- Summarization phase (section 5.0) ---------- */
  var finalReports = {
    kind: "end", label: "Produce final FVS reports", subs: ["FVS", "DISPLY", "GENPRT"], sec: "5.1.1",
    desc: "When the last cycle is complete FVS writes the final reports for the stand. MAIN then calls FVS again for the next stand (see Multi-stand runs below).",
    steps: [
      { label: "Signal end of the stand", subs: ["fvsStopPoint"], sec: "8.2",
        desc: "FVS calls fvsStopPoint with code -1, which sets the restart code to 100 and marks the stand as finished. This is how a calling program learns that the stand cannot be continued." },
      { label: "Compute final density", subs: ["SDICLS"], sec: "5.1.1",
        desc: "ICYC is incremented and ICL6 is set to -99, which tells DISPLY that the projection is complete. The current density values are saved for printing and SDICLS computes the end-of-projection stand SDI." },
      { label: "Write final stand and tree tables", subs: ["DISPLY", "PRTEXM"], sec: "5.1.1",
        desc: "DISPLY writes the final lines of the stand composition, sample tree and summary tables. It then writes an end-of-file marker on the scratch file and calls PRTEXM, which reads the unformatted scratch file and writes the example tree and stand attribute table in line printer format on the main output file." },
      { label: "Write economics and summary tables", subs: ["ECEND", "GROHED", "LBSPLW", "SUMOUT", "OPLIST"], sec: "5.1.1",
        desc: "ECEND writes the last economic output if the economics extension is active. GROHED writes the summary table header, LBSPLW the stand policy label set (SPLABEL), and SUMOUT the summary statistics table. OPLIST then writes the Activity Summary table." },
      { label: "Structural stage and visualization", subs: ["SSTAGE", "SVOUT"], sec: "5.1.1",
        desc: "SSTAGE computes the structural stage classes at the end of the projection, and SVOUT writes the end-of-projection stand visualization if requested." },
      { label: "Extension end-of-projection output", subs: ["ESOUT", "CVOUT", "MPBOUT", "DFBOUT", "TMOUT", "BWEOUT", "BRROUT"], sec: "5.1.1",
        desc: "Each extension writes its end-of-projection output: regeneration establishment (ESOUT), cover (CVOUT), mountain pine beetle (MPBOUT), Douglas-fir beetle (DFBOUT), tussock moth (TMOUT), budworm (BWEOUT) and blister rust (BRROUT). Root disease output is now handled by GENPRT." },
      { label: "Write the multiple-report tables", subs: ["GENPRT", "GENRPT"], sec: "5.1.1",
        desc: "GENPRT, an entry point in GENRPT, writes the summary output tables for the whole projection of the stand, using the reports saved on the multiple report scratch file. FVS then returns to its caller." }
    ]
  };

  /* ---------- Supporting sequences ---------- */
  var relMultiStand = {
    label: "Multi-stand runs and the MAIN program", sec: "5.2",
    desc: ["PROGRAM MAIN contains the only STOP statement. It calls fvsSetCmdLine once to read the command line, then calls FVS in a loop. Each call to FVS projects one stand and returns, and the loop ends when FVS sets a non-zero return code (for example 2 at a STOP keyword or end of file).",
           "A run with several stands is called a multiple stand serial run. Each stand may be a different stand or a different alternative for the same stand. The Parallel Processing Extension that once ran stands in parallel was removed; stop points and restart (below) replace it, with a calling program stopping every stand at a common year."],
    steps: [
      { label: "Read the command line", subs: ["fvsSetCmdLine"], sec: "8.2",
        desc: "fvsSetCmdLine resets the stop/restart variables and reads --keywordfile=, --stoppoint=code,year,file and --restart=file. It opens the stop point file for writing (--stoppoint) or the restart file for reading (--restart). A restart file replaces the keyword file." },
      { label: "Call FVS for one stand", subs: ["FVS"], sec: "2.2",
        desc: "FVS calls fvsRestart to decide whether this is a new stand or a restart. A new stand starts with ICYC = 0, LSTART and LFLAG true, and goes through initialization, the projection cycles and the final reports, as shown in the main figure." },
      { label: "Check the return code", subs: ["fvsGetRtnCode", "fvsSetRtnCode"], sec: "8.2.1",
        desc: "A return code of 0 means the stand finished normally, so MAIN calls FVS again for the next stand. INITRE sets the code to 2 when it reads a STOP keyword or reaches the end of the keyword file, and a fatal error sets it to 1. Any non-zero code ends the loop." },
      { kind: "end", label: "End of run" }
    ]
  };
  var relOptions = {
    label: "Option (activity) processing", sec: "6.1",
    desc: "Options such as a thinning scheduled 40 years into a run are posted to an activity schedule and retrieved by the routine that carries them out. Immediate settings such as the stand elevation are not scheduled.",
    steps: [
      { label: "Post the activity", subs: ["OPNEW", "OPNEWC", "OPCACT"], sec: "6.1",
        desc: "When a keyword record needs scheduling, INITRE calls OPNEW with the activity code, the year (IDATE) and the parameters. Pointers are stored in IACT(i,j) in the OPCOM common block. With the PARMS format OPNEWC stores compiled operations code in IEVCOD(k), and OPCACT stores a character string such as an SQL query." },
      { label: "Event-based activities wait", subs: ["EVTHEN"], sec: "6.1",
        desc: "An activity inside an IF-THEN-ENDIF is not scheduled until the event occurs. Its year field is then read as years after the event, and the sum becomes the scheduling year." },
      { label: "Set pointers each cycle", subs: ["OPEXPN", "OPCYCL", "OPCSET"], sec: "3.6.1",
        desc: "OPEXPN duplicates activities scheduled for all cycles, OPCYCL assigns activities to cycles, and OPCSET sets the pointers for the current cycle, sorted by ascending activity number." },
      { label: "Find the activities", subs: ["OPFIND"], sec: "6.2",
        desc: "The routine that carries out an activity lists the activity codes it handles (usually in MYACTS(i)) and calls OPFIND to see which are scheduled this cycle. For example CUTS handles the thinning codes and CROWN handles CRNMULT (code 81)." },
      { label: "Retrieve parameters", subs: ["OPGET", "OPGETC", "OPGET2"], sec: "6.1",
        desc: "OPGET returns the parameter values (evaluating PARMS expressions at this time), OPGETC returns a character string, and OPGET2 retrieves activities scheduled beyond the current cycle boundaries." },
      { label: "Carry out and mark the activity", subs: ["OPDONE", "OPDEL1"], sec: "3.3.1.3.2",
        desc: "The routine does the work and calls OPDONE to mark the activity DONE, or OPDEL1 for DELETED OR CANCELLED. Activities posted for a year outside the simulation are left NOT DONE. OPLIST lists the dispositions in the activity summary." }
    ]
  };
  var relEvents = {
    label: "Event monitor: defining and evaluating events", sec: "7.1",
    desc: "An event is a logical expression, entered with the IF keyword, that is evaluated twice every cycle. Activities that follow it are scheduled when it becomes true.",
    steps: [
      { label: "Define the event (keyword processing)", subs: ["EVIF", "EVCOMP", "ALGCMP", "EVTHEN", "EVEND"], sec: "3.4.1",
        desc: "IF calls EVIF, which stores the event and has EVCOMP read the expression. EVCOMP calls ALGCMP, which compiles it to operations code and stores it in IEVCOD(k), with its location in IEVNTS(i,j). THEN calls EVTHEN, which links the activities (the activity group) to the event in IEVACT(i,j). ENDIF calls EVEND." },
      { label: "Phase 1: before thinning", subs: ["EVMON", "EVTSTV", "EVAGE", "ALGEVL", "EVLDX", "EVPOST"], sec: "4.1.1.1",
        desc: "At the start of each cycle, just before CUTS, GRINCR calls EVMON with phase 1. EVTSTV loads the variables known before thinning, including user COMPUTE variables, EVAGE ages events from earlier cycles, ALGEVL evaluates the expressions, with EVLDX loading saved variables and function results, and EVPOST records the year of each event that occurred." },
      { label: "Thinning (CUTS)", subs: ["CUTS"], sec: "4.1.1.2", desc: "Activities scheduled by phase 1 events can be carried out here in the same cycle." },
      { label: "Phase 2: after thinning", subs: ["EVMON", "EVTSTV", "ALGEVL", "EVPOST"], sec: "4.1.1.3",
        desc: "EVMON is called again with phase 2. Variables that exist only after thinning (such as ABA, the after-thinning basal area) are defined now. A variable that is not defined makes its expression not defined, and an expression that is not defined is not true. MIN (10,BBA,ABA,1) is therefore not defined in phase 1 and defined in phase 2." },
      { label: "Event occurred: schedule its activities", subs: ["EVPOST", "EVALNK", "OPNEW"], sec: "6.1",
        desc: "EVPOST sets the event year in IVENTS(i,2), and EVALNK finds the linked activity group. The activities are scheduled for the event year plus their offset." }
    ]
  };
  var relRpn = {
    label: "Event monitor: compiling and evaluating an expression", sec: "7.1",
    desc: "Expressions are compiled once, when the keyword is read, and evaluated when needed. The compiled form is operations code in post-fix (Reverse Polish) notation. For BTOPHT GT 80 the code is 109, 1001, 6, 0.",
    steps: [
      { label: "Compile to post-fix operations code", subs: ["ALGCMP", "ALGKEY", "ALGEXP", "EVKEY", "EVMKV"], sec: "7.1",
        desc: "ALGCMP converts the expression to post-fix notation, so every operator follows its operands. ALGKEY recognizes variable and function names and gives their operation codes (its comments list them all). EVKEY finds user-defined variables, and EVMKV creates new ones." },
      { label: "Store the code and constants", subs: ["CONSTS", "IEVCOD"], sec: "7.1",
        desc: "The integer code goes in IEVCOD(k) and numeric constants go in CONSTS(i). In BTOPHT GT 80 the constant 80 is load code 1001, meaning the first constant." },
      { label: "Load variable values", subs: ["EVTSTV"], sec: "7.1",
        desc: "EVTSTV loads the predefined variables into the arrays TSTV1 to TSTV5 (TSTV1: before thinning, from cycle 1; TSTV2: after thinning; TSTV3: before thinning, from cycle 2; TSTV4: set by extensions, valid when LTSTV4(i) is true; TSTV5: user defined)." },
      { label: "Evaluate on a stack", subs: ["ALGEVL", "EVLDX"], sec: "7.1",
        desc: "ALGEVL steps through the codes. 109 loads BTOPHT onto the numeric stack, 1001 loads the constant 80, 6 (GT) compares the top two values and puts the result on the logical stack, and 0 ends the expression. Function codes such as MIN are 109NN, where NN is the number of arguments." }
    ]
  };
  var relStopPoint = {
    label: "Stop points: how FVS stops", sec: "8.1",
    desc: ["Every routine returns its status up the call stack, and no FORTRAN STOP is executed except in MAIN, so FVS can return from any stop point. The stop points are numbered 1 to 7 (see the stop point markers in the main figure), and -1 marks the end of a stand.",
           "A stop can be requested two ways. A command line --stoppoint=code,year,file is a major stop point, which stores the stand state in a file. fvsSetStoppointCodes(code, year), used by a calling program, sets a minor stop point, which returns without storing anything."],
    steps: [
      { label: "FVS reaches a stop point", subs: ["fvsStopPoint"], sec: "8.2",
        desc: "The code at each stop point calls fvsStopPoint with its location code. Afterwards it checks the flag ISTOPRES and the return code and returns if either is set." },
      { label: "Check for a major stop point", subs: ["fvsStopPoint"], sec: "8.2",
        desc: "A major stop point matches when its code equals this location (a negative code matches the first stop point reached) and its year falls within the current cycle. A code or year of 0 disables it. If it matches, the stand state is stored, the stop is marked stop-with-store, and the restart code is set to the location code.",
        steps: [
          { label: "Store the stand state", subs: ["PUTSTD", "VARPUT", "CVPUT", "ECNPUT", "FMPPPUT", "DBSPPPUT", "CLPUT"], sec: "8.2.1",
            desc: "The first time, the stop file gets a header (stop point code, year, keyword file name). PUTSTD then writes every state variable as a binary stream, and the variant and each extension add their own data. No file is written if no stop point file name was given." }
        ] },
      { label: "Check for a minor stop point", subs: ["fvsStopPoint"], sec: "8.2",
        desc: "If no major stop point matched, the minor stop point is checked the same way. If it matches, the stop is marked stop-without-store and the restart code is set. The state stays in memory (COMMON), so nothing is written." },
      { label: "Return up the call stack", subs: ["getAmStopping", "fvsGetRtnCode"], sec: "8.2",
        desc: "When a stop point matched, ISTOPDONE is set and GRADD, GRINCR, TREGRO and FVS each return in turn. After each call, the caller asks getAmStopping, and fvsGetRtnCode, whether it should return as well. Control goes back to MAIN, or to the calling program when FVS is a shared library." },
      { kind: "end", label: "No match: continue processing" }
    ]
  };
  var relRestart = {
    label: "Restarting after a stop", sec: "8.2",
    desc: "A stop can be resumed in the same program, using the state held in memory, or from a stop point file written by an earlier run (--restart=file). All variables needed after a restart must be in COMMON blocks, or the stop point file will not hold them.",
    steps: [
      { label: "Read the restart file (command line)", subs: ["fvsSetCmdLine"], sec: "8.2",
        desc: "With --restart=file, fvsSetCmdLine opens the stream, reads the stop point code, year and keyword file name, and remembers the code as the original restart code. A keyword file given on the same command line is ignored." },
      { label: "Decide what kind of start this is", subs: ["fvsRestart"], sec: "8.2",
        desc: "FVS calls fvsRestart, which checks the stop status: 0, no stop was done (start the stand from the keyword file); 1 or 2, stop with store, or the end of the last stand; 3, stop without store, so continue from memory; 4, the second call after a reload." },
      { label: "Reload the stand", subs: ["GETSTD", "VARGET", "CVGET", "ECNGET", "FMPPGET"], sec: "8.2.1",
        desc: "For a stored stop, fvsRestart saves the read position and calls GETSTD, which reads the state variables back in the order they were written. It returns a negative code so the calling program can inspect or change the stand through the API. The next call to FVS (status 4) sets the restart code to the original code." },
      { label: "Jump ahead", subs: ["fvsGetRestartCode", "ClearRestartCode"], sec: "8.2",
        desc: "FVS branches on the restart code: 7 resumes just after the input is read, and 1 to 6 go straight into the cycle loop. TREGRO, GRINCR and GRADD call fvsGetRestartCode at their start and branch to the point after the stop they previously returned from. The code is cleared once processing resumes." },
      { label: "Back up to the last stand", subs: ["fvsRestartLastStand"], sec: "8.2",
        desc: "fvsRestartLastStand reloads the stand most recently stored (the file position saved at the last restart), so a projection can be repeated from the stop point. This was first used for fuel management analyses in which actions that did not meet decision criteria were discarded." }
    ]
  };
  var relApi = {
    label: "Using FVS as a shared library (API)", sec: "8.0",
    desc: "When FVS is a shared library (or the rFVS R package, described in section 8.3) the caller drives it with stop points, which return control to the caller with the stand state still in memory.",
    steps: [
      { label: "Set up the run", subs: ["fvsSetCmdLine", "fvsSetStoppointCodes"], sec: "8.2",
        desc: "The caller passes the command line (for example --keywordfile=) and sets a minor stop point with the location code and year it wants." },
      { label: "Run to the stop point", subs: ["FVS"], sec: "8.1",
        desc: "The caller calls FVS. FVS runs until the stop point and returns. The return code is 0 (OK), 1 (error) or 2 (run has ended), and the restart code says where it stopped." },
      { label: "Read the stand", subs: ["fvsDimSizes", "fvsSummary", "fvsTreeAttr", "fvsSpeciesAttr", "fvsEvmonAttr", "fvsStandID"], sec: "8.2.1",
        desc: "Dimensions, summary data, tree and species attributes, event monitor variables and the stand identifiers can be read, and the tree, species and event monitor attributes can also be changed. Other routines give access to the SVS objects and fire and fuels attributes." },
      { label: "Change the stand", subs: ["fvsAddTrees", "fvsCutTrees", "fvsAddActivity", "fvsTreeAttr"], sec: "8.2.1",
        desc: "Trees can be added or cut, activities (keyword equivalents) can be scheduled, and tree attributes can be set. This is how disturbances modeled outside FVS are applied, and how conditional treatments are made." },
      { label: "Change the stop point and call FVS again", subs: ["FVS", "fvsSetStoppointCodes"], sec: "8.1",
        desc: "FVS jumps ahead to where it stopped and continues to the next stop point, or to the end of the projection. This repeats until the return code is 2." },
      { label: "Finish", subs: ["fvsGetRtnCode"], sec: "8.2",
        desc: "At the end of each stand fvsStopPoint(-1) signals that the stand cannot continue. fvsCloseFile can be used to close an open output file." }
    ]
  };

  /* ---------- Projection cycling phase (section 4.0) ---------- */
  var cycleSetup = {
    label: "Set up the cycle", subs: ["FVS", "TREGRO", "GRINCR"], sec: "4.1.1", stop: 1,
    desc: "FVS increments ICYC and calls TREGRO, which calls GRINCR for the first half of the cycle (events, harvest, growth, mortality) and GRADD for the second half (disturbances, update, regeneration, crown).",
    steps: [
      { label: "Set cycle length and option pointers", subs: ["OPCSET"], sec: "4.1.1",
        desc: "The cycle length FINT is set, OPCSET sets the option pointers for the cycle, and the logical LTRIP is set to control whether record tripling happens during the cycle." },
      { label: "Process SETSITE requests", subs: ["OPFIND", "OPGET", "OPDONE", "HABTYP", "RCON"], sec: "4.1.1",
        desc: "SETSITE keyword records scheduled for the cycle are processed. If the habitat type is reset, HABTYP decodes it, and RCON recalculates the species-level growth equation constants." },
      { label: "Set up the extensions", subs: ["RDMN2", "RDTRP", "FMSDIT"], sec: "4.1.1",
        desc: "Variables needed by the extensions (root disease, fire and fuels, and others) are set up for the cycle." },
      { label: "Compute before-thinning stand variables", subs: ["SILFTY", "SDICAL", "SDICLS", "SSTAGE"], sec: "4.1.1",
        desc: "SILFTY computes the SILVAH forest type (0 in all variants except NE). SDICAL computes the before-thinning maximum SDI, SDICLS computes the current stand SDI by the Reineke and Zeide methods, and SSTAGE computes the structural stage. These feed the predefined event monitor variables. Stop point 1 follows." }
    ]
  };
  var emPre = {
    label: "Check Event Monitor for pre-thinning actions", subs: ["EVMON"], sec: "4.1.1.1", stop: 2,
    desc: "GRINCR calls EVMON with phase number 1 (IPH = 1, stored as IPHASE in OPCOM). Before-thinning actions compute output variables from pre-harvest conditions and evaluate expressions that conditionally schedule activities such as a thinning.",
    steps: [
      { label: "Load predefined variables", subs: ["EVTSTV"], sec: "4.1.1.1", desc: "EVTSTV loads the values of the predefined event monitor variables in Groups 1, 3, 4 and 5." },
      { label: "Age earlier events (cycle 2 and later)", subs: ["EVAGE"], sec: "4.1.1.1", desc: "From cycle 2 on, EVAGE ages an event that has already occurred and resets it as able to occur again." },
      { label: "Evaluate expressions", subs: ["ALGEVL", "EVLDX"], sec: "4.1.1.1", desc: "ALGEVL evaluates the expressions used for user-defined variables and for PARMS parameter fields. EVLDX loads saved variables and function results such as SPMCDBH into the registers." },
      { label: "Post the events that occurred", subs: ["EVPOST", "EVALNK"], sec: "4.1.1.1", desc: "EVPOST records the year each event occurred (or -1 if it did not) in IVENTS(i,2). EVALNK checks whether the event is linked to an activity group." }
    ]
  };
  var thinning = {
    label: "Process thinning, then pruning requests", subs: ["CUTS"], sec: "4.1.1.2", stop: 3,
    desc: "Harvests scheduled at any time in a cycle are done at the beginning of that cycle. To harvest in a particular year, adjust the cycle boundaries with TIMEINT or CYCLEAT.",
    steps: [
      { label: "Write beginning-of-cycle visualization", subs: ["SVOUT"], sec: "4.1.1.2", desc: "From cycle 2 on, SVOUT writes the beginning-of-cycle file for the stand visualization post-processor." },
      { label: "Find the thinning requests", subs: ["CUTS", "OPFIND", "OPGET"], sec: "4.1.1.2.1",
        desc: "CUTS handles minimum harvest constraints (MINHARV), harvest priority multipliers (SPECPREF, TCONDMLT), yard loss (YARDLOSS), pruning (PRUNE) and the thinning requests (THIN___, SETPTHIN). It first checks for requests with OPFIND and zeroes the trial thinning vector WK4." },
      { label: "Trial thinning", sec: "4.1.1.2.1",
        desc: "The DO 1400 loop retrieves each request (OPGET) and accumulates the removals in WK4 and in the harvest volume totals, according to the request type IACTK. Nothing is final yet." },
      { label: "Apply thinning if allowed", subs: ["TREDEL", "SPESRT", "RDPSRT"], sec: "4.1.1.2.1",
        desc: "If the minimum harvest is met and the run is not in PRETEND mode for an economic analysis, the DO 1700 loop applies the trial results. Records reduced to zero trees per acre are deleted with TREDEL, SPESRT realigns the species sort, and RDPSRT re-sorts by diameter." },
      { label: "Interact with extensions", subs: ["FMSALV", "FMSCUT", "FMTREM", "FMPRUN", "ECHARV"], sec: "4.1.1.2",
        desc: "CUTS asks the fire extension to process salvage, update the snag list, save removals and add pruning slash, and passes board foot removals to the economics extension." },
      { label: "Write cut and residual tree lists", subs: ["PRTRLS", "FVSSTD", "NATCRZ", "SVCUTS"], sec: "4.1.1.2.1",
        desc: "PRTRLS writes the cut tree list (CUTLIST) and the post-treatment live tree list, FVSSTD writes the FVSStand cut list, NATCRZ the National Cruise Program list, and SVCUTS the stand visualization files." },
      { label: "Update stand statistics after thinning", subs: ["DENSE", "SDICAL", "SDICLS", "SILFTY", "SSTAGE", "CVBROW", "CVCNOP"], sec: "4.1.1.2.1",
        desc: "Back in GRINCR, DENSE updates the density statistics if thinning occurred. SDICAL, SDICLS, SILFTY and SSTAGE compute the after-thinning maximum SDI, stand SDI, forest type and structural stage, and the cover extension updates shrub and cover statistics. Stop point 3 follows." }
    ]
  };
  var emPost = {
    label: "Check Event Monitor for post-thinning actions", subs: ["EVMON"], sec: "4.1.1.3", stop: 4,
    desc: "GRINCR calls EVMON with phase number 2 (IPH = 2). The logic matches the pre-thinning check, but EVTSTV loads the Group 2 and Group 5 variables, and the actions are computed from post-harvest conditions." 
  };
  var prepGrowth = {
    label: "Prepare for growth", subs: ["COMCUP", "COMPRS", "DFTMGO", "MPBGO", "DFBGO", "BWEGO", "TMBMAS"], sec: "4.1.1.3",
    desc: "COMCUP calls COMPRS to compress the tree list, which can be needed when thinning removes whole records. The insect and disease extensions then determine whether an outbreak occurs this cycle (DFTMGO, MPBGO, DFBGO, BWEGO, and TMBMAS for tussock moth biomass). GRINCR is then ready to predict growth and mortality."
  };
  var growLarge = {
    label: "Grow large trees: diameter, then height", subs: ["DGDRIV", "DGF", "HTGF"], sec: "4.2.1.1",
    desc: "Large-tree diameter growth and height growth are estimated for all tree records, and the small-tree equations later replace or blend them where they apply.",
    steps: [
      { label: "Diameter growth", subs: ["DGDRIV", "MULTS", "AUTCOR", "DGF", "DGSCOR", "CLGMULT"], sec: "4.2.1.1",
        desc: ["DGDRIV retrieves growth multipliers with MULTS, and the climate multiplier with CLGMULT. AUTCOR computes the variance and covariance multipliers for the autoregressive error term. DGF holds the species regressions (ln of basal area increment, stored in WK2). DGSCOR computes the error term, which is added, and the result is multiplied by the dwarf mistletoe effect and bounded.",
               "Estimates are on a 10-year basis and are rescaled to the cycle length in GRADD. In the ORGANON variants DGDRIV calls EXECUTE for valid ORGANON trees."] },
      { label: "Height growth", subs: ["HTGF", "MULTS", "HTCALC", "FINDAG"], sec: "4.2.1.1",
        desc: "HTGF has the same species and tree loop structure as DGF, retrieves height growth multipliers, and bounds each tree to the species maximum height (TRESZCP). Where site index curves are used, FINDAG estimates tree age, 10 years are added, and HTCALC gives the end-of-cycle height. Estimates are on a cycle-length basis." }
    ]
  };
  var growSmall = {
    label: "Grow small trees: height, then diameter", subs: ["REGENT", "DGBND", "DUBSCR"], sec: "4.2.1.2",
    desc: "REGENT estimates growth for trees below a threshold diameter. Afterwards every tree has a height and diameter growth estimate, from the large-tree equations, the small-tree equations or a weighted average.",
    steps: [
      { label: "Weight small- and large-tree height growth", sec: "4.2.1.2.1",
        desc: "Between the species diameters XMIN and XMAX the two height growth estimates are blended with the weight XWT, which rises linearly from 0 to 1 across that range. Below XMIN only the small-tree estimate is used and above XMAX only the large-tree estimate. Diameter growth is not blended: a species threshold diameter (for example BREAK(i)) decides which estimate is used." },
      { label: "Estimate height, then diameter growth", subs: ["MULTS", "CCFCAL"], sec: "4.2.1.2.2",
        desc: "Height growth comes from regressions fit over 10 years (5 years in NC), scaled to the cycle length. Diameter growth then comes from species height-diameter curves, on a 10-year basis. Variants fit to 5-year data divide the cycle into periods of at most 5 years and update stand density each period, calling CCFCAL for crown competition." },
      { label: "Apply FIXDG and FIXHTG", subs: ["OPFIND", "OPGET", "OPDONE"], sec: "4.2.1.2.2",
        desc: "GRINCR checks the growth estimates for compliance with any FIXDG or FIXHTG keyword records scheduled for the cycle." }
    ]
  };
  var mortality = {
    label: "Compute mortality", subs: ["MORTS"], sec: "4.2.1.3",
    desc: "MORTS estimates mortality that is not caused by insects, disease or fire. It reduces PROB(j) on each record. The Prognosis-type or SDI-based model is used, except in the ORGANON variants, which use ORGANON mortality for valid ORGANON trees.",
    steps: [
      { label: "Set maximum density and end-of-cycle QMD", subs: ["MULTS", "SDICAL"], sec: "4.2.1.3",
        desc: "Mortality multipliers (MORTMULT) are retrieved. If no maximum basal area was entered (BAMAX), SDICAL assigns one that matches the maximum SDI, which the climate extension needs. MORTS then estimates the quadratic mean diameter at the end of the cycle." },
      { label: "Prognosis-type model", sec: "4.2.1.3.1",
        desc: "Basal area increment is recalculated assuming a share of it is lost to mortality, equal to stand basal area divided by the basal area maximum. This gives the annual approach-to-maximum rate Rb. An individual rate Ra comes from habitat type, species, diameter, increment and relative diameter. The two are combined as described in the Essential FVS guide." },
      { label: "SDI-based model", subs: ["MSBMRT"], sec: "4.2.1.3.2",
        desc: "The number of trees to kill is estimated from the change in QMD and SDI relationships, using background mortality plus density-related mortality, which starts when stand SDI passes a threshold (default 55% of the maximum). Mortality is distributed to records and QMD is recomputed, iterating until QMD changes by 0.1 inch or less (at most 10 times). MSBMRT adds over-mature stand breakup mortality (MORTMSB)." },
      { label: "Adjustments for all models", subs: ["CLMORTS", "OPFIND", "OPGET", "OPDONE"], sec: "4.2.1.3.3",
        desc: "Background rates RI (with MORTMULT) or density rates RN are applied per record. Variant routines (VARMRT, SEAMRT, BMTMRT, NWCMRT, SCOMRT, TTMRT, UTMRT) distribute SDI-based mortality. A diameter limit (TREESZCP) adds senescence mortality, SDI-based runs keep basal area within 1 square foot of the maximum, CLMORTS applies climate effects, and FIXMORT requests are processed." }
    ]
  };
  var tripling = {
    label: "Triple records, apply fertilizer effects", subs: ["TRIPLE", "REASS", "FFERT"], sec: "4.3.1",
    desc: "Final tasks in GRINCR, which then returns to TREGRO.",
    steps: [
      { label: "Triple tree records (if requested)", subs: ["TRIPLE", "MISGET", "MISPUT", "FMTRIP", "SVTRIP"], sec: "4.3.1",
        desc: "TRIPLE splits each record into three, appended in order (record 1 becomes records 31 and 32 if there are 30 live records). Growth was already tripled in DGDRIV and REGENT, and the extensions' records, such as mistletoe ratings and snags, are tripled too." },
      { label: "Realign pointers", subs: ["REASS"], sec: "4.3.1", desc: "REASS resets IND(k), IND1(k) and ISCT(k1,k2) after tripling." },
      { label: "Fertilizer effects on growth", subs: ["FFERT"], sec: "4.3.1",
        desc: "FFERT adjusts diameter and height growth for FERTILIZ treatments. Because it is called after MORTS, fertilizer does not change mortality through competition." }
    ]
  };
  var disturb = {
    label: "Adjust growth and mortality for fire, insect and pathogen impacts", subs: ["GRADD"], sec: "4.4.1", stop: 5,
    desc: "TREGRO calls GRADD. The active extensions may modify or replace the growth and mortality estimates made so far. Disturbances can also be modeled outside FVS and applied through the API after a stop (section 8.0).",
    steps: [
      { label: "Mountain pine beetle and Douglas-fir beetle", subs: ["MPBCUP", "DFBWIN", "DFBDRV"], sec: "4.4.1",
        desc: "If an outbreak occurs this cycle, MPBCUP applies mountain pine beetle effects and DFBDRV applies Douglas-fir beetle effects (DFBWIN checks for a Douglas-fir beetle outbreak window). Diameter growth must be on a per-year basis when these are called." },
      { label: "Dwarf mistletoe", subs: ["MISTOE"], sec: "4.4.1", desc: "Diameter growth is scaled to a FINT-year basis, then MISTOE applies dwarf mistletoe effects." },
      { label: "Tussock moth and budworm", subs: ["TMCOUP", "BWECUP"], sec: "4.4.1",
        desc: "TMCOUP applies Douglas-fir tussock moth effects if an outbreak occurs this cycle, and BWECUP is the interface to the western spruce budworm (BUDLITE) model." },
      { label: "Fire, blister rust and root disease", subs: ["FMMAIN", "FMKILL", "BRTREG", "RDTREG", "OPSTUS"], sec: "4.4.1",
        desc: "The fire model runs (FMMAIN, with FMKILL before and after the rust and root disease calls), blister rust (BRTREG) and western root disease (RDTREG) run, and OPSTUS checks whether a SIMFIRE was scheduled this cycle." },
      { label: "Height growth stops", subs: ["HTGSTP"], sec: "4.4.1",
        desc: "HTGSTP processes HTGSTOP and FIXHTG records, which can modify or stop height growth and can stand in for an insect extension such as tussock moth or budworm." },
      { label: "Update mortality visualization", subs: ["SVMORT", "SVRMOV"], sec: "4.5.1",
        desc: "SVMORT updates the stand visualization file for this cycle's mortality, treating mortality trees as standing snags. Stop point 5 follows." }
    ]
  };
  var update = {
    label: "Update tree records", subs: ["UPDATE", "RDPSRT", "DENSE"], sec: "4.5.1", stop: 6,
    desc: "FVS is finished estimating growth and mortality. GRADD now applies the estimates to the tree descriptions and recalculates the stand statistics.",
    steps: [
      { label: "Apply growth and mortality", subs: ["UPDATE", "VOLS", "PCTILE", "DIST", "COMP"], sec: "4.5.1",
        desc: "UPDATE adds increments (rescaling growth to the cycle length) and deducts mortality. Height, normal height and PROB are updated at the start, and diameter last, because VOLS accounts for diameter growth. UPDATE also computes volume statistics, the mortality volume array SPCMO(sp,vc), its percentile points and composition." },
      { label: "Re-sort and recompute density", subs: ["RDPSRT", "DENSE"], sec: "4.5.1", desc: "RDPSRT re-sorts the records by updated diameter and DENSE recomputes the density statistics." },
      { label: "Cover model, tree ages", subs: ["CVGO", "CVBROW"], sec: "4.5.1", desc: "If the cover extension is active, CVBROW computes shrub density and browse statistics. The tree age array ABIRTH(j) is advanced by the cycle length. Stop point 6 follows." }
    ]
  };
  var regen = {
    label: "Add regeneration", subs: ["CLAUESTB", "ESNUTR", "ESTAB"], sec: "4.6.1",
    desc: "The establishment extension is part of every variant. Regeneration is added near the end of the cycle, and section 10.0 describes the model in more detail.",
    steps: [
      { label: "Climate-driven regeneration", subs: ["CLAUESTB"], sec: "4.6.1", desc: "If the climate extension is active, CLAUESTB adds PLANT activities for regeneration caused by climate change, which ESNUTR then processes." },
      { label: "Stump and root sprouts", subs: ["ESCPRS", "COMPRS", "ESUCKR", "ESSPRT"], sec: "4.6.1.1",
        desc: "If needed, ESCPRS compresses the tree list to about half of MAXTRE. ESUCKR then creates sprout records for harvested sprouting species, using ESSPRT, SPRTHT and CWCALC, and the sorts are reset." },
      { label: "Regeneration tallies", subs: ["ESNUTR", "OPDONE"], sec: "4.6.1.2", desc: "ESNUTR checks for tallies, which are automatic in the full establishment model or requested with TALLY, TALLYONE, TALLYTWO or ESTAB. ADDTREES records add trees from an external source (ESADDT)." },
      { label: "Natural regeneration and planting", subs: ["ESTAB", "ESTOCK", "ESPADV", "ESPSUB", "ESPXCS", "ESTPP", "ESNSPE", "ESGENT"], sec: "4.6.1.3",
        desc: ["ESTAB replicates the inventory plots to at least 50 plots of 1/300 acre, processes site preparation (ESETPR, ESPREP), checks PLANT and NATURAL requests, and accumulates shading adjustments.",
               "It then creates the records plot by plot: natural regeneration first in the full model (stocking probability, advanced, subsequent and excess species, number of trees and species per plot, heights), then planted trees, then the best trees. The records are passed to the FVS tree list (compressing it first if needed) and ESGENT grows them with REGENT from age 5 to the end of the cycle."] },
      { label: "Update after establishment", subs: ["RDPSRT", "SVESTB", "ECCALC", "DENSE"], sec: "4.6.1.3.2",
        desc: "ESNUTR resets the diameter sort. GRADD then updates the visualization for the new trees (SVESTB), calculates costs and revenues for the economics extension (ECCALC), and recomputes density (DENSE)." }
    ]
  };
  var crown = {
    label: "Compute crown ratio change", subs: ["CROWN", "CWIDTH", "CWCALC"], sec: "4.7.1",
    desc: "Crown ratio and crown width are the last tree attributes estimated in a cycle. Crown ratio increase is bounded to 1% per year of the cycle, or the amount possible if all height growth goes to crown, whichever is less.",
    steps: [
      { label: "Change in crown ratio", subs: ["CROWN", "BGCFVS"], sec: "4.7.1", desc: "CROWN loops over species and records, and the model type depends on the variant. If the BGC extension is used, BGCFVS replaces the crown widths." },
      { label: "Update crown width", subs: ["CWIDTH", "CWCALC"], sec: "4.7.1", desc: "CWIDTH loops over all records, using user coefficients (CWEQN) or calling CWCALC, which holds the numbered equations. There are two versions of CWCALC, western (NI directory) and eastern (LS directory)." },
      { label: "Cover and distribution updates", subs: ["CVCNOP", "PCTILE", "DIST", "COMP"], sec: "4.7.1", desc: "If the cover extension is active, CVCNOP computes crown area and foliage biomass. GRADD then updates the distributions and percentile points of the attributes that changed, and returns to TREGRO and FVS." }
    ]
  };
  var endCycle = {
    label: "Update stand characteristics", subs: ["EXTREE", "DISPLY", "RESAGE"], sec: "4.8.1",
    desc: "FVS completes the end-of-cycle updating of output tables and files.",
    steps: [
      { label: "Select example trees", subs: ["EXTREE"], sec: "4.8.1", desc: "EXTREE loads the output arrays for the example trees. The subscripts are held in INS(i), loaded by DIST." },
      { label: "Write stand and tree statistics", subs: ["DISPLY", "FORTYP", "SDICAL"], sec: "4.8.1", desc: "DISPLY writes the stand composition, sample tree and summary statistics tables. It checks ICL6 to know whether the projection is complete (ICL6 < 0)." },
      { label: "Reset stand age", subs: ["RESAGE"], sec: "4.8.1", desc: "RESAGE resets the stand age if RESETAGE keyword records were used." },
      { label: "Extension output", subs: ["MISPRT", "RDPR", "BRPR"], sec: "4.8.1", desc: "MISPRT, RDPR and BRPR write the end-of-cycle values for dwarf mistletoe, root disease and blister rust." },
      { label: "Write tree lists and files", subs: ["PRTRLS", "FVSSTD", "NATCRZ"], sec: "4.8.1", desc: "The tree list (TREELIST), the FVSStand file (FVSSTAND) and the National Cruise Program file (CRUZFILE) are written if requested." },
      { label: "Run system calls", sec: "4.8.1", desc: "Commands entered with the SYSTEM keyword record are found and run for the cycle." }
    ]
  };
  var cycle = { kind: "loop", label: "Repeat for each projection cycle", exit: "No", steps: [
    cycleSetup, emPre, thinning, emPost, prepGrowth, growLarge, growSmall, mortality, tripling, disturb, update, regen, crown, endCycle,
    { kind: "decision", label: "More cycles?", loopBack: true, yes: "Yes", sec: "4.8.1", desc: "FVS checks whether this was the last cycle (ICYC = NCYC). If not, ICYC is incremented and the cycle starts over. NCYC defaults to 1 and can be set from 2 to 40 with NUMCYCLE." }
  ] };

  window.FVS_SEQUENCE = {
    stops: stops,
    main: [
      processKeywords, readInput, initialChars, backdate, calibrate, finishInit,
      cycle,
      finalReports
    ],
    related: [relMultiStand, relOptions, relEvents, relRpn, relStopPoint, relRestart, relApi]
  };
})();
