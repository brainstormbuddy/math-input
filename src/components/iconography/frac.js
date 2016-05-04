/**
 * An autogenerated component that renders the FRAC iconograpy in SVG.
 *
 * Generated with: https://gist.github.com/crm416/3c7abc88e520eaed72347af240b32590.
 */
const React = require('react');

const Frac = React.createClass({
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
            <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="math_keypad_icon_fraction">
                    <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="48" height="48"></rect>
                    <g id="fraction" transform="translate(12.000000, 12.000000)">
                        <rect id="bounds" fillOpacity="0" fill="#FF0088" x="0" y="0" width="24" height="24"></rect>
                        <path d="M9,16.9970301 L9,16.9970301 L9,23.0029699 C9,22.4474734 8.55530831,22 7.99539757,22 L16.0046024,22 C15.4455817,22 15,22.4432337 15,23.0029699 L15,16.9970301 C15,17.5525266 15.4446917,18 16.0046024,18 L7.99539757,18 C8.55441832,18 9,17.5567663 9,16.9970301 L9,16.9970301 Z M7,16.9970301 C7,16.4463856 7.4556644,16 7.99539757,16 L16.0046024,16 C16.5543453,16 17,16.4530363 17,16.9970301 L17,23.0029699 C17,23.5536144 16.5443356,24 16.0046024,24 L7.99539757,24 C7.44565467,24 7,23.5469637 7,23.0029699 L7,16.9970301 L7,16.9970301 Z" id="box" fill={this.props.primaryColor}></path>
                        <rect id="bar" fill={this.props.primaryColor} x="2" y="11" width="20" height="2" rx="1"></rect>
                        <path d="M9,0.997030139 L9,0.997030139 L9,7.00296986 C9,6.44747336 8.55530831,6 7.99539757,6 L16.0046024,6 C15.4455817,6 15,6.44323373 15,7.00296986 L15,0.997030139 C15,1.55252664 15.4446917,2 16.0046024,2 L7.99539757,2 C8.55441832,2 9,1.55676627 9,0.997030139 L9,0.997030139 Z M7,0.997030139 C7,0.446385598 7.4556644,0 7.99539757,0 L16.0046024,0 C16.5543453,0 17,0.453036308 17,0.997030139 L17,7.00296986 C17,7.5536144 16.5443356,8 16.0046024,8 L7.99539757,8 C7.44565467,8 7,7.54696369 7,7.00296986 L7,0.997030139 L7,0.997030139 Z" id="box" fill={this.props.primaryColor}></path>
                    </g>
                </g>
            </g>
        </svg>;
    },
});

module.exports = Frac;