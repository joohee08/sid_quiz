var dap1 = 2;
var dap2 = [2, 4, 1, 3];
var dap_array = dap2;
var ans_array = [];
var quiz_tot = 2;
var munNum = 1;
var audio = null;

let lines = [];  // 선의 좌표를 저장할 배열
var line_color = 'orange';//선색깔
var line_thick = 10; //선굵기

let selectedLeft = null;
let selectedRight = null;
let canvas;
let ctx;

var quiz_bool = true;
var win_scale = 1;

$(function () {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    $("#loadCtn").hide();
    const video0 = $("#video")[0];
    $("#video").on("play", function () {
        // 이전 재생이 끝난 후인지 확인
        if (video0.currentTime === 0) {
            $("#loadCtn").hide();
            $(video0).show();
            charView_fn("qman");
            munNum = 1;
            retryMun_fn();
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
    var qImage = "./img/qman.png";
    var oImage = "./img/oman.png";
    var xImage = "./img/xman.png";
    var dap = eval("dap" + munNum);
    var delay_sec = 1200;
    var charViewing_bool = false;
    // 타이머 ID를 저장할 변수
    let timeoutId;
    drawPointSet_fn();
    drawCanvasSet_fn();
    var sel_idx = -1;
    $(".Section").hide();
    $(".Section.quiz" + munNum).show();
    $(".ChkBtn").click(function () {//1번 문제 버튼 클릭
        if (!quiz_bool) return;
        const index = $(".ChkBtn").index(this); // ChkBtn 중 몇 번째인지 확인
        resetChkBtn();
        $(this).addClass("on");
        if (chkDap_fn(index + 1)) {//정답이면
            //$(".Character1").css("background-image", `url(${oImage})`);
            charView_fn("oman");
            quiz_bool = false;
            delayNote_fn();
        } else {//오답이면
            //$(".Character1").css("background-image", `url(${xImage})`);
            charView_fn("xman");
            delayRetry_fn();
        }
    })
    $(".Btn").click(function () {//2번문제 버튼 클릭
        if (!quiz_bool) return;
        const index = $(".Btn").index(this); // ChkBtn 중 몇 번째인지 확인
        sel_idx = index;
        $(this).addClass("on");
        if (chkDap_fn(index + 1)) {//정답이면
            //$(".Character1").css("background-image", `url(${oImage})`);
            charView_fn("oman");
            clearTimeout(timeoutId);
            if (chkAllDap_fn()) {//모두 정답인지 체크
                quiz_bool = false;
                delayNote_fn();
            } else {
                timeoutId = setTimeout(() => {
                    //$(".Character1").css("background-image", `url(${qImage})`);
                    charView_fn("qman");
                }, delay_sec);
            }
        } else {//오답이면
            //$(".Character1").css("background-image", `url(${xImage})`);
            clearTimeout(timeoutId);
            charView_fn("xman");
            delayResetSelBtn(index);
        }
    })

    $("#nextQuizButton").click(function () {//다음 문제로 이동
        nxtMun_fn();
    });
    function charView_fn(charClass) {//qman, oman, xman 을 받아 보여줌
        if (charViewing_bool) return;//두번 연달아 호출 안되게 하기 위해
        $(".Character1 div").hide();
        // 선택된 캐릭터 가져오기
        const selectedCharacter = $("." + charClass);
        // 선택된 캐릭터 보이기
        selectedCharacter.show();
        // 애니메이션 재적용 (클래스 제거 후 다시 추가)
        selectedCharacter.removeClass(charClass);
        charViewing_bool = true;
        setTimeout(() => {
            selectedCharacter.addClass(charClass);
            charViewing_bool = false;
        }, 10); // 브라우저가 클래스 변경을 감지할 시간을 줌
    }
    function retryMun_fn() {
        resetChkBtn();
        resetBtn();
        resetDraw();
        quiz_bool = true;
        $(".Section").hide();
        $(".Section.quiz" + munNum).show();
        //$(".Character1").css("background-image", `url(${qImage})`);
        charView_fn("qman");
    }
    function nxtMun_fn() {
        munNum++;
        quiz_bool = true;
        $(".Section").hide();
        $(".Section.quiz" + munNum).show();
        dap = eval("dap" + munNum);
        //$(".Character1").css("background-image", `url(${qImage})`);
        charView_fn("qman");
    }
    function resetDraw() {
        quiz_on = true;
        lines = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ans_array = [];
        $('.btn-point').data("occufy", false);
        $(".btn-point").removeClass("selected");
    }
    function resetChkBtn() {
        $(".ChkBtn").removeClass("on");
    }
    function resetBtn() {
        $(".Btn").removeClass("on");
    }
    function delayResetSelBtn(idx) {
        timeoutId = setTimeout(() => {
            $(".Btn").eq(idx).removeClass("on");
            //$(".Character1").css("background-image", `url(${qImage})`);
            charView_fn("qman");
        }, delay_sec);
    }
    function chkDap_fn(ans) {//정오답 체크
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
        if (typeof (dap) != "object") return;
        var allDap_bool = true;
        $(".Btn.on").each(function () {
            const index = $(".Btn").index(this) + 1; // 0부터 시작하므로 +1
            if (!dap.includes(index)) allDap_bool = false;
        });
        if ($(".Btn.on").length != dap.length) allDap_bool = false;
        return allDap_bool;
    }
    function delayRetry_fn() {
        setTimeout(() => {
            resetChkBtn();
            //$(".Character1").css("background-image", `url(${qImage})`);
            charView_fn("qman");
        }, delay_sec);
    }
    function delayNote_fn() {//다음 문제 넘어갈때 안내판
        setTimeout(() => {
            $("#Popup").show();
            if (quiz_tot == munNum) {//마지막 문제이면 다음문제 버튼 안보이게 처리
                $(".next-button").hide();
                if (video0.currentTime != video0.duration) video0.play();//비디오가 끝까지 가도록 처리함
            } else {
                $(".next-button").show();
            }
            //nxtMun_fn();
        }, delay_sec);
    }
    function drawPointSet_fn() {
        $('.left-list .btn-point').each(function (index) {
            $(this).attr("data-id", "left" + (index + 1));
        });
        $('.right-list .btn-point').each(function (index) {
            $(this).attr("data-id", "right" + (index + 1));
        })
    }
    function drawCanvasSet_fn() {
        /*function resizeCanvas() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            redrawLines()
        }
    
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();*/
        $('.btn-point').data("occufy", false);
        $('.btn-point').on('click', function () {
            if (!quiz_bool || munNum != 2) return;
            if ($(this).data("occufy")) return;
            const side = $(this).data('id').startsWith('left') ? 'left' : 'right';

            // 중복 선택 방지: 다른 포인트 선택 해제
            if (side === 'left' && selectedLeft && selectedLeft !== this) {
                $(selectedLeft).removeClass("selected");
                selectedLeft = null;
            }
            if (side === 'right' && selectedRight && selectedRight !== this) {
                $(selectedRight).removeClass("selected");
                selectedRight = null;
            }

            if ($(this).hasClass("selected")) {
                $(this).removeClass("selected");
                (side === 'left') ? selectedLeft = null : selectedRight = null;
                return;
            }
            $(this).addClass("selected");
            if (side === 'left') {
                selectedLeft = this;
            } else {
                selectedRight = this;
            }

            if (selectedLeft && selectedRight) {
                drawLine(selectedLeft, selectedRight);
                selectedLeft = null;
                selectedRight = null;
            }
        });
    }
    function drawLine(leftButton, rightButton) {
        const leftPos = $(leftButton).offset();
        const rightPos = $(rightButton).offset();
        const canvasOffset = $('#canvasDiv').offset();  // canDiv의 오프셋을 사용

        const leftX = (leftPos.left + $(leftButton).width() * win_scale / 2 - canvasOffset.left) / win_scale;
        const leftY = (leftPos.top + $(leftButton).height() * win_scale / 2 - canvasOffset.top) / win_scale;
        const rightX = (rightPos.left + $(rightButton).width() * win_scale / 2 - canvasOffset.left) / win_scale;
        const rightY = (rightPos.top + $(rightButton).height() * win_scale / 2 - canvasOffset.top) / win_scale;
        //leftButton 을 기준으로 index 값을 기억해서 lines 배열에 저장
        var l_idx = $(leftButton).index();//몇번째 요소인지 파악
        var r_idx = $(rightButton).index();
        var ans_num = r_idx + 1;
        var l_obj = { leftX, leftY, rightX, rightY };
        drawChkDap_fn(l_idx, ans_num, l_obj);
    }
    function drawChkDap_fn(l_idx, ans_num, l_obj) {//정답인지 확인 후 오답이면 삑소리 나면서 튕겨나가도록 처리
        if (ans_num == dap_array[l_idx]) {
            ans_array[l_idx] = ans_num;
            lines[l_idx] = l_obj;
            $(".left-list .btn-point").eq(l_idx).data("occufy", true);
            $(".right-list .btn-point").eq(ans_num - 1).data("occufy", true);
            redrawLines();
            playMP3_fn("./mp3/o.mp3");
            charView_fn("oman");
            if (JSON.stringify(dap_array) == JSON.stringify(ans_array)) {//모든 정답을 다 맞추었을때 처리
                quiz_bool = false;
                delayNote_fn();
            } else {

                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    //$(".Character1").css("background-image", `url(${qImage})`);
                    charView_fn("qman");
                }, delay_sec);
            }
        } else {
            lines[l_idx] = l_obj;
            redrawLines();
            playMP3_fn("./mp3/x.mp3");

            // 틀린 경우, 연결된 선을 취소하고 숫자를 흔들리게 함
            const $leftBtn = $(".left-list .btn-point").eq(l_idx);
            const $rightBtn = $(".right-list .btn-point").eq(ans_num - 1);
            charView_fn("xman")
            // 흔들림 효과 추가
            shake_fn($leftBtn.parent("li"));
            shake_fn($rightBtn.parent("li"));
            setTimeout(function () {
                lines[l_idx] = null;
                if (!$(".left-list .btn-point").eq(l_idx).data("occufy")) $(".left-list .btn-point").eq(l_idx).removeClass("selected");
                if (!$(".right-list .btn-point").eq(ans_num - 1).data("occufy")) $(".right-list .btn-point").eq(ans_num - 1).removeClass("selected");
                redrawLines();
            }, 500);
        }
    }
    function redrawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Canvas 초기화
        ctx.strokeStyle = line_color;
        ctx.lineWidth = line_thick;

        for (const line of lines) {
            if (line) {
                ctx.beginPath();
                ctx.moveTo(line.leftX, line.leftY);
                ctx.lineTo(line.rightX, line.rightY);
                ctx.stroke();
            }
        }
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
function shake_fn(button) {//button 은 jquery 개체
    var times = 8; // 애니메이션 횟수
    var distance = 5; // 떨림 거리
    var duration = 50; // 한 번 떨림의 지속 시간
    function shake(times, distance, duration) {
        if (times > 0) {
            button.css('transform', 'translateX(' + (times % 2 === 0 ? distance : -distance) + 'px)');
            setTimeout(function () {
                shake(--times, distance, duration);
            }, duration);
        } else {
            button.css('transform', 'translateX(0px)');
        }
    }
    shake(times, distance, duration);
}