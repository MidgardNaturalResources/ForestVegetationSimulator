      SUBROUTINE INVREF
      IMPLICIT NONE
C----------------------------------------------------------------------
C  ROUTINE TO OUTPUT INVENTORY REFERENCE INFORMATION
C
      INCLUDE 'PLOT.F77'

      IF(.NOT.LFIANVB) RETURN

      CALL DBSCASE(1)