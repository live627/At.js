# `atwho` Library README

## Overview
`atwho` is a flexible, lightweight JavaScript library designed to create and manage dropdown menus for autocompletion. It enables developers to build features like tagging, mentions (e.g., `@username`), or any text-triggered suggestion system within editable text fields or input elements.

---

## Features
- **Customizable Dropdowns**: Fully adjustable templates for dropdown items and insertion.
- **Efficient Search and Sorting**: Built-in filtering and sorting based on user queries.
- **ContentEditable Support**: Works seamlessly with both input fields and `contenteditable` elements.
- **Callback Functions**: Customize how data is processed, displayed, and managed.
- **Key Bindings**: Supports navigation and selection with keyboard keys like `Up`, `Down`, `Enter`, and `Tab`.

---

## Installation

### NPM
```bash
npm install atwho
```

### Script Tag
Include the `atwho` script directly in your HTML file:
```html
<script src="path/to/atwho.js"></script>
```

---

## Usage

### Basic Example
```javascript
// Initialize AtWho on a textarea
const input = document.querySelector('#input');
atwho(input, {
  at: '@', // Trigger character
  data: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  displayTpl: '<div>${name}</div>',
  insertTpl: '${name}',
});
```

### Advanced Example with Callbacks
```javascript
atwho(input, {
  at: '@',
  data: '/api/users', // Remote data source
  callbacks: {
    beforeSave: (data) => data.map(user => ({ ...user, extra: 'info' })),
    filter: (query, items) => items.filter(item => item.name.includes(query)),
  },
});
```

---

## Configuration Options

# DEFAULT_SETTINGS Documentation

The `DEFAULT_SETTINGS` object contains configurable options for the system, allowing developers to customize its behavior. Each setting is described below:

| **Option**                    | **Type**                  | **Default**              | **Description**                                                                                   |
|--------------------------------|---------------------------|--------------------------|---------------------------------------------------------------------------------------------------|
| `at`                          | `string`      | `void 0`                | Character that triggers the observation (e.g., `@`).                                             |
| `alias`                       | `string`      | `void 0`                | Alias name for the `at` trigger; also serves as the `id` attribute for the popup view.           |
| `data`                        | `Array`\|`string`\|`null`       | `null`                  | Data source (array of items or a URL). If a URL, the system fetches JSON data remotely.          |
| `headerTpl`                   | `string`                 | `""`                    | HTML template for rendering the top of the dropdown, commonly used for instructions or headings. |
| `displayTpl`                  | `string`\|`function`       | `"${name}"`             | Template for rendering each item in the dropdown, allowing interpolation of data values.         |
| `insertTpl`                   | `string`                 | `"${atwho-at}${name}"`  | Template for inserting selected items into the input field using placeholders like `${name}`.    |
| `callbacks`                   | `Object`                 | `DEFAULT_CALLBACKS`     | Custom callback functions for data processing (e.g., filtering or formatting results).           |
| `searchKey`                   | `string`                 | `"name"`                | Key in the data object to search and match against the user's query.                             |
| `limit`                       | `number`                 | `5`                     | Maximum number of items displayed in the dropdown list.                                          |
| `minLen`                      | `number`                 | `0`                     | Minimum length of the query string after the trigger character (`at`).                          |
| `maxLen`                      | `number`                 | `20`                    | Maximum length of the query string after the trigger character (`at`).                          |
| `startWithSpace`              | `boolean`                | `true`                  | If `true`, the `at` trigger must be preceded by a space in the input field.                     |
| `displayTimeout`              | `number`                 | `300`                   | Time in milliseconds to keep the popup open after losing focus from the input field.            |
| `highlightFirst`              | `boolean`                | `true`                  | If `true`, the first suggestion in the dropdown is automatically highlighted.                   |
| `delay`                       | `number`\|`null`           | `null`                  | Delay time (in ms) before triggering the dropdown while typing.                                 |
| `suffix`                      | `string`\|`undefined`      | `undefined`             | String appended after inserting a matched item.                                                 |
| `lookUpOnClick`               | `boolean`                | `true`                  | If `true`, the dropdown will show on click without typing the suffix.                           |
| `hideWithoutSuffix`           | `boolean`                | `false`                 | If `true`, the dropdown will not show unless the user types the suffix.                         |

### Example Configuration

Below is an example usage of `DEFAULT_SETTINGS` with custom values:

```javascript
const customSettings = {
  at: '@',
  alias: 'mention',
  data: '/api/users',
  headerTpl: '<div class="dropdown-header">Suggestions</div>',
  displayTpl: '${name} - ${email}',
  searchKey: 'name',
  limit: 10,
  startWithSpace: false,
  displayTimeout: 500,
  highlightFirst: false,
  delay: 200,
  suffix: ' ',
  lookUpOnClick: true,
};
initializeMentionSystem(customSettings);
```
---

## Keyboard Navigation
- **Up/Down**: Navigate through dropdown items.
- **Enter/Tab**: Select the highlighted item.
- **ESC**: Close the dropdown.

---

## API Methods
| Method               | Description                                                   |
|----------------------|---------------------------------------------------------------|
| `load(at, data)`     | Loads new data for the specified trigger character (`at`).    |
| `isSelecting()`      | Returns `true` if a dropdown is currently visible.            |
| `hide()`             | Hides the dropdown.                                           |
| `reposition()`       | Repositions the dropdown based on the input field's position. |
| `setIframe(iframe)`  | Sets the iframe element as the root for dropdown placement.   |
| `destroy()`          | Shuts down the instance and removes event listeners.          |

## Callback Functions Overview

### `beforeSave`
- **Description**: Processes data before saving.
- **Signature**: `beforeSave(data: Array): Object`
- **Parameters**:
  - `data` *(Array)*: The data to be saved.
- **Returns**: An object representing the processed data in a hash format.
- **Example**:
  ```javascript
  const processedData = callbacks.beforeSave([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ]);
  ```

---

### `matcher`
- **Description**: Matches the given subtext against a regex pattern.
- **Signature**: `matcher(flag: string, subtext: string, shouldStartWithSpace: boolean, acceptSpaceBar: boolean): string | null`
- **Parameters**:
  - `flag` *(string)*: The flag used to create a regex pattern.
  - `subtext` *(string)*: The text to search within.
  - `shouldStartWithSpace` *(boolean)*: Whether the flag must be matched with a leading space.
  - `acceptSpaceBar` *(boolean)*: Whether the space bar is accepted in the match.
- **Returns**: Matched text or `null` if no match is found.
- **Example**:
  ```javascript
  const match = callbacks.matcher('@', 'Hello @Alice', true, false);
  ```

---

### `filter`
- **Description**: Filters an array of data based on a search query.
- **Signature**: `filter(query: string, items: Array, searchKey: string): Array`
- **Parameters**:
  - `query` *(string)*: The search query.
  - `items` *(Array)*: The array of items to filter.
  - `searchKey` *(string)*: The key used to search within each data object.
- **Returns**: A filtered array of data matching the query.
- **Example**:
  ```javascript
  const filteredItems = callbacks.filter('ali', [{ name: 'Alice' }, { name: 'Bob' }], 'name');
  ```

---

### `remoteFilter`
- **Description**: A placeholder for applying remote filtering (not implemented).
- **Signature**: `remoteFilter: null`

---

### `sorter`
- **Description**: Sorts an array of items based on a search query.
- **Signature**: `sorter(query: string, items: Array, searchKey: string): Array`
- **Parameters**:
  - `query` *(string)*: The search query.
  - `items` *(Array)*: The array of items to sort.
  - `searchKey` *(string)*: The key used for sorting.
- **Returns**: A sorted array of items based on query relevance.
- **Example**:
  ```javascript
  const sortedItems = callbacks.sorter('ali', [{ name: 'Alice' }, { name: 'Bob' }], 'name');
  ```

---

### `tplEval`
- **Description**: Evaluates a template string by replacing placeholders with map values.
- **Signature**: `tplEval(tpl: string | Function, map: Object): string`
- **Parameters**:
  - `tpl` *(string | Function)*: Template string or a function returning a template.
  - `map` *(Object)*: Key-value pairs to replace in the template.
- **Returns**: The evaluated template string.
- **Example**:
  ```javascript
  const output = callbacks.tplEval('${name} is here', { name: 'Alice' });
  ```

---

### `highlighter`
- **Description**: Highlights a query in a string.
- **Signature**: `highlighter(strReplace: string, strWith: string): string`
- **Parameters**:
  - `strReplace` *(string)*: The string where highlighting should occur.
  - `strWith` *(string)*: The query to highlight.
- **Returns**: The modified string with highlighted query.
- **Example**:
  ```javascript
  const highlighted = callbacks.highlighter('Alice and Bob', 'Alice');
  ```

---

### `beforeInsert`
- **Description**: Processes a value before insertion.
- **Signature**: `beforeInsert(value: string): string`
- **Parameters**:
  - `value` *(string)*: The value to process.
- **Returns**: The processed value.
- **Example**:
  ```javascript
  const processedValue = callbacks.beforeInsert('Alice');
  ```

---

### `beforeReposition`
- **Description**: Adjusts the offset before repositioning an element.
- **Signature**: `beforeReposition(offset: Object): Object`
- **Parameters**:
  - `offset` *(Object)*: The current offset.
- **Returns**: The modified offset.
- **Example**:
  ```javascript
  const newOffset = callbacks.beforeReposition({ top: 10, left: 20 });
  ```

---

### `afterMatchFailed`
- **Description**: Executes a callback after a match failure.
- **Signature**: `afterMatchFailed(): void`
- **Example**:
  ```javascript
  callbacks.afterMatchFailed();
  ```

## Usage
You can override these callbacks by providing a custom implementation when initializing the library. For example:

```javascript
const customCallbacks = {
  matcher: (flag, subtext) => {
    // Custom logic
    return subtext.includes(flag) ? subtext.split(flag)[1] : null;
  },
  filter: (query, items, key) => {
    return items.filter(item => item[key].startsWith(query));
  }
};

const settings = {
  callbacks: customCallbacks
};
```

This allows you to tailor the behavior of the library to your specific use case.
