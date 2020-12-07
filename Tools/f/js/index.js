/**!
 * easy-pie-chart
 * Lightweight plugin to render simple, animated and retina optimized pie charts
 *
 * @license
 * @author Robert Fleischmann <rendro87@gmail.com> (http://robert-fleischmann.de)
 * @version 2.1.7
 **/
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],function(a){return b(a)}):"object"==typeof exports?module.exports=b(require("jquery")):b(jQuery)}(this,function(a){var b=function(a,b){var c,d=document.createElement("canvas");a.appendChild(d),"object"==typeof G_vmlCanvasManager&&G_vmlCanvasManager.initElement(d);var e=d.getContext("2d");d.width=d.height=b.size;var f=1;window.devicePixelRatio>1&&(f=window.devicePixelRatio,d.style.width=d.style.height=[b.size,"px"].join(""),d.width=d.height=b.size*f,e.scale(f,f)),e.translate(b.size/2,b.size/2),e.rotate((-0.5+b.rotate/180)*Math.PI);var g=(b.size-b.lineWidth)/2;b.scaleColor&&b.scaleLength&&(g-=b.scaleLength+2),Date.now=Date.now||function(){return+new Date};var h=function(a,b,c){c=Math.min(Math.max(-1,c||0),1);var d=0>=c?!0:!1;e.beginPath(),e.arc(0,0,g,0,2*Math.PI*c,d),e.strokeStyle=a,e.lineWidth=b,e.stroke()},i=function(){var a,c;e.lineWidth=1,e.fillStyle=b.scaleColor,e.save();for(var d=24;d>0;--d)d%6===0?(c=b.scaleLength,a=0):(c=.6*b.scaleLength,a=b.scaleLength-c),e.fillRect(-b.size/2+a,0,c,1),e.rotate(Math.PI/12);e.restore()},j=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(a){window.setTimeout(a,1e3/60)}}(),k=function(){b.scaleColor&&i(),b.trackColor&&h(b.trackColor,b.trackWidth||b.lineWidth,1)};this.getCanvas=function(){return d},this.getCtx=function(){return e},this.clear=function(){e.clearRect(b.size/-2,b.size/-2,b.size,b.size)},this.draw=function(a){b.scaleColor||b.trackColor?e.getImageData&&e.putImageData?c?e.putImageData(c,0,0):(k(),c=e.getImageData(0,0,b.size*f,b.size*f)):(this.clear(),k()):this.clear(),e.lineCap=b.lineCap;var d;d="function"==typeof b.barColor?b.barColor(a):b.barColor,h(d,b.lineWidth,a/100)}.bind(this),this.animate=function(a,c){var d=Date.now();b.onStart(a,c);var e=function(){var f=Math.min(Date.now()-d,b.animate.duration),g=b.easing(this,f,a,c-a,b.animate.duration);this.draw(g),b.onStep(a,c,g),f>=b.animate.duration?b.onStop(a,c):j(e)}.bind(this);j(e)}.bind(this)},c=function(a,c){var d={barColor:"#ef1e25",trackColor:"#f9f9f9",scaleColor:"#dfe0e0",scaleLength:5,lineCap:"round",lineWidth:3,trackWidth:void 0,size:110,rotate:0,animate:{duration:1e3,enabled:!0},easing:function(a,b,c,d,e){return b/=e/2,1>b?d/2*b*b+c:-d/2*(--b*(b-2)-1)+c},onStart:function(a,b){},onStep:function(a,b,c){},onStop:function(a,b){}};if("undefined"!=typeof b)d.renderer=b;else{if("undefined"==typeof SVGRenderer)throw new Error("Please load either the SVG- or the CanvasRenderer");d.renderer=SVGRenderer}var e={},f=0,g=function(){this.el=a,this.options=e;for(var b in d)d.hasOwnProperty(b)&&(e[b]=c&&"undefined"!=typeof c[b]?c[b]:d[b],"function"==typeof e[b]&&(e[b]=e[b].bind(this)));"string"==typeof e.easing&&"undefined"!=typeof jQuery&&jQuery.isFunction(jQuery.easing[e.easing])?e.easing=jQuery.easing[e.easing]:e.easing=d.easing,"number"==typeof e.animate&&(e.animate={duration:e.animate,enabled:!0}),"boolean"!=typeof e.animate||e.animate||(e.animate={duration:1e3,enabled:e.animate}),this.renderer=new e.renderer(a,e),this.renderer.draw(f),a.dataset&&a.dataset.percent?this.update(parseFloat(a.dataset.percent)):a.getAttribute&&a.getAttribute("data-percent")&&this.update(parseFloat(a.getAttribute("data-percent")))}.bind(this);this.update=function(a){return a=parseFloat(a),e.animate.enabled?this.renderer.animate(f,a):this.renderer.draw(a),f=a,this}.bind(this),this.disableAnimation=function(){return e.animate.enabled=!1,this},this.enableAnimation=function(){return e.animate.enabled=!0,this},g()};a.fn.easyPieChart=function(b){return this.each(function(){var d;a.data(this,"easyPieChart")||(d=a.extend({},b,a(this).data()),a.data(this,"easyPieChart",new c(this,d)))})}});

(function ($) {

    var selectors = {
        lengthSession: 'length-control__number__session',
        lengthBreak: 'length-control__number__break',
        lengthButton: 'length-control__button',
        timer: 'timer',
        timerHeader: 'timer-header__general',
        running: 'running',
        pause: 'pause',
        pauseHeader: 'timer-header__pause',
        actionHeader:'timer-header__action',
        disabled: 'disabled',
        numberParent: 'length-control__wrap',
        number: 'length-control__number',
        session: 'session',
        break: 'break',
        minus: 'minus',
        plus: 'plus',
        hoursChart: 'timer-count__hours-chart',
        hoursText: 'timer-count__hours-text',
        minutesChart: 'timer-count__minutes-chart',
        minutesText: 'timer-count__minutes-text',
        secondsChart: 'timer-count__seconds-chart',
        secondsText: 'timer-count__seconds-text',
        bodyPause:'body-pause',
        bodySession:'body-session',
        bodyBreak:'body-break'
    };

    var countdownTimer;
    var seconds = $('.' + selectors.lengthSession).text() * 60;

    var soundBreak = new Audio('http://www.oringz.com/oringz-uploads/sounds-999-hold-your-horses.mp3');
    var soundSession = new Audio('http://www.oringz.com/oringz-uploads/sounds-917-communication-channel.mp3');


    $('.' + selectors.timer).click(function (event) {
        event.preventDefault();

        var $this = $(this);
        if ($this.hasClass(selectors.running) && !$this.hasClass(selectors.pause)) {

            $this.addClass(selectors.pause);

            $('.' + selectors.number).removeClass(selectors.running);
            $('.'+selectors.numberParent).removeClass(selectors.disabled);

            $('.' + selectors.pauseHeader).text('Timer Paused');
            $('.' + selectors.actionHeader).text('Start!');

            $('body').addClass(selectors.bodyPause);

            stopTimer();

        } else if ($this.hasClass(selectors.running) && $this.hasClass(selectors.pause)) {

            $this.removeClass(selectors.pause);

            $('.' + selectors.number).addClass(selectors.running);
            $('.'+selectors.numberParent).addClass(selectors.disabled);

            $('.' + selectors.pauseHeader).text('');
            $('.' + selectors.actionHeader).text('Pause!');

            $('body').removeClass(selectors.bodyPause);

            runTimer();

        } else {

            $this
                .addClass(selectors.session)
                .addClass(selectors.running);

            $('.' + selectors.number).addClass(selectors.running);
            $('.'+selectors.numberParent).addClass(selectors.disabled);

            $('.' + selectors.timerHeader).text('Session');
            $('.' + selectors.actionHeader).text('Pause!');


            $('body').addClass(selectors.bodySession);

            runTimer();
        }
    });

    $('.' + selectors.lengthButton).click(function (event) {
        event.preventDefault();

        var parent = $(this).parent('.' + selectors.numberParent);
        var minus=parent.find('.'+selectors.minus);
        var plus=parent.find('.'+selectors.plus);
        var numberContainer = $(this).siblings('.' + selectors.number);
        var number = parseInt(numberContainer.text());

        if (numberContainer.hasClass(selectors.running)) {
            return;
        }

        $('.' + selectors.timerHeader).text('Session');
        $('.' + selectors.pauseHeader).text('');
        $('.' + selectors.timer)
            .removeClass(selectors.session)
            .removeClass(selectors.break)
            .removeClass(selectors.running)
            .removeClass(selectors.pause);

        $('body')
            .removeClass(selectors.bodyBreak)
            .removeClass(selectors.bodySession)
            .removeClass(selectors.bodyPause);

        var min = 1;
        var max = 999;

        if ( !numberContainer.hasClass(selectors.running)) {
            parent.removeClass(selectors.disabled);
        }

        if ($(this).hasClass(selectors.minus)) {
            number--;
        }
        if ($(this).hasClass(selectors.plus)) {
            number++;
        }

        if (number <= min) {
            minus.addClass(selectors.disabled);
        } else{
            minus.removeClass(selectors.disabled);
        }

        if (number >= max) {
            plus.addClass(selectors.disabled);
        }else{
            plus.removeClass(selectors.disabled);
        }

        if (number < min) {
            numberContainer.text(min);
        } else if (number > max) {
            numberContainer.text(max);
        } else {
            numberContainer.text(number);

            seconds = $('.' + selectors.lengthSession).text() * 60;
            setTime();
        }
    });


    function done() {

        stopTimer();

        var button = $('.' + selectors.timer);

        if (button.hasClass(selectors.session)) {
            $('.' + selectors.timerHeader).text('Break');
            button.removeClass(selectors.session);
            button.addClass(selectors.break);
            seconds = $('.' + selectors.lengthBreak).text() * 60;
            $('body')
                .removeClass(selectors.bodySession)
                .addClass(selectors.bodyBreak);
            soundBreak.play();
        } else if (button.hasClass(selectors.break)) {
            $('.' + selectors.timerHeader).text('Session');
            button.removeClass(selectors.break);
            button.addClass(selectors.session);
            seconds = $('.' + selectors.lengthSession).text() * 60;
            $('body')
                .removeClass(selectors.bodyBreak)
                .addClass(selectors.bodySession);
            soundSession.play();
        }
        runTimer();
    }

    function setTime() {
        var minutes = Math.round((seconds - 30) / 60);
        var hours = Math.round((minutes - 30) / 60);


        var remainingSeconds = seconds % 60;
        var remainingMinutes = minutes % 60;
        var remainingHours = hours % 24;

        $('.' + selectors.hoursChart).data('easyPieChart').update(100 - (remainingHours * 100 / 24));
        $('.' + selectors.minutesChart).data('easyPieChart').update(100 - (remainingMinutes * 100 / 60));
        $('.' + selectors.secondsChart).data('easyPieChart').update(100 - (remainingSeconds * 100 / 60));

        if (remainingSeconds < 10) {
            remainingSeconds = "0" + remainingSeconds;
        }
        if (remainingMinutes < 10) {
            remainingMinutes = "0" + remainingMinutes;
        }
        if (remainingHours < 10) {
            remainingHours = "0" + remainingHours;
        }

        $('.' + selectors.hoursText).text(remainingHours);
        $('.' + selectors.minutesText).text(remainingMinutes);
        $('.' + selectors.secondsText).text(remainingSeconds);

    }

    function runTimer() {
        countdownTimer = setInterval(function () {
            setTime();

            if (seconds == 0) {
                done();
            } else {
                seconds--;
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(countdownTimer);
    }


    var chartOptions = {
        scaleColor: false,
        trackColor: 'rgba(255,255,255,.4)',
        barColor: 'white',
        lineWidth: 6,
        lineCap: 'butt',
        size: 180,
        animate: 300
    };

    $('.' + selectors.hoursChart).easyPieChart(chartOptions);
    $('.' + selectors.minutesChart).easyPieChart(chartOptions);
    $('.' + selectors.secondsChart).easyPieChart(chartOptions);

    setTime();
})($);