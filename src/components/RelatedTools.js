import React from 'react';
import { Link, Grid, CardMedia, Typography, Card, CardContent } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    tool: {
        maxWidth: 150,
    },
});

export default function RelatedTools({tools}){
    if(!tools) { return null }
    return (
        <>
            <Typography gutterBottom variant="h4" component="h2">Useful tool{tools.length > 1 ? 's' : ''} for this data:</Typography>
            <Grid container spacing={2} direction="row" justify="flex-start" alignItems="stretch">
                {tools.map(tool => (
                    <Grid item xs={6} md={2} key={tool.toolId} ><ToolLink tool={tool}/></Grid>
                ))}
            </Grid>
        </>
    )
}

function ToolLink({tool}) {
    const classes = useStyles();
    return (
        <Link href={tool.directUrl ? tool.directUrl : tool.url} >
            <Card raised={true} className={classes.tool} p={1}>
                <CardMedia component="img" image={tool.image_url} alt={'Icon for ' + tool.display_name} title={tool.display_name}/>
                <CardContent p="1">
                    <Typography p="3" variant="h5" component="h2">{tool.display_name}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p">{tool.name}</Typography>
                </CardContent>
            </Card>
        </Link>
    )
}