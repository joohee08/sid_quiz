var dap1=[1,2,3,4,5,6];
var dap2 = [2, 2, 1, 3];
var dap_array = dap2;
var quiz_tot=2;
var munNum=1;
var audio=null;
var initialPositions = {};
var initialIndex = {};
var dropAreaNo_array = ["1-1", "1-2", "2", "3"];
var ans_array = [];
var $clone = null;//복제된 버튼을 담을 변수
var quiz_bool = true;
var win_scale = 1;


$(function(){
    $("#loadCtn").hide();
    initPos_fn();
    setBtnEvt_fn();
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
    $(".Btn").click(function(){//1번문제 버튼 클릭
        if(!quiz_bool) return;
        const index = $(".Btn").index(this); // ChkBtn 중 몇 번째인지 확인
        sel_idx=index;
        $(this).addClass("on");
        if(chkDap_fn(index+1)){//정답이면
            charView_fn("oman");
            clearTimeout(timeoutId);
            if(chkAllDap_fn()){//모두 정답인지 체크
                quiz_bool=false;
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
   
    $("#nextQuizButton").click(function(){//다음 문제로 이동
        nxtMun_fn();
    });

    function initPos_fn() {
        buttons = $('.btn-word').toArray();
        $dragButton = $('.btn-word');
        $dropArea = $('.blank-box');
        $dragButton.each(function (index) {
            $(this).attr("draggable", "true");
            var id = $(this).attr('id');
            initialPositions[id] = $(this).parent();
            initialIndex[id] = index;
        });
    }

    function setBtnEvt_fn() {
        $dragButton.draggable({
            cancel: false,
            revert: function (socketObj) {
                if (socketObj) {
                    var newId = $(this).attr('id');
                    var drag_idx = Number(newId.split("-")[1]);
                    var a_idx = Number(socketObj[0].id.split("-")[2]);
                    if (dap_array[a_idx] == drag_idx) {
                        return false;
                    } else {
                        falseResult_fn($(this));
                        return true;
                    }
                }
                return true;
            },
            revertDuration: 0,
            opacity: 0.4,
            start: function (event, ui) {
                $(this).data('prePosition', {
                    left: ui.position.left,
                    top: ui.position.top
                });
                $(this).data('preMousePos', {
                    left: event.clientX,
                    top: event.clientY
                });
            },
            drag: function (event, ui) {
                var prePos = $(this).data('prePosition');
                var preMousePos = $(this).data('preMousePos');
                var addPos = {
                    top: (event.clientY - preMousePos.top) / win_scale,
                    left: (event.clientX - preMousePos.left) / win_scale
                };
                ui.position.top = prePos.top + addPos.top;
                ui.position.left = prePos.left + addPos.left;
                $(this).data('prePosition', {
                    left: ui.position.left,
                    top: ui.position.top
                });
                $(this).data('preMousePos', {
                    left: event.clientX,
                    top: event.clientY
                });
            }
        });

        $dropArea.droppable({
            accept: '.btn-word',
            activeClass: 'highlight',
            hoverClass: 'hovered',
            drop: function (event, ui) {
                var newId = ui.draggable.attr('id');
                var drag_idx = Number(newId.split("-")[1]); // 드래그된 버튼 ID
                var a_idx = Number(this.id.split("-")[2]); // 드롭 영역 ID
                ans_array[a_idx] = drag_idx; // 드롭 결과 저장
        
                if (dap_array[a_idx] == drag_idx) {
                    playMP3_fn("./mp3/o.mp3");
                    clearTimeout(timeoutId);
                    charView_fn("oman");
                    timeoutId = setTimeout(() => {
                        charView_fn("qman");
                    }, delay_sec);
        
                    $(this).append(ui.draggable); // 드롭된 요소 이동
                    ui.draggable.css({
                        left: 'auto',
                        top: 'auto'
                    });
                    ui.draggable.draggable('disable');
                    ui.draggable.css({ opacity: "" });

                    var dropAreaId = this.id;
                    if (drag_idx === 2 && (dropAreaId === 'drop-area-1-1' || dropAreaId === 'drop-area-1-2')) {
                        var otherDropAreaId = dropAreaId === 'drop-area-1-1' ? 'drop-area-1-2' : 'drop-area-1-1';
                        var otherDropArea = $('#' + otherDropAreaId);
                        if (otherDropArea.children().length === 0) {
                            $clone = ui.draggable.clone().attr('id', 'button-2-clone');
                            otherDropArea.append($clone);
                            $clone.css({
                                left: 'auto',
                                top: 'auto',
                                opacity: ""
                            });
                            var clone_a_idx = a_idx === 1 ? 0 : 1;
                            ans_array[clone_a_idx] = drag_idx;
                        }
                    }
                } else {
                    playMP3_fn("./mp3/x.mp3");
                }
                dragChkDap_fn();
            }
        });
    }

    function rmvBtnEvt() {
        $dragButton.off("dragstart dragend");
        $dropArea.off("dragenter dragleave dragover drop");
        $('.Btn_Area').off("dragover drop");
    }

    function falseResult_fn($btn) {//드래그 앤 드랍시 오답일때
        charView_fn("xman");
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if ($btn.hasClass("ui-draggable-disabled")) return;
            charView_fn("qman");
        }, delay_sec);
    }

    function dragChkDap_fn() {
        var allCorrect = true;

        for (var i = 0; i < dap_array.length; i++) {
            var drop_area = $('#drop-area-' + dropAreaNo_array[i]);
            var chk_btn = drop_area.children();
            if (isEmpty(chk_btn[0])) {
                allCorrect = false;
                continue;
            }
            var isCorrect = chk_btn.attr('id').indexOf('button-' + dap_array[i]) >= 0;

            if (!isCorrect) allCorrect = false;
        }
        if (allCorrect) {
            $dragButton.draggable('disable');
            clearTimeout(timeoutId);
        }
        return allCorrect;
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

    function retryMun_fn() {
        resetChkBtn();
        resetBtn();
        dap = eval("dap" + munNum);
        quiz_bool = true;
        $(".Section").hide();
        $(".Section.quiz" + munNum).show();
        charView_fn("qman");
        if (munNum == 2) {
            $clone.remove();
            $('.Btn_Area').append(buttons); 
            initPos_fn();
            $dragButton.draggable('enable');
            ans_array = [];
            setBtnEvt_fn();
        }
    }
    
    function nxtMun_fn(){
        munNum++;
        quiz_bool=true;
        $(".Section").hide();
        $(".Section.quiz"+munNum).show();
        dap=eval("dap"+munNum);
        charView_fn("qman");
    }

    function resetBtn() {
        $(".Btn").removeClass("on");
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

    function delayRetry_fn() {
        setTimeout(() => {
            resetChkBtn();
            charView_fn("qman");
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

function isEmpty(ipStr) {//ipStr 은 문자열
    if (typeof (ipStr) == "undefined") return true;
    if (!isNaN(ipStr) && typeof (ipStr) == "number") return false;
    if (ipStr == "" || ipStr == " " || ipStr == undefined) return true;
    return false;
}
