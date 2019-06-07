import React from 'react';

export default function Error({error}) {
    return <div className="error">{error.message ? error.message : error}</div>
}