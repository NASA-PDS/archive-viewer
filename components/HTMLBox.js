import { useTheme } from '@material-ui/core';
import React from 'react';

class HTMLBoxClass extends React.Component {
    createMarkup() {
        return {__html: this.props.markup}
    }
    render() {
        const {theme, markup} = this.props
        if(!!markup) {
            return <>
                <div className="custom" dangerouslySetInnerHTML={this.createMarkup()} />
                <style jsx global>{`
                    .custom a {
                        cursor: pointer;
                        color: ${theme.palette.primary.main};
                        text-decoration: none;
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