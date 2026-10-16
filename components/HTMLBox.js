import { useTheme } from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import React from 'react';

class HTMLBoxClass extends React.Component {
    createMarkup() {
        return {__html: this.props.markup}
    }
    render() {
        const {theme, markup} = this.props
        // Match the opaque divider used by MUI TableCell.
        const rowBorder = theme.vars?.palette?.TableCell?.border || (
            theme.palette.mode === 'light'
                ? lighten(alpha(theme.palette.divider, 1), 0.88)
                : darken(alpha(theme.palette.divider, 1), 0.68)
        )
        if(!!markup) {
            return <>
                <div className="custom" dangerouslySetInnerHTML={this.createMarkup()} />
                <style jsx global>{`
                    .custom a {
                        cursor: pointer;
                        color: ${theme.palette.primary.main};
                        text-decoration: none;
                    }
                    .custom details {
                        margin: 24px 0;
                    }
                    .custom details > summary {
                        display: list-item;
                        list-style-position: inside;
                        position: relative;
                        isolation: isolate;
                        padding: 20px 16px;
                        border-bottom: 1px solid ${rowBorder};
                        color: ${theme.palette.primary.main};
                        font-family: ${theme.typography.fontFamily};
                        font-size: ${theme.typography.body1.fontSize};
                        line-height: ${theme.typography.body1.lineHeight};
                        letter-spacing: ${theme.typography.body1.letterSpacing};
                        font-weight: ${theme.typography.fontWeightRegular};
                        cursor: pointer;
                        outline: none;
                    }
                    /* Match the List gutters around the table's ListItemButton. */
                    .custom details > summary::before {
                        content: '';
                        position: absolute;
                        inset: 8px 0 9px;
                        z-index: -1;
                        transition: ${theme.transitions.create('background-color', { duration: theme.transitions.duration.shortest })};
                    }
                    .custom details > summary:hover::before {
                        background-color: ${theme.palette.action.hover};
                    }
                    @media (hover: none) {
                        .custom details > summary:hover::before {
                            background-color: transparent;
                        }
                    }
                    .custom details > summary:focus-visible::before {
                        background-color: ${theme.palette.action.focus};
                    }
                    .custom table {
                        border: 0;
                        border-collapse: separate;
                        border-spacing: 0;
                        margin: 24px 0;
                        padding: 0;
                    
                        background: ${theme.custom.raisedContent};
                    
                        box-sizing: border-box;
                    
                        box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
                        border-radius: 4px;
                    }
                    .custom td, .custom th {
                        padding: 16px;
                        border: 0;
                    }
                    .custom td > a:only-child {
                        display: block;
                        margin: -16px;
                        padding: 16px;
                    }
                    .custom td a:hover {
                        transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                        background: ${theme.custom.raisedContentHover};
                    }
                    .custom th, .custom td i {
                        font-weight: bold;
                        font-style: normal;
                    }
                    .custom td[rowspan]:not([rowspan="1"]) {
                        vertical-align: text-top;
                    }
                    .custom th, .custom tr:not(:last-child) td{
                        border-bottom: 1px solid ${theme.palette.divider};
                    }
                    .custom p, .custom li {
                        margin: 24px 0;
                    }
                    .custom h1 {
                        font-size: 48px;
                        line-height: initial;
                        letter-spacing: 0px;
                        margin: 40px 0;
                    }
                    .custom h2 {
                        font-size: 34px;
                        line-height: initial;
                        letter-spacing: 0.25px;
                        margin: 40px 0;
                    }
                    .custom h3 {
                        font-size: 24px;
                        line-height: initial;
                        letter-spacing: 0px;
                        margin: 40px 0;
                    }
                    .custom h4 {
                        font-size: 20px;
                        line-height: initial;
                        letter-spacing: 0.15px;
                        margin: 32px 0;
                    }
                    .custom a[href^='http']:not([href*='psi.edu']):not([href*='localhost']):after {
                        background-image: url('${theme.custom.externalLinkLocation}');
                        background-size: 16px;
                        background-repeat: no-repeat;
                        background-position: 4px 4px;
                        display: inline-block;
                        padding-left: 1em;
                        padding-top: 2px;
                        width: 20px;
                        height: 20px;
                        content:"";
                    }
                    .custom td > div { /* citation boxes */
                        margin: 0;
                        padding: 5px !important;
                        height: 100% !important;
                        border-radius: 4px;
                        box-shadow:
                            ${theme.custom.insetShadowTop},
                            ${theme.custom.insetShadowBottom}; 
                        user-select: text;  
                    }
                    @media (max-width: 600px) {
                        .custom td > div {
                            display: none;
                        }
                    }
                                
                `}</style>
            </>
        }
        return null
    }
}

export default function HTMLBox(props) {
    const theme = useTheme();

    return <HTMLBoxClass {...props} theme={theme}/>
}