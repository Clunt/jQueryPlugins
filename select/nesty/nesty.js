(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define('nesty', factory);
  } else {
    // Browser globals
    root.Nesty = factory();
  }
}(this, function(root) {

  function Nesty(select, settings) {
    "use strict";

    var KeyCodes = {
      'DOWN': 40,
      'UP': 38,
      'RIGHT': 39,
      'LEFT': 37,
      'TAB': 9,
      'ENTER': 13
    };

    if (!select) {
      select = {
        options: []
      };
    }

    function addEvent(elem, event, handler, capture) {
      capture = !!capture;

      if (elem.addEventListener) elem.addEventListener(event, handler, capture);
      else elem.attachEvent("on" + event, handler);
    }

    function removeEvent(elem, event, handler, capture) {
      capture = !!capture;

      if (elem.removeEventListener) elem.removeEventListener(event, handler, capture);
      else elem.detachEvent("on" + event, handler);
    }

    function getKeyCode(e) {
      e = e || document.event;
      if (typeof e.which == "number") return e.which;
      else return e.keyCode;
    }

    function matchesSelector(elem, selector) {
      var nodeList = (elem.parentNode || document).querySelectorAll(selector) || [],
        i = nodeList.length;

      while (i--) {
        if (nodeList[i] == elem) {
          return true;
        }
      }
      return false;
    }

    function nextElementSibling(el) {
      do {
        el = el.nextSibling
      } while (el && el.nodeType !== 1);
      return el;
    }

    function parseSettings(settings) {
      settings = settings || {};

      var defaults = {
        maxWidth: "300px"
      };

      // Use defaults if the user defined value is missing.
      for (var attr in defaults) {
        if (typeof settings[attr] === "undefined") {
          settings[attr] = defaults[attr];
        }
      }

      return settings;
    }

    function preventDefault(e) {
      if (e.preventDefault) e.preventDefault();
      else e.returnValue = false;
    }

    function stopPropagation(e) {
      if (e.stopPropagation) e.stopPropagation();
      else e.cancelBubble = true;
    }

    function supportsTransitions() {
      var b = document.body || document.documentElement;
      var s = b.style;
      var p = "transition";
      var v = ["Moz", "Webkit", "Khtml", "O", "ms"];

      if (typeof s[p] === "string") return true;
      p = p.charAt(0).toUpperCase() + p.substr(1);

      for (var i = 0; i < v.length; i++) {
        if (typeof s[v[i] + p] === "string") return true;
      }

      return false;
    }

    function triggerKeyupEvent(el, keyCode) {
      var e;
      if (document.createEvent) {
        e = document.createEvent('HTMLEvents');
        e.initEvent("keyup", true, true);
        e.which = keyCode
        return el.dispatchEvent(e);
      }

      // Internet Explorer
      if (document.fireEvent) {
        e = document.createEventObject("KeyboardEvent");
        e.keyCode = keyCode;
        el.fireEvent("onkeyup", e);
      }
    }

    function Model(options) {
      var events = {};

      this.getRootOption = function() {
        return options;
      };

      this.getSelectedOption = function() {
        var selectedOption;

        function traverse(obj) {
          for (var i = 0; i < obj.options.length; i++) {
            var option = obj.options[i];
            if (option.selected) {
              selectedOption = option;
              return;
            } else if (option.options) {
              traverse(option);
            }
          }
        }
        traverse(options);
        return selectedOption;
      };

      this.getParentOptionOf = function(option) {
        var parent;

        function traverse(obj) {
          for (var i = 0; i < obj.options.length; i++) {
            var _option = obj.options[i];
            if (_option === option) {
              parent = obj;
              return;
            } else if (_option.options) {
              traverse(_option);
            }
          }
        }
        traverse(options);
        return parent;
      };

      this.on = function(eventName, callback, context) {
        if (!(eventName in events)) events[eventName] = [];
        events[eventName].push({
          callback: callback,
          context: context
        });
      };

      this.trigger = function(eventName, data) {
        var registeredEvents = events[eventName];
        if (registeredEvents) {
          for (var i = 0; i < registeredEvents.length; i++) {
            var event = registeredEvents[i];
            event.callback.call(event.context, data);
          }
        }
      };

      this.expand = function(option) {
        this.trigger("expand", option);
      };

      this.collapse = function(option) {
        this.trigger("collapse", option);
      };

      this.select = function(option) {
        var selectedOption = this.getSelectedOption();
        if (selectedOption) delete selectedOption.selected;
        option.selected = true;
        this.trigger("select", option);
        if (selectedOption !== option) this.trigger("change", option);
      };
    }

    function Input(model, panel) {
      var placeholderText, firstOption;
      var input = document.createElement("a");
      input.className = "nesty-input";
      input.tabIndex = 0;

      var selectedOption = model.getSelectedOption();

      if (selectedOption) {
        placeholderText = selectedOption.label;
      } else {
        firstOption = model.getRootOption().options[0];
        placeholderText = firstOption ? firstOption.label : '';
      }

      input.textContent = placeholderText;
      input.innerText = placeholderText;

      addEvent(input, "click", onClick);
      addEvent(input, "keydown", onKeydown);
      addEvent(input, "keyup", onKeyup);

      model.on("select", function(option) {
        input.textContent = option.label;
        input.innerText = option.label;
      });

      function onKeyup(e) {
        if (getKeyCode(e) === KeyCodes.TAB) {
          launchPanel();
        }
      }

      function onClick(e) {
        stopPropagation(e);
        if (panel.isClosed()) {
          launchPanel();
        } else {
          panel.close();
        }
      }

      function onKeydown(e) {
        preventDefault(e);
        if (getKeyCode(e) === KeyCodes.DOWN) {
          launchPanel();
        }
      }

      function launchPanel() {
        panel.open();
        positionPanel();
      }

      function positionPanel() {
        var inputPos = input.getBoundingClientRect();
        var panelHeight = panel.el.offsetHeight;
        var inputHeight = input.offsetHeight;
        var windowHeight = isNaN(window.innerHeight) ? document.documentElement.clientHeight : window.innerHeight;
        var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        var offsetY = inputPos.top;

        if (windowHeight - inputPos.top < panelHeight) {
          // No room for the panel under the input element, move it above the input
          offsetY = offsetY + inputHeight - panelHeight;
        }

        panel.el.style.top = scrollPos + offsetY + "px";
        panel.el.style.left = inputPos.left + "px";
        panel.el.style.width = inputPos.right - inputPos.left + "px";
      }

      this.el = input;
    }

    /*global model*/

    function Item(model, option, attributes) {
      var item = document.createElement("li");
      item.tabIndex = -1;
      item.textContent = attributes.textContent;
      item.innerText = attributes.textContent;
      item.className = attributes.className;
      item.id = attributes.value || null;

      function visible(item) {
        return item.offsetWidth > 0 && item.offsetHeight > 0;
      }

      this.el = item;

      this.option = option;

      // expose a reference to the API on the Node
      // element for easier event delegation
      this.el.nesty = this;

      this.focus = function() {
        item.focus();
      };

      this.focusNext = function() {
        var next = item.nextSibling;
        do {
          if (next && visible(next)) {
            next.focus();
            return;
          } else if (next && next.nextSibling) {
            next = next.nextSibling;
          } else {
            return;
          }
        } while (next);
      };

      this.focusPrevious = function() {
        var prev = item.previousSibling;
        do {
          if (prev && visible(prev)) {
            prev.focus();
            return;
          } else if (prev && prev.previousSibling) {
            prev = prev.previousSibling;
          } else {
            return;
          }
        } while (prev);
      };

      this.pushIt = function() {
        if (this.isExpandable()) this.expand();
        else if (this.isCollapsable()) this.collapse();
        else this.select();
      };

      this.isExpandable = function() {
        return item.className === "nesty-expand";
      };

      this.expand = function() {
        model.expand(option);
      };

      this.isCollapsable = function() {
        return item.className === "nesty-collapse";
      };

      this.collapse = function() {
        model.collapse(option);
      };

      this.select = function() {
        model.select(option);
      };

    }

    function Menu(model, option) {
      var menu, listItems, selectedListItem, sliding;

      menu = document.createElement("ul");
      menu.style.transition = "left .2s";
      listItems = document.createDocumentFragment();

      if ("label" in option) {
        listItems.appendChild(new Item(model, option, {
          className: "nesty-collapse",
          textContent: settings.backLabel || option.label
        }).el);
      }

      for (var i = 0; i < option.options.length; i++) {
        var _option = option.options[i];
        var className = null;
        if (_option && _option.options) className = "nesty-expand";
        else if (_option && _option.selected) className = "nesty-selected";
        listItems.appendChild(new Item(model, _option, {
          className: className,
          textContent: _option.label,
          value: _option.value
        }).el);
      }

      menu.appendChild(listItems);

      addEvent(menu, "mouseover", onMouseover);
      addEvent(menu, "click", onClick);
      addEvent(menu, "keydown", onKeydown);

      function onMouseover(e) {
        var item = e.target || e.srcElement;
        item.focus();
      }

      function onClick(e) {
        var item = e.target || e.srcElement;
        if (item.nesty && item.nesty.pushIt) {
          item.nesty.pushIt();
        }
      }

      function onKeydown(e) {
        preventDefault(e);
        if (sliding) return;
        var item = e.target || e.srcElement;
        switch (e.keyCode) {
          case KeyCodes.TAB:
            onTabKeyDown();
            break;
          case KeyCodes.ENTER:
            item.nesty.pushIt();
            break;
          case KeyCodes.UP:
            item.nesty.focusPrevious();
            break;
          case KeyCodes.DOWN:
            item.nesty.focusNext();
            break;
          case KeyCodes.RIGHT:
            item.nesty.isExpandable() && item.nesty.expand();
            break;
          case KeyCodes.LEFT:
            item.nesty.isCollapsable() && item.nesty.collapse();
            break;
        }
      }

      function onTabKeyDown() {
        panel.close();
        var nextTabbable = findNextTabbable();
        if (!nextTabbable) return;
        if (nextTabbable.tagName.toLowerCase() === 'a') { // next input is a nesty
          triggerKeyupEvent(nextTabbable, KeyCodes.TAB);
        } else {
          nextTabbable.focus();
        }
      }

      function findNextTabbable() {
        var nextTabbableSelector = "input, textarea, a.nesty-input";
        var nextElement = input.el.nextElementSibling || nextElementSibling(input.el);
        var nextParent = input.el.parentNode;

        // 1) First try to find tabbable element among the siblings
        if (nextElement) {
          while (nextElement = nextElement.nextElementSibling || nextElementSibling(nextElement)) {
            if (isVisible(nextElement) && matchesSelector(nextElement, nextTabbableSelector)) {
              return nextElement;
            }
          }
        }

        // 2) Nothing was found. As a last resort, search first visible parent
        while ((nextParent = nextParent.nextElementSibling) || nextElementSibling(nextParent)) {
          if (isVisible(nextParent)) break;
        }

        // 3) Exit if no visible parent
        if (!nextParent) return false;

        // 4) Parent exists, search inside it
        var nextElements = nextParent.querySelectorAll(nextTabbableSelector);
        for (var i = 0, l = nextElements.length; i < l; i++) {
          if (isVisible(nextElements[i])) return nextElements[i];
        }

        return false;
      }

      function isVisible(el) {
        return el.getAttribute("type") !== "hidden" && $(el).is(':visible');
      }

      this.el = menu;

      this.slideTo = function(x, duration) {
        var callback, _this = this;
        sliding = true;
        menu.style.left = x;
        setTimeout(function() {
          sliding = false;
          if (typeof callback === "function") callback.call(_this);
        }, duration);
        return {
          then: function(_callback) {
            callback = _callback;
            return _this;
          }
        };
      };

      this.focus = function(option) {
        for (var i = 0; i < menu.children.length; i++) {
          var listItem = menu.children[i];
          var nestyOption = listItem.nesty.option;
          if (nestyOption === option) {
            listItem.focus();
          }
        }
      };

    }

    function Panel(model, settings) {
      var panel, menu, hasFocus, that, duration = supportsTransitions() ? 200 : 0;

      panel = document.createElement("div");
      panel.className = "nesty-panel";
      panel.style.display = "none";

      document.body.appendChild(panel);
      panel.style.maxWidth = settings.maxWidth;

      addEvent(panel, "click", stopPropagation);
      addEvent(panel, "mousedown", preventDefault);

      model.on("collapse", function(option) {
        var currentMenu = menu,
          newMenu;
        var parentOption = model.getParentOptionOf(option);
        currentMenu.slideTo("100%", duration).then(function() {
          panel.removeChild(currentMenu.el);
        });
        newMenu = new Menu(model, parentOption);
        newMenu.el.style.left = "-100%";
        panel.appendChild(newMenu.el);
        var forceReflow = menu.el.offsetTop;
        newMenu.slideTo("0px", duration).then(function() {
          newMenu.focus(option);
        });
        menu = newMenu;
      }, this);

      model.on("expand", function(option) {
        var currentMenu = menu,
          newMenu;
        currentMenu.slideTo("-100%", duration).then(function() {
          panel.removeChild(currentMenu.el);
        });
        newMenu = new Menu(model, option);
        newMenu.el.style.left = "100%";
        panel.appendChild(newMenu.el);
        var forceReflow = menu.el.offsetTop;
        newMenu.slideTo("0px", duration).then(function() {
          newMenu.focus(option);
        });
        menu = newMenu;
      }, this);

      model.on("select", function() {
        this.close();
      }, this);

      this.el = panel;

      this.isClosed = function() {
        return panel.style.display === "none";
      };

      that = this;

      function scrollHandler(evt) {
        var target = evt.target || evt.srcElement;
        // Panel is a child of body element in DOM tree. It doesn't move if Nesty is inside a
        // scrollable element which moves.

        if (!target) return;
        if (!(target === panel || target.parentNode === panel || target === document)) {
          // Something else than the panel element or the document itself is scrolling.
          // Hide the panel to avoid detached input element and panel.
          that.close();
        }
      }

      function focusHandler() {
        hasFocus = true;
      }

      function blurHandler() {
        hasFocus = false;

        // If panel doesn't get focus event 50ms after blur event then focus has moved outside of the Nesty
        setTimeout(function() {
          if (!hasFocus) {
            that.close();
          }
        }, 50);
      }

      this.open = function() {
        panel.innerHTML = "";
        var selectedOption = model.getSelectedOption();
        var option = selectedOption ? model.getParentOptionOf(selectedOption) : model.getRootOption();
        panel.style.display = "block";
        menu = new Menu(model, option);
        panel.appendChild(menu.el);
        setTimeout(function() {
          menu.focus(selectedOption === option ? selectedOption : option.options[0]);
        }, 1);

        addEvent(window, "scroll", scrollHandler, true);
        addEvent(window, "blur", blurHandler, true);
        addEvent(panel, "focus", focusHandler, true);
      };

      this.close = function() {
        panel.innerHTML = "";
        panel.style.display = "none";

        removeEvent(window, "scroll", scrollHandler, true);
        removeEvent(window, "blur", blurHandler, true);
        removeEvent(panel, "focus", focusHandler, true);
      };
    }

    function Select(element) {
      element.style.display = "none";

      model.on("change", function(option) {
        element.value = option.value;
        triggerChange();
      });

      function triggerChange() {
        var event;
        if (document.createEvent) {
          event = document.createEvent("HTMLEvents");
          event.initEvent("change", true, true);
          element.dispatchEvent(event);
        } else {
          event = document.createEventObject();
          event.eventType = "change";
          element.fireEvent("on" + event.eventType, event);
        }
      }

      this.before = function(el) {
        element.parentNode.insertBefore(el, element);
      };

    }

    function parse(select) {
      var settings = {
        options: []
      };
      for (var i = 0; i < select.children.length; i++) {
        var child = select.children[i];
        if (child.tagName === "OPTION") {
          var label = child.label || child.innerText || child.textContent;

          settings.options.push({
            label: label,
            value: child.value,
            selected: child.selected
          });
        } else if (child.tagName === "OPTGROUP") {
          var label = child.label || child.innerText || child.textContent;
          var optgroup = {
            label: label,
            value: child.value,
            options: []
          };
          for (var o = 0; o < child.children.length; o++) {
            var option = child.children[o];
            var optLabel = option.label || option.innerText || option.textContent;
            optgroup.options.push({
              label: optLabel,
              value: option.value,
              selected: option.selected
            });
          }
          settings.options.push(optgroup);
        }
      }
      return settings;
    }

    var options = select.nodeName === "SELECT" ? parse(select) : select;
    settings = parseSettings(settings);

    var model = new Model(options);
    var panel = new Panel(model, settings);
    var input = new Input(model, panel);

    if (select.nodeName === "SELECT") {
      new Select(select).before(input.el);
    }

    model.on("select", function() {
      panel.close();
    });

    addEvent(document, "click", function() {
      panel.close();
    });

    addEvent(document, "keydown", function(e) {
      if (e.which === 27) {
        panel.close();
        input.el.focus();
      }
    });

    this.panel = panel;
    this.input = input;

    this.on = model.on;

  };

  return Nesty;

}));