       SUBROUTINE NVBEQ (SPCD, VOLEQ)
       IMPLICIT NONE

       INCLUDE 'PRGPRM.F77'
       INCLUDE 'PLOT.F77'
       INCLUDE 'CONTRL.F77'
       INCLUDE 'VARCOM.F77'

C-------- File automatically generated from python script ----------

       CHARACTER(LEN=10) DIVISION, VOLEQ
       CHARACTER(LEN=4) SppID, DivSplit
       CHARACTER(LEN=10) DIVS(15)
       INTEGER I, J, M, N, idx, SPCD
       INTEGER, DIMENSION(32, 16) :: SPPDIV
       LOGICAL validDivSpp


       DATA (DIVS(I), I=1,15) /
     & '130 ', '210 ', '220 ', '240 ', '260 ', 
     & '310 ', '330 ', '340 ', 'M130', 'M210', 
     & 'M240', 'M260', 'M310', 'M330', 'M340'/

       DATA ((SPPDIV(M,N), N=1,16), M=1,32) /
     &  11, 4, 10, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  15, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  19, 9, 10, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  42, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  73, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  93, 9, 10, 11, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  108, 1, 7, 9, 10, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  119, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  122, 6, 7, 10, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 
     &  202, 1, 4, 5, 8, 10, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 
     &  231, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  242, 4, 8, 10, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  263, 4, 8, 10, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  264, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  299, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  312, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  324, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  351, 11, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  375, 1, 2, 3, 9, 10, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  431, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  492, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  746, 1, 2, 3, 9, 10, 11, 14, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  747, 1, 9, 10, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  760, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  815, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  920, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  998, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0/

        idx = -1
        validDivSpp = .FALSE.
        DivSplit = '0000'
        DIVISION = ECOREG
        do i=1, size(DIVS)
          if (adjustl(DIVS(i)) .EQ. DIVISION) idx = i
        end do

        if (idx .GT. 0) then
          do i= 1,size(SPPDIV, dim= 1)
            if ( SPPDIV(i,1) .EQ. SPCD) THEN
              do j = 2, size(SPPDIV, dim=2)
                if ( SPPDIV(i,j) .EQ. IDX) validDivSpp = .TRUE.
              end do
            end if
          end do
        end if

        if (validDivSpp) then
          DIVISION = ADJUSTL(DIVISION)
          IF (LEN_TRIM(DIVISION) .LT. 4) DIVISION ='0'//TRIM(DIVISION)
          DivSplit = TRIM(DIVISION)
        end if

        write(SppID, FMT='(I4)') SPCD
        SppID = ADJUSTL(SppID)

        DO WHILE (LEN_TRIM(SppID) .LT. 3)
          SppID = '0' // TRIM(SppID)
        END DO

        VOLEQ = 'NVB' // DivSplit // TRIM(SppID)

       END
