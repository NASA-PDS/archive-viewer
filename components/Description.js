import React, { useState } from 'react';
import { Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const DescriptionTypography = styled(Typography)({
    whiteSpace: 'pre-line',
});

export const ridiculousLength = 100
export const previewLength = 750

export default function Description(props) {
    const { model } = props;
    const { display_description } = model;
    let description = (display_description || model.description || model.instrument_description || model.instrument_host_description || model.investigation_description || model.target_description)
    description = description ? description.trim() : ''
    const alwaysShow = description.length < ridiculousLength;
    const [expanded, setExpanded] = useState(alwaysShow);

    return (
        <DescriptionTypography variant="body1" itemProp="description">
            {!description ? 'No description is available.' : expanded ? <>
                {description}{alwaysShow ? null : <Link onClick={() => setExpanded(false)}>Hide</Link>}
            </> : <>
                    {description.length < previewLength ? description : (<>{shorten(description)}<Link onClick={() => setExpanded(true)}>...Show More</Link></>)}
                </>}
        </DescriptionTypography>
    );
}

function shorten(description) {
    return description.split('').splice(0,previewLength).join('') + '... '
}
