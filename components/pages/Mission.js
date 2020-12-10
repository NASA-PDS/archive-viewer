import React, { useEffect, useState } from 'react';
import {getSpacecraftForMission} from 'api/mission.js'
import {MissionHeader, MissionDescription, Menu} from 'components/ContextObjects'
import Loading from 'components/Loading'
import Spacecraft from 'components/pages/Spacecraft'
import PrimaryLayout from 'components/PrimaryLayout';
import InternalLink from 'components/InternalLink'

export default function Mission({mission, lidvid}) {
    const [spacecraft, setSpacecraft] = useState(null)

    useEffect(() => {
        getSpacecraftForMission(mission).then(setSpacecraft, er => console.error(er))

        return function cleanup() { setSpacecraft(null) }
    }, [lidvid])

    // if this mission only has one spacecraft, we should just show that spacecraft's page
    if(spacecraft && spacecraft.length === 1) return <Spacecraft spacecraft={spacecraft[0]}></Spacecraft>

    return (
        <div className="co-main">
            <MissionHeader model={mission} />
            <Menu/>
            <PrimaryLayout primary={
                <>
                    <MissionDescription model={mission} />
                    {!!spacecraft ? 
                        (<div className="mission-spacecraft-list">
                            <h2>View the mission's data for:</h2>
                            { spacecraft.map(ButtonForSpacecraft)}
                        </div>)
                        : <Loading/>
                    }
                </>
            }/>
        </div>
    )
}

function ButtonForSpacecraft(spacecraft) {
    return (
        <InternalLink key={spacecraft.identifier} identifier={spacecraft.identifier}>
        <a className="mission-spacecraft-button" >
            {spacecraft.image_url && <img alt={"Image of " + spacecraft.title} src={spacecraft.image_url}/> }
            <span className="spacecraft-title">{spacecraft.display_name ? spacecraft.display_name : spacecraft.title}</span>
        </a>
        </InternalLink>
    )
}