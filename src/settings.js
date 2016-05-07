const queryString = require('query-string');
const { keypadTypes, switchTypes, jumpOutTypes } = require('./consts');

// test 1
// keypad_switch: [toggle], page_control, tab_bar

// tests 2 & 3 & 4
// keypad_type: number, fraction, simple_expression, [advanced_expression]
// TODO(kevinb) map these to existing keypad constants

// echo_state: [yes], no

// icon_style: simple, [fancy]

// test 5
// jump_out: static, dynamic

const parsed = queryString.parse(location.search);

const defaults = {
    keypadSwitch: switchTypes.TOGGLE,
    keypadType: keypadTypes.ADVANCED_EXPRESSION,
    jumpOutType: jumpOutTypes.STATIC,
    echoState: 'yes',
    iconStyle: 'fancy',
    debugSwitcher: 'no',
};

const settings = {
    keypadSwitch: parsed.keypad_switch || defaults.keypadSwitch,
    keypadType: parsed.keypad_type || defaults.keypadType,
    jumpOutType: parsed.jump_out_type || defaults.jumpOutType,
    echoState: parsed.echo_state || defaults.echoState,
    iconStyle: parsed.icon_style || defaults.iconStyle,
    debugSwitcher: parsed.debug_switcher || defaults.debugSwitcher,
};

// Map any values to caps.
for (const [key, value] of Object.entries(settings)) {
    settings[key] = value.toUpperCase();
}

module.exports =  settings;
