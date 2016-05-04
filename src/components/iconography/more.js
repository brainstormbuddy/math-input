/**
 * An autogenerated component that renders the MORE iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const More = React.createClass({
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
                <g id="[Assets]-Math-Input" transform="translate(-1000.000000, -200.000000)">
                    <g id="math_keypad_icon_on_page_numbers" transform="translate(1000.000000, 200.000000)">
                        <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                        <g id="horizontal-toggle" strokeWidth="1" transform="translate(4.000000, 16.000000)">
                            <rect id="track" fill={this.props.secondaryColor} x="0" y="0" width="40" height="16" rx="2"></rect>
                            <rect id="selection" fill="#888D93" x="0" y="0" width="20" height="16" rx="2"></rect>
                            <polyline id="radical" stroke="#E3E5E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="25 8 27 12 31 4 35 4"></polyline>
                            <path d="M10,13.168 C12.66,13.168 13.864,10.746 13.864,8.338 C13.864,5.93 12.66,3.522 10,3.522 C7.326,3.522 6.136,5.93 6.136,8.338 C6.136,10.746 7.326,13.168 10,13.168 L10,13.168 Z M10,11.404 C8.656,11.404 8.152,10.06 8.152,8.338 C8.152,6.616 8.656,5.286 10,5.286 C11.33,5.286 11.834,6.616 11.834,8.338 C11.834,10.06 11.33,11.404 10,11.404 L10,11.404 Z" id="0" fill="#FFFFFF"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = More;
