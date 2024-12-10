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

### Main Options
| Option              | Type                      | Default           | Description                                                                 |
|---------------------|---------------------------|-------------------|-----------------------------------------------------------------------------|
| `at`                | `string`                 | `undefined`       | The trigger character to activate dropdown (e.g., `@`, `#`, etc.).         |
| `alias`             | `string`                 | `undefined`       | Alias for the `at` trigger.                                                |
| `data`              | `Array` or `string`      | `null`            | Source of suggestions (array or URL).                                      |
| `displayTpl`        | `string` or `function`   | `${name}`         | Template for displaying items in the dropdown.                             |
| `insertTpl`         | `string`                 | `${atwho-at}${name}` | Template for inserting the selected item into the input.                   |
| `searchKey`         | `string`                 | `name`            | Key to search in data objects for matches.                                 |
| `limit`             | `number`                 | `5`               | Maximum number of items to display.                                        |
| `callbacks`         | `object`                 | `DEFAULT_CALLBACKS`| Customize data processing, filtering, and more.                            |

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
