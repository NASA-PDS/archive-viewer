import React from 'react';
import 'css/main.scss';
import 'css/FrontPage.scss'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@material-ui/core/styles';
import App from './App'
import Theme from './Theme'

// ========================================

ReactDOM.render(
    <ThemeProvider theme={Theme}>
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);
