import React from 'react';
import EmptyMessage from './EmptyMessage';
import Loading from './Loading';

export default function LoadingWrapper({model, skeleton, children, showEmpty = true}) {
    if (model === null) {
        return skeleton || <Loading/>
    }
    if (showEmpty && (model === undefined || model.length === 0)) {
        return <EmptyMessage/>
    }
    return children

}