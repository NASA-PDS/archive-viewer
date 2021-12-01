import { Typography, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, ListItemText, Chip, Checkbox, FormControlLabel, Switch, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getRelatedTargetsForTarget } from 'api/target';
import Breadcrumbs from 'components/Breadcrumbs';
import { RelatedTargetGroupedList } from 'components/GroupedList';
import LoadingWrapper from 'components/LoadingWrapper';
import PrimaryLayout from 'components/PrimaryLayout';
import React, { useEffect, useState } from 'react';
import { groupByField } from 'services/groupings';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 250
    },
    chips: {
        display: 'flex',
        flexWrap: 'nowrap',
        marginTop:  -7.5,
        marginBottom:  -7.5,
    },
    chip: {
        marginLeft: 4,
        marginRight: 4,
    }
}));

export default function TargetRelated(props) {
    const { target } = props
    const [relatedTargets, setRelatedTargets] = useState(null)
    const [multipleGroupMode, setMultipleGroupMode] = useState(false)
    const [inclusiveOrMode, setInclusiveOrMode] = useState(false)
    const [filterState, setFilterState] = React.useState({
        tags: null,
        activeGroup: null
    })
    useEffect(() => {
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))
        return function cleanup() {
            setRelatedTargets(null)
        }
    }, [props.target])

    let filteredTargets = relatedTargets, groups = []
    if(relatedTargets?.length > 0) {

        const tags = relatedTargets?.flatMap(target => target.tags || []).sort((a, b) => a.name.localeCompare(b.name))
        groups = groupByField(tags || [], 'group').sort((a, b) => a.order < b.order ? -1 : 1)
        if(!filterState.tags && groups.length > 0) {
            setFilterState(Object.assign(filterState, {
                tags: Array(groups.length).fill([])
            }))
        } 
    
        if(filterState.tags.flat().length === 0) {
            filteredTargets = relatedTargets
        }
        else if(!multipleGroupMode) {
            const filterTags = !filterState.activeGroup ? filterState.tags.flat() : filterState.tags[filterState.activeGroup]
            filteredTargets = relatedTargets?.filter(target => target.tags?.some(tag => filterTags.includes(tag.name)))
        }
        else if(multipleGroupMode && inclusiveOrMode) {
            const filterTags = filterState.tags.flat()
            filteredTargets = relatedTargets?.filter(target => target.tags?.some(tag => filterTags.includes(tag.name)))
        } else {
            filteredTargets = relatedTargets?.filter(target => filterState.tags.every(tagGroup => {
                return target.tags?.some(tag => tagGroup.length === 0 || tagGroup.includes(tag.name))
            }))
        }
    }

    const updateFilter = (index) => {
        return (tags) => {
            filterState.tags.splice(index, 1, tags)
            setFilterState({
                tags: filterState.tags,
                activeGroup: index
            })
        }
    }
    

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Related" home={target}/>                
                <Typography variant="h1" gutterBottom>Related Targets</Typography>

                <Paper component={Box} px={2} py={1}>
                    <Grid container direction="row" my={2} alignItems="center" wrap="norap">
                        <Grid item xs={12} md={1}><Typography variant="h4">Filter:</Typography></Grid>
                        <Grid item xs={12} md={9}>
                            <Grid container direction="row" justifyContent="flex-start" wrap="wrap">
                            {groups.map((group, index) => <Grid item component={TagSelector} key={group.name} label={group.name} tags={group.items} filter={updateFilter(index)} disabled={!multipleGroupMode && filterState.activeGroup !== index}/>)}
                            </Grid>
                        </Grid>
                        <Grid item component={Box} marginLeft="auto" xs={6} md={1}>
                            <Tooltip placement="top" title="Off: filter by the most recently used. On: use all filters simultaneously.">
                            <FormControlLabel
                                value="bottom"
                                control={<Switch checked={multipleGroupMode} onChange={() => setMultipleGroupMode(!multipleGroupMode)} size="small" color="primary" />}
                                label="Use multiple"
                                labelPlacement="bottom"
                            />
                            </Tooltip>
                        </Grid>
                        <Grid item component={Box} xs={6} md={1}>
                            <Tooltip placement="top" title="Off: results must have at least one tag of each group. On: results can have any of the tags.">
                            <FormControlLabel
                                value="bottom"
                                control={<Switch checked={inclusiveOrMode} onChange={() => setInclusiveOrMode(!inclusiveOrMode)} size="small" color="primary" disabled={!multipleGroupMode}/>}
                                label="Inclusive"
                                labelPlacement="bottom"
                            />
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Paper>

                <LoadingWrapper model={relatedTargets}>
                    {relatedTargets &&
                        <RelatedTargetGroupedList items={filteredTargets} />
                    }
                </LoadingWrapper>
            </>
        } />
    )
}



const ITEM_HEIGHT = 54;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function TagSelector({label, tags, filter, disabled}) {
    const classes = useStyles()
    const [selected, setSelected] = React.useState([]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelected(value)
        filter(value)
    };

    return (
        <div>
            <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel id="demo-multiple-name-label">{label}</InputLabel>
                <Select
                    labelId="demo-multiple-name-label"
                    multiple
                    value={selected}
                    onChange={handleChange}
                    label={label}
                    renderValue={(selected) => (
                        <Box className={classes.chips} >
                          {selected.map((value, index) => (
                            index < 2 && <Chip color={disabled ? 'default' : 'secondary'} key={value} label={value} className={classes.chip}/>
                          ))}
                          {selected.length > 2 && <Chip label={`${selected.length - 2} more...`} className={classes.chip}/>}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {tags.map((tag) => (
                        <MenuItem key={tag.name} value={tag.name}>
                            <Checkbox checked={selected.includes(tag.name)} />
                            <ListItemText primary={tag.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}