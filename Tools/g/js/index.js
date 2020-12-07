(function() {
  /*

    Music is by The XX
    @see http://thexx.info

    This is best viewed in Chrome since there is a bug in Safari
    when using getByteFrequencyData with MediaElementAudioSource

    @see https://goo.gl/6WLx1

  */
  var ALPHA, AudioAnalyser, COLORS, MP3_PATH, NUM_BANDS, NUM_PARTICLES, Particle, SCALE, SIZE, SMOOTHING, SPEED, SPIN;

  // Config
  NUM_PARTICLES = 150;

  NUM_BANDS = 128;

  SMOOTHING = 0.5;

  MP3_PATH = 'Mere - Mehboob.mp3';

  SCALE = {
    MIN: 5.0,
    MAX: 80.0
  };

  SPEED = {
    MIN: 0.2,
    MAX: 1.0
  };

  ALPHA = {
    MIN: 0.8,
    MAX: 0.9
  };

  SPIN = {
    MIN: 0.001,
    MAX: 0.005
  };

  SIZE = {
    MIN: 0.5,
    MAX: 1.25
  };

  COLORS = ['#69D2E7', '#1B676B', '#BEF202', '#EBE54D', '#00CDAC', '#1693A5', '#F9D423', '#FF4E50', '#E7204E', '#0CCABA', '#FF006F'];

  AudioAnalyser = (function() {
    // Audio Analyser
    class AudioAnalyser {
      constructor(audio = new Audio(), numBands = 256, smoothing = 0.3) {
        var src;
        this.audio = audio;
        this.numBands = numBands;
        this.smoothing = smoothing;
        
        // construct audio object
        if (typeof this.audio === 'string') {
          src = this.audio;
          this.audio = new Audio();
          this.audio.crossOrigin = "anonymous";
          this.audio.controls = true;
          this.audio.src = src;
        }
        
        // setup audio context and nodes
        this.context = new AudioAnalyser.AudioContext();
        
        // createScriptProcessor so we can hook onto updates
        this.jsNode = this.context.createScriptProcessor(2048, 1, 1);
        
        // smoothed analyser with n bins for frequency-domain analysis
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.fftSize = this.numBands * 2;
        
        // persistant bands array
        this.bands = new Uint8Array(this.analyser.frequencyBinCount);
        // circumvent http://crbug.com/112368
        this.audio.addEventListener('canplay', () => {
          
          // media source
          this.source = this.context.createMediaElementSource(this.audio);
          // wire up nodes
          this.source.connect(this.analyser);
          this.analyser.connect(this.jsNode);
          this.jsNode.connect(this.context.destination);
          this.source.connect(this.context.destination);
          // update each time the JavaScriptNode is called
          return this.jsNode.onaudioprocess = () => {
            // retreive the data from the first channel
            this.analyser.getByteFrequencyData(this.bands);
            if (!this.audio.paused) {
              return typeof this.onUpdate === "function" ? this.onUpdate(this.bands) : void 0;
            }
          };
        });
      }

      start() {
        return this.audio.play();
      }

      stop() {
        return this.audio.pause();
      }

    };

    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;

    AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

    return AudioAnalyser;

  }).call(this);

  
  // Particle
  Particle = class Particle {
    constructor(x1 = 0, y1 = 0) {
      this.x = x1;
      this.y = y1;
      this.reset();
    }

    reset() {
      this.level = 1 + floor(random(4));
      this.scale = random(SCALE.MIN, SCALE.MAX);
      this.alpha = random(ALPHA.MIN, ALPHA.MAX);
      this.speed = random(SPEED.MIN, SPEED.MAX);
      this.color = random(COLORS);
      this.size = random(SIZE.MIN, SIZE.MAX);
      this.spin = random(SPIN.MAX, SPIN.MAX);
      this.band = floor(random(NUM_BANDS));
      if (random() < 0.5) {
        this.spin = -this.spin;
      }
      this.smoothedScale = 0.0;
      this.smoothedAlpha = 0.0;
      this.decayScale = 0.0;
      this.decayAlpha = 0.0;
      this.rotation = random(TWO_PI);
      return this.energy = 0.0;
    }

    move() {
      this.rotation += this.spin;
      return this.y -= this.speed * this.level;
    }

    draw(ctx) {
      var alpha, power, scale;
      power = exp(this.energy);
      scale = this.scale * power;
      alpha = this.alpha * this.energy * 1.5;
      this.decayScale = max(this.decayScale, scale);
      this.decayAlpha = max(this.decayAlpha, alpha);
      this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
      this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;
      this.decayScale *= 0.985;
      this.decayAlpha *= 0.975;
      ctx.save();
      ctx.beginPath();
      ctx.translate(this.x + cos(this.rotation * this.speed) * 250, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.smoothedScale * this.level, this.smoothedScale * this.level);
      ctx.moveTo(this.size * 0.5, 0);
      ctx.lineTo(this.size * -0.5, 0);
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.globalAlpha = this.smoothedAlpha / this.level;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      return ctx.restore();
    }

  };

  
  // Sketch
  Sketch.create({
    particles: [],
    setup: function() {
      var analyser, error, i, intro, j, particle, ref, warning, x, y;

// generate some particles
      for (i = j = 0, ref = NUM_PARTICLES - 1; j <= ref; i = j += 1) {
        x = random(this.width);
        y = random(this.height * 2);
        particle = new Particle(x, y);
        particle.energy = random(particle.band / 256);
        this.particles.push(particle);
      }
      if (AudioAnalyser.enabled) {
        try {
          // setup the audio analyser
          analyser = new AudioAnalyser(MP3_PATH, NUM_BANDS, SMOOTHING);
          // update particles based on fft transformed audio frequencies
          analyser.onUpdate = (bands) => {
            var k, len, ref1, results;
            ref1 = this.particles;
            results = [];
            for (k = 0, len = ref1.length; k < len; k++) {
              particle = ref1[k];
              results.push(particle.energy = bands[particle.band] / 256);
            }
            return results;
          };
          
          // start as soon as the audio is buffered
          analyser.start();
          document.body.appendChild(analyser.audio);
          intro = document.getElementById('intro');
          intro.style.display = 'none';
          
          // bug in Safari 6 when using getByteFrequencyData with MediaElementAudioSource
          // @see https://goo.gl/6WLx1
          if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            warning = document.getElementById('warning2');
            return warning.style.display = 'block';
          }
        } catch (error1) {
          error = error1;
        }
      } else {
        
        // Web Audio API not detected
        warning = document.getElementById('warning1');
        return warning.style.display = 'block';
      }
    },
    draw: function() {
      var j, len, particle, ref, results;
      this.globalCompositeOperation = 'lighter';
      ref = this.particles;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        particle = ref[j];
        
        // recycle particles
        if (particle.y < -particle.size * particle.level * particle.scale * 2) {
          particle.reset();
          particle.x = random(this.width);
          particle.y = this.height + particle.size * particle.scale * particle.level;
        }
        particle.move();
        results.push(particle.draw(this));
      }
      return results;
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7Ozs7Ozs7QUFBQSxNQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLFFBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQTs7O0VBY0EsYUFBQSxHQUFnQjs7RUFDaEIsU0FBQSxHQUFZOztFQUNaLFNBQUEsR0FBWTs7RUFDWixRQUFBLEdBQVc7O0VBRVgsS0FBQSxHQUFRO0lBQUEsR0FBQSxFQUFLLEdBQUw7SUFBVyxHQUFBLEVBQUs7RUFBaEI7O0VBQ1IsS0FBQSxHQUFRO0lBQUEsR0FBQSxFQUFLLEdBQUw7SUFBWSxHQUFBLEVBQUs7RUFBakI7O0VBQ1IsS0FBQSxHQUFRO0lBQUEsR0FBQSxFQUFLLEdBQUw7SUFBWSxHQUFBLEVBQUs7RUFBakI7O0VBQ1IsSUFBQSxHQUFRO0lBQUEsR0FBQSxFQUFLLEtBQUw7SUFBWSxHQUFBLEVBQUs7RUFBakI7O0VBQ1IsSUFBQSxHQUFRO0lBQUEsR0FBQSxFQUFLLEdBQUw7SUFBWSxHQUFBLEVBQUs7RUFBakI7O0VBRVIsTUFBQSxHQUFTLENBQ1AsU0FETyxFQUVQLFNBRk8sRUFHUCxTQUhPLEVBSVAsU0FKTyxFQUtQLFNBTE8sRUFNUCxTQU5PLEVBT1AsU0FQTyxFQVFQLFNBUk8sRUFTUCxTQVRPLEVBVVAsU0FWTyxFQVdQLFNBWE87O0VBZ0JIOztJQUFOLE1BQUEsY0FBQTtNQUtFLFdBQWEsU0FBVyxJQUFJLEtBQUosQ0FBQSxDQUFYLGFBQW9DLEdBQXBDLGNBQXNELEdBQXRELENBQUE7QUFHWCxZQUFBO1FBSGEsSUFBQyxDQUFBO1FBQXFCLElBQUMsQ0FBQTtRQUFnQixJQUFDLENBQUEsc0JBR3JEOzs7UUFBQSxJQUFHLE9BQU8sSUFBQyxDQUFBLEtBQVIsS0FBaUIs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RkY7QUFyS0EiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblxuICBNdXNpYyBpcyBieSBUaGUgWFhcbiAgQHNlZSBodHRwOi8vdGhleHguaW5mb1xuXG4gIFRoaXMgaXMgYmVzdCB2aWV3ZWQgaW4gQ2hyb21lIHNpbmNlIHRoZXJlIGlzIGEgYnVnIGluIFNhZmFyaVxuICB3aGVuIHVzaW5nIGdldEJ5dGVGcmVxdWVuY3lEYXRhIHdpdGggTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2VcblxuICBAc2VlIGh0dHBzOi8vZ29vLmdsLzZXTHgxXG5cbiMjI1xuXG4jIENvbmZpZ1xuXG5OVU1fUEFSVElDTEVTID0gMTUwXG5OVU1fQkFORFMgPSAxMjhcblNNT09USElORyA9IDAuNVxuTVAzX1BBVEggPSAnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLzQyMzI4MjE5L3N0cmVhbT9jbGllbnRfaWQ9YjE0OTVlMzkwNzFiZDcwODFhNzQwOTM4MTZmNzdkZGInXG5cblNDQUxFID0gTUlOOiA1LjAsICBNQVg6IDgwLjBcblNQRUVEID0gTUlOOiAwLjIsICAgTUFYOiAxLjBcbkFMUEhBID0gTUlOOiAwLjgsICAgTUFYOiAwLjlcblNQSU4gID0gTUlOOiAwLjAwMSwgTUFYOiAwLjAwNVxuU0laRSAgPSBNSU46IDAuNSwgICBNQVg6IDEuMjVcblxuQ09MT1JTID0gW1xuICAnIzY5RDJFNydcbiAgJyMxQjY3NkInXG4gICcjQkVGMjAyJ1xuICAnI0VCRTU0RCdcbiAgJyMwMENEQUMnXG4gICcjMTY5M0E1J1xuICAnI0Y5RDQyMydcbiAgJyNGRjRFNTAnXG4gICcjRTcyMDRFJ1xuICAnIzBDQ0FCQSdcbiAgJyNGRjAwNkYnXG5dXG5cbiMgQXVkaW8gQW5hbHlzZXJcblxuY2xhc3MgQXVkaW9BbmFseXNlclxuICBcbiAgQEF1ZGlvQ29udGV4dDogc2VsZi5BdWRpb0NvbnRleHQgb3Igc2VsZi53ZWJraXRBdWRpb0NvbnRleHRcbiAgQGVuYWJsZWQ6IEBBdWRpb0NvbnRleHQ/XG4gIFxuICBjb25zdHJ1Y3RvcjogKCBAYXVkaW8gPSBuZXcgQXVkaW8oKSwgQG51bUJhbmRzID0gMjU2LCBAc21vb3RoaW5nID0gMC4zICkgLT5cbiAgXG4gICAgIyBjb25zdHJ1Y3QgYXVkaW8gb2JqZWN0XG4gICAgaWYgdHlwZW9mIEBhdWRpbyBpcyAnc3RyaW5nJ1xuICAgICAgc3JjID0gQGF1ZGlvXG4gICAgICBAYXVkaW8gPSBuZXcgQXVkaW8oKVxuICAgICAgQGF1ZGlvLmNyb3NzT3JpZ2luID0gXCJhbm9ueW1vdXNcIlxuICAgICAgQGF1ZGlvLmNvbnRyb2xzID0geWVzXG4gICAgICBAYXVkaW8uc3JjID0gc3JjXG4gIFxuICAgICMgc2V0dXAgYXVkaW8gY29udGV4dCBhbmQgbm9kZXNcbiAgICBAY29udGV4dCA9IG5ldyBBdWRpb0FuYWx5c2VyLkF1ZGlvQ29udGV4dCgpXG4gICAgXG4gICAgIyBjcmVhdGVTY3JpcHRQcm9jZXNzb3Igc28gd2UgY2FuIGhvb2sgb250byB1cGRhdGVzXG4gICAgQGpzTm9kZSA9IEBjb250ZXh0LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciAyMDQ4LCAxLCAxXG4gICAgXG4gICAgIyBzbW9vdGhlZCBhbmFseXNlciB3aXRoIG4gYmlucyBmb3IgZnJlcXVlbmN5LWRvbWFpbiBhbmFseXNpc1xuICAgIEBhbmFseXNlciA9IEBjb250ZXh0LmNyZWF0ZUFuYWx5c2VyKClcbiAgICBAYW5hbHlzZXIuc21vb3RoaW5nVGltZUNvbnN0YW50ID0gQHNtb290aGluZ1xuICAgIEBhbmFseXNlci5mZnRTaXplID0gQG51bUJhbmRzICogMlxuICAgIFxuICAgICMgcGVyc2lzdGFudCBiYW5kcyBhcnJheVxuICAgIEBiYW5kcyA9IG5ldyBVaW50OEFycmF5IEBhbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudFxuXG4gICAgIyBjaXJjdW12ZW50IGh0dHA6Ly9jcmJ1Zy5jb20vMTEyMzY4XG4gICAgQGF1ZGlvLmFkZEV2ZW50TGlzdGVuZXIgJ2NhbnBsYXknLCA9PlxuICAgIFxuICAgICAgIyBtZWRpYSBzb3VyY2VcbiAgICAgIEBzb3VyY2UgPSBAY29udGV4dC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UgQGF1ZGlvXG5cbiAgICAgICMgd2lyZSB1cCBub2Rlc1xuXG4gICAgICBAc291cmNlLmNvbm5lY3QgQGFuYWx5c2VyXG4gICAgICBAYW5hbHlzZXIuY29ubmVjdCBAanNOb2RlXG5cbiAgICAgIEBqc05vZGUuY29ubmVjdCBAY29udGV4dC5kZXN0aW5hdGlvblxuICAgICAgQHNvdXJjZS5jb25uZWN0IEBjb250ZXh0LmRlc3RpbmF0aW9uXG5cbiAgICAgICMgdXBkYXRlIGVhY2ggdGltZSB0aGUgSmF2YVNjcmlwdE5vZGUgaXMgY2FsbGVkXG4gICAgICBAanNOb2RlLm9uYXVkaW9wcm9jZXNzID0gPT5cblxuICAgICAgICAjIHJldHJlaXZlIHRoZSBkYXRhIGZyb20gdGhlIGZpcnN0IGNoYW5uZWxcbiAgICAgICAgQGFuYWx5c2VyLmdldEJ5dGVGcmVxdWVuY3lEYXRhIEBiYW5kc1xuICAgICAgICBcbiAgICAgICAgIyBmaXJlIGNhbGxiYWNrXG4gICAgICAgIEBvblVwZGF0ZT8gQGJhbmRzIGlmIG5vdCBAYXVkaW8ucGF1c2VkXG4gICAgICAgIFxuICBzdGFydDogLT5cbiAgXG4gICAgQGF1ZGlvLnBsYXkoKVxuICAgIFxuICBzdG9wOiAtPlxuICBcbiAgICBAYXVkaW8ucGF1c2UoKVxuICAgIFxuIyBQYXJ0aWNsZVxuXG5jbGFzcyBQYXJ0aWNsZVxuICBcbiAgY29uc3RydWN0b3I6ICggQHggPSAwLCBAeSA9IDAgKSAtPlxuXG4gICAgQHJlc2V0KClcbiAgICBcbiAgcmVzZXQ6IC0+XG4gIFxuICAgIEBsZXZlbCA9IDEgKyBmbG9vciByYW5kb20gNFxuICAgIEBzY2FsZSA9IHJhbmRvbSBTQ0FMRS5NSU4sIFNDQUxFLk1BWFxuICAgIEBhbHBoYSA9IHJhbmRvbSBBTFBIQS5NSU4sIEFMUEhBLk1BWFxuICAgIEBzcGVlZCA9IHJhbmRvbSBTUEVFRC5NSU4sIFNQRUVELk1BWFxuICAgIEBjb2xvciA9IHJhbmRvbSBDT0xPUlNcbiAgICBAc2l6ZSA9IHJhbmRvbSBTSVpFLk1JTiwgU0laRS5NQVhcbiAgICBAc3BpbiA9IHJhbmRvbSBTUElOLk1BWCwgU1BJTi5NQVhcbiAgICBAYmFuZCA9IGZsb29yIHJhbmRvbSBOVU1fQkFORFNcbiAgICBcbiAgICBpZiByYW5kb20oKSA8IDAuNSB0aGVuIEBzcGluID0gLUBzcGluXG4gICAgXG4gICAgQHNtb290aGVkU2NhbGUgPSAwLjBcbiAgICBAc21vb3RoZWRBbHBoYSA9IDAuMFxuICAgIEBkZWNheVNjYWxlID0gMC4wXG4gICAgQGRlY2F5QWxwaGEgPSAwLjBcbiAgICBAcm90YXRpb24gPSByYW5kb20gVFdPX1BJXG4gICAgQGVuZXJneSA9IDAuMFxuICAgIFxuICBtb3ZlOiAtPlxuICBcbiAgICBAcm90YXRpb24gKz0gQHNwaW5cbiAgICBAeSAtPSBAc3BlZWQgKiBAbGV2ZWxcbiAgICBcbiAgZHJhdzogKCBjdHggKSAtPlxuICAgIFxuICAgIHBvd2VyID0gZXhwIEBlbmVyZ3lcbiAgICBzY2FsZSA9IEBzY2FsZSAqIHBvd2VyXG4gICAgYWxwaGEgPSBAYWxwaGEgKiBAZW5lcmd5ICogMS41XG4gICAgXG4gICAgQGRlY2F5U2NhbGUgPSBtYXggQGRlY2F5U2NhbGUsIHNjYWxlXG4gICAgQGRlY2F5QWxwaGEgPSBtYXggQGRlY2F5QWxwaGEsIGFscGhhXG4gICAgXG4gICAgQHNtb290aGVkU2NhbGUgKz0gKCBAZGVjYXlTY2FsZSAtIEBzbW9vdGhlZFNjYWxlICkgKiAwLjNcbiAgICBAc21vb3RoZWRBbHBoYSArPSAoIEBkZWNheUFscGhhIC0gQHNtb290aGVkQWxwaGEgKSAqIDAuM1xuICAgIFxuICAgIEBkZWNheVNjYWxlICo9IDAuOTg1XG4gICAgQGRlY2F5QWxwaGEgKj0gMC45NzVcbiAgXG4gICAgY3R4LnNhdmUoKVxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC50cmFuc2xhdGUgQHggKyBjb3MoIEByb3RhdGlvbiAqIEBzcGVlZCApICogMjUwLCBAeVxuICAgIGN0eC5yb3RhdGUgQHJvdGF0aW9uXG4gICAgY3R4LnNjYWxlIEBzbW9vdGhlZFNjYWxlICogQGxldmVsLCBAc21vb3RoZWRTY2FsZSAqIEBsZXZlbFxuICAgIGN0eC5tb3ZlVG8gQHNpemUgKiAwLjUsIDBcbiAgICBjdHgubGluZVRvIEBzaXplICogLTAuNSwgMFxuICAgIGN0eC5saW5lV2lkdGggPSAxXG4gICAgY3R4LmxpbmVDYXAgPSAncm91bmQnXG4gICAgY3R4Lmdsb2JhbEFscGhhID0gQHNtb290aGVkQWxwaGEgLyBAbGV2ZWxcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBAY29sb3JcbiAgICBjdHguc3Ryb2tlKClcbiAgICBjdHgucmVzdG9yZSgpXG4gICAgXG4jIFNrZXRjaFxuICAgIFxuU2tldGNoLmNyZWF0ZVxuXG4gIHBhcnRpY2xlczogW11cbiAgXG4gIHNldHVwOiAtPlxuICAgIFxuICAgICMgZ2VuZXJhdGUgc29tZSBwYXJ0aWNsZXNcbiAgICBmb3IgaSBpbiBbMC4uTlVNX1BBUlRJQ0xFUy0xXSBieSAxXG4gICAgICBcbiAgICAgIHggPSByYW5kb20gQHdpZHRoXG4gICAgICB5ID0gcmFuZG9tIEBoZWlnaHQgKiAyXG4gICAgICBcbiAgICAgIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlIHgsIHlcbiAgICAgIHBhcnRpY2xlLmVuZXJneSA9IHJhbmRvbSBwYXJ0aWNsZS5iYW5kIC8gMjU2XG4gICAgICBcbiAgICAgIEBwYXJ0aWNsZXMucHVzaCBwYXJ0aWNsZVxuICAgICAgXG4gICAgaWYgQXVkaW9BbmFseXNlci5lbmFibGVkXG4gICAgICBcbiAgICAgIHRyeVxuXG4gICAgICAgICMgc2V0dXAgdGhlIGF1ZGlvIGFuYWx5c2VyXG4gICAgICAgIGFuYWx5c2VyID0gbmV3IEF1ZGlvQW5hbHlzZXIgTVAzX1BBVEgsIE5VTV9CQU5EUywgU01PT1RISU5HXG5cbiAgICAgICAgIyB1cGRhdGUgcGFydGljbGVzIGJhc2VkIG9uIGZmdCB0cmFuc2Zvcm1lZCBhdWRpbyBmcmVxdWVuY2llc1xuICAgICAgICBhbmFseXNlci5vblVwZGF0ZSA9ICggYmFuZHMgKSA9PiBwYXJ0aWNsZS5lbmVyZ3kgPSBiYW5kc1sgcGFydGljbGUuYmFuZCBdIC8gMjU2IGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzXG4gICAgICAgIFxuICAgICAgICAjIHN0YXJ0IGFzIHNvb24gYXMgdGhlIGF1ZGlvIGlzIGJ1ZmZlcmVkXG4gICAgICAgIGFuYWx5c2VyLnN0YXJ0KCk7XG4gICAgICBcbiAgICAgICAgIyBzaG93IGF1ZGlvIGNvbnRyb2xzXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgYW5hbHlzZXIuYXVkaW9cbiAgICAgICAgXG4gICAgICAgIGludHJvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2ludHJvJ1xuICAgICAgICBpbnRyby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgIFxuICAgICAgICAjIGJ1ZyBpbiBTYWZhcmkgNiB3aGVuIHVzaW5nIGdldEJ5dGVGcmVxdWVuY3lEYXRhIHdpdGggTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2VcbiAgICAgICAgIyBAc2VlIGh0dHBzOi8vZ29vLmdsLzZXTHgxXG4gICAgICAgIGlmIC9TYWZhcmkvLnRlc3QoIG5hdmlnYXRvci51c2VyQWdlbnQgKSBhbmQgbm90IC9DaHJvbWUvLnRlc3QoIG5hdmlnYXRvci51c2VyQWdlbnQgKVxuICAgICAgICBcbiAgICAgICAgICB3YXJuaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3dhcm5pbmcyJ1xuICAgICAgICAgIHdhcm5pbmcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcblxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgIFxuICAgIGVsc2VcbiAgICAgIFxuICAgICAgIyBXZWIgQXVkaW8gQVBJIG5vdCBkZXRlY3RlZFxuICAgICAgd2FybmluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd3YXJuaW5nMSdcbiAgICAgIHdhcm5pbmcuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICBcbiAgZHJhdzogLT5cbiAgXG4gICAgQGdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVyJ1xuICBcbiAgICBmb3IgcGFydGljbGUgaW4gQHBhcnRpY2xlc1xuICAgICAgXG4gICAgICAjIHJlY3ljbGUgcGFydGljbGVzXG4gICAgICBpZiBwYXJ0aWNsZS55IDwgLXBhcnRpY2xlLnNpemUgKiBwYXJ0aWNsZS5sZXZlbCAqIHBhcnRpY2xlLnNjYWxlICogMlxuICAgICAgICBcbiAgICAgICAgcGFydGljbGUucmVzZXQoKTtcbiAgICAgICAgcGFydGljbGUueCA9IHJhbmRvbSBAd2lkdGhcbiAgICAgICAgcGFydGljbGUueSA9IEBoZWlnaHQgKyBwYXJ0aWNsZS5zaXplICogcGFydGljbGUuc2NhbGUgKiBwYXJ0aWNsZS5sZXZlbFxuICAgICAgXG4gICAgICBwYXJ0aWNsZS5tb3ZlKClcbiAgICAgIHBhcnRpY2xlLmRyYXcgQCJdfQ==
//# sourceURL=coffeescript