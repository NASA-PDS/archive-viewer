import React from 'react';
import { Container, Grid, Paper} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.grey[100],
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
        <div>
            <Grid container direction="row" className={classes.root}>
                <Grid item xs={12} sm={5} md={3} className={classes.outerPrimary}>
                    {secondary}
                </Grid>
                <Grid item xs className={classes.outerPrimary}>
                    <Container maxWidth="lg" component={Paper} square elevation={2} className={classes.innerPrimary} >
                        {primary}
                    </Container>
                </Grid>
            </Grid>
        </div>
    )
}