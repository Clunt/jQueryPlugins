/* Copyright (c) 2014 Clunt
 * Licensed under the MIT License
 */
(function (factory) {
  'use strict';
  // Browser Globals
  factory(jQuery);
})(function ($) {
  if (typeof $.cluntSelect !== 'undefined') {
    return;
  }
  $.fn.cluntCascadeSelect = function (option) {
    return this.each(function (index, target) {
      if (target.tagName.toLowerCase() === 'select') {
        var $target = $(target);
        if (!$target.hasClass('cluntCascadeSelect')) {
          $target.addClass('cluntCascadeSelect');
        }
      }
      function init ($select) {
        var status = {
          id : 0,
          times : 0
        };
        $select.on('change', function () {
          var $self = $(this),
              value = $select.val(),
              ajaxOption = {};
          alert('test');
          return;
          ajax(ajaxOption, ajaxSuccess, ajaxError);
        });
      }
      function ajaxSuccess (ajaxData) {
      }
      function ajaxError (err) {
      }
      function ajaxUtil (option, callback, errback) {
        $.ajax({
          type: option.type || 'GET',
          url: option.route,
          data: option.data,
          dataType: option.dataType || 'JSON',
          cache: option.cache || !1,
          success: function (result) {
            if (result.status === 200) {
              callback(null, result.data)
            } else {
              if (typeof errback !== undefined) {
                errback();
              } else {
                callback(true);
              }
            }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (typeof errback !== undefined) {
              errback();
            } else {
              callback(true);
            }
          }
        });
      }
      init($target);
    });
  }
});