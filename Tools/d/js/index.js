/**
 * @constructor
 */
var Clock = function()
{
    /**
     * @type {Clock}
     */
    var me = this;

    var config = {
        starCount   : 500,
        showFps     : true,
        drawDigital : true,
        star        : {
            minOpacity : 0.1,
            fade       : true,
            fadeSpeed  : 0.02,
            color      : '#0a0'
        },
        hour : {
            foreground : '#aaa',
            background : '#000',
            width      : 3,
        },
        minute : {
            foreground : '#aaa',
            background : '#000',
            width      : 3,
        },
        second : {
            foreground : '#aaa',
            background : '#000',
            width      : 3,
        },
        milli : {
            foreground : 'rgba(0,0,0,0.1)',
            background : '#000',
            width      : 3,
        }
    }

    /**
     * @type {Element}
     */
    var canvas = document.createElement('canvas');

    /**
     * @type {CanvasRenderingContext2D}
     */
    var engine = canvas.getContext('2d');

    /**
     * requestor
     * @type {*|Function}
     */
    var frame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(cb) { return setTimeout(cb, 30) };

    /**
     * @type {{}}
     */
    var star = [];

    /**
     *
     * @type {number}
     */
    var size = 0.9;

    /**
     * @type {number}
     */
    var radius = size / 2;

    /**
     * @type {Date}
     */
    var current = null;

    /**
     * @type {{refresh: number, tick: number, start: Date}}
     */
    var fps = {
        val     : 0,
        refresh : 50,
        tick    : 0,
        start   : new Date()
    };

    /**
     * @type {{width: number, height: number, size: number, radius: number, middle: number}}
     */
    var meta = {
        width  : 0,
        height : 0,
        size   : 0,
        radius : 0,
        middle : 0
    };

    /**
     * init
     */
    this.run = function()
    {
        generateStar();
        document.body.appendChild(canvas);

        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);

        frame(tick);
    };

    /**
     * render frame
     */
    var tick = function()
    {
        current = new Date();
        solveMeta();

        engine.fillStyle = '#000';
        engine.clearRect(0, 0, meta.width, meta.height);
        engine.fillRect(0, 0, meta.width, meta.height);

        //draw part
        drawFps();
        drawStar();

        drawBackgroundTime();
        drawPattern();
        drawForegroundTime();

        drawDigital();

        frame(tick);
    };

    /**
     * draw digital watch
     */
    var drawDigital = function()
    {
        if (config.drawDigital) {
            var time = [
                n(current.getHours()),
                current.getSeconds() % 2 ? ':' : ' ',
                n(current.getMinutes())
            ].join('');

            var size    = 30;
            var padding = 10;
            engine.font = size + 'px Arial';
            var m       = engine.measureText(time);

            //engine.fillStyle = 'rgba(0,0,0,0.5)';
            //engine.fillRect(
            //    meta.middle.x - m.width / 2 - padding,
            //    meta.middle.y - size / 2 - padding,
            //    m.width + padding * 2,
            //    size + padding * 2
            //);

            engine.fillStyle = '#fff';
            engine.fillText(
                time,
                meta.middle.x - m.width / 2,
                meta.middle.y + size / 2
            );
        }
    };

    /**
     * @param ne
     * @returns {*}
     */
    var n = function(ne)
    {
        if (ne < 10) {
            return '0' + ne;
        }

        return ne;
    };

    /**
     * draw lines for evers hour and minute
     */
    var drawPattern = function()
    {
        //#1
        engine.strokeStyle = 'rgba(255,255,255,0.2)';
        engine.lineWidth   = 2;

        engine.beginPath();
        engine.arc(meta.middle.x, meta.middle.y, meta.radius * 0.8 - meta.radius / 12, 0, Math.PI * 2);
        engine.stroke();
        engine.closePath();

        //#1.5
        engine.strokeStyle = 'rgba(255,255,255,0.2)';
        engine.beginPath();
        engine.arc(meta.middle.x, meta.middle.y, meta.radius * 0.8 + meta.radius / 12, 0, Math.PI * 2);
        engine.stroke();
        engine.closePath();

        //#2
        engine.strokeStyle = 'rgba(0,0,0,0.5)';
        engine.lineWidth   = meta.radius / 6;

        engine.beginPath();
        engine.arc(meta.middle.x, meta.middle.y, meta.radius * 0.8, 0, Math.PI * 2);
        engine.stroke();
        engine.closePath();


        var angleWidth = Math.PI * 2 / 60;
        var seconds    = current.getSeconds() + current.getMilliseconds() / 1000;

        for (var i = 0; i < 60; i++) {
            var angleMid   = i * angleWidth - 0.5 * Math.PI;
            var startAngle = angleMid - Math.PI / 500;
            var endAngle   = angleMid + Math.PI / 500;

            //var opa = (60 - seconds + i - 1) % 60;
            //
            //engine.strokeStyle = 'rgba(' + [255, 255, 255, opa / 60].join(',') + ')';

            if (i === parseInt(seconds)) {
                engine.strokeStyle = '#0a0';
            } else {
                var opa = 1 - Math.min(
                    Math.abs(i - 60 - seconds),
                    Math.abs(i - seconds),
                    Math.abs(i + 60 - seconds)
                ) / 15;

                engine.strokeStyle = 'rgba(' + [255, 255, 255, opa].join(',') + ')';
            }


            engine.lineWidth   = meta.radius / 20;

            engine.beginPath();
            engine.arc(meta.middle.x, meta.middle.y, meta.radius * 0.8, startAngle, endAngle);
            engine.stroke();
            engine.closePath();
        }

        angleWidth = Math.PI * 2 / 12;

        for (var i = 0; i < 12; i++) {
            var angleMid   = i * angleWidth - 0.5 * Math.PI;
            var startAngle = angleMid - Math.PI / 200;
            var endAngle   = angleMid + Math.PI / 200;

            engine.strokeStyle = 'rgba(255,255,255,0.6)';
            engine.lineWidth   = meta.radius / 7;

            engine.beginPath();
            engine.arc(meta.middle.x, meta.middle.y, meta.radius * 0.75, startAngle, endAngle);
            engine.stroke();
            engine.closePath();
        }
    }

    /**
     * draw background clock
     */
    var drawBackgroundTime = function()
    {
        drawBackgroundTimePart(meta.radius / 3 + 20, current.getHours() + current.getMinutes() / 60, 12, config.hour);
        drawBackgroundTimePart(meta.radius * 0.65 + 20, current.getMinutes() + current.getSeconds() / 60, 60, config.minute);
        drawBackgroundTimePart(meta.radius + 20, current.getSeconds() + current.getMilliseconds() / 1000, 60, config.second);
    };

    /**
     * draw foreground clock
     */
    var drawForegroundTime = function()
    {
        drawTimePart(meta.radius / 3, current.getHours() + current.getMinutes() / 60, 12, config.hour);
        drawTimePart(meta.radius * 0.65, current.getMinutes() + current.getSeconds() / 60, 60, config.minute);
        drawTimePart(meta.radius, current.getSeconds() + current.getMilliseconds() / 1000, 60, config.second);

        drawTimePart(meta.radius / 15, current.getMilliseconds()      , 1000, config.milli, true);
        drawTimePart(meta.radius / 15, current.getMilliseconds() + 250, 1000, config.milli, true);
        drawTimePart(meta.radius / 15, current.getMilliseconds() + 500, 1000, config.milli, true);
        drawTimePart(meta.radius / 15, current.getMilliseconds() + 750, 1000, config.milli, true);
    };

    /**
     * draw bg time part
     *
     * @param {number} radius
     * @param {number} time
     * @param {number} maxTime
     * @param {{}} config
     */
    var drawBackgroundTimePart = function(radius, time, maxTime, config)
    {
        engine.globalAlpha = 0.5;

        var angleWidth = Math.PI * 2 / maxTime;
        var angleMid   = time * angleWidth - 0.5 * Math.PI;
        var startAngle = angleMid - Math.PI / 1.5;
        var endAngle   = angleMid + Math.PI / 1.5;

        engine.fillStyle = config.background;

        //### 1
        var grd = engine.createRadialGradient(meta.middle.x, meta.middle.y, radius / 2, meta.middle.x, meta.middle.y, radius);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, config.background);
        engine.fillStyle = grd;

        engine.beginPath();
        engine.moveTo(meta.middle.x, meta.middle.y);
        engine.arc(meta.middle.x, meta.middle.y, radius, startAngle, endAngle);
        engine.fill();
        engine.closePath();

        //### 2
        grd = engine.createRadialGradient(meta.middle.x, meta.middle.y, radius / 2, meta.middle.x, meta.middle.y, radius);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, 'rgba(0,200,0,0.5)');
        engine.fillStyle = grd;

        engine.beginPath();
        engine.moveTo(meta.middle.x, meta.middle.y);
        engine.arc(meta.middle.x, meta.middle.y, radius, startAngle + Math.PI / 2, endAngle - Math.PI / 2);
        engine.fill();
        engine.closePath();

        engine.globalAlpha = 1;
    }

    /**
     * draw time part
     *
     * @param {number} radius
     * @param {number} time
     * @param {number} maxTime
     * @param {{}} config
     */
    var drawTimePart = function(radius, time, maxTime, config, anti)
    {
        var angleWidth = Math.PI * 2 / maxTime;
        var angleMid   = time * angleWidth - 0.5 * Math.PI;
        var length     = 8;

        if (anti) {
            angleMid = 0 - angleMid;
            length   = 8;
        }

        var startAngle = angleMid - Math.PI / length;
        var endAngle   = angleMid + Math.PI / length;

        engine.strokeStyle = config.foreground;
        engine.lineWidth   = config.width;

        engine.beginPath();
        engine.arc(meta.middle.x, meta.middle.y, radius - config.width, startAngle, endAngle);
        engine.stroke();
        engine.closePath();


        if (!anti) {
            engine.strokeStyle = '#fff';
            engine.lineWidth   = 20;

            engine.beginPath();
            engine.arc(meta.middle.x, meta.middle.y, radius, angleMid - 0.01, angleMid + 0.01);
            engine.stroke();
            engine.closePath();
        }
    }

    /**
     * solve and render fps
     */
    var drawFps = function()
    {
        if (config.showFps) {
            fps.tick--;

            if (fps.tick <= 0) {
                var diffTime = (new Date() - fps.start) / 1000;
                fps.val   = parseInt(fps.refresh / diffTime * 10) / 10;
                fps.start = new Date();
                fps.tick  = fps.refresh;
            }

            engine.font      = '10px Arial';
            engine.fillStyle = '#fff';
            engine.fillText(fps.val + ' fps | ' + [
                n(current.getHours()),
                current.getSeconds() % 2 ? ':' : ' ',
                n(current.getMinutes()),
                current.getSeconds() % 2 ? ':' : ' ',
                n(current.getSeconds())
            ].join(''), 5, meta.height - 5);
        }
    }

    /**
     * generate Star line setup
     */
    var generateStar = function()
    {
        for (var i = 0; i < config.starCount; i++) {
            star.push({
                width    : Math.random(),
                deg      : Math.random() * 360,
                color    : Math.random(),
                colorDir : Math.random() < 0.5 ? config.star.fadeSpeed : -config.star.fadeSpeed
            });
        }
    }

    /**
     * height of canvas
     * @returns {string}
     */
    var width = function()
    {
        return canvas.getAttribute('width');
    }

    /**
     * height of canvas
     * @returns {string}
     */
    var height = function()
    {
        return canvas.getAttribute('height');
    }

    /**
     * get mid coords from the clock
     * @returns {{x: number, y: number}}
     */
    var middle = function()
    {
        return {x : width() / 2, y : height() / 2};
    }

    /**
     * cache size properties
     */
    var solveMeta = function()
    {
        meta.width  = width();
        meta.height = height();
        meta.radius = Math.min(meta.width, meta.height) * radius;
        meta.size   = Math.min(meta.width, meta.height);
        meta.middle = middle();
    }

    /**
     * draw clock star lines
     */
    var drawStar = function()
    {
        engine.strokeStyle = config.star.color;

        for (var i = 0; i < star.length; i++) {
            var starLine = star[i];
            var relX = Math.sin(starLine.deg / 360 * Math.PI * 2);
            var relY = Math.cos(starLine.deg / 360 * Math.PI * 2);

            engine.beginPath();

            engine.moveTo(
                meta.middle.x,
                meta.middle.y
            );

            engine.lineTo(
                meta.middle.x + relX * starLine.width * meta.radius,
                meta.middle.y + relY * starLine.width * meta.radius
            );

            engine.lineWidth   = parseInt((1 - starLine.width) * 5);

            if (config.star.fade) {
                engine.globalAlpha = config.star.minOpacity + (1 - config.star.minOpacity) * starLine.color;
                starLine.color    += starLine.colorDir;

                if (starLine.color >= 1 || starLine.color <= 0) {
                    starLine.color    = starLine.color | 0;
                    starLine.colorDir = -starLine.colorDir;
                }
            }

            engine.stroke();
            engine.closePath();
        }

        engine.globalAlpha = 1;
    }
};

var c = new Clock();
c.run();