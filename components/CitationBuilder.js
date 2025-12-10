import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { Help } from '@mui/icons-material';
import React, { useState } from 'react';

const FORMAT = {
    one: 'Format 1',
    two: 'Format 2',
    three: 'Format 3',
    four: 'Format 4',
}

const buildCitation = (format, dataset) => {
    switch(format) {
        default:
        case FORMAT.one: return `${dataset.title} ${dataset.citation_publication_year} ${dataset.citation_author_list} ${dataset.citation_description}`
        case FORMAT.two: return `${dataset.citation_publication_year}: ${dataset.citation_description}\n${dataset.citation_author_list}`
        case FORMAT.three: return `${dataset.title} (${dataset.citation_publication_year}) - ${dataset.citation_description}${dataset.citation_author_list}`
        case FORMAT.four: return `${dataset.citation_author_list} - ${dataset.citation_publication_year} - ${dataset.citation_description}`
    }
}

const ContainerGrid = styled(Grid)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%'
}));

const CitationField = styled(TextField)({
    width: '100%'
});

export default function CitationBuilder({dataset}) {
    const [format, setFormat] = useState(FORMAT.one)

    return <Box m={1}>
        <ContainerGrid container direction="column" spacing={1}>
            <Grid container spacing={1} direction="row" sx={{ alignItems: 'center' }}>
                <Grid>
                    <CitationSelector current={format} setter={setFormat}/>
                </Grid>
                <Grid>
                    <Tooltip placement="right" title="Select a format, then copy the citation out below">
                        <Help/>
                    </Tooltip>
                </Grid>
            </Grid>
            <Grid>
                <CitationField multiline rows={4} value={buildCitation(format, dataset)} variant="outlined"/>
            </Grid>
        </ContainerGrid>
        </Box>
}

function CitationSelector({current, setter}) {
    return <FormControl variant="outlined">
    <InputLabel id="citation-select-label">Format</InputLabel>
    <Select
      labelId="citation-select-label"
      value={current}
      onChange={(event) => setter(event.target.value)}
      label="Format"
    >
        {Object.values(FORMAT).map(format => (
            <MenuItem key={format} value={format}>{format}</MenuItem>
        ))}
    </Select>
  </FormControl>
}