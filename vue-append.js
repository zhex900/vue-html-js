(function () {
  var vueAppend = {};
  var addScript = function (element) {
    setTimeout(function () {
      var target = element.ownerDocument ?
        element.ownerDocument.defaultView :
        window;
      target['eval'].call(target, element.innerHTML);
    });
  }
  var fireEvent = function (element, event) {
    if (document.createEventObject) {
      // IE浏览器支持fireEvent方法
      var evt = document.createEventObject();
      return element.fireEvent('on' + event, evt);
    } else {
      // 其他标准浏览器使用dispatchEvent方法
      var evt = document.createEvent('HTMLEvents');
      // initEvent接受3个参数：
      // 事件类型，是否冒泡，是否阻止浏览器的默认行为
      evt.initEvent(event, true, true);
      return !element.dispatchEvent(evt);
    }
  };

  var slice = [].slice,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    table = document.createElement('table'),
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tableRow = document.createElement('tr'),
    containers = {
      tr: document.createElement('tbody'),
      tbody: table,
      thead: table,
      tfoot: table,
      td: tableRow,
      th: tableRow,
      '*': document.createElement('div')
    };

  var fragment = function (html, name, properties) {
    var dom, container;
    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = document.createElement(RegExp.$1);

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';

      container = containers[name];
      container.innerHTML = '' + html;
      dom = slice.call(container.childNodes).map(function (child) {
        return container.removeChild(child);
      });
    }

    return dom;
  };

  function traverseNode(node, fun) {
    fun(node);
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun);
  }

  var append = function (nodes, target, script) {

    nodes.forEach(function (_node) {
      var node = _node.cloneNode(true);

      if (
        document.documentElement !== target &&
        document.documentElement.contains(target)
      ) {
        traverseNode(target.insertBefore(node, null), function (el) {
          if (
            el.nodeName != null &&
            el.nodeName.toUpperCase() === 'SCRIPT' &&
            (!el.type || el.type === 'text/javascript')
          ) {
            if (el.src && el.src.match(new RegExp(script, 'g'))) {
              var http = new XMLHttpRequest();
              http.open('GET', el.src, true);
              http.onreadystatechange = function () {
                if (http.readyState === 4 && http.status === 200) {
                  el.innerHTML = http.responseText;
                  addScript(el);
                }
              };
              http.send(null);
            } else {
              addScript(el);
            }
          }
        });
      }
    });
  };

  var exec = function (el, val, script) {
    if (val) {
      try {
        el.innerHTML = '';
        append(fragment(val), el, script);
        fireEvent(el, 'appended');
      } catch (e) {
        fireEvent(el, 'appenderr');
        console.error('the vue-append module parse html was error: ', val);
        console.log('--------');
        console.error(e);
      }
    }
  };

  // exposed global options
  vueAppend.config = {};

  vueAppend.install = function (Vue) {
    Vue.directive('append', {
      inserted: function (el, data) {
        exec(el, data.value.html, data.value.script);
      },
      componentUpdated: function (el, data) {
        if (data.value.html !== data.oldValue.html) {
          exec(el, data.value.html, data.value.script);
        }
      }
    });
  };

  if (typeof exports == 'object') {
    module.exports = vueAppend;
  } else if (typeof define == 'function' && define.amd) {
    define([], function () {
      return vueAppend;
    });
  } else if (window.Vue) {
    window.VueTouch = vueAppend;
    Vue.use(vueAppend);
  }
})();