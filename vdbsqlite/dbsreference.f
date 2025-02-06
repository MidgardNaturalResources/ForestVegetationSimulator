      SUBROUTINE DBSREFERENCE
      IMPLICIT NONE
C----------------------------------------------------------------------
C  ROUTINE TO OUTPUT INVENTORY REFERENCE INFORMATION
C
      INCLUDE 'PRGPRM.F77'
      INCLUDE 'DBSCOM.F77'
      INCLUDE 'CONTRL.F77'
      INCLUDE 'PLOT.F77'
      INCLUDE 'VOLSTD.F77'

      INTEGER iRet, ColNumber, iInvRef, I, SPPNUM
      DOUBLE PRECISION FORMCLS,SPPSDI,STIDX,MIND,MERCHTOPD,STUMP,
     >                 SAWD,SAWTD,SAWSTMP,BFD,BFTD,BFSTUMP
      CHARACTER*4    SPPFVS,SPPPLTS
      CHARACTER*5    SPPFIA
      CHARACTER*2000 SQLStmtStr
      CHARACTER*20   TABLENAME

      INTEGER fsql3_tableexists,fsql3_exec,fsql3_bind_int,fsql3_step,
     >        fsql3_prepare,fsql3_bind_double,fsql3_finalize

C      IF(.NOT.LFIANVB) RETURN

      CALL DBSCASE(1)

      TABLENAME = 'FVS_InvReference'

      iRet=fsql3_tableexists(IoutDBref,TRIM(TABLENAME)//CHAR(0))
      IF(iRet.EQ.0) THEN
        SQLStmtStr='CREATE TABLE '//TRIM(TABLENAME)//
     -             ' (CaseID text not null, '//
     -             'StandID text not null, '//
     -             'SpeciesNum int, '//
     -             'SpeciesFVS text, '//
     -             'SpeciesPlants text, '//
     -             'SpeciesFIA text, '//
     -             'FormClass real, '//
     -             'SDIMax real, '//
     -             'SiteIndex real, '//
     -             'CFVolEq text, '//
     -             'MinDBH real, '//
     -             'TopDia real, '//
     -             'Stump real, '//
     -             'SawMinDBH real, '//
     -             'SawTopDia real, '//
     -             'SawStump real, '//
     -             'BFVolEq text, '//
     -             'BFMinDBH real, '//
     -             'BFTopDia real, '//
     -             'BFStump real);'//CHAR(0)

        iRet=fsql3_exec(IoutDBref, SQLStmtStr)
        IF(iRet.NE.0) THEN 
          iInvRef=0
          RETURN
        ENDIF
      ENDIF

      DO I=1,MAXSP
        FORMCLS=FRMCLS(I)
        SPPSDI=SDIDEF(I)
        STIDX=SITEAR(I)
        MIND=DBHMIN(I)
        MERCHTOPD=TOPD(I)
        STUMP=STMP(I)
        SAWD=SCFMIND(I)
        SAWTD=SCFTOPD(I)
        SAWSTMP=SCFSTMP(I)
        BFD=BFMIND(I)
        BFTD=BFTOPD(I)
        BFSTUMP=BFSTMP(I)

        SQLStmtStr='INSERT INTO '//TRIM(TABLENAME)//
     -             ' (CaseID,StandID,'//
     -             'SpeciesNum,SpeciesFVS,SpeciesPlants,SpeciesFIA,'//
     -             'FormClass,SDIMax,SiteIndex,'//
     -             'CFVolEq,MinDBH,TopDia,Stump,'//
     -             'SawMinDBH,SawTopDia,SawStump,'//
     -             'BFVolEQ,BFMinDBH,BFTopDia,BFStump)'//
     -             " VALUES('"//CASEID//"','"//TRIM(NPLT)//"',"//
     -             "?,'"//TRIM(JSP(I))//"','"//TRIM(PLNJSP(I))//"','"//
     -             TRIM(FIAJSP(I))//"',"// 
     -             '?,?,?,'//
     -             "'"//TRIM(VEQNNC(I))//"',?,?,?,"//
     -             '?,?,?,'//
     -             "'"//TRIM(VEQNNB(I))//"',?,?,?);"//CHAR(0)

        iRet=fsql3_prepare(IoutDBref,SQLStmtStr)
        IF(iRet.NE.0) THEN 
          iInvRef=0
          RETURN
        ENDIF

        ColNumber = 1
        iRet= fsql3_bind_int(IoutDBref,ColNumber,I)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,FORMCLS)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,SPPSDI)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,STIDX)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,MIND)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,MERCHTOPD)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,STUMP)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,SAWD)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,SAWTD)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,SAWSTMP)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,BFD)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,BFTD)

        ColNumber = ColNumber + 1
        iRet= fsql3_bind_double(IoutDBref,ColNumber,BFSTUMP)

        iRet= fsql3_step(IoutDBref)
      ENDDO
      iRet= fsql3_finalize(IoutDBref)
      IF(iRet.NE.0) iInvRef = 0

      RETURN
      END