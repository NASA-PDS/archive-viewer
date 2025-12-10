import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StyledFooter = styled('footer')(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.custom?.raisedContent,
    height: '3em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)',
}));

const FooterText = styled('p')({
    margin: 0,
    padding: 0,
    textAlign: 'center',
});

const FooterExtended = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    height: '20em',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const FooterPsiContainer = styled('aside')({
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

const Logo = styled('img')(({ theme }) => ({
    width: '12em',
    background: theme.palette.common.white,
    padding: 0,
    margin: '0 0 1em 0',
    borderRadius: '10em',
}));

export default function Footer() {
    return (
        <div>
            <StyledFooter>
                <FooterText>
                    For questions about the data sets or this web site, contact us at <Link href="mailto:sbn@psi.edu">sbn@psi.edu</Link>.
                </FooterText>
            </StyledFooter>

            <FooterExtended>
                <FooterPsiContainer>
                    <Logo src="/images/PSI_Logo.png" alt="PSI Logo" title="PSI Logo"/>
                    <span>Hosted by the Planetary Science Institute</span>
                </FooterPsiContainer>
            </FooterExtended>
        </div>
    )
}