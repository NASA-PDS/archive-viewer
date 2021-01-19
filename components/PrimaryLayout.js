import React from 'react';
import { Container, Grid, Paper} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        width: "100%",
        height: "100%"
    },
    outerPrimary: {
        padding: theme.spacing(2)
    },
    innerPrimary: {
        backgroundColor: theme.palette.grey[800],
        padding: theme.spacing(2)
    },
    innerContainer: {
        padding: 0
    } 
}));

export default function({primary, secondary, navigational}) {
    const classes = useStyles()
    return (
        <div>
            <Grid container direction="row" className={classes.root}>
                <Grid item xs={12} sm={5} md={3} className={classes.outerPrimary}>
                    {navigational}
                </Grid>
                <Grid item xs className={classes.outerPrimary}>
                    <Container maxWidth="lg" className={classes.innerContainer}>
                        <Paper square elevation={2} className={classes.innerPrimary}  >
                            {primary}
                        </Paper>
                        { secondary }
                    </Container>
                </Grid>
            </Grid>
        </div>
    )
}