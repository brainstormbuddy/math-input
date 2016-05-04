/**
 * An autogenerated component that renders the RADICAL iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const Radical = React.createClass({
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
            <defs>
                <rect id="path-1" x="13" y="16" width="8" height="8" rx="1"></rect>
                <mask id="mask-2" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox" x="0" y="0" width="8" height="8" fill="white">
                    <use xlinkHref="#path-1"></use>
                </mask>
            </defs>
            <g id="Math-Input" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="[Assets]-Math-Input" transform="translate(-1272.000000, -698.000000)">
                    <g id="math_keypad_icon_radical" transform="translate(1272.000000, 698.000000)">
                        <g id="icon">
                            <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                            <use id="box" stroke={this.props.primaryColor} mask="url(#mask-2)" strokeWidth="4" xlinkHref="#path-1"></use>
                            <polyline id="root" stroke={this.props.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="14 29 18 35 27 21 34 21"></polyline>
                        </g>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = Radical;