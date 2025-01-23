var dap1=[1,2,4,5];
var dap2=["랜섬웨어","랜섬웨어"];
var cstr_array=["ㄹㅅㅇㅇ","ㄹㅅㅇㅇ"]
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
            //timeupdate 이벤트 등록 (100ms 이전 처리)
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
    var dap=eval("dap"+munNum);
    var delay_sec =1200;
    var charViewing_bool=false;
    // 타이머 ID를 저장할 변수
    let timeoutId;

    var sel_idx=-1;
    $(".Section").hide();
    $(".Section.quiz"+munNum).show();
    $(".Btn").click(function(){//1번문제 버튼 클릭-중복정답
        if(!quiz_bool) return;
        const index = $(".Btn").index(this); // ChkBtn 중 몇 번째인지 확인
        sel_idx=index;
        resetXBtn_fn();
        $(this).addClass("on");
        if(chkDap_fn(index+1)){//정답이면
            charView_fn("oman");
            clearTimeout(timeoutId);
            if(chkAllDap_fn()){//모두 정답인지 체크
                quiz_bool=false;
                delayNote_fn();
            }else{
                timeoutId=setTimeout(() => {
                    charView_fn("qman");
                }, delay_sec);
            }
        }else{//오답이면
            clearTimeout(timeoutId);
            charView_fn("xman");
            delayResetSelBtn(index);
        }
    })
    $(".btns input").click(function(){//2번문제 정답버튼 클릭
        if(!quiz_bool) return;
        if(chkDap2_fn()){//정답이면
            charView_fn("oman");
            clearTimeout(timeoutId);
            quiz_bool=false;
            delayNote_fn();
        }else{//오답이면
            clearTimeout(timeoutId);
            charView_fn("xman");
            delayRetry_fn();
        }
    })
    //문제2번 inputBox 에 placeholder 값으로 초성값을 넣음
    setPlaceHolder_fn($(".Input_box input"),cstr_array[0]);
    setPlaceHolder_fn($(".Input_box2 input"),cstr_array[1]);
    function setPlaceHolder_fn(inputs,cstr){// 각 input에 placeholder 설정
        inputs.each(function (index) {
            if (index < cstr.length) {
                $(this).attr("placeholder", cstr[index]); // placeholder 설정
            }
        });
    }
    
    $(".retry-button").click(function(){//다시 풀기
        $("#Popup").hide();
        retryMun_fn();
    });
    $("#nextQuizButton").click(function(){//다음 문제로 이동
        $("#Popup").hide();
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
    function retryMun_fn(){
        resetBtn();
        resetInput();
        quiz_bool=true;
        $(".Section").hide();
        $(".Section.quiz"+munNum).show();
        charView_fn("qman");
    }
    function nxtMun_fn(){
        munNum++;
        quiz_bool=true;
        $(".Section").hide();
        $(".Section.quiz"+munNum).show();
        dap=eval("dap"+munNum);
        charView_fn("qman");
    }
    function resetBtn(){
        $(".Btn").removeClass("on");
    }
    function resetInput(){
        $(".inputRect").val("");
    }
    function delayResetSelBtn(idx){
        timeoutId=setTimeout(() => {
            $(".Btn").eq(idx).removeClass("on");
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
    function chkDap2_fn(){//2번 문제 정답 확인
        var rtn_bool=false;
        rtn_bool = chkSentences_fn($(".Input_box input"),dap2[0]);
        rtn_bool = chkSentences_fn($(".Input_box2 input"),dap2[1]);
       // 정답 여부에 따라 사운드 재생
       if (rtn_bool) {
        playMP3_fn("./mp3/o.mp3"); // 정답 사운드
    } else {
        playMP3_fn("./mp3/x.mp3"); // 오답 사운드
    }

    return rtn_bool;
}
    function chkSentences_fn(inputs,d_str){
        var match_bool=true;
        for(var i=0;i<d_str.length;i++){
            if(inputs.eq(i).val()!=d_str.charAt(i)){
                match_bool=false;
                inputs.eq(i).val("");
            }
        }
        return match_bool;
    }
    $(".xman").dblclick(function(){
        fillDap2_fn();
    })
    function fillDap2_fn(){
        inputSentences_fn($(".Input_box input"),dap2[0]);
        inputSentences_fn($(".Input_box2 input"),dap2[1]);
        function inputSentences_fn(inputs,d_str){
            for(var i=0;i<d_str.length;i++){
                inputs.eq(i).val(d_str.charAt(i))
            }
        }
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
    });
}