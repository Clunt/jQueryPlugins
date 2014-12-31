/* Copyright (c) 2014 Clunt Dragger
 * Licensed under the MIT License
 */
(function (factory) {
  'use strict';
  // Browser Globals
  factory(jQuery);
})(function ($) {
  if ('undefined' !== typeof $.fn.dragger) {
    return;
  }
  /**
   * DraggerList For Store new Dragger [PreDestory]
   * @type {Object}
   */
  var DraggerList = {};
  /**
   * Class Dragger
   * @param {Object} $selelctor
   */
  function Dragger($selelctor) {
    this.$node = $selelctor;
    this.isDrag = false;
    this.init();
  }
  Dragger.prototype = {
    init: function() {
      this.$node.on('mousedown', this.mousedown.bind(this))
      $(document).on('mouseup', this.mouseup.bind(this));
    },
    mousedown: function(event) {
      event.preventDefault();
      this.isDrag = true;
      this.$node.trigger('dragstart');
      $(document).on('mousemove', this.mousemove.bind(this))
    },
    mousemove: function(event) {
      var coords = {
        x: event.pageX,
        y: event.pageY
      };
      this.$node.trigger('drag', coords);
    },
    mouseup: function() {
      if (this.isDrag) {
        this.isDrag = false;
        $(document).off('mousemove');
        this.$node.trigger('dragend');
      }
    },
    destory: function(callback) {
      this.$node.off('mousedown mousemove');
      if (undefined !== callback) {
        callback();
      }
    }
  };
  $.fn.dragger = function(options) {
    return this.each(function(index, target) {
      var $self = $(this),
          type  = options || 'on',
          stamp;
      if (type == 'on') {
        stamp = 'dargger' + (+new Date);
        DraggerList[stamp] = new Dragger($self);
        $self.attr('data-dragger-id', stamp);
      } else if (type == 'destory') {
        stamp = $self.attr('data-dragger-id');
        if (DraggerList[stamp]) {
          DraggerList[stamp].destory(function() {
            DraggerList[stamp] = null;
          });
          $self.removeAttr('data-dragger-id');
        }
      }
    });
  }
});