import HTMLBox from 'components/HTMLBox';
import { Metadata } from 'components/Metadata';
import PrimaryLayout from 'components/PrimaryLayout';
import { TagTypes } from 'components/TagSearch.js';
import React from 'react';

export default function Target({target}) {
    return (
        <PrimaryLayout primary={
            <>
            <HTMLBox markup={target.html1} />
            <Metadata model={target} tagType={TagTypes.target}/>
            <HTMLBox markup={target.html2} />
            </>
        } />
    )
}