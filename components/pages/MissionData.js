import Breadcrumbs from 'components/Breadcrumbs';
import HTMLBox from 'components/HTMLBox';
import PrimaryLayout from 'components/PrimaryLayout';
import React from 'react';



export default function MissionData({mission}) {

    return (
        <PrimaryLayout primary={
            <>
                <Breadcrumbs currentTitle="Other Data" home={mission}/>

                <HTMLBox markup={mission.other_html}/>
            </>
        } />
    )
}