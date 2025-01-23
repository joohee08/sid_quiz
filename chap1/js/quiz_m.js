var dap1=2;
var dap2=[4,5];
var quiz_tot=2;
var munNum=1;
var audio=null;


$(function(){
    $("#loadCtn").hide();
    const video0 = $("#video")[0];
    $("#video").on("play", function () {  
        // 이전 재생이 끝난 후인지 확인
        if (video0.currentTime === 0) {
            $("#loadCtn").hide();
            $(video0).show();
            charView_fn("qman");
            //console.log("영상이 처음 재생됩니다.");
            // timeupdate 이벤트 등록 (100ms 이전 처리)
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
    var delay_sec =1200;
    var charViewing_bool=false;
    // 타이머 ID를 저장할 변수
    let timeoutId;

    var sel_idx=-1;
    $(".Section").hide();
    $(".Section.quiz"+munNum).show();
    $(".ChkBtn").click(function(){//1번 문제 버튼 클릭
        if(!quiz_bool) return;
        const index = $(".ChkBtn").index(this); // ChkBtn 중 몇 번째인지 확인
        resetChkBtn();
        $(this).addClass("on");
        if(chkDap_fn(index+1)){//정답이면
            //$(".Character1").css("background-image", `url(${oImage})`);
            charView_fn("oman");
            quiz_bool=false;
            delayNote_fn();
        }else{//오답이면
            //$(".Character1").css("background-image", `url(${xImage})`);
            charView_fn("xman");
            delayRetry_fn();
        }
    })
    $(".Btn").click(function(){//2번문제 버튼 클릭
        if(!quiz_bool) return;
        const index = $(".Btn").index(this); // ChkBtn 중 몇 번째인지 확인
        sel_idx=index;
        resetXBtn_fn();
        $(this).addClass("on");
        if(chkDap_fn(index+1)){//정답이면
            //$(".Character1").css("background-image", `url(${oImage})`);
            charView_fn("oman");
            clearTimeout(timeoutId);
            if(chkAllDap_fn()){//모두 정답인지 체크
                quiz_bool=false;
                delayNote_fn();
            }else{
                timeoutId=setTimeout(() => {
                    //$(".Character1").css("background-image", `url(${qImage})`);
                    charView_fn("qman");
                }, delay_sec);
            }
        }else{//오답이면
            //$(".Character1").css("background-image", `url(${xImage})`);
            clearTimeout(timeoutId);
            charView_fn("xman");
            delayResetSelBtn(index);
        }
    })

    $("#nextQuizButton").click(function(){//다음 문제로 이동
        nxtMun_fn();
    });
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
    
    function nxtMun_fn(){
        munNum++;
        quiz_bool=true;
        $(".Section").hide();
        $(".Section.quiz"+munNum).show();
        dap=eval("dap"+munNum);
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
    function chkDap_fn(ans){//정오답 체크
        var rtn_bool=false;
        if(typeof(dap)=="object"){//배열-중복답
            if(dap.includes(ans)) rtn_bool=true;
        }else{
            if(ans==dap) rtn_bool=true;
        }
        if(rtn_bool){
            playMP3_fn("./mp3/o.mp3");
        }else{
            playMP3_fn("./mp3/x.mp3");
        }
        return rtn_bool;
    }
    function chkAllDap_fn(){
        if(typeof(dap)!="object") return;
        var allDap_bool=true;
        $(".Btn.on").each(function () {
            const index = $(".Btn").index(this) + 1; // 0부터 시작하므로 +1
            if(!dap.includes(index)) allDap_bool=false;
        });
        if( $(".Btn.on").length != dap.length) allDap_bool =false;
        return allDap_bool;
    }
    function delayRetry_fn(){
        setTimeout(() => {
            resetChkBtn();
            //$(".Character1").css("background-image", `url(${qImage})`);
            charView_fn("qman");
        }, delay_sec);
    }
    function delayNote_fn(){//다음 문제 넘어갈때 안내판
        setTimeout(() => {
            $("#Popup").show();
            if(quiz_tot==munNum){//마지막 문제이면 다음문제 버튼 안보이게 처리
                $(".next-button").hide();
                if(video0.currentTime!=video0.duration) video0.play();//비디오가 끝까지 가도록 처리함
            }else{
                $(".next-button").show();
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