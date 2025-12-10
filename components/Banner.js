import React, { Component } from 'react';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import Image from 'next/image'

const logo = '/images/pdsLogo.png'

const TitleLink = styled(Link)({
    marginRight: '70px',
    '&:hover':{
        textDecoration: 'none'
    }
});

const PdsIconButton = styled(IconButton)({
    padding: '5px',
    margin: '0',
    fontSize: '0'
});

const Title = styled(Typography)({
    fontSize: '16px',
    color: 'white',
    marginLeft: '5px'
});

const HeaderLogo = styled('span')({
    height: '25px',
    width: '48px'
});

const PdsBanner = styled(AppBar)({
    background: '#000000',
    height: '32px'
});

const PdsBannerToolbar = styled(Toolbar)({
    color: '#ffffff',
    minHeight: '0',
    padding: '0px',
    fontSize: '14px'
});

const NodeButton = styled(Button)({
    color: 'white',
    border: 'none',
    backgroundColor: 'black',
    boxShadow: 'none',
    borderRadius: '0',
    padding: '5px 0 6px 5px',
    textTransform: 'none',
    fontWeight: '400',
    height: '32px',
    '&:hover': {
        backgroundColor: 'rgb(23, 23, 23)',
        boxShadow: 'none'
    }
});

const MenuLink = styled(Link)({
    color: 'white',
    textDecoration: 'none'
});

const StyledListItemText = styled(ListItemText)({
    '& .MuiTypography-body1':{
        fontSize: '12px'
    }
});

const ArrowIcon = styled('span')({
    marginLeft: '40px',
    display: 'flex',
    alignItems: 'center'
});

const InfoIconSvg = styled(SvgIcon)({
    height: '17px',
    width: '17px'
});

const InfoButton = styled(IconButton)({
    padding: '0 0 0 5px'
});

const InfoPopover = styled(Popover)({
    pointerEvents: 'none'
});

const InfoText = styled(Typography)({
    fontSize: '12px'
});

const ListItemTextFirst = styled(ListItemText)({
    height:'0',
    margin:'0'
});

const StyledMenu = styled(Menu)({
    '& .MuiPaper-root': {
        backgroundColor: 'black',
        borderRadius: '0 0 3px 3px',
    },
    '& .MuiList-padding': {
        padding: '11px 5px 11px 5px'
    }
});

const StyledMenuItem = styled(MenuItem)({
    '&:hover': {
        backgroundColor: 'black',
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: '#64B6F7',
            textDecoration: 'none'
        },
        '& .MuiLink-underlineHover': {
            textDecoration: 'none'
        }
    },
    '&:focus': {
        backgroundColor: 'black',
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: '#64B6F7',
            textDecoration: 'none'
        },
        '& .MuiLink-underlineFocus': {
            textDecoration: 'none'
        }
    },
    padding: '0'
});

class Banner extends Component {
    state = {
        anchorEl: null,
        infoAnchorEl: null
    }

    handleNodeClick = (event) => {
        this.setState({
            anchorEl: event.currentTarget,
            infoAnchorEl: this.state.infoAnchorEl
        });
    };

    handleNodeClose = () => {
        this.setState({ 
            anchorEl: null,
            infoAnchorEl: this.state.infoAnchorEl
        });
    };

    handleInfoMouseEnter = (event) => {
        this.setState({
            anchorEl: this.state.anchorEl,
            infoAnchorEl: event.currentTarget
        });
    };

    handleInfoMouseLeave = () => {
        this.setState({
            anchorEl: this.state.anchorEl,
            infoAnchorEl: null
        });
    };

    handleInfoEnterOpen = (event) => {
        if (event.key === "Enter") {
            this.setState({
                anchorEl: this.state.anchorEl,
                infoAnchorEl: event.currentTarget
            });
        }
    };

    handleInfoEnterClose = (event) => {
        if (event.key === "Enter") {
            this.setState({
                anchorEl: this.state.anchorEl,
                infoAnchorEl: null
            });
        }
    };

    handleNodeSelect = (link) => {
        this.setState({
            anchorEl: null,
            infoAnchorEl: this.state.infoAnchorEl
        });
        window.location.href = link;
    };

    render() {
        const { anchorEl, infoAnchorEl } = this.state;

        return (
            <PdsBanner position='static'>
                <PdsBannerToolbar>
                
                    <TitleLink
                        href='https://pds.nasa.gov' 
                        rel='noopener'
                    >
                        <PdsIconButton 
                            edge='start' 
                            aria-label='PDS'
                        >
                            <Image
                                src={logo}
                                height={25}
                                width={48}
                                alt=''
                            />
                            <Title>
                                Planetary Data System
                            </Title>
                        </PdsIconButton>
                    </TitleLink>
                    
                    <InfoButton
                        edge='start' 
                        aria-label='info'
                        aria-controls='info-menu'
                        variant='contained'
                        color='primary'
                        onMouseEnter={this.handleInfoMouseEnter} 
                        onMouseLeave={this.handleInfoMouseLeave}
                        onKeyDown={this.handleInfoEnterOpen}
                    >
                        <InfoIconSvg>
                            <path 
                                fill="white" 
                                d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z">
                            </path>
                        </InfoIconSvg>
                    </InfoButton>
                    <InfoPopover
                        id="info-menu"
                        open={Boolean(infoAnchorEl)}
                        anchorEl={infoAnchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        transformOrigin={{
                            horizontal: 'left',
                            vertical: 'top',
                        }}
                        PaperProps={{
                            style: {
                                backgroundColor: 'black',
                                color: 'white',
                                padding: '15px 12px 12px 12px',
                                width: '640px'
                            }
                        }}
                        onKeyDown={this.handleInfoEnterClose}
                    >
                        <InfoText>
                            <Box component='span' fontWeight='fontWeightBold'>Find a Node</Box> - Use these links to navigate to any of the 8 publicly accessible PDS Nodes.
                            <br></br>
                            <br></br>
                            This bar indicates that you are within the PDS enterprise which includes 6 science discipline nodes and 2 support nodes which are overseen by the Project Management Office at NASA's Goddard Space Flight Center (GSFC). Each node is led by an expert in the subject discipline, supported by an advisory group of other practitioners of that discipline, and subject to selection and approval under a regular NASA Research Announcement.
                        </InfoText>
                    </InfoPopover>

                    <NodeButton
                        aria-controls='nodes-menu'
                        aria-haspopup='true'
                        aria-owns={anchorEl ? 'nodes': null}
                        variant='contained'
                        onClick={this.handleNodeClick}
                    >
                        Find a node
                        <ArrowIcon>{anchorEl ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>}</ArrowIcon>
                    </NodeButton>

                    <StyledMenu
                        id="nodes-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={this.handleNodeClose}
                        anchorOrigin={{
                            horizontal: 'left', 
                            vertical: 'bottom'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                        }}
                        PaperProps={{
                            style: {
                                top: '36px'
                            }
                        }}
                    >
                        <StyledMenuItem>
                            <ListItemTextFirst/>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-atmospheres.nmsu.edu')}}>
                            <MenuLink
                                href='https://pds-atmospheres.nmsu.edu'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Atmospheres (ATM)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-geosciences.wustl.edu')}}>
                            <MenuLink
                                href='https://pds-geosciences.wustl.edu'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Geosciences (GEO)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-imaging.jpl.nasa.gov')}}>
                            <MenuLink
                                href='https://pds-imaging.jpl.nasa.gov'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Cartography and Imaging Sciences (IMG)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://naif.jpl.nasa.gov/naif')}}>
                            <MenuLink
                                href='https://naif.jpl.nasa.gov/naif'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Navigational and Ancillary Information (NAIF)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-ppi.igpp.ucla.edu')}}>
                            <MenuLink
                                href='https://pds-ppi.igpp.ucla.edu'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Planetary Plasma Interactions (PPI)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-rings.seti.org')}}>
                            <MenuLink
                                href='https://pds-rings.seti.org'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Ring-Moon Systems (RMS)'/>
                            </MenuLink>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => {this.handleNodeSelect('https://pds-smallbodies.astro.umd.edu')}}>
                            <MenuLink
                                href='https://pds-smallbodies.astro.umd.edu'
                                rel='noopener'
                            >
                                <StyledListItemText primary='Small Bodies (SBN)'/>
                            </MenuLink>
                        </StyledMenuItem>
                    </StyledMenu>
                </PdsBannerToolbar>
            </PdsBanner>
        );
    }
}

export default Banner;