      SUBROUTINE VALIDATEECODIVISION(DIV)
      IMPLICIT NONE

      CHARACTER(LEN=*) DIV
      CHARACTER(LEN=4) DIVS(19),CHECK
      INTEGER I
      LOGICAL VALIDDIV


      DATA (DIVS(I), I=1,19) /
     &  "130 ", "210 ", "220 ", "230 ", "240 ",
     &  "250 ", "260 ", "310 ", "330 ", "340 ",
     &  "M130", "M210", "M220", "M230", "M240",
     &  "M260", "M310", "M330", "M340"/
      
      VALIDDIV = .FALSE.
      
      CHECK = ADJUSTL(DIV)
      I = SCAN(CHECK, '0123456789', .TRUE.)
      SELECT CASE (I)
      CASE (3,4)
        CHECK(I:I) = '0'
        CHECK = CHECK(:I)
        
        DO I=1,19
          IF (CHECK .EQ. DIVS(I)) VALIDDIV = .TRUE.
        END DO

      CASE DEFAULT 

      END SELECT

      IF (.NOT. VALIDDIV) THEN 
        CHECK = ''
        CALL ERRGRO(.TRUE., 54)
      END IF

      DIV = CHECK

      RETURN

      END