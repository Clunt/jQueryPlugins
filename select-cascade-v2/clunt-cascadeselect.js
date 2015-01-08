/* Copyright (c) 2014 Clunt CascadeSelect
 * Licensed under the MIT License
 */
(function (factory) {
  'use strict';
  // Browser Globals
  factory(jQuery);
})(function ($) {
  if (typeof $.fn.cluntCascadeSelect !== 'undefined') {
    return;
  }
  $.fn.cluntCascadeSelect = function (option) {
    var option = option || {};
    return this.each(function (index, target) {
      console.log(this);
      return this;
      if (target.tagName.toLowerCase() === 'select') {
        var $target = $(target);
        if (!$target.hasClass('cluntCascadeSelect')) {
          option.name = option.name || $target.attr('name');
          option.url = option.url || $target.attr('data-url');
          $target.addClass('cluntCascadeSelect');
          init($target);
        }
      }
      function ajaxUtil (option, callback, errback) {
        $.ajax({
          type: option.type || 'GET',
          url: option.route,
          data: option.data,
          dataType: option.dataType || 'JSON',
          cache: option.cache || false,
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
      function preHtml (datas) {
        var handle = {
          input: function (data) {
            var css = option.css || '';
            var value = data.value || '';
            var html = '<input class="cluntCascadeSelectChild ' + css + '" name="' + data.name + '" value="' + value + '">';
            return html;
          },
          textarea: function (data) {
            var css = option.css || '';
            var value = data.value || '';
            var html = '<textarea class="cluntCascadeSelectChild ' + css + '" name="' + data.name + '">' + value + '</textarea>';
            return html;
          },
          select: function (data) {
            var css = option.css || '';
            if (data.next) {
              css += ' cluntCascadeSelectNext';
              var nextUrl = ' data-url="' + data.next + '"';
            }
            if (data.custom != 0) {
              css += ' cluntCascadeSelectCustom';
            }
            var dopts = data.option;
            var opt = '';
            for (var i = 0; i < dopts.length; i++) {
              var dopt = dopts[i];
              opt += '<option value="' + dopt.value + '">' + dopt.text + '</option>';
            }
            var html = '<select class="cluntCascadeSelectChild ' + css + '" name="' + data.name + '"' + nextUrl + '>' + opt + '</select>';
            return html;
          }
        };
        var html = '';
        for (var i = 0; i < datas.length; i++) {
          var data = datas[i];
          data.name = data.name || option.name;
          html += handle[data.type](data);
        }
        return html;
      }
      function dealData (data) {
        var html = preHtml(data);
        if ($target.siblings('.cluntCascadeSelectWrap').length === 0) {
          $target.parent().append('<div class="cluntCascadeSelectWrap">cluntCascadeSelectWrap</div>')
        }
        $target.siblings('.cluntCascadeSelectWrap').html(html);
        $('select.cluntCascadeSelectCustom').cluntSelect();
        $('.cluntCascadeSelectNext').cluntCascadeSelect();
      }
      function init ($select) {
        var status = {
          id : 0,
          times : 0
        };
        function getAjaxData (ajaxOption, id) {
          ajaxUtil(ajaxOption, function (ajaxData) {
            status.times = 0;
            if (status.id !== id || typeof data.length === undefined) {
              return;
            }
            dealData(ajaxData);
          }, function (err) {
            if (status.times < 3) {
              status.times += 1;
              getAjaxData(ajaxOption);
            } else {
              status.times = 0;
              alert('出错了，请页面刷新后重试');
            }
          });
        }
        $select.on('change', function () {
          var $self = $(this),
              value = $select.val(),
              ajaxOption = {
                route: option.url,
                data: {
                  cate: value
                }
              };
          status.id += 1;
          getAjaxData(ajaxOption, status.id);
        });
      }
    });
  }
});