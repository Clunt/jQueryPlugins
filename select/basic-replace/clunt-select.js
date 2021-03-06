/* Copyright (c) 2014 Clunt CustomSelect
 * Licensed under the MIT License
 */
(function (factory) {
  'use strict';
  // Browser Globals
  factory(jQuery);
})(function ($) {
  if (typeof $.fn.cluntSelect !== 'undefined') {
    return;
  }
  $(function () {
    $('body').on('click', function () {
      $('.clunt-select').removeClass('open');
    });
  });
  $.fn.cluntSelect = function (option) {
    return this.each(function (index, target) {
      if (target.tagName.toLowerCase() === 'select') {
        var $target = $(target);
        if (!$target.hasClass('cluntSelect')) {
          $target.addClass('cluntSelect');
          bind($(prep(target)).insertBefore($target.hide()));
        }
      }
      function bind ($select) {
        $select.on('click', function (event) {
          if (!$(this).hasClass('open')) {
            event.stopPropagation();
            $('.clunt-select').removeClass('open');
            $(this).addClass('open').find('.param-item.checked').addClass('hover').siblings().removeClass('hover');
          }
        }).on('mouseenter', '.param-item', function () {
          if (!$(this).hasClass('disabled')) {
            $(this).addClass('hover').siblings().removeClass('hover');
          }
        }).on('click', '.param-item', function (event) {
          if ($(this).hasClass('disabled')) {
            event.stopPropagation();
          } else {
            if (!$(this).hasClass('checked')) {
              $target.val($(this).attr('data-value')).change();
            }
          }
        });
        $target.on('change', function () {
          var $checked = $select.find('.param-item[data-value="' + $(this).val() + '"]');
          $checked = $checked.eq($checked.length-1);
          updateValue($checked, $checked.html());
        })
      }
      function updateValue ($checked, text) {
        $checked.parents('.clunt-select').find('.select-show .txt').html(text);
        $checked.addClass('checked').siblings().removeClass('checked');
      }
      function prep (select) {
        var options = select.options,
            optionsLen = options.length,
            defvalue = '',
            itemList = '',
            i;
        for (i = 0; i < optionsLen; i += 1) {
          defvalue = options[i].selected ? options[i].text : defvalue;
          itemList += '<li class="param-item' + (options[i].selected ? ' checked hover' : '') + (options[i].disabled ? ' disabled' : '') + '" data-value="' + options[i].value + '"><div class="txt">' + options[i].text + '</div></li>';
        }
        return '<div class="clunt-select"><div class="select-show select-border"><div class="txt">' + defvalue + '</div><span class="arrow"></span></div><div class="select-param"><div class="select-border"><div class="select-param-inner"><ul class="param-list">' + itemList + '</ul></div></div></div></div>';
      }
    });
  };
});