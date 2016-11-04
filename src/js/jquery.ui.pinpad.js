/**
 * Created by yannick.ebongue on 26/09/16.
 */

(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery", "jquery-ui"], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";

    $.extend($.ui.keyCode, {

        NUM_PAD_0: 96,
        NUM_PAD_1: 97,
        NUM_PAD_2: 98,
        NUM_PAD_3: 99,
        NUM_PAD_4: 100,
        NUM_PAD_5: 101,
        NUM_PAD_6: 102,
        NUM_PAD_7: 103,
        NUM_PAD_8: 104,
        NUM_PAD_9: 105,
        NUM_PAD_DECIMAL: 110

    });

    $.widget("ui.pinpad", {

        version: "@VERSION",
        defaultElement: "<input>",

        options: {

            /**
             * Specify whether the confirm event is triggered when the pin pad input value length reach its max length.
             */
            autoComplete: false,

            /**
             * Specify whether the pin pad input accept only digits. If set to true, the pin pad input should accept at most
             * one decimal point.
             */
            digitOnly: false,

            /**
             * Specify whether the clear command of the pin pag widget must clear the input content. If set to true, the
             * clear command clears the pin pad input content, otherwise only the last inserted character is removed.
             */
            clear: false,

            /**
             * Specify the minimum number of characters allowed to enable the confirm command.
             */
            minLength: 0,

            /**
             * Specify the maximum number of characters allowed in the pin pad input.
             */
            maxLength: Number.MAX_VALUE,

            /**
             * Specify settings for localization.
             */
            display: {
                decPoint: ".",
                cancel: "Cancel",
                correct: "Correct",
                confirm: "Confirm"
            },

            /**
             * Defines the pin pad keys layout.
             */
            keys: [
                "1 2 3",
                "4 5 6",
                "7 8 9",
                "{empty} 0 {dec}"
            ],

            /**
             * Defines the command buttons of this pin pad.
             */
            commands: [
                {position: 0, name: "cancel", options: {icon: "ui-icon-close", iconPosition: "end"}},
                {position: 1, name: "correct", options: {icon: "ui-icon-caret-1-w", iconPosition: "end"}},
                {position: 2, name: "confirm", options: {icon: "ui-icon-radio-off", iconPosition: "end"}}
            ],

            /**
             * Specify the container of the pin pad widget. Must be a valid HTML element or jQuery selector. If no matching
             * DOM element is found during rendering, the widget is inserted directly after the pin pad input.
             */
            appendTo: null
        },

        _create: function() {
            var inst = this;
            var output = $(inst.options.output);
            var maxLength = parseInt(inst.element.attr("maxlength"), 10);
            var container = $();

            inst.element.uniqueId();

            if (output.length == 0) {
                output = inst.element.clone()
                    .attr("id", inst.element.attr("id") + "_output")
                    .removeAttr("maxlength");
                output.insertAfter(inst.element);
            }
            output
                .addClass("ui-pinpad-output")
                .attr("role", "pinpad-output");
            $("label[for='" + inst.element.attr("id") + "']").each(function(index, element) {
                $(element).attr("for", output.attr("id"));
            });
            inst.outputElement = output;
            inst.element.attr("role", "pinpad-input");
            inst.element.val(inst._getDefaultValue());
            inst._addClass("ui-pinpad-input", "ui-helper-hidden");

            if (!isNaN(maxLength) && maxLength > 0) {
                inst.options.maxLength = Math.max(inst.options.minLength, maxLength);
            }

            if (!inst.options.formatter) {
                inst.options.formatter = $.ui.pinpad.defaultFormatter;
            }

            if (inst.options.appendTo) {
                container = container.add(inst.options.appendTo);
            }
            if (container.length) {
                inst.ppDiv = $("<div></div>").appendTo(container);
            } else {
                inst.ppDiv = $("<div></div>").insertAfter(output);
            }
            inst.ppDiv.addClass("ui-pinpad ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
                .data("input", inst.element);

            inst._bindInputEvents();
            //inst._drawKeys();
            //inst._drawCommands();
            inst.refresh();

            //inst._focusable(inst.outputElement);
            //inst._hoverable(inst.outputElement);

            if (!container.length) {
                delete inst.options.appendTo;
                inst.element.on("pinpadcancel", function(event, ui) {
                    inst.value(inst.element.data("initialValue"));
                });
                inst.element.on("pinpadcancel pinpadconfirm", function(event, ui) {
                    inst.element.removeData("initialValue");
                    inst._hide(inst.ppDiv, inst.options.hide);
                });
                inst.outputElement.on({
                    focusin: function(event) {
                        if (inst.ppDiv.is(":hidden")) {
                            inst.element.data("initialValue", inst.element.val());
                            inst._show(inst.ppDiv, inst.options.show);
                        }
                    },
                    focusout: function(event) {
                        if (event.relatedTarget != null) {
                            var input = $(event.relatedTarget).closest(".ui-pinpad").data("input");
                            if (!(input && input.attr("id") === inst.element.attr("id"))) {
                                inst.cancel();
                            }
                        } else {
                            inst.cancel();
                        }
                    }
                });
                inst.ppDiv.on({
                    focusout: function(event) {
                        if (!$(event.target).is(".ui-pinpad-command")) {
                            var relatedTarget = $(event.relatedTarget);
                            var input = relatedTarget.closest(".ui-pinpad").data("input");
                            if (!((input && input.attr("id") === inst.element.attr("id")) || (relatedTarget.attr("id") === inst.outputElement.attr("id")))) {
                                inst.cancel();
                            }
                        }
                    }
                });
                inst.ppDiv.position({
                    my: "left top",
                    at: "left bottom",
                    of: output
                });
                inst._addClass(inst.ppDiv, null, "ui-front");
                inst._hide(inst.ppDiv, false);
            }
        },

        /**
         * Renders the pin pad numeric keys.
         * @private
         */
        _drawKeys: function() {
            var that = this;
            var keys = [];
            var numPad = $("<div class='ui-pinpad-num-pad'></div>").appendTo(this.ppDiv);
            var table = $("<table></table>").appendTo(numPad);
            var firstKeyCode = $.ui.keyCode.NUM_PAD_0;
            var row;
            var col;
            var i, j;
            $.each(this.options.keys, function(index, row) {
                keys.push(row.split(" "));
            });
            for (i = 0; i < keys.length; i++) {
                row = $("<tr></tr>").appendTo(table);
                for (j = 0; j < keys[i].length; j++) {
                    var keyId = keys[i][j];
                    var digit = parseInt(keyId, 10);
                    col = $("<td></td>").appendTo(row);
                    if (!isNaN(digit)) {
                        $("<button type='button' class='ui-pinpad-key ui-pinpad-key-num-pad-" + digit + "' data-key-code='" + (firstKeyCode + digit) + "' value='" + digit + "'>" + digit + "</button>").appendTo(col).button();
                    } else {
                        if (/^\{\S+\}$/.test(keyId)) {
                            keyId = keyId.match(/^\{(\S+)\}$/)[1];
                            if (keyId === "dec") {
                                $("<button type='button' class='ui-pinpad-key ui-pinpad-key-num-pad-dec' data-key-code='" + $.ui.keyCode.NUM_PAD_DECIMAL + "' value='.'>" + this.options.display.decPoint + "</button>").appendTo(col).button({disabled: this.options.digitOnly});
                            } else if (keyId === "empty") {
                                $("<button type='button' class='ui-pinpad-key ui-pinpad-key-num-pad-empty' data-key-code='0'>&nbsp;</button>").appendTo(col).button();
                            }
                        }
                    }
                }
            }
            this.ppDiv.find(".ui-pinpad-key").each(function(index, element) {
                var button = $(element);
                that._bindKeyEvents(button);
            });
        },

        _drawCommands: function() {
            var that = this;
            var commands = that.options.commands;
            var commandPanel = $("<div class='ui-pinpad-command-panel'></div>").appendTo(this.ppDiv);
            var button;
            var i;
            var count = 4;
            var table = $("<table></table>").appendTo(commandPanel);
            for (i = 0; i < count; i++) {
                var row = $("<tr></tr>").appendTo(table);
                var col = $("<td></td>").appendTo(row);
                button = $("<button class='ui-pinpad-command' type='button'>&nbsp;</button>").appendTo(col).button();
            }
            $.each(commands, function(index, command) {
                button = commandPanel.find("tr:eq(" + command.position + ") .ui-pinpad-command")
                    .addClass("ui-pinpad-command-" + command.name)
                    .attr("name", command.name)
                    .button("option", $.extend({}, command.options, {
                        label: that.options.display[command.name]
                    }));
                that._bindCommandEvents(button);
            });
        },

        _updateCommands: function(commands, display) {
            var commandPanel = this.ppDiv.find(".ui-pinpad-command-panel");
            $.each(commands, function(index, command) {
                commandPanel.find(".ui-pinpad-command-" + command.name)
                    .button("option", {
                        label: display[command.name]
                    });
            });
        },

        _bindInputEvents: function() {
            var that = this;
            that._on({
                change: function(event) {
                    that._trigger("change", event);
                    var value = that.element.val();
                    var confirmCommand = that.ppDiv.find(".ui-pinpad-command-confirm");
                    var confirmDisabled = confirmCommand.button("option", "disabled");
                    var invalid = (value.length < that.options.minLength) ||
                            (that.options.autoComplete && (value.length < that.options.maxLength));
                    invalid = invalid || that.element.is(".ui-pinpad-input-invalid");
                    that.outputElement.val(that.options.formatter.format(value, that.options));
                    if (invalid && !confirmDisabled) {
                        confirmCommand.button("disable");
                    } else if (!invalid && confirmDisabled) {
                        confirmCommand.button("enable");
                    }
                    if (!invalid &&
                            that.options.autoComplete &&
                            value.length == that.options.maxLength) {
                        that.confirm();
                    }
                    event.preventDefault();
                }
            });
            that.outputElement.on({
                keydown: function(event) {
                    var keyCode = event.keyCode;
                    switch (keyCode) {
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.LEFT:
                    case $.ui.keyCode.RIGHT:
                    case $.ui.keyCode.UP:
                    case $.ui.keyCode.DOWN:
                    case $.ui.keyCode.TAB:
                        return;
                    case $.ui.keyCode.BACKSPACE:
                        if (!that.options.clear) {
                            that.ppDiv.find(".ui-pinpad-command-correct").click();
                        }
                        break;
                    case $.ui.keyCode.DELETE:
                        if (that.options.clear) {
                            that.ppDiv.find(".ui-pinpad-command-correct").click();
                        }
                        break;
                    case $.ui.keyCode.ENTER:
                        that.ppDiv.find(".ui-pinpad-command-confirm").click();
                        break;
                    case $.ui.keyCode.ESCAPE:
                        that.ppDiv.find(".ui-pinpad-command-cancel").click();
                        break;
                    case $.ui.keyCode.NUM_PAD_DECIMAL:
                        that.ppDiv.find(".ui-pinpad-key-num-pad-dec").click();
                        break;
                    default:
                        if ($.ui.pinpad.isDigit(keyCode)) {
                            that.ppDiv.find(".ui-pinpad-key-num-pad-" + (keyCode - $.ui.keyCode.NUM_PAD_0)).click();
                        }
                    }
                    event.preventDefault();
                }
            });
        },

        _bindKeyEvents: function(button) {
            this._on(button, {
                click: function(event) {
                    var keyCode = button.data("keyCode");
                    var value = this.element.val();
                    if (($.ui.pinpad.isDigit(keyCode) || ($.ui.pinpad.isDecimalPoint(keyCode) && value.indexOf(".") == -1)) &&
                            value.length < this.options.maxLength &&
                            this._trigger("keypress", event, keyCode)) {
                        this.value(value + button.val());
                    }
                }
            });
        },

        _bindCommandEvents: function(button) {
            this._on(button, {
                click: function(event) {
                    if (button.is(".ui-pinpad-command-correct")) {
                        //event.stopImmediatePropagation();
                        if (this.options.clear) {
                            this.clear();
                        } else {
                            this.backspace();
                        }
                    } else {
                        this._trigger(button.attr("name"), event);
                    }
                }
            });
        },

        /**
         * Check if the given value can be used as pin pad raw value.
         * @param value the value to check.
         * @returns {boolean} true if the value is valid, otherwise false.
         * @private
         */
        _isValid: function(value) {
            var valid = false;
            if (typeof value === "string") {
                valid = value.length == 0 || ($.ui.pinpad.isDecimalNumber(value) && !(this.options.digitOnly && value.indexOf(".") > -1));
            }
            return valid;
        },

        /**
         * Returns the options of this pin pad.
         * @returns {Object} the options of the pin pad.
         * @private
         */
        _getCreateEventData: function() {
            return this.options;
        },

        /**
         * Returns the default value of this pin pad.
         * @returns {string} the default value of the pin pad.
         * @private
         */
        _getDefaultValue: function() {
            var inputVal = this.element.val();
            return inputVal && this._isValid(inputVal) ? inputVal : "";
        },

        /**
         * Get the raw value of this pin pad.
         * @returns {string} the raw value of this pinpad.
         * @private
         */
        _getValue: function() {
            return this.element.val();
        },

        /**
         * Set the raw value of this pin pad.
         * @param newValue the new value to set.
         * @private
         */
        _setValue: function(newValue) {
            if (this._isValid(newValue)) {
                if (this.ppDiv.is(":hidden")) {
                    this.element.data("initialValue", this.element.val());
                    this._show(this.ppDiv, this.options.show);
                }
                this.element.val(newValue).change();
            }
        },

        _setOption: function(key, value) {
            var that = this;
            that._super(key, value);
            if (key === "display") {
                this.ppDiv.find(".ui-pinpad-key-num-pad-dec").button("option", "label", value.decPoint);
                this._updateCommands(this.options.commands, value);
            } else if (key === "disabled") {
                if (value) {
                    that.ppDiv.find(".ui-pinpad-key").button("disable");
                    that.ppDiv.find(".ui-pinpad-command-correct").button("disable");
                    that.ppDiv.find(".ui-pinpad-command-confirm").button("disable");
                } else {
                    that.ppDiv.find(".ui-pinpad-key").button("enable");
                    that.ppDiv.find(".ui-pinpad-key-num-pad-dec").button("option", "disabled", that.options.digitOnly);
                    that.ppDiv.find(".ui-pinpad-command-correct").button("enable");
                    that.element.change();
                }
            }
        },

        /**
         * Restore the original state of input.
         * @private
         */
        _destroy: function() {
            this.ppDiv.remove();
            this.element.next();
            this.element.removeAttr("role").removeUniqueId();
            this._off(this.element);
        },

        /**
         * Removes the last inserted character.
         */
        backspace: function() {
            var currentValue = this.element.val();
            var length = currentValue.length;
            if (length > 0) {
                this.value(currentValue.substring(0, length - 1));
            }
        },

        /**
         * Removes all inserted character.
         */
        clear: function() {
            this.value("");
        },

        /**
         * Sends a cancel command to this pinpad.
         */
        cancel: function() {
            this.ppDiv.find(".ui-pinpad-command-cancel").click();
        },

        /**
         * Sends a confirm command to this pinpad.
         */
        confirm: function() {
            this.ppDiv.find(".ui-pinpad-command-confirm").click();
        },

        /**
         * Returns the output element where the formatted value is displayed.
         * @returns {Object} the jQuery object containing the unique output DOM element of this pin pad.
         */
        output: function() {
            return this.outputElement;
        },

        /**
         * Render the pin pad with its actual state.
         */
        refresh: function() {
            this.ppDiv.find("button").button("destroy");
            this.ppDiv.empty();
            this._drawKeys();
            this._drawCommands();
            this.ppDiv.find("button").button("refresh");
            this.value(this.element.val());
        },

        /**
         * Get or set the raw value of this pinpad.
         * @param newValue the new raw value to set if not undefined.
         * @returns {string} the current raw value of this pinpad if newValue is undefined.
         */
        value: function(newValue) {
            if (newValue === undefined) {
                return this._getValue();
            }
            var val = newValue.toString();
            this._setValue(val.substring(0, Math.min(val.length, this.options.maxLength)));
            return undefined;
        },

        widget: function() {
            return this.ppDiv;
        }

    });

    $.extend($.ui.pinpad, {
        defaultFormatter: {
            format: function(value, settings) {
                return value.replace(".", settings.display.decPoint);
            }
        },

        /**
         * Generates a pin pad keys layout in order to have keys set in random position.
         * @returns {Array} the pin pad keys' layout.
         */
        generateRandomKeys: function() {
            var keys = [];
            var digits = [];
            var items = [];
            var i;
            for (i = 0; i < 10; i++) {
                digits.push(i);
            }
            for (i = digits.length; i > 0; i--) {
                var index = Math.floor(Math.random() * i);
                var digit = digits[index];
                digits.splice(index, 1);
                items.push(digit);
                if (items.length % 3 == 0) {
                    keys.push(items.join(" "));
                    items = [];
                }
            }
            keys.push(items);
            keys[keys.length - 1] = "{empty} " + keys[keys.length - 1] + " {empty}";
            return keys;
        },

        /**
         * Checks if the given key code represents a digit of the num pad.
         * @param keyCode the key code to check
         * @returns {boolean} true if the key code represents a digit of the num pad, otherwise false.
         */
        isDigit: function(keyCode) {
            return keyCode >= $.ui.keyCode.NUM_PAD_0 && keyCode <= $.ui.keyCode.NUM_PAD_9;
        },

        /**
         * Checks if the given key code represents the decimal point of the num pad.
         * @param keyCode the key code to check.
         * @returns {boolean} true if the key code represents the decimal point of the num pad, otherwise false.
         */
        isDecimalPoint: function(keyCode) {
            return keyCode == $.ui.keyCode.NUM_PAD_DECIMAL;
        },

        /**
         * Checks if the given value contains the decimal point.
         * @param value the value to check.
         * @returns {boolean}
         */
        isDecimalNumber: function(value) {
            return (/^\d+(\.\d*)?$/).test(value);
        }

    });

    return $.ui.pinpad;

}));