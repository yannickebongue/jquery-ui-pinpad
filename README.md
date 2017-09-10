# jQuery UI Pinpad

[![npm version][npm-badge]][npm] [![license][license-badge]][license]

The jQuery UI Pinpad is a jQuery UI widget to simulate on a web browser screen a Point Of Sale (POS) or an Encrypted PIN Pad (EPP). The aim of this widget is to display a numeric pad with optionally a decimal point key and the three basic commands Cancel, Clear and Confirm.

## Installation

Include the following Javascript and CSS:

```html
<!-- jQuery UI theme -->
<link rel="stylesheet" type="text/css" href="external/jquery-ui/jquery-ui.css">

<!-- pinpad CSS -->
<link rel="stylesheet" type="text/css" href="dist/jquery.ui.pinpad.css">

<!-- external libraries -->
<script src="external/jquery/jquery.js"></script>
<script src="external/jquery-ui/jquery-ui.js"></script>

<!-- pinpad widget -->
<script src="dist/jquery.ui.pinpad.js"></script>
```

## Usage

### Default functionality

The jQuery UI Pinpad is tied to a standard form input field.

Insert an input text where to apply the PIN pad feature

```html
<input id="pinpad">
```

Create the pinpad widget for the input text

```javascript
$( "#pinpad" ).pinpad();
```

This will generate an interactive pinpad which will be initially hidden. The user just have to focus the input (click inside or use the tab key) to open the interactive pinpad in small overlay.

### Display inline

The jQuery UI Pinpad can also be displayed embedded in the page instead of an overlay.

Insert an input text where to apply the PIN pad feature

```html
<input id="pinpad">
```

Insert the div that will contain the interactive pinpad

```html
<div id="container"></div>
```

Create the pinpad widget for the input text

```javascript
$( "#pinpad" ).pinpad( {
    appendTo: "#container"
} );
```

This will generate an interactive pinpad inside element specified by the `appendTo` option to use during the pinpad widget initialization.

## License

Copyright (c) 2016 Yannick Ebongue

Released under the MIT License (see [LICENSE.txt](LICENSE.txt))


[npm]: https://www.npmjs.org/package/jquery-ui-pinpad
[npm-badge]: https://img.shields.io/npm/v/jquery-ui-pinpad.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/github/license/yannickebongue/jquery-ui-pinpad.svg?style=flat-square
