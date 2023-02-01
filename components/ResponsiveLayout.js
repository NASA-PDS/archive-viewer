import { Container, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        width: "100%",
        height: "100%"
    },
    [theme.breakpoints.up('xs')]: {
        outerPrimary: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2)
        }
    },
    [theme.breakpoints.up('md')]: {
        outerPrimary: {
            padding: theme.spacing(2)
        },
        innerPrimary: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2)
        }
    }
}));

export default function({primary, secondary, ...otherProps}) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
        <Container maxWidth="lg" >
            <Grid container direction="row" className={classes.outerPrimary} {...otherProps}>
                <Grid item xs className={classes.innerPrimary}>
                    {primary}
                </Grid>
                <Grid item xs={12} md={3} className={classes.innerPrimary}>
                    {secondary}
                </Grid>
            </Grid>
        </Container>
        </div>
    )
}