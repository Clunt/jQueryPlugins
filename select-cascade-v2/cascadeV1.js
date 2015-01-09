/**
 * Copyright (c) 2014 Clunt $.fn.cascade
 * Licensed under the MIT License
 */
(function(factory) {
  factory(jQuery);
})(function($) {
  if (typeof $.fn.cascade !== 'undefined') {
    return;
  }
  $.fn.cascade = function(option) {
    function Cascade(node) {
      this.$node = $(node);
      this.node  = node;
      this.data  = {};
      this.init();
    }
    Cascade.prototype.init = function() {
      this.anaylseStructure();
      this.bind();
    };
    Cascade.prototype.bind = function() {
      var self = this;
      this.$node.on('change', function() {
        var value = $(this).val(),
            data  = self.data;
        if (value !== '' && value !== null) {
          if (typeof data[value] === 'string') {
            self.ajaxCascade(value);
          } else if (typeof data[value] === 'object') {
            self.dealCascade(value);
          }
        }
      });
    };
    Cascade.prototype.anaylseStructure = function() {
      var node    = this.node,
          options = node.options,
          path    = '',
          option,
          value;
      for (var i = 0; i < options.length; i += 1) {
        option = options[i];
        value = options[i].value;
        if (value !=='') {
          this.data[value] = path;
        }
      }
    };
    Cascade.prototype.dealCascade = function(value) {
      var self = this;
      var index = [];// TODO
      var handle = {
        input: function (data) {
          var html = '<input name="" value="">';
          return html;
        },
        textarea: function (data) {
          var html = '<textarea name=""></textarea>';
          return html;
        },
        select: function (data) {
          var options = data.option;
          var option;
          var html = '<select name="">';
          for (var i = 0; i < options.length; i += 1) {
            option = options[i];
            html += '<option value="' + option.value + '">' + option.text + '</option>';
          }
          html += '</select>'
          return html;
        }
      };
      var $html = $(function() {
        var cascades = self.data[value];
        var cascade;
        var html = '';
        for (var i = 0; i < cascades.length; i++) {
          cascade = cascades[i];
          html += handle[cascade.type](cascade);

          // TODO
          if (cascade.type == 'select') {
            index.push(i);
          }
        }
        return html;
      }());
      this.$node.nextAll().remove().end().after($html);
      for (var i = 0; i < index.length; i++) {
        var ind = index[i];
        var target = $html[ind];
        $(target).cascade();
      }
    };



    Cascade.prototype.ajaxCascade = function(value) {
      var self = this;
      !(function() {
        if (value === 'input') {
          self.data[value] = [{
            "type": "input"
          }];
        } else if (value === 'select') {
          self.data[value] = [{
            "type": "select",
            "option": [{
              "text": "美国",
              "value": "select"
            }, {
              "text": "美国",
              "value": "input"
            }, {
              "text": "中国",
              "value": "textarea"
            }]
          }];
        } else if (value === 'textarea') {
          self.data[value] = [{
            "type": "textarea"
          }];
        } else if (value === 'all') {
          self.data[value] = [{
            "type": "input"
          }, {
            "type": "textarea"
          }, {
            "type": "select",
            "option": [{
              "text": "美国",
              "value": "amarica"
            }, {
              "text": "美国",
              "value": "amarica"
            }, {
              "text": "中国",
              "value": "china"
            }]
          }];
        } else {
          self.data[value] = [{
            "type": "input"
          }, {
            "type": "textarea"
          }];
        }
      }())
      this.dealCascade(value);
    };
    return this.each(function(index, target) {
      var $target = $(target);
      if ($target.attr('data-cascade') !== undefined) {
        return;
      }
      $target.attr('data-cascade', +new Date);
      new Cascade(target);
    });
  };
});