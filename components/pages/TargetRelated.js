import { Typography, Box, Paper, Grid, FormControl, InputLabel, Select, MenuItem, ListItemText, Chip, Checkbox } from '@material-ui/core';
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
        minWidth: 250,
        maxWidth: 400,
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
    
    const tags = relatedTargets?.flatMap(target => target.tags || []).sort((a, b) => a.name.localeCompare(b.name))
    const groups = groupByField(tags || [], 'group').sort((a, b) => a.order < b.order ? -1 : 1)
    const [filterTags, setFilterTags] = React.useState(groups.map(g => []));

    useEffect(() => {
        getRelatedTargetsForTarget(target).then(setRelatedTargets, er => console.error(er))
        return function cleanup() {
            setRelatedTargets(null)
        }
    }, [props.target])

    const updateFilter = (index) => {
        return (tags) => {
            filterTags.splice(index, 1, tags)
            setFilterTags([...filterTags])
        }
    }

    const filterTagsFlat = filterTags.flat()
    const filteredTargets = filterTagsFlat.length > 0 ? relatedTargets?.filter(target => target.tags?.some(tag => filterTagsFlat.includes(tag.name))) : relatedTargets

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Related" home={target}/>                
                <Typography variant="h1" gutterBottom>Related Targets</Typography>

                <Paper component={Box} px={2} py={1}>
                <Grid container direction="row" my={2} alignItems="center">
                    <Typography variant="h4">Filter:</Typography>
                    {groups.map((group, index) => <TagSelector key={group.name} label={group.name} tags={group.items} filter={updateFilter(index)}/>)}
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
function TagSelector({label, tags, filter}) {
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
                            index < 2 && <Chip color="secondary" key={value} label={value} className={classes.chip}/>
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