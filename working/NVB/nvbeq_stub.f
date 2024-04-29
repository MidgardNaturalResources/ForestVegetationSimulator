      SUBROUTINE NVBEQ (KARD2,ARRAY2)
      IMPLICIT NONE
C----------
C
C     
C----------
COMMONS
C
C
      INCLUDE 'PRGPRM.F77'
C
C
      INCLUDE 'PLOT.F77'
C
C
      INCLUDE 'CONTRL.F77'
C
C
      INCLUDE 'VARCOM.F77'
C
C
COMMONS
C---------
      CHARACTER*10 KARD2
      INTEGER ARRAY2
      CHARACTER*4 DIVS(10)
      INTEGER SPPDIV(22:10)
      LOGICAL DEBUG
C----------
      DATA (DIVS)/
C --- IDX 1      2        3       4       5
     & ' 130', 'M130', ' 210', 'M210', ' 220',
C ---     6      7        8       9      10
     & ' 240', 'M240', ' 330', 'M330', ' 340'/

      DATA (SPPDIV(:, 1))/
     &  11,  19,  42,  71,  94,  95,  98, 108, 242, 263,
     & 264, 299, 350, 351, 375, 376, 741, 746, 747, 920,
     & 928, 998/

C ---- VALID DIVS INDEXS FOR SPP 11
      DATA (SPPDIV(1, :))/
     & 4, 6, 7, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 19
      DATA (SPPDIV(2, :))/
     & 2, 4, 7, 9, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 42
      DATA (SPPDIV(3, :))/
     & 7, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 71
      DATA (SPPDIV(4, :))/
     & 1, 2, 3, 4, 9,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 94
      DATA (SPPDIV(5, :))/
     & 1, 2, 3, 5, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 95
      DATA (SPPDIV(6, :))/
     & 1, 2, 3, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 98
      DATA (SPPDIV(7, :))/
     & 7, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 108
      DATA (SPPDIV(8, :))/
     & 1, 2, 4, 7, 8,
     & 9, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 242
      DATA (SPPDIV(9, :))/
     & 4, 6, 7, 9, 10,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 263
      DATA (SPPDIV(10, :))/
     & 4, 6, 7, 9, 10,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 264
      DATA (SPPDIV(11, :))/
     & 7, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 299
      DATA (SPPDIV(12, :))/
     & 0, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 350
      DATA (SPPDIV(13, :))/
     & 0, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 351
      DATA (SPPDIV(14, :))/
     & 7, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 375
      DATA (SPPDIV(15, :))/
     & 1, 2, 3, 4, 5,
     & 9, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 376
      DATA (SPPDIV(16, :))/
     & 0, 0, 0, 0, 0,
     & 9, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 741
      DATA (SPPDIV(17, :))/
     & 1, 3, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 746
      DATA (SPPDIV(18, :))/
     & 1, 2, 3, 4, 5,
     & 7, 9, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 747
      DATA (SPPDIV(19, :))/
     & 1, 2, 4, 9, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 920
      DATA (SPPDIV(20, :))/
     & 0, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 928
      DATA (SPPDIV(21, :))/
     & 0, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/

C ---- VALID DIVS INDEXS FOR SPP 998
      DATA (SPPDIV(22, :))/
     & 0, 0, 0, 0, 0,
     & 0, 0, 0, 0, 0/



C-----------
C  CHECK FOR DEBUG.
C-----------
      CALL DBCHK (DEBUG,'NVBEQ',6,ICYC)
      IF(DEBUG) WRITE(JOSTND,*)
     &'ENTERING HABTYP CYCLE,KODTYP,KODFOR,KARD2,ARRAY2= ',
     &ICYC,KODTYP,KODFOR,KARD2,ARRAY2
C----------
C  DECODE HABITAT TYPE/PLANT ASSOCIATION FIELD.
C----------
      CALL HBDECD (KODTYP,SNECU(1),NPA,ARRAY2,KARD2)
      IF(DEBUG)WRITE(JOSTND,*)'AFTER HAB DECODE,KODTYP= ',KODTYP
      IF (KODTYP .LE. 0) GO TO 20
C
      PCOM = SNECU(KODTYP)
      ITYPE=KODTYP
      IF(LSTART)WRITE(JOSTND,10) PCOM
   10 FORMAT(/,T12,'ECOLOGICAL UNIT CODE USED IN THIS',
     &' PROJECTION IS ',A8)
      GO TO 40
C----------
C  NO MATCH WAS FOUND, TREAT IT AS A SEQUENCE NUMBER.
C----------
   20 CONTINUE
      IF(DEBUG)WRITE(JOSTND,*)'EXAMINING FOR INDEX, ARRAY2= ',ARRAY2
      IHB = IFIX(ARRAY2)
      IF(IHB.GT.0 .AND. IHB.LE.NPA)THEN
        KODTYP=IHB
        ITYPE=IHB
        PCOM = SNECU(KODTYP)
        GO TO 40
      ELSE
        ITYPE=122
        GO TO 30
      ENDIF
C----------
C  DEFAULT CONDITIONS --- ECOLOGICAL UNIT = 231DD
C----------
   30 CONTINUE
      CALL ERRGRO(.TRUE.,14)
      KODTYP=ITYPE
      PCOM = SNECU(KODTYP)
      IF(LSTART)WRITE(JOSTND,10) PCOM
C
   40 CONTINUE
      ICL5=KODTYP
      KARD2=PCOM
C
      IF(DEBUG)WRITE(JOSTND,*)'LEAVING HABTYP KODTYP,ITYPE,ICL5,KARD2',
     &' PCOM =',KODTYP,ITYPE,ICL5,KARD2,PCOM
      RETURN
      END
