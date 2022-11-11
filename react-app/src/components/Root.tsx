import {
    EuiPageTemplate,
    EuiPageBody,
    EuiHeader,
    EuiHeaderSection,
    EuiHeaderSectionItem,
    EuiTitle,
    EuiAvatar,
    EuiIcon,
    EuiButtonIcon,
    IconType,
    EuiButton,
    EuiSideNav,
    EuiSideNavItemType,
    EuiText,
    EuiTextColor,
    EuiLink,
    EuiAccordion,
    EuiPanel,
} from '@elastic/eui';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const Header = () => {
    return (
        <EuiHeader
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'transparent',
                backdropFilter: 'blur(100px)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: 'none',
            }}
            css={{
                // safari workaround
                '-webkit-backdrop-filter': 'blur(100px)',
            }}
        >
            <EuiHeaderSection
                grow={false}
                style={{
                    margin: '1rem 2rem',
                }}
            >
                <EuiHeaderSectionItem border='right'>
                    <EuiTitle size='m'>
                        <h1>Bumbuventory</h1>
                    </EuiTitle>
                </EuiHeaderSectionItem>
            </EuiHeaderSection>
            <EuiHeaderSection
                grow={false}
                style={{
                    margin: '1rem 2rem',
                }}
            >
                <EuiHeaderSectionItem border='right'>
                    <EuiIcon
                        type='gear'
                        size='m'
                        style={{
                            margin: '0 1rem',
                        }}
                    />
                    {/* we get name in session storage */}
                    <EuiAvatar size='m' name='John Doe' />
                </EuiHeaderSectionItem>
            </EuiHeaderSection>
        </EuiHeader>
    );
};

const StyledNavLink = ({ url, label }: { url: string; label: string }) => {
    const activeStyle: React.CSSProperties = {
        fontWeight: '800',
        marginBottom: '0.2rem',
    };

    const inactiveStyle: React.CSSProperties = {
        fontWeight: 'normal',
        marginBottom: '0.2rem',
    };

    return (
        <NavLink
            to={url}
            style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
        >
            <EuiTextColor color='default'>{label}</EuiTextColor>
        </NavLink>
    );
};

const SideNavItem = () => {
    const childAccordionItemStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: '1.5rem',
    };
    return (
        <>
            <StyledNavLink url='/' label='Home' />
            <EuiAccordion
                id='Customers'
                buttonContent='Customer Management'
                arrowDisplay='none'
            >
                <div style={childAccordionItemStyle}>
                    <StyledNavLink url='/customers' label='Customers list' />
                    <StyledNavLink
                        url='/customer-new'
                        label='Create New Customer'
                    />
                </div>
            </EuiAccordion>

            <EuiAccordion
                id='Inventory'
                buttonContent='Inventory Management'
                arrowDisplay='none'
            >
                <div style={childAccordionItemStyle}>
                    <StyledNavLink url='/inventory' label='Inventory list' />
                    <StyledNavLink
                        url='/production-draft'
                        label='Production draft list'
                    />
                    <StyledNavLink
                        url='/production-draft-create'
                        label='Create Production draft'
                    />
                    <StyledNavLink
                        url='/production-draft-approve'
                        label='Approve Production draft'
                    />
                </div>
            </EuiAccordion>
            <EuiAccordion
                id='Finance'
                buttonContent='Finance Management'
                arrowDisplay='none'
            >
                <div style={childAccordionItemStyle}>
                    <StyledNavLink url='/so-list' label='Sales Invoice list' />
                    <StyledNavLink
                        url='/so-draft-list'
                        label='Sales Invoice Draft list'
                    />
                    <StyledNavLink
                        url='/so-draft-create'
                        label='Create Sales Invoice Draft'
                    />
                    <StyledNavLink
                        url='/so-draft-approve'
                        label='Approve Sales Invoice Draft'
                    />
                </div>
            </EuiAccordion>
            <EuiAccordion
                id='User'
                buttonContent='User Management'
                arrowDisplay='none'
            >
                <div style={childAccordionItemStyle}>
                    <StyledNavLink url='/users' label='User list' />
                    <StyledNavLink url='/user-create' label='Create New User' />
                </div>
            </EuiAccordion>
        </>
    );
};

const Root = () => {
    return (
        <>
            <EuiPageTemplate panelled={true} grow={true}>
                <Header />
                <EuiPageTemplate.Sidebar sticky={true}>
                    <EuiPageBody
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            marginTop: '2rem',
                        }}
                    >
                        <SideNavItem />
                    </EuiPageBody>
                </EuiPageTemplate.Sidebar>
                <Outlet />
            </EuiPageTemplate>
        </>
    );
};

export default Root;
