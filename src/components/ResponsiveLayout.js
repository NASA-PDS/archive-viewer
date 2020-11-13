import React from 'react';
import { Container, Grid, Paper} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        width: "100%",
        height: "100%"
    },
    outerPrimary: {
        padding: theme.spacing(2)
    },
    innerPrimary: {
        padding: theme.spacing(2)
    }
}));

export default function({primary, secondary}) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
        <Container maxWidth="lg" >
            <Grid container direction="row" component={Paper} square elevation={2} className={classes.outerPrimary}>
                <Grid item xs >
                    {primary}
                </Grid>
                <Grid item xs={12} sm={5} md={3} >
                    {secondary}
                </Grid>
            </Grid>
        </Container>
        </div>
    )
}