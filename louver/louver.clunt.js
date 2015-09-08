/* Copyright (c) 2014 Clunt Custom Louver
 * Licensed under the MIT License
 */
;
(function() {

  var util = {
    supportCss3: function(style) {
      var prefix = ['webkit', 'moz', 'ms', 'o', ''];
      var styles = document.documentElement.style;
      var css3 = [];
      for (var i = 0; i < prefix.length; i++) {
        var attr = 0 === prefix[i].length ? style : '-' + prefix[i] + '-' + style;
        css3.push(attr);
      }
      for (var j = 0; j < css3.length; j++) {
        if (css3[j] in styles) return true;
      }
      return false;
    },
    addAnimation: function($element, time) {
      var transition = 'all ' + time + 'ms linear';
      return $element.css({
        '-webkit-transition': transition,
        '-moz-transition': transition,
        '-ms-transition': transition,
        '-o-transition': transition,
        'transition': transition
      });
    },
    throttle: function(fn, delay) {
      var id = null;
      var delay = delay || 500;
      return function() {
        var ctx = this,
          args = arguments;
        clearTimeout(id);
        id = setTimeout(function() {
          fn.apply(ctx, args);
        }, delay);
      }
    }
  };

  function Louver(option) {
    this.option = option || {};
    this.$wrap = option.$wrap;
    this.$item = undefined;
    this.speed = 500;
    this.callback = undefined;
    this.isSupportTransition = true;
  }

  Louver.prototype.css = function(type, index) {
    if ('did' === type) {
      if (index < 0) {
        this.$item.removeClass('did');
      } else {
        this.$item.addClass('did');
      }
    } else if ('will' === type) {
      if (index < 0) {
        this.$item.removeClass('open');
      } else {
        this.$item.eq(index).addClass('open').siblings().removeClass('open');
      }
    }
  };

  Louver.prototype.init = function() {
    if ('object' !== typeof this.$wrap) return this;
    this.$item = this.$wrap.children();
    this.callback = this.option.callback;
    this.update(-1);
    this.isSupportTransition = util.supportCss3('transition');
    if (this.isSupportTransition) {
      util.addAnimation(this.$item, this.speed);
    }
    this.bind();
    return this;
  };

  Louver.prototype.bind = function() {
    var self = this;
    this.$item.on('mouseenter', util.throttle(function() {
      self.update($(this).index());
    }, 200));
    this.$wrap.on('mouseleave', function() {
      self.update(-1);
    });
  };

  Louver.prototype.update = function(index) {
    var self = this;
    var position = [];
    var size = [];
    var wrapWidth = this.$wrap.width();
    var itemLength = this.$item.length;
    var maxWidth = this.option.maxWidth || wrapWidth / itemLength;
    var minWidth = this.option.minWidth || 100;
    var width = index < 0 ? maxWidth : minWidth;
    var left = 0;
    var right = wrapWidth - minWidth * itemLength;
    for (var i = 0; i < itemLength; i++) {
      position[i] = index < 0 || i <= index ? left : right;
      size[i] = i === index ? wrapWidth - width * (itemLength - 1) : width;
      left += width;
      right += width;
    }
    var change = this.isSupportTransition ? 'css' : 'animate';
    self.css('will', index);
    if ('function' === typeof this.callback) {
      this.callback.apply(this, ['will', index]);
    }
    for (var j = 0; j < itemLength; j++) {
      this.$item.eq(j)[change]({
        left: position[j],
        width: size[j]
      }, this.speed);
    }
    setTimeout(function() {
      self.css('did', index);
      if ('function' === typeof self.callback) {
        self.callback.apply(self, ['did', index]);
      }
    }, this.speed);
  };

  'function' !== typeof window.Louver && (window.Louver = Louver);
})();