var dap1=[1,2,1,2,1];
var dap2=[1,4];
var quiz_tot=2;
var munNum=1;
var audio=null;
var ox_num=0;


$(function(){
    oxInit_fn();
    charView_fn("qman");
    $("#loadCtn").hide();
    const video0 = $("#video")[0];
    $("#video").on("play", function () {  
        // 이전 재생이 끝난 후인지 확인
        if (video0.currentTime === 0) {
            $("#loadCtn").hide();
            $(video0).show();
            $(video0).on("timeupdate.custom", function () {
                const remainingTime = video0.duration - video0.currentTime;
    
                if (remainingTime <= 0.1) { // 종료 100ms 이전
                    video0.pause(); // 비디오 멈춤
                    munNum=1;
                    $("#video").hide(); // 비디오 숨기기
                    $("#loadCtn").show(); // 로딩 컨테이너 표시
                    // 이벤트 중복 실행 방지를 위해 off 처리
                    $(this).off("timeupdate.custom");
                }
            });
        }
    });
    var quiz_bool=true;
    var qImage="./img/qman.png";
    var oImage="./img/oman.png";
    var xImage="./img/xman.png";
    var dap=eval("dap"+munNum);
    console.log("Current munNum:", munNum); // 문제 번호 확인
    console.log("dap evaluated:", eval("dap" + munNum)); // dap 값을 평가

    var delay_sec =1200;
    var charViewing_bool=false;
    // 타이머 ID를 저장할 변수
    let timeoutId;

    var sel_idx=-1;
    $(".Section").hide();
    $(".Section.quiz"+munNum).show();
    $(".ChkBtn").click(function(){//1번 문제(ox버튼) 버튼 클릭
        if(!quiz_bool) return;
        const parentDiv = $(this).closest(".oxQuiz");
        const index = parentDiv.find(".ChkBtn").index(this);
        resetChkBtn();
        $(this).addClass("on");
        if(chkDap_fn(index+1)){//정답이면
            quiz_bool=false;
            charView_fn("oman");
            timeoutId=setTimeout(() => {
                quiz_bool=true;
                oxNext_fn();
                charView_fn("qman");
            }, delay_sec);
        }else{//오답이면
            charView_fn("xman");
            quiz_bool=false;
            delayRetryOx_fn();
        }
    })
    $(".Btn").click(function () { // 2번 문제 버튼 클릭
        if (!quiz_bool) return; // 클릭 차단
        
        const index = $(".Btn").index(this); // 클릭된 버튼의 인덱스 확인
        sel_idx = index;
        resetXBtn_fn();
        if ($(this).find("img").length > 0) {
            $(this).addClass("on");
        }
    
        if (chkDap_fn2(index + 1)) { // 개별 정답 확인
            console.log(`Button ${index + 1} is correct.`);
            charView_fn("oman"); // 부분 정답 캐릭터 표시
            clearTimeout(timeoutId);
    
            if (chkAllDap_fn2()) { // 모두 정답인지 확인
                console.log("All answers are correct.");
                quiz_bool = false; // 추가 클릭 차단
                delayNote_fn(); // 다음 단계로 진행
            } else { // 아직 모든 정답을 맞추지 않은 경우
                timeoutId = setTimeout(() => {
                    charView_fn("qman"); // 기본 캐릭터로 복원
                }, delay_sec);
            }
        } else { // 오답 처리
            console.log(`Button ${index + 1} is incorrect.`);
            clearTimeout(timeoutId);
            charView_fn("xman");
            delayResetSelBtn(index);
        }
    });

    $(".retry-button").click(function(){//다시 풀기
        $("#Popup").hide();
        retryMun_fn();
    });
    $("#nextQuizButton").click(function(){//다음 문제로 이동
        $("#Popup").hide();
        nxtMun_fn();
    });
    function oxInit_fn(){
        ox_num=1;
        $(".oxQuiz .prev_btn").hide();
        $(".oxQuiz").hide();
        $(".oxQuiz").eq(0).show();
        console.log("ox_num initialized to:", ox_num); // 디버그 로그

    }
    function oxNext_fn(){
        $(".oxQuiz .prev_btn").show();
        if(ox_num<5){
            $(".oxQuiz").hide();
            $(".oxQuiz").eq(ox_num).show();
            ox_num++;
        }else{
            $(".oxQuiz .next_btn").hide();
            delayNote_fn();
        }
    }
    function oxPrev_fn(){
        $(".oxQuiz .next_btn").show();
        if(ox_num>1){
            $(".oxQuiz").hide();
            ox_num--;
            $(".oxQuiz").eq(ox_num).show();
        }else{
            $(".oxQuiz .prev_btn").hide();
        }
    }
    function resetXBtn_fn(){
        var len = $(".Btn").length;
        for(var i=0;i<len;i++){
            if(!dap.includes(i+1)){//오답인 경우 선택해제
                $(".Btn").eq(i).removeClass("on");
            }
        }
    }
    function charView_fn(charClass){//qman, oman, xman 을 받아 보여줌
        if(charViewing_bool) return;//두번 연달아 호출 안되게 하기 위해
        $(".Character1 div").hide();
        // 선택된 캐릭터 가져오기
        const selectedCharacter = $("." + charClass);
        // 선택된 캐릭터 보이기
        selectedCharacter.show();
        // 애니메이션 재적용 (클래스 제거 후 다시 추가)
        selectedCharacter.removeClass(charClass);
        charViewing_bool=true;
        setTimeout(() => {
            selectedCharacter.addClass(charClass);
            charViewing_bool=false;
        }, 10); // 브라우저가 클래스 변경을 감지할 시간을 줌
    }
    function retryMun_fn(){
        resetChkBtn();
        resetBtn();
        quiz_bool=true;
        munNum = 1; // 첫 번째 문제로 이동
        dap = eval("dap" + munNum); // 정답 값을 다시 설정
        $(".Section").hide();
        $(".Section.quiz"+munNum).show();
         // OX 퀴즈 초기화
         oxInit_fn();
        //$(".Character1").css("background-image", `url(${qImage})`);
        charView_fn("qman");
    }
    function nxtMun_fn(){
        munNum++;
        quiz_bool=true;
        $(".oxQuiz").hide(); // 모든 OX퀴즈 숨기기
        $(".Section").hide();
        munNum = 2; // 현재 문제 번호 갱신
        dap = eval("dap" + munNum); // 문제2 정답 업데이트
        $(".Section.quiz"+munNum).show();
        //$(".Character1").css("background-image", `url(${qImage})`);
        charView_fn("qman");
    }
    function resetChkBtn(){
        $(".ChkBtn").removeClass("on");
    }
    function resetBtn(){
        $(".Btn").removeClass("on");
    }
    function delayResetSelBtn(idx){
        timeoutId=setTimeout(() => {
            $(".Btn").eq(idx).removeClass("on");
            //$(".Character1").css("background-image", `url(${qImage})`);
            charView_fn("qman");
        }, delay_sec);
    }
    function chkDap_fn(ans) {
        let rtn_bool = false;
        console.log("Current ox_num:", ox_num); // ox_num 값 확인
        console.log("Current dap array:", dap); // dap 값 확인
        console.log("Expected answer:", dap ? dap[ox_num - 1] : "undefined"); // 현재 정답

        if (ox_num <= 0) {
            console.error("ox_num is not valid:", ox_num);
            return false;
        }

        if (Array.isArray(dap)) { // dap이 배열인지 확인
            if (dap[ox_num - 1] == ans) {
                rtn_bool = true;
                playMP3_fn("./mp3/o.mp3"); 
            } else {
                playMP3_fn("./mp3/x.mp3"); 
            }
        } else {
            if (ans == dap) {
                rtn_bool = true;
                playMP3_fn("./mp3/o.mp3"); 
            } else {
                playMP3_fn("./mp3/x.mp3"); 
            }
        }

        console.log("User answer:", ans, "Result:", rtn_bool); // 결과 확인
        return rtn_bool;
}

    function chkDap_fn2(ans) {//정오답 체크
        var rtn_bool = false;
        if (typeof (dap) == "object") {//배열-중복답
            if (dap.includes(ans)) rtn_bool = true;
        } else {
            if (ans == dap) rtn_bool = true;
        }
        if (rtn_bool) {
            playMP3_fn("./mp3/o.mp3");
        } else {
            playMP3_fn("./mp3/x.mp3");
        }
        return rtn_bool;
    }

    function chkAllDap_fn() {
        if (!Array.isArray(dap)) return false; // 정답이 배열인지 확인
    
        // 선택된 버튼 인덱스를 배열로 가져오기
        const selectedIndexes = $(".Btn.on").map(function () {
            return $(".Btn").index(this) + 1; // 인덱스를 1부터 시작하도록 설정
        }).get();
    
        // 선택된 인덱스와 정답 배열 비교
        if (selectedIndexes.length !== dap.length) return false; // 선택된 개수가 다르면 false
    
        // 선택된 인덱스 배열이 정답 배열과 일치하는지 확인
        return selectedIndexes.every((index) => dap.includes(index));
    }

    function chkAllDap_fn2() {
        if (typeof (dap) != "object") return;
        var allDap_bool = true;
        $(".Btn.on").each(function () {
            const index = $(".Btn").index(this) + 1; // 0부터 시작하므로 +1
            if (!dap.includes(index)) allDap_bool = false;
        });
        if ($(".Btn.on").length != dap.length) allDap_bool = false;
        return allDap_bool;
    }

    function delayRetryOx_fn(){
        timeoutId = setTimeout(() => {
            quiz_bool=true;
            resetChkBtn();
            charView_fn("qman");
        }, delay_sec);
    }
    function delayNote_fn(){//다음 문제 넘어갈때 안내판
        setTimeout(() => {
            $("#Popup").show();
            if(quiz_tot==munNum){//마지막 문제이면 다음문제 버튼 안보이게 처리
                $(".next-button").hide();
                $(".retry-button").show();
                if(video0.currentTime!=video0.duration) video0.play();//비디오가 끝까지 가도록 처리함
            }else{
                $(".next-button").show();
                $(".retry-button").hide();
            }
            //nxtMun_fn();
        }, delay_sec);
    }
})
function playMP3_fn(mp3Url) {
    //if(mp3Play_array[mp3Url]) return;
    if (audio) audio.pause();
    audio = new Audio(mp3Url);
    audio.play().then(() => {
        //console.log('재생이 시작되었습니다.');
    }).catch(error => {
        console.log('재생을 시작할 수 없습니다:', error);
    });
    // 오디오 재생이 끝났을 때의 이벤트 리스너 추가
    audio.addEventListener('ended', () => {
        //console.log('재생이 끝났습니다.');
        //mp3Play_array[mp3Url] = false;
    });
}