/* Copyright (c) 2014 Clunt Custom Fullpage
 * Licensed under the MIT License
 */
;(function() {
  var util = {
    isTouchDevice: navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/),
    isTouch: (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints)),
    isSupport3D: (function() {
      var el = document.createElement('p'),
          transforms = {
            'webkitTransform': '-webkit-transform',
            'OTransform': '-o-transform',
            'msTransform': '-ms-transform',
            'MozTransform': '-moz-transform',
            'transform': 'transform'
          },
          has3d;
      document.body.insertBefore(el, null);
      for (var t in transforms) {
        if (el.style[t] !== undefined) {
          el.style[t] = 'translate3d(1px,1px,1px)';
          has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
      }
      document.body.removeChild(el);
      return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
    }()),
    getMSPointer: function() {
      var pointer;
      //IE >= 11 & rest of browsers
      if (window.PointerEvent) {
        pointer = {
          down: 'pointerdown',
          move: 'pointermove'
        };
      } else {
        //IE < 11
        pointer = {
          down: 'MSPointerDown',
          move: 'MSPointerMove'
        };
      }
      return pointer;
    },
    isReallyTouch: function(ent) {
      return typeof ent.pointerType === 'undefined' || ent.pointerType != 'mouse';
    },
    getEventsPage: function(ent) {
      var events = [];
      events.y = (typeof ent.pageY !== 'undefined' && (ent.pageY || ent.pageX) ? ent.pageY : ent.touches[0].pageY);
      events.x = (typeof ent.pageX !== 'undefined' && (ent.pageY || ent.pageX) ? ent.pageX : ent.touches[0].pageX);
      if (util.isTouch && util.isReallyTouch(ent)) {
        events.y = ent.touches[0].pageY;
        events.x = ent.touches[0].pageX;
      }
      return events;
    },
    addAnimation: function($element, time) {
      var transition = 'all ' + time + 'ms ease';
      return $element.css({
        '-webkit-transition': transition,
        'transition': transition
      });
    },
    getTransforms: function(translate3d) {
      return {
        '-webkit-transform': translate3d,
        '-moz-transform': translate3d,
        '-ms-transform': translate3d,
        'transform': translate3d
      };
    }
  };
  function Touch(callback) {
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchEndY = 0;
    this.touchEndX = 0;
    this.callback = callback;
    if ('function' === typeof this.callback) {
      this.init();
    }
  }
  Touch.prototype.init = function() {
    var self = this;
    var MSPointer = util.getMSPointer();
    $('body').off('touchstart ' + MSPointer.down).on('touchstart ' + MSPointer.down, function(ent) {
      self.touchStartHandler(ent);
    });
    $('body').off('touchmove ' + MSPointer.move).on('touchmove ' + MSPointer.move, function(ent) {
      self.touchMoveHandler(ent);
    });
    $('body').off('touchend ' + MSPointer.move).on('touchend ' + MSPointer.move, function() {
      self.touchEndHandler();
    });
  };
  Touch.prototype.touchStartHandler = function(ent) {
    var e = ent.originalEvent;
    if (util.isReallyTouch(ent)) {
      var touchEvents = util.getEventsPage(e);
      this.touchEndY = this.touchStartY = touchEvents.y;
      this.touchEndX = this.touchStartX = touchEvents.x;
    }
  };
  Touch.prototype.touchMoveHandler = function(ent) {
    var e = ent.originalEvent;
    ent.preventDefault();
    var touchEvents = util.getEventsPage(e);
    this.touchEndY = touchEvents.y;
    this.touchEndX = touchEvents.x;
  };
  Touch.prototype.touchEndHandler = function() {
    var distanceX = this.touchEndX - this.touchStartX;
    var distanceY = this.touchEndY - this.touchStartY;
    this.callback({
      deltaX: distanceX,
      deltaY: distanceY
    });
  };
  function Fullpage(option) {
    // Selector
    this.$wrap = option.$wrap;
    this.$page = option.$page;
    this.$pages = option.$pages;
    this.$index = option.$index;
    this.$prev = option.$prev;
    this.$next = option.$next;
    this.$gotop = option.$gotop;
    this.direction = option.direction || 'y';
    // Data
    this.childW = [];
    this.childH = [];
    this.index = 0;
    this.distance = 0;
    this.total = 0;
    this.speed = 1000;
    this.status = true;
    this.resizeId = null;
    // Callback
    this.willScroll = option.willScroll;
    this.didScroll = option.didScroll;
  }
  Fullpage.prototype.init = function() {
    if ('undefined' === typeof this.$pages || 'undefined' === typeof this.$page) return this;
    var self = this;
    this.total = this.$pages.length - 1;
    this.$pages.each(function(ind) {
      self.childW[ind] = $(this).width();
      self.childH[ind] = $(this).height();
    })
    this.bind();
    this.update();
    return this;
  };
  Fullpage.prototype.bind = function() {
    var self = this;
    // Keyboard
    $(window).on('resize', function() {
      self.resize();
    });
    $(document).on('keyup', function(ent) {
      var tagName = ent.target.tagName.toLocaleUpperCase();
      var tagReg = /^(INPUT|TEXTAREA|SELECT)$/;
      if (tagReg.test(tagName)) return;
      var codeNext = self.direction === 'x' ? 39 : 40;
      var codePrev = self.direction === 'x' ? 37 : 38;
      if(ent.keyCode === codePrev) {
        self.scroll(-1);
      } else if(ent.keyCode === codeNext) {
        self.scroll(1);
      }
    });
    $(document).mousewheel(function(ent) {
      var delta = self.direction === 'x' ? ent.deltaX : ent.deltaY;
      if (delta > 0) {
        self.scroll(-1);
      } else if (delta < 0) {
        self.scroll(1);
      }
    });
    // Index
    if ('undefined' !== typeof this.$index) {
      this.$index.on('click', 'li', function() {
        var diff = $(this).index() - self.index;
        if (diff !== 0) {
          self.scroll(diff);
        }
      });
    }
    // Trun
    if ('undefined' !== typeof this.$prev) {
      this.$prev.on('click', function() {
        self.scroll(-1);
      });
    }
    if ('undefined' !== typeof this.$next) {
      this.$next.on('click', function() {
        self.scroll(1);
      });
    }
    // Gotop
    if ('undefined' !== typeof this.$gotop) {
      this.$gotop.on('click', function() {
        if (0 !== this.index) {
          self.scroll(-this.index);
        }
      });
    }
    // Touch
    if (util.isTouchDevice || util.isTouch) {
      var touch = new Touch(function(ent) {
        var delta = self.direction === 'x' ? ent.deltaX : ent.deltaY;
        if (delta > 4) {
          self.scroll(-1);
        } else if (delta < -4) {
          self.scroll(1);
        }
      });
    }
  };
  Fullpage.prototype.getDistance = function(ind) {
    var distance = 0;
    var link = this.direction === 'x' ? this.childW : this.childH;
    for (var i = 1; i <= ind; i++) {
      distance += link[i];
    }
    return distance;
  };
  Fullpage.prototype.scroll = function(direction) {
    var ind = this.index + direction;
    if (!this.status) return;
    if (ind < 0 || ind > this.total) return;
    this.status = false;
    if ('function' === typeof this.willScroll && this.index !== ind) this.willScroll.apply(this, [ind]);
    var self = this;
    var time = this.speed;
    this.index = ind;
    this.distance = this.getDistance(ind);
    this.update(time);
    if (util.isSupport3D) {
      var translate3d = this.direction === 'x' ? 'translate3d(-' + this.distance + 'px, 0px, 0px)' : 'translate3d(0px, -' + this.distance + 'px, 0px)';
      util.addAnimation(this.$page, time);
      this.$page.css(util.getTransforms(translate3d));
    } else {
      var direction = this.direction === 'x' ? 'left' : 'top';
      var animate = {};
      animate[direction] = -this.distance;
      this.$page.animate(animate, time);
    }
    setTimeout(function() {
      self.status = true;
      if ('function' === typeof self.didScroll && this.index !== ind) {
        self.didScroll.apply(self, []);
      }
    }, time);
  };
  Fullpage.prototype.resize = function() {
    var self = this;
    clearTimeout(this.resizeId);
    this.resizeId = setTimeout(function() {
      self.$pages.each(function (ind) {
        self.childW[ind] = $(this).width();
        self.childH[ind] = $(this).height();
      });
      self.scroll(0);
    }, 300);
  };
  Fullpage.prototype.update = function() {
    if ('undefined' !== typeof this.$index) {
      this.$index.children().eq(this.index).addClass('on').siblings().removeClass('on');
    }
    if (0 === this.index) {
      if ('undefined' !== typeof this.$prev) {
        this.$prev.hide();
      }
      if ('undefined' !== typeof this.$next) {
        this.$next.show();
      }
    } else if (this.total === this.index) {
      if ('undefined' !== typeof this.$prev) {
        this.$prev.show();
      }
      if ('undefined' !== typeof this.$next) {
        this.$next.hide();
      }
    } else {
      if ('undefined' !== typeof this.$prev) {
        this.$prev.show();
      }
      if ('undefined' !== typeof this.$next) {
        this.$next.show();
      }
    }
    if (0 < this.index) {
      if ('undefined' !== typeof this.$gotop) {
        this.$gotop.show();
      }
    } else {
      if ('undefined' !== typeof this.$gotop) {
        this.$gotop.hide();
      }
    }
  };
  'function' !== typeof window.Fullpage && (window.Fullpage = Fullpage);
})();