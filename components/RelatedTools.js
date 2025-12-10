import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { OpenInNew } from '@mui/icons-material';
import React from 'react';

const ToolImage = styled(CardMedia)({
    height: 150,
    width: 150,
});

const ToolCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
        display: 'flex',
        alignItems: 'flex-start',
        flexFlow: 'row nowrap',
    },
}));

const ToolCardContent = styled(CardContent)({
    flex: 1
});

export default function RelatedTools({tools, noImages, noTitle}){
    if(!tools) { return null }
    return (
        <Box my={2}>
            {!noTitle && <Typography gutterBottom variant="h3">Continue your search with {tools.length > 1 ? 'these tools' : 'this tool'}</Typography> }
            <Grid container spacing={2} direction="column" sx={{ justifyContent: 'flex-start', alignItems: 'stretch' }}>
                {tools.map(tool => (
                    <Grid key={tool.toolId} ><ToolLink tool={tool} noImages={noImages}/></Grid>
                ))}
            </Grid>
        </Box>
    )
}

function ToolLink({tool, noImages}) {
    return <ToolCard raised={true} p={1}>
            {!noImages && <ToolImage component="img" image={tool.image_url} alt={'Icon for ' + tool.display_name} title={tool.display_name}/>}
            <ToolCardContent p="1">
                <Typography p="3" variant="h5" component="h2" color="primary">{tool.display_name}</Typography>
                <Typography color="textPrimary" component="p" gutterBottom>{tool.name}</Typography>
                <Typography color="textSecondary" component="p">{tool.description}</Typography>
            </ToolCardContent>
            <CardActions>
                <Button color="primary" variant="contained" endIcon={<OpenInNew/>} href={tool.directUrl ? tool.directUrl : tool.url} underline="none">Visit</Button>
            </CardActions>
        </ToolCard>
}