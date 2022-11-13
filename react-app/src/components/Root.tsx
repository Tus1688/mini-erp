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
    EuiTextColor,
    EuiAccordion,
    EuiContextMenuItem,
    EuiPopover,
    EuiContextMenuPanel,
    EuiButtonEmpty,
    EuiGlobalToastList,
    EuiSpacer,
} from '@elastic/eui';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { logoutRequest } from '../api/Authentication';
import useTheme from '../hooks/useTheme';
import useToast from '../hooks/useToast';

const Header = () => {
    const [isPopoverThemeOpen, setPopoverThemeOpen] = useState(false);
    const { toggleLightMode, toggleDarkMode } = useTheme();
    const [isPopoverAvatarOpen, setPopoverAvatarOpen] = useState(false);

    const onSettingButtonClick = () => {
        setPopoverThemeOpen(!isPopoverThemeOpen);
    };

    const closeSettingPopover = () => {
        setPopoverThemeOpen(false);
    };

    const closeAvatarPopover = () => {
        setPopoverAvatarOpen(false);
    };

    const settingButton = (
        <EuiButtonIcon
            aria-label='Settings'
            iconType='gear'
            iconSize='m'
            color='text'
            onClick={onSettingButtonClick}
        />
    );

    const toggleLightModeAndClose = () => {
        closeSettingPopover();
        toggleLightMode();
        window.location.reload();
    };

    const toggleDarkModeAndClose = () => {
        closeSettingPopover();
        toggleDarkMode();
        window.location.reload();
    };

    const toggleLogoutAndClose = async () => {
        await logoutRequest();
        closeAvatarPopover();
        window.location.reload();
    };

    const avatarButton = (
        <EuiButtonEmpty
            aria-label='Avatar'
            onClick={() => setPopoverAvatarOpen(!isPopoverAvatarOpen)}
        >
            <EuiAvatar name='John Doe' size='m' />
        </EuiButtonEmpty>
    );

    const settingItems = [
        <EuiContextMenuItem key='light' onClick={toggleLightModeAndClose}>
            <EuiIcon type='sun' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Light</EuiTextColor>
        </EuiContextMenuItem>,
        <EuiContextMenuItem key='dark' onClick={toggleDarkModeAndClose}>
            <EuiIcon type='moon' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Dark</EuiTextColor>
        </EuiContextMenuItem>,
    ];

    const avatarItems = [
        <EuiContextMenuItem key='profile-setting' onClick={closeAvatarPopover}>
            <EuiIcon type='user' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Profile Settings</EuiTextColor>
        </EuiContextMenuItem>,
        <EuiContextMenuItem key='logout' onClick={toggleLogoutAndClose}>
            <EuiIcon type='exit' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Logout</EuiTextColor>
        </EuiContextMenuItem>,
    ];

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
                    margin: '1rem 1.5rem',
                }}
            >
                <EuiHeaderSectionItem>
                    {/* <EuiTitle size='m'>
                        <h1>Bumbuventory</h1>
                    </EuiTitle> */}
                </EuiHeaderSectionItem>
            </EuiHeaderSection>
            <EuiHeaderSection
                grow={false}
                style={{
                    margin: '1rem 2rem',
                }}
            >
                <EuiHeaderSectionItem border='right'>
                    <EuiPopover
                        id='settings-popover'
                        button={settingButton}
                        isOpen={isPopoverThemeOpen}
                        closePopover={closeSettingPopover}
                        panelPaddingSize='none'
                        anchorPosition='downRight'
                        style={{
                            margin: '0 0.5rem',
                        }}
                    >
                        <EuiContextMenuPanel items={settingItems} />
                    </EuiPopover>
                    <EuiPopover
                        id='avatar-popover'
                        button={avatarButton}
                        isOpen={isPopoverAvatarOpen}
                        closePopover={closeAvatarPopover}
                        panelPaddingSize='none'
                        anchorPosition='downRight'
                    >
                        <EuiContextMenuPanel items={avatarItems} />
                    </EuiPopover>
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
            <EuiTitle size='m'>
                <h2>Bumbuventory</h2>
            </EuiTitle>
            <EuiSpacer size='xl' />
            <StyledNavLink url='/' label='Home' />
            <EuiAccordion
                id='Customers'
                buttonContent='Customer Management'
                arrowDisplay='none'
            >
                <div style={childAccordionItemStyle}>
                    <StyledNavLink
                        url='/customer-list'
                        label='Customers list'
                    />
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
    const { getAllToasts, removeToast } = useToast();
    return (
        <>
            <EuiPageTemplate panelled={true} grow={true}>
                <Header />
                <EuiPageTemplate.Sidebar sticky={true}>
                    <EuiPageBody>
                        <SideNavItem />
                    </EuiPageBody>
                </EuiPageTemplate.Sidebar>
                <Outlet />
                <EuiGlobalToastList
                    toasts={getAllToasts()}
                    dismissToast={({ id }) => removeToast(id)}
                    toastLifeTimeMs={6000}
                />
            </EuiPageTemplate>
        </>
    );
};

export default Root;
