$(function() {
  var basic = {
    "Subject": [{
      "type": "select",
      "options": [{
        "value": "is",
        "text": "是"
      }, {
        "value": "is_not",
        "text": "不是"
      }, {
        "value": "contains",
        "text": "包含"
      }, {
        "value": "does_not_contain",
        "text": "不包含"
      }, {
        "value": "starts_with",
        "text": "以其开始"
      }, {
        "value": "ends_with",
        "text": "以其结束"
      }]
    }, {
      "type": "input",
      "value": "主题默认描述input"
    }],
    "SelectField_1": [{
      "type": "select",
      "options": [{
        "text": "是",
        "value": "is"
      }, {
        "text": "不是",
        "value": "is_not",
        "selected": "selected"
      }]
    }, {
      "type": "select",
      "options": [{
        "text": "select-a-options-1",
        "value": "0"
      }, {
        "text": "select-a-options-2",
        "value": "1"
      }, {
        "text": "select-a-options-3",
        "value": "2"
      }, {
        "text": "select-a-options-4",
        "value": "3",
        "selected": "selected"
      }]
    }],
    "SelectField_2": [{
      "type": "select",
      "options": [{
        "text": "是",
        "value": "is"
      }, {
        "text": "不是",
        "value": "is_not",
      }]
    }, {
      "type": "select",
      "options": [{
        "text": "select-b-options-1",
        "value": "0"
      }, {
        "text": "select-b-options-2",
        "value": "1"
      }, {
        "text": "select-b-options-3",
        "value": "2"
      }, {
        "text": "select-b-options-4",
        "value": "3"
      }, {
        "text": "select-b-options-5",
        "value": "4"
      }]
    }],
    "SelectField_3": [{
      "type": "select",
      "options": [{
        "text": "是",
        "value": "is"
      }, {
        "text": "不是",
        "value": "is_not",
      }]
    }, {
      "type": "select",
      "options": [{
        "text": "select-c-options-1",
        "value": "0"
      }, {
        "text": "select-c-options-2",
        "value": "1"
      }]
    }]
  };
  function genSelect(datas) {
    var html = '';
    var options;
    var data;
    var li = '';

    function preOptions(options) {
      var option;
      var selected = '';
      var disabled = '';
      var html = '';
      for (var i = 0; i < options.length; i += 1) {
        option = options[i];
        if (option.group) {
          html += '<optgroup label="' + option.group.title + '">' + preOptions(option.group.options) + '</optgroup>';
        } else {
          selected = option.selected === 'selected' ? ' selected="selected"' : '';
          disabled = option.disabled === 'disabled' ? ' disabled="disabled"' : '';
          html += '<option value="' + option.value + '"' + selected + disabled + '>' + option.text + '</option>';
          // option.selected = null;
        }
      }
      return html;
    }
    for (var i = 0; i < datas.length; i += 1) {
      data = datas[i];
      options = data.options;
      html += '<li data-count=""><div class="cascade"><select name="' + data.name + '[]">' + preOptions(options) + '</select></div><span class="btn-drop"></span><b class="btn-remove"></b></li>';
      li = '<li data-count=""><div class="cascade"><select name="' + data.name + '[]">' + preOptions(options) + '</select></div><span class="btn-drop"></span><b class="btn-remove"></b></li>';
      $(li).appendTo('#conditions').find('select').cascade({
        name: data.name + '[]',
        path: data.path,
        init: data.cascade,
        cascade: data.cascade
      });
    }
    return html;
  }
  genSelect(conditions_init);
  // var html = genSelect(conditions_init);
  // $(html).appendTo('#conditions').find('select').cascade();



});