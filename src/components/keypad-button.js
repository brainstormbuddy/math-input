/**
 * A component that renders a keypad button.
 */

const React = require('react');
const { connect } = require('react-redux');

const { StyleSheet } = require('aphrodite');
const { Text, View } = require('../fake-react-native-web');
const Icon = require('./icon');
const MultiSymbolPopover = require('./multi-symbol-popover');
const { keyTypes, borderDirections, borderStyles } = require('../consts');
const { row, column, centered } = require('./styles');
const {
    brightGreen,
    buttonBorderColor,
    buttonBorderStyle,
    buttonBorderWidthPx,
    iconSizeHeightPx,
    iconSizeWidthPx,
} = require('./common-style');
const { keyConfigPropType, bordersPropType } = require('./prop-types');

const KeypadButton = React.createClass({
    propTypes: {
        // The borders to display on the button. Typically, this should be set
        // using one of the preset `borderStyles` options.
        borders: bordersPropType,
        buttonHeightPx: React.PropTypes.number.isRequired,
        // Any additional keys that can be accessed by long-pressing on the
        // button.
        childKeys: React.PropTypes.arrayOf(keyConfigPropType),
        focused: React.PropTypes.bool,
        // The name of the button, used to select the appropriate SVG
        // background image.
        name: React.PropTypes.string,
        onTouchCancel: React.PropTypes.func,
        onTouchEnd: React.PropTypes.func,
        onTouchMove: React.PropTypes.func,
        onTouchStart: React.PropTypes.func,
        popoverEnabled: React.PropTypes.bool,
        style: React.PropTypes.any,
        type: React.PropTypes.oneOf(Object.keys(keyTypes)).isRequired,
    },

    getDefaultProps() {
        return {
            borders: borderStyles.ALL,
            childKeys: [],
            focused: false,
            popoverEnabled: false,
        };
    },

    componentWillMount() {
        this.heightStyles = stylesForButtonHeightPx(this.props.buttonHeightPx);
    },

    componentWillUpdate(newProps, newState) {
        // Only recompute the Aphrodite StyleSheet when the button height has
        // changed. Though it is safe to recompute the StyleSheet (since
        // they're content-addressable), it saves us a bunch of hashing and
        // other work to cache it here.
        if (newProps.buttonHeightPx !== this.props.buttonHeightPx) {
            this.heightStyles = stylesForButtonHeightPx(
                newProps.buttonHeightPx
            );
        }
    },

    _getFocusStyle(type) {
        let focusBackgroundStyle;
        if (type === keyTypes.INPUT_NAVIGATION ||
                type === keyTypes.KEYPAD_NAVIGATION) {
            focusBackgroundStyle = styles.light;
        } else {
            focusBackgroundStyle = styles.bright;
        }

        return [styles.focusBox, focusBackgroundStyle];
    },

    _getButtonStyle(type, borders, style) {
        // Select the appropriate style for the button.
        let backgroundStyle;
        switch (type) {
            case keyTypes.EMPTY:
                backgroundStyle = styles.disabled;
                break;

            case keyTypes.NUMERAL:
                backgroundStyle = styles.numeral;
                break;

            case keyTypes.MANY:
            case keyTypes.MATH:
                backgroundStyle = styles.command;
                break;

            case keyTypes.INPUT_NAVIGATION:
            case keyTypes.KEYPAD_NAVIGATION:
                backgroundStyle = styles.control;
                break;

            case keyTypes.ECHO:
                backgroundStyle = null;
                break;
        }

        const borderStyle = [];
        if (borders.indexOf(borderDirections.LEFT) !== -1) {
            borderStyle.push(styles.leftBorder);
        }
        if (borders.indexOf(borderDirections.BOTTOM) !== -1) {
            borderStyle.push(styles.bottomBorder);
        }

        return [
            styles.buttonBase,
            backgroundStyle,
            ...borderStyle,
            type === keyTypes.ECHO && styles.echo,
            this.heightStyles.fullHeight,
            // React Native allows you to set the 'style' props on user defined
            // components, https://facebook.github.io/react-native/docs/style.html
            ...(Array.isArray(style) ? style : [style]),
        ];
    },

    render() {
        const {
            borders,
            childKeys,
            focused,
            name,
            onTouchCancel,
            onTouchEnd,
            onTouchMove,
            onTouchStart,
            popoverEnabled,
            style,
            type,
        } = this.props;

        // We render in the focus state if the key is focused, or if it's an
        // echo.
        const renderFocused = focused || type === keyTypes.ECHO;
        const buttonStyle = this._getButtonStyle(type, borders, style);

        const eventHandlers = {
            onTouchCancel, onTouchEnd, onTouchMove, onTouchStart,
        };
        const maybePopoverContent = popoverEnabled &&
            <MultiSymbolPopover keys={childKeys} />;

        if (type === keyTypes.EMPTY) {
            return <View style={buttonStyle} {...eventHandlers} />;
        } else if (type === keyTypes.MANY) {
            // TODO(charlie): Figure out how we're going to get the symbols. We
            // could re-add the symbol logic, but if we end up doing this with
            // SVG as well (i.e., if we need button rescaling), then it's not
            // worthwhile.
            const maxKeysPerColumn = 2;
            return <View style={buttonStyle} {...eventHandlers}>
                <View style={[row, centered, styles.singleIconSize]}>
                    <View style={column}>
                        {childKeys.slice(0, maxKeysPerColumn).map(key =>
                            <Text style={styles.extraSymbolText} key={key.id}>
                                {key.id}
                            </Text>
                        )}
                    </View>
                    <View style={column}>
                        {childKeys.slice(
                            maxKeysPerColumn, 2 * maxKeysPerColumn)
                        .map(key =>
                            <Text style={styles.extraSymbolText} key={key.id}>
                                {key.id}
                            </Text>
                        )}
                    </View>
                </View>
                {maybePopoverContent}
            </View>;
        } else {
            const focusStyle = this._getFocusStyle(type);
            return <View style={buttonStyle} {...eventHandlers}>
                <View style={renderFocused && focusStyle}>
                    <Icon name={name} focused={renderFocused} />
                </View>
                {maybePopoverContent}
            </View>;
        }
    },
});

const focusInsetPx = 4;

const styles = StyleSheet.create({
    buttonBase: {
        width: '100%',
        flexDirection: 'row',
        cursor: 'pointer',
        // Make the text unselectable
        userSelect: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        // Borders are made selectively visible.
        borderColor: buttonBorderColor,
        borderStyle: buttonBorderStyle,
        // The focus state is inset slightly from the edge of the button.
        padding: focusInsetPx,
    },

    // Overrides for the echo state, where we want to render the borders for
    // layout purposes, but we don't want them to be visible.
    echo: {
        borderColor: 'transparent',
    },

    // Styles used to create the 'additional symbols' button.
    singleIconSize: {
        height: iconSizeHeightPx,
        width: iconSizeWidthPx,
    },

    extraSymbolText: {
        margin: 1,
        // TODO(charlie): Include Proxima and set font appropriately.
        fontSize: 12,
        color: '#888d93',
    },

    // Background colors and other base styles that may vary between key types.
    numeral: {
        backgroundColor: '#FFF',
    },
    command: {
        backgroundColor: '#FAFAFA',
    },
    control: {
        backgroundColor: '#F6F7F7',
    },
    disabled: {
        backgroundColor: '#F0F1F2',
        cursor: 'default',
    },

    focusBox: {
        width: '100%',
        height: '100%',
        borderRadius: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bright: {
        backgroundColor: brightGreen,
    },
    light: {
        backgroundColor: 'rgba(33, 36, 44, 0.1)',
    },

    // Styles used to render the appropriate borders. Buttons are only allowed
    // to render left and bottom borders, to simplify layout.
    leftBorder: {
        borderLeftWidth: buttonBorderWidthPx,
    },
    bottomBorder: {
        borderBottomWidth: buttonBorderWidthPx,
    },
});

const stylesForButtonHeightPx = (buttonHeightPx) => {
    return StyleSheet.create({
        fullHeight: {
            height: buttonHeightPx,
        },
    });
};

const mapStateToProps = (state) => {
    return state.buttons;
};

module.exports = connect(mapStateToProps)(KeypadButton);
