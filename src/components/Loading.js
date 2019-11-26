import React from 'react';

export default function Loading({fullscreen}) {
    if(fullscreen) {
        return <div className="loading-container">{loadingCircle}</div>
    }   
    else return loadingCircle
}

const loadingCircle = <div className="lds-ring"><div></div><div></div><div></div><div></div></div>