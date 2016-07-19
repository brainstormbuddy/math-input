/**
 * This file contains configuration settings for the buttons in the keypad.
 */

/* globals i18n */

const Keys = require('../data/keys');
const {KeyTypes} = require('../consts');

const KeyConfigs = {
    // Basic math keys.
    [Keys.PLUS]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a plus sign.
        ariaLabel: i18n._('Plus'),
    },
    [Keys.MINUS]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a minus sign.
        ariaLabel: i18n._('Minus'),
    },
    [Keys.TOGGLE_SIGN]: {
        type: KeyTypes.OPERATOR,
        // TODO(charlie): Change this to 'Toggle negative' and add an
        // aria-pressed={true} based on the current state of the input. Right
        // now, that's tricky to do as the rendering of the keypad button is
        // ignorant of the contents of the input.
        // I18N: A label for a button that will change the input from positive
        // to negative or the other way around.
        ariaLabel: i18n._('Toggle positive/negative'),
    },
    [Keys.TIMES]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a multiplication sign (represented with an 'x').
        ariaLabel: i18n._('Multiply'),
    },
    [Keys.DIVIDE]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a division sign.
        ariaLabel: i18n._('Divide'),
    },
    [Keys.DECIMAL]: {
        type: KeyTypes.VALUE,
        // I18N: A label for a percent symbol.
        ariaLabel: i18n._('Decimal'),
    },
    [Keys.PERCENT]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a percent sign.
        ariaLabel: i18n._('Percent'),
    },
    [Keys.CDOT]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a multiplication sign (represented as a dot).
        ariaLabel: i18n._('Multiply'),
    },
    [Keys.EQUAL]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Equals sign'),
    },
    [Keys.NEQ]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Not-equals sign'),
    },
    [Keys.GT]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a 'greater than' sign (represented as '>').
        ariaLabel: i18n._('Greater than sign'),
    },
    [Keys.LT]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a 'less than' sign (represented as '<').
        ariaLabel: i18n._('Less than sign'),
    },
    [Keys.GEQ]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Greater than or equal to sign'),
    },
    [Keys.LEQ]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Less than or equal to sign'),
    },
    [Keys.FRAC]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a 'fraction' symbol.
        ariaLabel: i18n._('Fraction'),
    },
    [Keys.EXP]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a button that will allow the user to input a custom
        // exponent.
        ariaLabel: i18n._('Custom exponent'),
    },
    [Keys.EXP_2]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a button that will square (take to the second
        // power) some math.
        ariaLabel: i18n._('Square'),
    },
    [Keys.EXP_3]: {
        type: KeyTypes.OPERATOR,
        // I18N: A label for a button that will cube (take to the third power)
        // some math.
        ariaLabel: i18n._('Cube'),
    },
    [Keys.SQRT]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Square root'),
    },
    [Keys.CUBE_ROOT]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Cube root'),
    },
    [Keys.RADICAL]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Radical with custom root'),
    },
    [Keys.LEFT_PAREN]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Left parenthesis'),
    },
    [Keys.RIGHT_PAREN]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Right parenthesis'),
    },
    [Keys.LN]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Natural logarithm'),
    },
    [Keys.LOG]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Logarithm with base 10'),
    },
    [Keys.LOG_N]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Logarithm with custom base'),
    },
    [Keys.SIN]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Sine'),
    },
    [Keys.COS]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Cosine'),
    },
    [Keys.TAN]: {
        type: KeyTypes.OPERATOR,
        ariaLabel: i18n._('Tangent'),
    },
    [Keys.PI]: {
        type: KeyTypes.VALUE,
        ariaLabel: i18n._('Pi'),
        unicodeSymbol: {
            character: '\u03C0',
            italicized: true,
        },
    },
    [Keys.THETA]: {
        type: KeyTypes.VALUE,
        ariaLabel: i18n._('Theta'),
        unicodeSymbol: {
            character: '\u03B8',
            italicized: true,
        },
    },
    [Keys.NOOP]: {
        type: KeyTypes.EMPTY,
    },

    // Input navigation keys.
    [Keys.LEFT]: {
        type: KeyTypes.INPUT_NAVIGATION,
        ariaLabel: i18n._('Left arrow'),
    },
    [Keys.RIGHT]: {
        type: KeyTypes.INPUT_NAVIGATION,
        ariaLabel: i18n._('Right arrow'),
    },
    [Keys.JUMP_OUT]: {
        type: KeyTypes.INPUT_NAVIGATION,
        ariaLabel: i18n._('Navigate right'),
    },
    [Keys.BACKSPACE]: {
        type: KeyTypes.INPUT_NAVIGATION,
        // I18N: A label for a button that will delete some input.
        ariaLabel: i18n._('Delete'),
    },

    // Keypad navigation keys.
    [Keys.DISMISS]: {
        type: KeyTypes.KEYPAD_NAVIGATION,
        // I18N: A label for a button that will dismiss/hide a keypad.
        ariaLabel: i18n._('Dismiss'),
    },
};

// TODO(charlie): Use the numeral color for the 'Many' key.
KeyConfigs[Keys.MANY] = {
    type: KeyTypes.MANY,
    // childKeyIds will be configured by the client.
};

// Add in every numeral.
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
for (const num of NUMBERS) {
    // TODO(charlie): Consider removing the SVG icons that we have for the
    // numeral keys. They can be rendered just as easily with text (though that
    // would mean that we'd be using text beyond the variable key).
    const textRepresentation = `${num}`;
    KeyConfigs[`NUM_${num}`] = {
        type: KeyTypes.VALUE,
        ariaLabel: textRepresentation,
        unicodeSymbol: {
            character: textRepresentation,
            italicized: false,
        },
    };
}

// Add in every variable.
const LETTERS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];
for (const letter of LETTERS) {
    const lowerCaseVariable = letter.toLowerCase();
    const upperCaseVariable = letter.toUpperCase();

    for (const textRepresentation of [lowerCaseVariable, upperCaseVariable]) {
        KeyConfigs[textRepresentation] = {
            type: KeyTypes.VALUE,
            ariaLabel: textRepresentation,
            unicodeSymbol: {
                character: textRepresentation,
                italicized: true,
            },
        };
    }
}

for (const key of Object.keys(KeyConfigs)) {
    KeyConfigs[key] = {
        ...KeyConfigs[key],
        id: key,
    };
}

module.exports = KeyConfigs;
