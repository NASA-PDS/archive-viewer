import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ExitToApp } from '@material-ui/icons';
import React from 'react';


const useStyles = makeStyles((theme) => ({
    img: {
        height: 150,
        width: 150,
    },
    cardContainer: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            display: 'flex',
            alignItems: 'flex-start',
            flexFlow: 'row nowrap',
        },
    },
    cardContent: {
        flex: 1
    }
}))

export default function RelatedTools({tools, noImages, noTitle}){
    if(!tools) { return null }
    return (
        <Box my={2}>
            {!noTitle && <Typography gutterBottom variant="h3">Continue your search with {tools.length > 1 ? 'these tools' : 'this tool'}</Typography> }
            <Grid container spacing={2} direction="column" justify="flex-start" alignItems="stretch">
                {tools.map(tool => (
                    <Grid item key={tool.toolId} ><ToolLink tool={tool} noImages={noImages}/></Grid>
                ))}
            </Grid>
        </Box>
    )
}

function ToolLink({tool, noImages}) {
    const classes = useStyles();
    return <Card raised={true} className={classes.cardContainer} p={1}>
            {!noImages && <CardMedia component="img" className={classes.img} image={tool.image_url} alt={'Icon for ' + tool.display_name} title={tool.display_name}/>}
            <CardContent className={classes.cardContent} p="1">
                <Typography p="3" variant="h5" component="h2" color="primary">{tool.display_name}</Typography>
                <Typography color="textPrimary" component="p" gutterBottom>{tool.name}</Typography>
                <Typography color="textSecondary" component="p">{tool.description}</Typography>
            </CardContent>
            <CardActions>
                <Button color="primary" variant="contained" endIcon={<ExitToApp/>} href={tool.directUrl ? tool.directUrl : tool.url} underline="none">Visit</Button>
            </CardActions>
        </Card>
}