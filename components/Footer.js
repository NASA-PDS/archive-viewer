import { Link, makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) => ({
    footer: {
        width: '100%',
        backgroundColor: theme.custom.paperTitle,
        height: '3em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)',
    
    },
    footerText: {
        margin: 0,
        padding: 0,
        textAlign: 'center',
    },
    link: {
        color: theme.palette.text.primary,
    },
    footerExtended:{
        backgroundColor: theme.palette.background.paper,
        height: '20em',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerPsiContainer: {
        padding: '1em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo: {
        width: '12em',
        background: theme.palette.common.white,
        padding: 0,
        margin: '0 0 1em 0',
        borderRadius: '10em',
    }
}))

export default function Footer() {
    const classes = useStyles()
    return (
        <div>
            <footer className={classes.footer}>
                <p className={classes.footerText}>
                    For questions about the data sets or this web site, contact us at <Link href="mailto:sbn@psi.edu">sbn@psi.edu</Link>.
                </p>
            </footer>

            <div className={classes.footerExtended}>
                <aside className={classes.footerPsiContainer}>
                    <img src="/images/PSI_Logo.png" alt="PSI Logo" title="PSI Logo" className={classes.logo}/>
                    <span>Hosted by the Planetary Science Institute</span>
                </aside>
            </div>
        </div>
    )
}