import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Help } from '@material-ui/icons';
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

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        width: '100%'
    },
    citation: {
        width: '100%'
    },
}))

export default function CitationBuilder({dataset}) {
    const [format, setFormat] = useState(FORMAT.one)
    const classes = useStyles()

    return <Box m={1}>
        <Grid container direction="column" spacing={1} className={classes.container}>
            <Grid item container spacing={1} direction="row" alignItems="center">
                <Grid item>
                    <CitationSelector current={format} setter={setFormat}/>
                </Grid>
                <Grid item>
                    <Tooltip placement="right" title="Select a format, then copy the citation out below">
                        <Help/>
                    </Tooltip>
                </Grid>
            </Grid>
            <Grid item>
                <TextField multiline rows={4} value={buildCitation(format, dataset)} variant="outlined" className={classes.citation}/>
            </Grid>
        </Grid>
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