import React from 'react';
import { Link, Grid, CardMedia, Typography, Card, CardContent, Box } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    tool: {
        maxWidth: 150,
        height: '100%'
    },
});

export default function RelatedTools({tools, noImages}){
    if(!tools) { return null }
    return (
        <Box my={2}>
            <Typography gutterBottom variant="h3">Tool{tools.length > 1 ? 's' : ''} for viewing this data:</Typography>
            <Grid container spacing={2} direction="row" justify="flex-start" alignItems="stretch">
                {tools.map(tool => (
                    <Grid item xs={6} sm={4} md={2} key={tool.toolId} ><ToolLink tool={tool} noImages={noImages}/></Grid>
                ))}
            </Grid>
        </Box>
    )
}

function ToolLink({tool, noImages}) {
    const classes = useStyles();
    return (
        <Link href={tool.directUrl ? tool.directUrl : tool.url} >
            <Card raised={true} className={classes.tool} p={1}>
                {!noImages && <CardMedia component="img" image={tool.image_url} alt={'Icon for ' + tool.display_name} title={tool.display_name}/>}
                <CardContent p="1">
                    <Typography p="3" variant="h5" component="h2" color="primary">{tool.display_name}</Typography>
                    <Typography variant="body2" color="textSecondary" component="p">{tool.name}</Typography>
                </CardContent>
            </Card>
        </Link>
    )
}