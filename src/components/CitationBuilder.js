import React, {useState} from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Grid, Typography, Box, Tooltip } from '@material-ui/core'
import { Help } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';

const FORMAT = {
    ADS: 'ADS',
    APA: 'APA'
}

const buildCitation = (format, dataset) => {
    switch(format) {
        default:
        case FORMAT.ADS: 
        case FORMAT.APA: return `${dataset.title} ${dataset.citation_publication_year} ${dataset.citation_author_list} ${dataset.citation_description}`
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
    const [format, setFormat] = useState(FORMAT.ADS)
    const classes = useStyles()

    return <Box m={1}>
        <Typography variant="h3">Citation</Typography>
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