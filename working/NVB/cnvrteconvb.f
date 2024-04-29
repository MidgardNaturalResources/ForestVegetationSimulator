      SUBROUTINE CNVRTECONVB(ECOCD)
      IMPLICIT NONE

C ------------------------------
C     TAKES ECOREGION FORMAT OF C###Cc AND CONVERTS TO 
C       FORMAT OF C##0

      CHARACTER(LEN=10) ECOCD
      INTEGER last
  
      ECOCD = ADJUSTR(ECOCD)
      last = scan(ECOCD, '0123456789', .TRUE.)
      ECOCD(last:last) = '0'
      ECOCD = ADJUSTL(ECOCD(:last))

      RETURN
      END