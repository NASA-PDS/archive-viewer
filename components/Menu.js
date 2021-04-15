import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles, Link } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) => ({
    menu: {
        position: 'absolute',
        top: 5,
        right: 5,
        height: 30,
        zIndex: 99
    }
}))

export default function Menu() {
    const classes = useStyles()
    return <Link href="/" className={classes.menu}><MenuIcon/></Link>
}