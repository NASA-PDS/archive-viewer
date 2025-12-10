import { ListItem, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import React from 'react';

const MetadataLabel = styled(Typography)({
    marginBottom: 'auto'
});

const MetadataValue = styled(Grid)(({ theme }) => ({
    maxWidth: `calc(100vw - ${theme.spacing(3)})`,
    wordWrap: 'break-word'
}));

export function LabeledListItem({label, item}) {
    return <SplitListItem left={
        <MetadataLabel variant="h6">{label}</MetadataLabel>
    } right = {item} />
}

export function SplitListItem({left, right}) {
    return <ListItem disableGutters component={Grid} container direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
    <Grid size={{ xs: 12, sm: 3 }}>
        {left}
    </Grid>
    <MetadataValue size={{ xs: 12, sm: 9 }}>
        {right}
    </MetadataValue>
</ListItem>
}