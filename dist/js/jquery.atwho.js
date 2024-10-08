/**
 * at.js - 1.5.4
 * Copyright (c) 2018 chord.luo <chord.luo@gmail.com>;
 * Homepage: http://ichord.github.com/At.js
 * License: MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["jquery"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    factory();
  }
}(this, function () {
var DEFAULT_CALLBACKS, KEY_CODE;

KEY_CODE = {
  ESC: 27,
  TAB: 9,
  ENTER: 13,
  CTRL: 17,
  A: 65,
  P: 80,
  N: 78,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  BACKSPACE: 8,
  SPACE: 32
};

DEFAULT_CALLBACKS = {
  beforeSave: function(data) {
    return Controller.arrayToDefaultHash(data);
  },
  matcher: function(flag, subtext, should_startWithSpace, acceptSpaceBar) {
    var _a, _y, match, regexp, space;
    flag = flag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    if (should_startWithSpace) {
      flag = '(?:^|\\s)' + flag;
    }
    _a = decodeURI("%C3%80");
    _y = decodeURI("%C3%BF");
    space = acceptSpaceBar ? "\ " : "";
    regexp = new RegExp(flag + "([A-Za-z" + _a + "-" + _y + "0-9_" + space + "\'\.\+\-]*)$|" + flag + "([^\\x00-\\xff]*)$", 'gi');
    match = regexp.exec(subtext);
    if (match) {
      return match[2] || match[1];
    } else {
      return null;
    }
  },
  filter: function(query, data, searchKey) {
    var _results, i, item, len;
    _results = [];
    for (i = 0, len = data.length; i < len; i++) {
      item = data[i];
      if (~new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase())) {
        _results.push(item);
      }
    }
    return _results;
  },
  remoteFilter: null,
  sorter: function(query, items, searchKey) {
    var _results, i, item, len;
    if (!query) {
      return items;
    }
    _results = [];
    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      item.atwho_order = new String(item[searchKey]).toLowerCase().indexOf(query.toLowerCase());
      if (item.atwho_order > -1) {
        _results.push(item);
      }
    }
    return _results.sort(function(a, b) {
      return a.atwho_order - b.atwho_order;
    });
  },
  tplEval: function(tpl, map) {
    var error, error1, template;
    template = tpl;
    try {
      if (typeof tpl !== 'string') {
        template = tpl(map);
      }
      return template.replace(/\$\{([^\}]*)\}/g, function(tag, key, pos) {
        return map[key];
      });
    } catch (error1) {
      error = error1;
      return "";
    }
  },
  highlighter: function(li, query) {
    var regexp;
    if (!query) {
      return li;
    }
    regexp = new RegExp(">\\s*([^\<]*?)(" + query.replace("+", "\\+") + ")([^\<]*)\\s*<", 'ig');
    return li.replace(regexp, function(str, $1, $2, $3) {
      return '> ' + $1 + '<strong>' + $2 + '</strong>' + $3 + ' <';
    });
  },
  beforeInsert: function(value, $li, e) {
    return value;
  },
  beforeReposition: function(offset) {
    return offset;
  },
  afterMatchFailed: function(at, el) {}
};


class App {
  constructor(inputor) {
    this.currentFlag = null;
    this.controllers = {};
    this.aliasMaps = {};
    this.inputor = inputor instanceof HTMLElement ? inputor : document.querySelector(inputor);
    this.setupRootElement();
    this.listen();
  }

  createContainer(doc) {
    if (this.el) {
      this.el.remove();
    }
    this.el = document.createElement('div');
    this.el.classList.add('atwho-container');
    (doc.body || document.body).appendChild(this.el);
  }

  setupRootElement(iframe = null, asRoot = false) {
    if (iframe) {
      this.window = iframe.contentWindow;
      this.document = iframe.contentDocument || this.window.document;
      this.iframe = iframe;
    } else {
      this.document = this.inputor.ownerDocument;
      this.window = this.document.defaultView || this.document.parentWindow;
      try {
        this.iframe = this.window.frameElement;
      } catch (error) {
        console.error("iframe auto-discovery failed. Set target iframe manually.");
      }
    }
    this.createContainer(asRoot ? this.document : document);
  }

  controller(at) {
    let current;
    if (this.aliasMaps[at]) {
      current = this.controllers[this.aliasMaps[at]];
    } else {
      for (let currentFlag in this.controllers) {
        if (currentFlag === at) {
          current = this.controllers[currentFlag];
          break;
        }
      }
    }
    return current || this.controllers[this.currentFlag];
  }

  setContextFor(at) {
    this.currentFlag = at;
    return this;
  }

  reg(flag, setting) {
    let controller = this.controllers[flag] || 
                     (this.inputor.isContentEditable ? new EditableController(this, flag) : new TextareaController(this, flag));
    if (setting.alias) {
      this.aliasMaps[setting.alias] = flag;
    }
    controller.init(setting);
    return this;
  }

  listen() {
    this.inputor.addEventListener('compositionstart', (e) => {
      let controller = this.controller();
      if (controller) controller.view.hide();
      this.isComposing = true;
    });

    this.inputor.addEventListener('compositionend', (e) => {
      this.isComposing = false;
      setTimeout(() => this.dispatch(e));
    });

    this.inputor.addEventListener('keyup', (e) => this.onKeyup(e));
    this.inputor.addEventListener('keydown', (e) => this.onKeydown(e));
    this.inputor.addEventListener('blur', (e) => {
      let controller = this.controller();
      if (controller) {
        controller.expectedQueryCBId = null;
        controller.view.hide(e, controller.getOpt("displayTimeout"));
      }
    });

    this.inputor.addEventListener('click', (e) => this.dispatch(e));
    this.inputor.addEventListener('scroll', () => {
      let lastScrollTop = this.inputor.scrollTop;
      return (e) => {
        let currentScrollTop = e.target.scrollTop;
        if (lastScrollTop !== currentScrollTop) {
          let controller = this.controller();
          if (controller) controller.view.hide(e);
        }
        lastScrollTop = currentScrollTop;
      };
    });
  }

  shutdown() {
    Object.values(this.controllers).forEach(controller => {
      controller.destroy();
      delete this.controllers[controller.flag];
    });
    this.inputor.removeEventListener('.atwhoInner');
    this.el.remove();
  }

  dispatch(e) {
    if (e === undefined) return;
    Object.values(this.controllers).forEach(controller => controller.lookUp(e));
  }

  onKeyup(e) {
    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        let controller = this.controller();
        if (controller) controller.view.hide();
        break;
      case KEY_CODE.DOWN:
      case KEY_CODE.UP:
      case KEY_CODE.CTRL:
      case KEY_CODE.ENTER:
        break;
      case KEY_CODE.P:
      case KEY_CODE.N:
        if (!e.ctrlKey) this.dispatch(e);
        break;
      default:
        this.dispatch(e);
    }
  }

  onKeydown(e) {
    let view = this.controller()?.view;
    if (!view?.visible()) return;

    switch (e.keyCode) {
      case KEY_CODE.ESC:
        e.preventDefault();
        view.hide(e);
        break;
      case KEY_CODE.UP:
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.DOWN:
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.P:
        if (!e.ctrlKey) return;
        e.preventDefault();
        view.prev();
        break;
      case KEY_CODE.N:
        if (!e.ctrlKey) return;
        e.preventDefault();
        view.next();
        break;
      case KEY_CODE.TAB:
      case KEY_CODE.ENTER:
      case KEY_CODE.SPACE:
        if (!view.visible()) return;
        if (view.highlighted()) {
          e.preventDefault();
          view.choose(e);
        } else {
          view.hide(e);
        }
        break;
      default:
        break;
    }
  }
}

class Controller {
  uid() {
    return (Math.random().toString(16) + "000000000").substr(2, 8) + (new Date().getTime());
  }

  constructor(app, at) {
    this.app = app;
    this.at = at;
    this.inputor = this.app.inputor;
    this.id = this.inputor.id || this.uid();
    this.expectedQueryCBId = null;
    this.setting = null;
    this.query = null;
    this.pos = 0;
    this.range = null;
    
    // Create or reuse ground element
    this.el = document.querySelector(`#atwho-ground-${this.id}`);
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.id = `atwho-ground-${this.id}`;
      this.app.el.appendChild(this.el);
    }

    this.model = new Model(this);
    this.view = new View(this);
  }

  init(setting) {
    this.setting = Object.assign({}, this.setting || $.fn.atwho.default, setting);
    this.view.init();
    return this.model.reload(this.setting.data);
  }

  destroy() {
    this.trigger('beforeDestroy');
    this.model.destroy();
    this.view.destroy();
    return this.el.remove();
  }

  callDefault(funcName, ...args) {
    try {
      return DEFAULT_CALLBACKS[funcName].apply(this, args);
    } catch (error) {
      console.error(`Error: ${error}. Maybe At.js doesn't have the function ${funcName}`);
    }
  }

  trigger(name, data = []) {
    data.push(this);
    const alias = this.getOpt('alias');
    const eventName = alias ? `${name}-${alias}.atwho` : `${name}.atwho`;
    const event = new CustomEvent(eventName, { detail: data });
    this.inputor.dispatchEvent(event);
  }

  callbacks(funcName) {
    return this.getOpt('callbacks')[funcName] || DEFAULT_CALLBACKS[funcName];
  }

  getOpt(at, default_value) {
    try {
      return this.setting[at];
    } catch (e) {
      return null;
    }
  }

  insertContentFor(li) {
    const data = Object.assign({}, li.dataset['itemData'], { 'atwho-at': this.at });
    const tpl = this.getOpt('insertTpl');
    return this.callbacks('tplEval').call(this, tpl, data, 'onInsert');
  }

  renderView(data) {
    const searchKey = this.getOpt('searchKey');
    const sortedData = this.callbacks('sorter').call(this, this.query.text, data.slice(0, 1001), searchKey);
    return this.view.render(sortedData.slice(0, this.getOpt('limit')));
  }

  static arrayToDefaultHash(data) {
    if (!Array.isArray(data)) return data;

    return data.map(item => {
      return typeof item === 'object' ? item : { name: item };
    });
  }

  lookUp(e) {
    if (e && e.type === 'click' && !this.getOpt('lookUpOnClick')) return;
    if (this.getOpt('suspendOnComposing') && this.app.isComposing) return;

    const query = this.catchQuery(e);
    if (!query) {
      this.expectedQueryCBId = null;
      return query;
    }

    this.app.setContextFor(this.at);
    const wait = this.getOpt('delay');
    if (wait) {
      this._delayLookUp(query, wait);
    } else {
      this._lookUp(query);
    }
    return query;
  }

  _delayLookUp(query, wait) {
    const now = Date.now ? Date.now() : new Date().getTime();
    this.previousCallTime = this.previousCallTime || now;
    const remaining = wait - (now - this.previousCallTime);

    if (remaining > 0 && remaining < wait) {
      this.previousCallTime = now;
      this._stopDelayedCall();
      this.delayedCallTimeout = setTimeout(() => {
        this.previousCallTime = 0;
        this.delayedCallTimeout = null;
        this._lookUp(query);
      }, wait);
    } else {
      this._stopDelayedCall();
      if (this.previousCallTime !== now) this.previousCallTime = 0;
      this._lookUp(query);
    }
  }

  _stopDelayedCall() {
    if (this.delayedCallTimeout) {
      clearTimeout(this.delayedCallTimeout);
      this.delayedCallTimeout = null;
    }
  }

  _generateQueryCBId() {
    return {};
  }

  _lookUp(query) {
    const queryCBId = this._generateQueryCBId();
    this.expectedQueryCBId = queryCBId;
    this.model.query(query.text, (data) => {
      if (queryCBId !== this.expectedQueryCBId) return;
      if (data && data.length > 0) {
        this.renderView(Controller.arrayToDefaultHash(data));
      } else {
        this.view.hide();
      }
    });
  }
}

class TextareaController extends Controller {
  catchQuery() {
    const content = this.inputor.value;
    const caretPos = this.inputor.selectionStart;
    const subtext = content.slice(0, caretPos);
    const query = this.callbacks('matcher').call(this, this.at, subtext, this.getOpt('startWithSpace'), this.getOpt('acceptSpaceBar'));

    if (typeof query === 'string' && query.length >= this.getOpt('minLen', 0) && query.length <= this.getOpt('maxLen', 20)) {
      const start = caretPos - query.length;
      const end = start + query.length;
      this.pos = start;
      this.query = { text: query, headPos: start, endPos: end };
      this.trigger('matched', [this.at, this.query.text]);
    } else {
      this.query = null;
      this.view.hide();
    }

    return this.query;
  }

  rect() {
    const caretOffset = this.inputor.getBoundingClientRect();
    if (!caretOffset) return null;

    const scaleBottom = 2;
    return {
      left: caretOffset.left,
      top: caretOffset.top,
      bottom: caretOffset.top + caretOffset.height + scaleBottom
    };
  }

  insert(content, li) {
    const source = this.inputor.value;
    const startStr = source.slice(0, Math.max(this.query.headPos - this.at.length, 0));
    const suffix = this.getOpt('suffix') || ' ';
    const newContent = startStr + content + suffix + source.slice(this.query.endPos);
    this.inputor.value = newContent;

    const newPos = startStr.length + content.length;
    this.inputor.setSelectionRange(newPos, newPos);
    this.inputor.focus();
    this.inputor.dispatchEvent(new Event('input'));
  }
}

class EditableController extends Controller {
  _getRange() {
    const sel = this.app.window.getSelection();
    if (sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
  }

  _setRange(position, node, range = this._getRange()) {
    if (!(range && node)) return;

    node = typeof node === 'string' ? document.querySelector(node) : node;

    if (position === 'after') {
      range.setEndAfter(node);
      range.setStartAfter(node);
    } else {
      range.setEndBefore(node);
      range.setStartBefore(node);
    }
    range.collapse(false);
    return this._clearRange(range);
  }

  _clearRange(range = this._getRange()) {
    const sel = this.app.window.getSelection();
    if (!this.ctrl_a_pressed) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  _movingEvent(e) {
    return e.type === 'click' || [KEY_CODE.RIGHT, KEY_CODE.LEFT, KEY_CODE.UP, KEY_CODE.DOWN].includes(e.which);
  }

  _unwrap(node) {
    const parent = node.parentNode;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
    return node;
  }

  catchQuery(e) {
    let range = this._getRange();
    if (!range || !range.collapsed) return;

    if (e.which === KEY_CODE.ENTER) {
      const query = document.querySelector('.atwho-query');
      if (query) {
        query.textContent = query.textContent;  // unwrap equivalent
        if (!query.textContent.trim()) query.remove();
      }
      const atwhoQuery = document.querySelectorAll(".atwho-query");
      atwhoQuery.forEach(query => {
        query.textContent = query.textContent;
        query.remove();
      });
      this._clearRange();
      return;
    }

    // Handle BACKSPACE for Firefox
    if (/firefox/i.test(navigator.userAgent)) {
      const startContainer = range.startContainer;
      if (e.which === KEY_CODE.BACKSPACE && startContainer.nodeType === Node.ELEMENT_NODE && range.startOffset - 1 >= 0) {
        const newRange = range.cloneRange();
        newRange.setStart(startContainer, range.startOffset - 1);
        if (newRange.cloneContents().lastChild?.classList.contains('atwho-inserted')) {
          const inserted = startContainer.childNodes[range.startOffset - 1];
          this._setRange('after', inserted.lastChild);
        }
      } else if (e.which === KEY_CODE.LEFT && startContainer.nodeType === Node.TEXT_NODE) {
        const inserted = startContainer.previousSibling;
        if (inserted && inserted.classList.contains('atwho-inserted') && range.startOffset === 0) {
          this._setRange('after', inserted.lastChild);
        }
      }
    }

    // Handling the query highlight and navigation
    const closestInserted = range.startContainer.closest('.atwho-inserted');
    if (closestInserted) {
      closestInserted.classList.add('atwho-query');
      closestInserted.siblings.forEach(sibling => sibling.classList.remove('atwho-query'));
    }

    // Remove empty query elements
    const emptyQueries = document.querySelectorAll(".atwho-query").filter(query => !query.textContent.trim());
    emptyQueries.forEach(query => query.remove());

    if (!this._movingEvent(e)) {
      document.querySelectorAll('.atwho-inserted').forEach(elem => elem.classList.remove('atwho-query'));
    }

    const matchedQuery = this._findMatchedQuery(range, e);
    if (matchedQuery) {
      this.query = matchedQuery;
      this.trigger('matched', [this.at, matchedQuery.text]);
    } else {
      this.view.hide();
      this.query = null;
    }
  }

  _findMatchedQuery(range, e) {
    let matched, isString, index;
    const queryContent = document.querySelector('.atwho-query')?.getAttribute('data-atwho-at-query');
    if (queryContent) {
      document.querySelector('.atwho-query').textContent = queryContent;
      this._setRange('after', document.querySelector('.atwho-query'), range);
    }

    const newRange = range.cloneRange();
    newRange.setStart(range.startContainer, 0);
    matched = this.callbacks('matcher').call(this, this.at, newRange.toString(), this.getOpt('startWithSpace'), this.getOpt('acceptSpaceBar'));
    isString = typeof matched === 'string';

    if (!document.querySelector('.atwho-query') && isString && (index = range.startOffset - this.at.length - matched.length) >= 0) {
      range.setStart(range.startContainer, index);
      const query = document.createElement('span');
      query.classList.add('atwho-query');
      Object.assign(query, this.getOpt("editableAtwhoQueryAttrs"));
      range.surroundContents(query);
      this._setRange('after', query.lastChild, range);
    }

    if (isString && matched.length < this.getOpt('minLen', 0)) return null;
    if (isString && matched.length <= this.getOpt('maxLen', 20)) {
      return { text: matched, el: document.querySelector('.atwho-query') };
    } else {
      return null;
    }
  }

  rect() {
    const queryEl = this.query.el;
    if (!queryEl || !queryEl.getClientRects().length) return;

    const rect = queryEl.getBoundingClientRect();
    const iframe = this.app.iframe;
    if (iframe && !this.app.iframeAsRoot) {
      const iframeRect = iframe.getBoundingClientRect();
      rect.left += iframeRect.left - this.$inputor.scrollLeft;
      rect.top += iframeRect.top - this.$inputor.scrollTop;
    }

    rect.bottom = rect.top + queryEl.offsetHeight;
    return rect;
  }

  insert(content, $li) {
    if (!this.$inputor.is(':focus')) this.$inputor.focus();
    
    const suffix = this.getOpt('suffix') || '\u00A0';
    const data = $li.dataset.itemData;

    this.query.el.classList.remove('atwho-query');
    this.query.el.classList.add('atwho-inserted');
    this.query.el.innerHTML = content;
    this.query.el.setAttribute('data-atwho-at-query', `${data['atwho-at']}${this.query.text}`);
    this.query.el.setAttribute('contenteditable', 'false');

    const range = this._getRange();
    if (range) {
      range.setEndAfter(this.query.el);
      range.collapse(false);
      const suffixNode = document.createTextNode(suffix);
      range.insertNode(suffixNode);
      this._setRange('after', suffixNode, range);
    }
    
    if (!this.$inputor.is(':focus')) this.$inputor.focus();
    return this.$inputor.dispatchEvent(new Event('change'));
  }
}

class Model {
  constructor(context) {
    this.context = context;
    this.at = context.at;
    this.storage = context.$inputor;
  }

  destroy() {
    this.storage.dataset[this.at] = null;
  }

  saved() {
    return this.fetch().length > 0;
  }

  query(query, callback) {
    let data = this.fetch();
    const searchKey = this.context.getOpt("searchKey");
    data = this.context.callbacks('filter').call(this.context, query, data, searchKey) || [];

    const remoteFilter = this.context.callbacks('remoteFilter');
    if (data.length || !remoteFilter) {
      callback(data);
    } else {
      remoteFilter.call(this.context, query, callback);
    }
  }

  fetch() {
    return this.storage.dataset[this.at] || [];
  }

  save(data) {
    this.storage.dataset[this.at] = this.context.callbacks('beforeSave').call(this.context, data || []);
  }

  load(data) {
    if (!this.saved() && data) {
      this._load(data);
    }
  }

  reload(data) {
    this._load(data);
  }

  _load(data) {
    if (typeof data === 'string') {
      fetch(data)
        .then(response => response.json())
        .then(fetchedData => this.save(fetchedData));
    } else {
      this.save(data);
    }
  }
}

class View {
  constructor(context) {
    this.context = context;
    this.$el = document.createElement('div');
    this.$el.classList.add('atwho-view');
    this.$elUl = document.createElement('ul');
    this.$el.appendChild(this.$elUl);
    this.timeoutID = null;
    this.context.$el.appendChild(this.$el);
    this.bindEvent();
  }

  init() {
    const id = this.context.getOpt("alias") || this.context.at.charCodeAt(0);
    const headerTpl = this.context.getOpt("headerTpl");

    if (headerTpl && this.$el.children.length === 1) {
      this.$el.insertAdjacentHTML('afterbegin', headerTpl);
    }
    this.$el.id = `at-view-${id}`;
  }

  destroy() {
    this.$el.remove();
  }

  bindEvent() {
    const menu = this.$el.querySelector('ul');
    let lastCoordX = 0;
    let lastCoordY = 0;

    menu.addEventListener('mousemove', e => {
      if (Math.abs(lastCoordX - e.clientX) > 5 || Math.abs(lastCoordY - e.clientY) > 5) {
        lastCoordX = e.clientX;
        lastCoordY = e.clientY;
        const targetLi = e.target.closest('li');
        if (targetLi) this._onMouseEnter(targetLi);
      }
    });

    menu.addEventListener('click', e => {
      const targetLi = e.target.closest('li');
      if (targetLi) this._onClick(targetLi);
    });
  }

  _onMouseEnter(targetLi) {
    targetLi.classList.add('active');
    targetLi.siblings.forEach(sibling => sibling.classList.remove('active'));
  }

  _onClick(targetLi) {
    this.context.callbacks('beforeInsert').call(this.context, targetLi.dataset.itemData);
    this.context.insert(targetLi.innerHTML, targetLi);
    this.context.callbacks('afterInsert').call(this.context, targetLi.dataset.itemData);
  }

  renderList(items) {
    this.clear();

    if (items.length === 0) {
      this.hide();
      return;
    }

    const ul = this.$el.querySelector('ul');
    const tpl = this.context.getOpt("tpl");
    items.forEach(item => {
      const li = document.createElement('li');
      li.dataset.itemData = item;
      li.innerHTML = tpl(item);
      ul.appendChild(li);
    });

    this.show();
  }

  show() {
    clearTimeout(this.timeoutID);
    this.$el.style.display = 'block';
  }

  hide() {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => {
      this.$el.style.display = 'none';
    }, this.context.getOpt("hideDelay"));
  }

  clear() {
    this.$el.querySelector('ul').innerHTML = '';
  }

  next() {
    const activeLi = this.$el.querySelector('li.active');
    let nextLi = activeLi ? activeLi.nextElementSibling : this.$el.querySelector('li');
    if (nextLi) {
      this._onMouseEnter(nextLi);
    }
  }

  prev() {
    const activeLi = this.$el.querySelector('li.active');
    let prevLi = activeLi ? activeLi.previousElementSibling : this.$el.querySelector('li:last-child');
    if (prevLi) {
      this._onMouseEnter(prevLi);
    }
  }

  choose() {
    const activeLi = this.$el.querySelector('li.active');
    if (activeLi) this._onClick(activeLi);
  }
}

var Api = {
  load: function(at, data) {
    var c = this.controller(at);
    if (c) {
      return c.model.load(data);
    }
  },
  isSelecting: function() {
    var ref = this.controller();
    return !!(ref && ref.view.visible());
  },
  hide: function() {
    var ref = this.controller();
    return ref && ref.view.hide();
  },
  reposition: function() {
    var c = this.controller();
    if (c) {
      return c.view.reposition(c.rect());
    }
  },
  setIframe: function(iframe, asRoot) {
    this.setupRootElement(iframe, asRoot);
    return null;
  },
  run: function() {
    return this.dispatch();
  },
  destroy: function() {
    this.shutdown();
    return this.$inputor.removeAttribute('data-atwho');
  }
};

HTMLElement.prototype.atwho = function(method, ...args) {
  let result = null;
  this.querySelectorAll('textarea, input, [contenteditable], [contenteditable="true"]').forEach((element) => {
    let app = element.dataset.atwho ? JSON.parse(element.dataset.atwho) : null;
    if (!app) {
      element.dataset.atwho = JSON.stringify(new App(element));
      app = JSON.parse(element.dataset.atwho);
    }
    if (typeof method === 'object' || !method) {
      app.reg(method.at, method);
    } else if (Api[method] && app) {
      result = Api[method].apply(app, args);
    } else {
      console.error("Method " + method + " does not exist on atwho");
    }
  });
  return result || this;
};

HTMLElement.prototype.atwho.default = {
  at: undefined,
  alias: undefined,
  data: null,
  displayTpl: "<li>${name}</li>",
  insertTpl: "${atwho-at}${name}",
  headerTpl: null,
  callbacks: DEFAULT_CALLBACKS,
  functionOverrides: {},
  searchKey: "name",
  suffix: undefined,
  hideWithoutSuffix: false,
  startWithSpace: true,
  acceptSpaceBar: false,
  highlightFirst: true,
  limit: 5,
  maxLen: 20,
  minLen: 0,
  displayTimeout: 300,
  delay: null,
  spaceSelectsMatch: false,
  tabSelectsMatch: true,
  editableAtwhoQueryAttrs: {},
  scrollDuration: 150,
  suspendOnComposing: true,
  lookUpOnClick: true
};

HTMLElement.prototype.atwho.debug = false;

})
)();
