Forked from https://github.com/hacke2/vue-append

# vue-html-js

> vue-html-js, like v-html directive, but it can call both inline and external javascript

## Install

```
npm install vue-html-js --save
# or
yarn add vue-html-js
```

#### Es6 module

- Available through npm as `vue-html-js`.

```js
import VueHtmlJs from 'vue-html-js';
Vue.use(VueHtmlJs);
```

#### CommonJS

```js
var VueHtmlJs = require('vue-html-js');
Vue.use(VueHtmlJs);
```

#### Direct include

- You can also directly include it with a `<script>` tag. It will automatically install itself, and will add a global `VueHtmlJs`.

## Event

### appended

- if html append and no throw error, it will fire `appended` event.

### appenderr

- if throw error when html appended, it will fire `appenderr` event.

## Usage

#### Using the `v-append` directive

template:

```html
<div id="app">
    <div v-html-js="{html: content, script:'jquery'}" @appended="appended"></div>
</div>
```

- `content` is the html string
- `script` is the regular expression that matches `src` in the `<script>` tag.
  If there is a match, it will insert the script into DOM and run the script.

js:

```js
import Vue from 'vue/dist/vue.esm';
import VueHtmlJs from 'vue-html-js';

// use the plugin
Vue.use(VueHtmlJs);

const html = `
<div id="test">1</div>
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script>
var i = 1;
setInterval(function() {
    document.getElementById("test").innerHTML = ++i;
}, 1000);
</script>

`;

new Vue({
  el: '#app',
  data: {
    content: html
  },
  methods: {
    appended() {
      console.log('appended!');
    }
  }
});
```

## License

[MIT](http://opensource.org/licenses/MIT)
