var WavPlayer = (function() {
  var $playbtn  = undefined;
  var player   = undefined;
  var playlist = [];
  var util = {
    formatTime: function(value) {
      value *= 60;
      var result = [];
      var second = (value / 60) % 60;

      value = value / 60 - second;
      var min = (value / 60) % 60;

      value = value / 60 - min;
      var hour = (value / 60) % 24;

      var day = value / 60 - hour;

      second = second.toString();
      min = min.toString();
      hour = hour.toString();
      day = day.toString();

      if (second.length < 2) {
        second = '0' + second
      }
      if (min.length < 2) {
        min = '0' + min
      }
      if (hour.length < 2) {
        hour = '0' + hour
      }

      if (day != '0') {
        result.push(day);
      }
      if (hour != '00') {
        result.push(hour);
      }
      result.push(min);
      result.push(second);
      return result.join(':');
    },
    formatPerc: function(a, b) {
      return ((b == 0 ? 0.0 : a / b) * 100).toFixed(2);
    }
  };
  var time = {
    len: 0,
    pos: 0,
    last: undefined,
    id: undefined,
    state: 'STOPPED',
    update: function() {
      var $btn = $playbtn;
      if ('PLAYING' === time.state) {
        $btn.attr('data-wav', 'pause');
        if (undefined != time.last) {
          var now = +new Date();
          var interval = (now - time.last) / 1000;
          time.pos += interval;
          time.last = now;
        }
      } else if ('PAUSED' === time.state) {
        $btn.attr('data-wav', 'resume');
      } else if ('STOPPED' === time.state) {
        if ('load' !== $btn.attr('data-wav')) {
          $btn.attr('data-wav', 'play');
        }
      }
      var timePerc = util.formatPerc(time.pos, time.len);
      var timeSec  = util.formatTime(parseInt(time.pos));
      var $parent = $btn.parent();
      $parent.find('.progress-pos').width(timePerc + '%');
      $parent.find('.time span').text(timeSec);
    },
    start: function() {
      time.last = +new Date();
      time.id = setInterval(time.update, 100);
    },
    stop: function() {
      clearInterval(time.id);
      time.id = undefined;
    }
  };
  var control = {
    play: function(self) {
      var src = $(self).attr('data-src');
      $('[data-wav][data-wav!=complete]').attr('data-wav', 'play').each(function() {
        var $parent = $(this).parent();
        $parent.find('.progress-pos').width(0);
        $parent.find('.time span').text('00:00');
      });
      $playbtn = $(self).attr('data-wav', 'load');
      player.play(src);
    },
    stop: function() {
      player.stop()
    },
    pause: function() {
      player.pause()
    },
    resume: function() {
      player.resume()
    },
    volume: function() {
      player.volume()
    },
    seek: function() {
      player.seek()
    },
    pan: function() {
      player.pan()
    }
  };
  var notify = {
    fileload: function(bytesLoad, bytesTotal) {
      document.getElementById('InfoFile').innerHTML = "Loaded " + bytesLoad + "/" + bytesTotal + " bytes (" + util.formatPerc(bytesLoad, bytesTotal) + "%)";
    },
    soundload: function(secLoad, secTotal) {
      document.getElementById('InfoSound').innerHTML = "Available " + secLoad.toFixed(2) + "/" + secTotal.toFixed(2) + " seconds (" + util.formatPerc(secLoad, secTotal) + "%)";
      time.len = secTotal;
    },
    soundstate: function(state, position) {
      if (position !== undefined) {
        time.pos = Math.abs(parseInt(position));
      }
      if ('PLAYING' === state) {
        if ('PLAYING' !== time.state) {
          time.start();
        }
      } else {
        if ('PLAYING' === time.state) {
          time.stop();
        }
      }
      time.state = state;
      time.update();
    }
  };
  function init() {
    if ('undefined' === typeof player) {
      player = $('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"><embed src="wavplayer.swf" width="0" height="0" name="haxe" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /></object>').appendTo('body').find('embed')[0];
      attach();
    }
  }
  function bind() {
    var $playlist = $('[data-wav=init]').attr('data-wav', 'complete');
    $playlist.each(function() {
      var wav = {
        src:  $(this).attr('href'),
        time: util.formatTime($(this).attr('data-time')),
        name: $(this).text()
      };
      var html = '<div class="wavplayer" title="' + wav.name + '"><div class="btn" data-wav="play" data-src="' + wav.src + '"></div><div class="progress"><div class="progress-pos"></div></div><div class="time"><span>00:00</span>/' + wav.time + '</div></div>';
      playlist.push(wav);
      $(this).before(html);
    });
    $('body').on('click', '[data-wav]', function() {
      var entName = $(this).attr('data-wav');
      var entFun  = control[entName];
      if ('function' === typeof entFun) {
        entFun(this);
      }
    });
  }
  function attach() {
    if (!player || !player.attachHandler) {
      setTimeout(attach, 300);
    } else {
      player.attachHandler('progress', 'WavPlayer.notify.fileload');
      player.attachHandler('PLAYER_LOAD', 'WavPlayer.notify.soundload');
      player.attachHandler('PLAYER_BUFFERING', 'WavPlayer.notify.soundstate', 'BUFFERING');
      player.attachHandler('PLAYER_PLAYING', 'WavPlayer.notify.soundstate', 'PLAYING');
      player.attachHandler('PLAYER_STOPPED', 'WavPlayer.notify.soundstate', 'STOPPED');
      player.attachHandler('PLAYER_PAUSED', 'WavPlayer.notify.soundstate', 'PAUSED');
      bind();
    }
  }
  var exports = {
    init: init,
    notify: notify,
    control: control
  };
  return exports;
}());