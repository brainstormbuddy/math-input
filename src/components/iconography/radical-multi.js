/**
 * An autogenerated component that renders the RADICAL_MULTI iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const RadicalMulti = React.createClass({
    propTypes: {
        primaryColor: React.PropTypes.string,
        secondaryColor: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            primaryColor: '#3B3E40',
            secondaryColor: '#BABEC2',
        };
    },

    render() {
        return <svg width="48px" height="48px" viewBox="0 0 48 48" version="1.1">
            <g id="Math-Input" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="[Assets]-Math-Input" transform="translate(-1272.000000, -902.000000)">
                    <g id="math_keypad_icon_radical_multi" transform="translate(1272.000000, 902.000000)">
                        <g id="icon">
                            <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                            <polyline id="root" stroke={this.props.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="14 29 18 35 27 21 34 21"></polyline>
                            <path d="M20.635,23 L20.635,21.5 L18.195,21.5 C19.855,20.34 20.585,19.47 20.585,18.45 C20.585,17.11 19.455,16.23 17.885,16.23 C16.955,16.23 15.895,16.56 15.185,17.34 L16.135,18.48 C16.615,18.03 17.175,17.75 17.915,17.75 C18.405,17.75 18.835,17.99 18.835,18.45 C18.835,19.11 18.295,19.57 15.405,21.66 L15.405,23 L20.635,23 Z" id="2" fill={this.props.primaryColor}></path>
                            <rect id="base" fill={this.props.primaryColor} opacity="0.3" transform="translate(18.000000, 26.000000) scale(1, -1) translate(-18.000000, -26.000000) " x="15" y="25" width="6" height="2" rx="1"></rect>
                        </g>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = RadicalMulti;
