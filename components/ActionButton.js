import { Button } from '@material-ui/core';
import React from 'react';
import InternalLink from './InternalLink';

export default function ActionButton({ url, identifier, title, prominent, icon }) {
    if (!url && !identifier)
        return null;
    const button = <Button color="primary" variant="contained" href={url} size={prominent ? "large" : "medium"} endIcon={icon}>{title}</Button>;
    return (
        identifier ? <InternalLink identifier={identifier} passHref>{button}</InternalLink> : button
    );
}
