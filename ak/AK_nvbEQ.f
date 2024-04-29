       SUBROUTINE NVBEQ (SPCD, VOLEQ)
       IMPLICIT NONE

       INCLUDE 'PRGPRM.F77'
       INCLUDE 'PLOT.F77'
       INCLUDE 'CONTRL.F77'
       INCLUDE 'VARCOM.F77'

C-------- File automatically generated from python script ----------

       CHARACTER(LEN=10) DIVISION, VOLEQ
       CHARACTER(LEN=4) SppID, DivSplit
       CHARACTER(LEN=10) DIVS(10)
       INTEGER I, J, M, N, idx, SPCD
       INTEGER, DIMENSION(22, 11) :: SPPDIV
       LOGICAL validDivSpp


       DATA (DIVS(I), I=1,10) /
     & '130 ', '210 ', '220 ', '240 ', '330 ', 
     & '340 ', 'M130', 'M210', 'M240', 'M330'/

       DATA ((SPPDIV(M,N), N=1,11), M=1,22) /
     &  11, 4, 8, 9, 0, 0, 0, 0, 0, 0, 0, 
     &  19, 7, 8, 9, 10, 0, 0, 0, 0, 0, 0, 
     &  42, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  71, 1, 2, 7, 8, 10, 0, 0, 0, 0, 0, 
     &  94, 1, 2, 3, 7, 0, 0, 0, 0, 0, 0, 
     &  95, 1, 2, 7, 0, 0, 0, 0, 0, 0, 0, 
     &  98, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  108, 1, 5, 7, 8, 9, 10, 0, 0, 0, 0, 
     &  242, 4, 6, 8, 9, 10, 0, 0, 0, 0, 0, 
     &  263, 4, 6, 8, 9, 10, 0, 0, 0, 0, 0, 
     &  264, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  299, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  350, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  351, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  375, 1, 2, 3, 7, 8, 10, 0, 0, 0, 0, 
     &  376, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  741, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  746, 1, 2, 3, 7, 8, 9, 10, 0, 0, 0, 
     &  747, 1, 7, 8, 10, 0, 0, 0, 0, 0, 0, 
     &  920, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  928, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
     &  998, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0/

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
