## ⚠️ Announcement ⚠️ ##

**This project was no longer maintained.**
**You could use [zurb tribute](https://github.com/zurb/tribute) instead.**

------

**An autocompletion library to autocomplete mentions, smileys etc. just like on Github!**  
[![Build Status](https://travis-ci.org/ichord/At.js.png)](https://travis-ci.org/ichord/At.js)

#### Notice

At.js now **depends on** [Caret.js](https://github.com/ichord/Caret.js).  
Please read [**CHANGELOG.md**](CHANGELOG.md) for more details if you are going to update to new version.

### Demo
http://ichord.github.com/At.js

### Documentation
https://github.com/ichord/At.js/wiki

Here is the conversion of the provided JavaScript code into an organized format, detailing the structure and key functions:

### 1. **Api Object Definition**
The `Api` object defines several key methods used in the code. Each method has a specific function that interacts with a controller or model.

- **load(at, data)**: Loads data into the model for a specified controller.
- **isSelecting()**: Checks if the view is visible and returns `true` if it is, otherwise returns `false`.
- **hide()**: Hides the view of the controller.
- **reposition()**: Repositions the view based on the rectangle (`rect`) of the controller.
- **setIframe(iframe, asRoot)**: Sets up the root element for the iframe.
- **run()**: Dispatches an event or action.
- **destroy()**: Shuts down the controller and removes the `atwho` data from the input element.

### 2. **jQuery Plugin - atwho**
The `$.fn.atwho` function is the main method for interacting with the `atwho` plugin. It supports various operations based on the method passed to it.

- **Method Behavior**:
  1. The function filters elements like `textarea`, `input`, or contenteditable elements.
  2. If the method is an object, it registers a new `App` instance.
  3. If the method exists in the `Api` object, it applies that method.
  4. If the method does not exist, it triggers an error.

### 3. **Default Settings**
The default settings for the `atwho` plugin are defined as follows:

- **at**: The trigger character for autocomplete (e.g., `@`).
- **alias**: Optional alias for the trigger.
- **data**: The data source for suggestions.
- **displayTpl**: Template for how each suggestion is displayed (`<li>${name}</li>`).
- **insertTpl**: Template for how the suggestion is inserted into the input field.
- **headerTpl**: Optional template for headers in the suggestion list.
- **callbacks**: Default callbacks used by the plugin.
- **functionOverrides**: Allows overriding default functions.
- **searchKey**: The key used for searching in the data (default is `"name"`).
- **Various Behavioral Flags**: Flags that control specific behavior (e.g., `acceptSpaceBar`, `highlightFirst`).
  
### 4. **Debugging**
The final line of the code defines the `debug` flag, allowing debug mode to be turned on or off for the `atwho` plugin.

- **$.fn.atwho.debug = false**: Debugging is turned off by default.
- 
### Compatibility

* `textarea` - Chrome, Safari, Firefox, IE7+ (maybe IE6)
* `contentEditable` - Chrome, Safari, Firefox, IE9+

### Features Preview

* Support IE 7+ for **textarea**.
* Supports HTML5  [**contentEditable**](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_Editable) elements (NOT including IE 8)
* Can listen to any character and not just '@'. Can set up multiple listeners for different characters with different behavior and data
* Listener events can be bound to multiple inputors.
* Format returned data using templates
* Keyboard controls in addition to mouse
    - `Tab` or `Enter` keys select the value
    - `Up` and `Down` navigate between values (and `Ctrl-P` and `Ctrl-N` also)
    - `Right` and `left` will re-search the keyword.
* Custom data handlers and template renderers using a group of configurable callbacks
* Supports AMD

### Requirements

* jQuery >= 1.7.0.
* [Caret.js](https://github.com/ichord/Caret.js)
    (You can use `Component` or `Bower` to install it.)

### Integrating with your Application

Simply include the following files in your HTML and you are good to go.

```html
<link href="css/jquery.atwho.css" rel="stylesheet">
<script src="http://code.jquery.com/jquery.js"></script>
<script src="js/jquery.caret.js"></script>
<script src="js/jquery.atwho.js"></script>
```

```javascript
$('#inputor').atwho({
    at: "@",
    data:['Peter', 'Tom', 'Anne']
})
```

#### Bower & Component
For installing using Bower you can use `jquery.atwho` and for Component please use `ichord/At.js`.

#### Rails
You can include At.js in your `Rails` application using the gem [jquery-atwho-rails](https://github.com/ichord/jquery-atwho-rails).

### Core Team Members

* [@ichord](https://twitter.com/_ichord) (twitter)

