import { Menu } from 'components/ContextHeaders';
import HTMLBox from 'components/HTMLBox';
import { Metadata } from 'components/Metadata';
import PDS3Results from 'components/PDS3Results';
import PrimaryLayout from 'components/PrimaryLayout';
import { TargetTagList } from 'components/TagList';
import React from 'react';

export default function Target({target, lidvid}) {
    return (
        <>
            <Menu/>
            <PrimaryLayout primary={
                <>
                <TargetTagList tags={target.tags} />
                <HTMLBox markup={target.html1} />
                <Metadata model={target} />
                <HTMLBox markup={target.html2} />
                </>
            } secondary = {
                <PDS3Results name={target.display_name ? target.display_name : target.title}/>
            } />
        </>
    )
}