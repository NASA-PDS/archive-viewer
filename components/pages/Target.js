import HTMLBox from 'components/HTMLBox';
import { Metadata } from 'components/Metadata';
import PrimaryLayout from 'components/PrimaryLayout';
import { TargetTagList } from 'components/TagList';
import React from 'react';

export default function Target({target}) {
    return (
        <PrimaryLayout primary={
            <>
            <TargetTagList tags={target.tags} />
            <HTMLBox markup={target.html1} />
            <Metadata model={target} />
            <HTMLBox markup={target.html2} />
            </>
        } />
    )
}