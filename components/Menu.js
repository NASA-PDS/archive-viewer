import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles, Link } from '@material-ui/core'
import NextLink from 'next/link'
import React from 'react'

const useStyles = makeStyles((theme) => ({
    menu: {
        position: 'absolute',
        top: 5,
        right: 5,
        height: 30,
        zIndex: 99,
        color: `${theme.palette.common.white} !important`
    }
}))

export default function Menu() {
    const classes = useStyles()
    return <NextLink href="/" passHref><Link className={classes.menu}><MenuIcon/></Link></NextLink>
}