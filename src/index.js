import React from 'react';
import 'css/main.scss';
import 'css/FrontPage.scss'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@material-ui/core/styles';
import App from './App'
import Theme from './Theme'
import AppBar from './components/Banner'

// ========================================

ReactDOM.render(
    <ThemeProvider theme={Theme}>
        <AppBar/>
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);
