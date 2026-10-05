CODE SEGMENT GLBLCNTL
C----------
C NOTE: This is a copy of common/GLBLCNTL.F77 with suggested
C revisions to the comments only. No declarations or code are changed.
C----------
C COMMON $Id$
C----------
C
      character(len=250) :: keywordfile,restartfile,stopptfile
C    
      integer :: firstWrite,fvsRtnCode,jdstash,jstash,majorstopptcode,
     &  majorstopptyear,maxStoppts,minorstopptcode,minorstopptyear,
     &  originalRestartCode,oldstopyr,readFilePos,restartcode,
     &  seekReadPos,stopstatcd
C
      common /GLBLCNTLC/ keywordfile,restartfile,stopptfile
C
      common /GLBLCNTL/ firstWrite,fvsRtnCode,jdstash,jstash,
     &  majorstopptcode,majorstopptyear,maxStoppts,minorstopptcode,
     &  minorstopptyear,oldstopyr,originalRestartCode,readFilePos,
     &  restartCode,seekReadPos,stopstatcd
C
C----------
C  VARIABLE DEFINITIONS:
C----------
C
C  The stop/restart variables are described in section 8.0 of "Model
C  Structure of the Forest Vegetation Simulator".
C
C  There are two kinds of requested stops, "major" and "minor".
C
C    major (stopWithStore):  set with the command line option
C         --stoppoint=code,year,file. The stand state is written to
C         the stop point file (PUTSTD) and the stop can be resumed later
C         with --restart=file, in this or a later run.
C    minor (stopWithoutStore):  set with fvsSetStoppointCodes (this is what
C         rFVS fvsRun does). Nothing is written. The stand state stays in
C         memory (the COMMON blocks) and FVS is resumed by calling it
C         again. fvsRun(7,0), for example, is a minor stop point.
C
C  The stop point location codes (also used as restart codes) are:
C
C     1 = Stop just before the first call to the Event Monitor
C         (phase 1, before thinning). In GRINCR.
C     2 = Stop just after the first call to the Event Monitor and
C         before CUTS (thinning). In GRINCR.
C     3 = Stop after CUTS and just before the second call to the Event
C         Monitor (phase 2). In GRINCR.
C     4 = Stop just after the second call to the Event Monitor and
C         before growth is estimated. In GRINCR.
C     5 = Stop after growth and mortality have been estimated, and
C         adjusted for disturbances and pests, but before UPDATE
C         applies them. In GRADD.
C     6 = Stop after UPDATE and the density statistics, just before
C         the regeneration establishment routines (ESTAB) are called.
C         In GRADD.
C     7 = Stop after the input data have been read and prepared
C         (activity schedule, species sort, trees per acre expansion)
C         and before missing values are dubbed and the model is
C         calibrated (CRATET). In FVS, in cycle 0. The year test (see
C         minorstopptyear) is made against the first cycle.
C   100 = Not a location. It is the restart code returned when a stand has
C         ended (fvsStopPoint is called internally with -1 at that point).
C
C  The codes in the requests below are:
C
C      majorstopptcode = stoppoint request code (stopWithStore).
C                        0 = no stop. 1 through 7 = stop at that location.
C                       -1 = stop at the first stop point reached in the
C                            selected cycle (the run ends there, so this is
C                            the first stop point of the cycle).
C                        The command line input is limited to -1 through
C                        maxStoppts.
C      majorstopptyear = stoppoint year request (stopWithStore).
C                        0 = never stop. (A year of 0 disables a major
C                            stop point.)
C                       <0 = no year test, stop at the first matching
C                            stop point (the first cycle).
C                       >0 = stop in the cycle that contains the year.
C      minorstopptcode = stoppoint request code (stopWithoutStore).
C                        0 = never stop.
C                       -1 = stop at every stop point (the program can be
C                            called again and will stop at the next one).
C                       1 through maxStoppts = stop at that location. A
C                            code greater than maxStoppts never matches.
C      minorstopptyear = stoppoint year request (stopWithoutStore).
C                        <=0 = no year test, stop in every cycle (0 does
C                            NOT disable a minor stop point; to turn it
C                            off set minorstopptcode to 0).
C                        >0 = stop only in the cycle that contains the year.
C                        For stop point 7 a year >0 must be in the first
C                        cycle or the stop is never made.
C           maxStoppts = the largest stop point location code (7). It
C                        limits the code given on the command line, and is
C                        not tested against minorstopptcode.
C           fvsRtnCode = -1 no start up has happened.
C                         0 if all is well, continue processing,
C                         1 if there is a error, return to caller,
C                         2 if STOP was found on the keyword file
C                           or EOF on the restart file.
C                           (not an error, but do not continue).
C          restartcode = restart code. This value is the location code
C                        where the processing ended. That is, it is the
C                        value of minor|major stopptcode when the program
C                        returned to the caller. 0 if there was no stop.
C                        100 when a stand has ended. Negative (the
C                        original restart code with the sign changed)
C                        right after a stand is reloaded from a stop point
C                        file, so that the caller can inspect it; the next
C                        call to FVS then continues from the stop point.
C                        If -1, then processing should stop.
C  originalRestartCode = restart code used when a stopWithStore was done.
C                        It is the code stored in the stop point file.
C          stopstatcd = 0=no stop has been "caused" (this is the initial
C                       condition).
C                       1=stop was caused by a stopWithStore
C                       2=stop was caused by a simulation end signal
C                         (fvsStopPoint called with -1 at the end of a
C                         stand)
C                       3=stop was caused by a stopWithoutStore
C                       4=stop was caused by a the reload of a stand
C           stopptfile = stoppoint file name. If blank, or [none], the
C                        program does not write a stoppoint file, it
C                        simply returns. A major stop is also not made
C                        if this is blank.
C          restartfile = restart file name. If blank, the program assumes
C                        that its memory state is consistent with the
C                        last check point.
C          keywordfile = keyword file name. When restarting, it is the name
C                        stored in the restart file.
C               jstash = stoppoint file unit number (71). If -1, then no
C                        file is output. The file is a binary stream
C                        written by PUTSTD.
C              jdstash = restart file unit number (72). If -1, then no
C                        file can be read. The file is a binary stream
C                        read by GETSTD.
C           firstWrite = 1 if putstd has not yet happened once, 0 if it has
C            oldstopyr = if restarting form a restart file, it is the stop
C                        year from the last run. -1 otherwise. This value is
C                        used to signal if the program is running from a
C                        restart file verses from a keyword file.
C          readFilePos = The file position where the current stand starts,
C                        can be used to recall the stand for another
C                        alternative (fvsRestartLastStand).
C          seekReadPos = A semaphore, readFilePos for first read, -1 for
C                        rest of current stand. This supports re-reading a
C                        stand.
C
C-----END SEGMENT
