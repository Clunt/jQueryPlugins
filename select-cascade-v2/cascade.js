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
    var options = option || {};
    function Cascade(node, option) {
      this.node    = node;
      this.$node   = $(node);
      this.name    = option.name || '';
      this.path    = option.path || '';
      this.cascade = option.cascade || {};
      this.ajaxid  = 0;
      this.init();
      console.log(option);
    }
    Cascade.prototype.init = function() {
      var self = this;
      this.anaylseStructure();
      this.$node.on('change', function() {
        var value = $(this).val();
        if (typeof value === 'string') {
          self.changeCascade(value);
        }
      });
      this.$node.change();
    };
    Cascade.prototype.anaylseStructure = function() {
      var node    = this.node;
      var path    = this.path;
      var cascade = this.cascade;
      var options = node.options;
      var value;
      for (var i = 0; i < options.length; i += 1) {
        value = options[i].value;
        if (value !== '' && cascade[value] === undefined) {
          cascade[value] = path;
        }
      }
    };
    Cascade.prototype.changeCascade = function(value) {
      var cascade = this.cascade;
      if (value === '') {
        this.$node.nextAll().remove();
      } else if (typeof cascade[value] === 'string') {
        this.ajaxCascade(value);
      } else if (typeof cascade[value] === 'object') {
        this.dealCascade(value);
      }
    };
    Cascade.prototype.dealCascade = function(value) {
      var self   = this;
      var datas  = this.cascade[value];
      var index  = [];
      var handle = {
        input: function (data) {
          var value = data.value || '';
          var html = '<input name="' + self.name + '" value="' + value + '">';
          data.value = null;
          return html;
        },
        textarea: function (data) {
          var value = data.value || '';
          var html = '<textarea name="' + self.name + '">' + value + '</textarea>';
          data.value = null;
          return html;
        },
        select: function (data) {
          var options = data.options;
          var option;
          var selected = '';
          var disabled = '';
          var html = '<select name="' + self.name + '">';
          for (var i = 0; i < options.length; i += 1) {
            option = options[i];
            selected = option.selected === 'selected' ? ' selected="selected"' : '';
            disabled = option.disabled === 'disabled' ? ' disabled="disabled"' : '';
            html += '<option value="' + option.value + '"' + selected + disabled +'>' + option.text + '</option>';
            option.selected = null;
          }
          html += '</select>'
          return html;
        }
      };
      var $html = $(function() {
        var html = '';
        var data;
        for (var i = 0; i < datas.length; i++) {
          data = datas[i];
          html += handle[data.type](data);
          if (data.cascade !== undefined) {
            index.push(i);
          }
        }
        return html;
      }());
      // Insert HTML After SELECT_NODE
      this.$node.nextAll().remove().end().after($html);
      // Continue Cascade For Child
      this.childCascade(value, $html, index);
    };
    Cascade.prototype.childCascade = function(value, $group, index) {
      var datas = this.cascade[value];
      var data, target;
      for (var i = 0, j; i < index.length; i += 1) {
        j = index[i];
        data = datas[j];
        target = $group[j];
        if (typeof data.cascade === 'string') {
          data.cascade = {};
        }
        new Cascade(target, {
          'name': data.name || this.name || '',
          'path': data.path || this.path || '',
          'cascade': data.cascade
        });
      }
    }
    Cascade.prototype.ajaxCascade = function(value) {
      var self = this;
      var ajaxid = this.ajaxid + 1;
      var ajaxOption = {
        url: this.path,
        data: {
          value: value,
        }
      };
      this.ajaxid += 1;
      // TODO Remove Begin
      !(function() {
        self.cascade[value] = [{
          "type": "input"
        }];
        self.cascade[value] = [{
          "type": "select",
          "options": [{
            "text": "是",
            "value": "true"
          }, {
            "text": "否",
            "value": "false"
          }],
          "cascade": {
            "true": [{
              "type": "input"
            }]
          }
        }];
        if (value == 'true') {
          return;
        }
        if (ajaxid === self.ajaxid) {
          self.dealCascade(value);
        }
        return;
        self.cascade[value] = [{
          "type": "input"
        }];
        self.cascade[value] = [{
          "type": "textarea"
        }];
        self.cascade[value] = [{
          "type": "select",
          "options": [{
            "text": "是",
            "value": "true"
          }, {
            "text": "否",
            "value": "false"
          }],
          "path": 'abc',
          "cascade": {
            "true": [{
              "type": "input"
            }],
            "false": [{
              "type": "textarea"
            }]
          }
        }];
        self.cascade[value] = [{
          "type": "select",
          "options": [{
            "text": "是",
            "value": "true"
          }, {
            "text": "否",
            "value": "false"
          }],
          "path": 'abc',
          "cascade": {
            "true": [{
              "type": "textarea"
            }]
          }
        }];
        if (value == 'false') {
          self.cascade[value] = [{
            "type": "input"
          }];
        }
        if (ajaxid === self.ajaxid) {
          self.dealCascade(value);
        }
      }());
      return;
      // TODO Remove End
      $.ajax({
        type: 'GET',
        url: ajaxOption.url,
        data: ajaxOption.data,
        dataType: 'JSON',
        cache: false,
        success: function (result) {
          if (result.status === 200) {
            self.cascade[value] = result.data;
            if (ajaxid === self.ajaxid) {
              self.dealCascade(value);
            }
          } else {
            alert('加载失败，请刷新重试');
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          alert('加载失败，请刷新重试');
        }
      });
    };
    return this.each(function(index, target) {
      var $target = $(target);
      if ($target.attr('data-cascade') !== undefined) {
        return;
      }
      $target.attr('data-cascade', +new Date);
      // Default Option
      var option = {};
      if (options.cascade) {
        option.cascade = options.cascade;
      }
      option.path = options.path || $target.attr('data-cascade-path') || '';
      option.name = options.name || $target.attr('name') || '';
      new Cascade(target, option);
    });
  };
});