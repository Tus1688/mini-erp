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
    EuiSpacer,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logoutRequest } from '../api/Authentication';
import useTheme from '../hooks/useTheme';

const Header = ({
    toggleSideNav,
    sideNavState,
}: {
    toggleSideNav: (value: React.SetStateAction<boolean>) => void;
    sideNavState: boolean;
}) => {
    const navigate = useNavigate();
    const [isPopoverThemeOpen, setPopoverThemeOpen] = useState(false);
    const { toggleLightMode, toggleDarkMode } = useTheme();
    const [isPopoverAvatarOpen, setPopoverAvatarOpen] = useState(false);

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
            onClick={() => setPopoverThemeOpen(!isPopoverThemeOpen)}
        />
    );

    const avatarButton = (
        <EuiButtonEmpty
            aria-label='Avatar'
            onClick={() => setPopoverAvatarOpen(!isPopoverAvatarOpen)}
        >
            <EuiAvatar
                name={sessionStorage.getItem('username') || ''}
                size='m'
            />
        </EuiButtonEmpty>
    );

    const settingItems = [
        <EuiContextMenuItem
            key='light'
            onClick={() => {
                closeSettingPopover();
                toggleLightMode();
                window.location.reload();
            }}
        >
            <EuiIcon type='sun' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Light</EuiTextColor>
        </EuiContextMenuItem>,
        <EuiContextMenuItem
            key='dark'
            onClick={() => {
                closeSettingPopover();
                toggleDarkMode();
                window.location.reload();
            }}
        >
            <EuiIcon type='moon' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Dark</EuiTextColor>
        </EuiContextMenuItem>,
    ];

    const avatarItems = [
        <EuiContextMenuItem
            key='profile-setting'
            onClick={() => {
                closeAvatarPopover();
                navigate('/profile-settings');
            }}
        >
            <EuiIcon type='user' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Profile Settings</EuiTextColor>
        </EuiContextMenuItem>,
        <EuiContextMenuItem
            key='logout'
            onClick={() => {
                logoutRequest();
                closeAvatarPopover();
                navigate('/login');
            }}
        >
            <EuiIcon type='exit' style={{ marginRight: '1rem' }} />
            <EuiTextColor>Logout</EuiTextColor>
        </EuiContextMenuItem>,
    ];

    return (
        <EuiHeader
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
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
                    marginLeft: '1rem',
                }}
            >
                <EuiHeaderSectionItem>
                    <EuiButtonIcon
                        aria-label='Menu'
                        iconType='menu'
                        iconSize='m'
                        color='text'
                        onClick={() => {
                            toggleSideNav(!sideNavState);
                            sessionStorage.setItem(
                                'sideNavState',
                                sideNavState ? 'false' : 'true'
                            );
                        }}
                    />
                </EuiHeaderSectionItem>
            </EuiHeaderSection>
            <EuiHeaderSection grow={false}>
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
    const [isInventoryUser, setIsInventoryUser] = useState(false);
    const [isFinanceUser, setIsFinanceUser] = useState(false);
    const [isSystemAdmin, setIsSystemAdmin] = useState(false);

    useEffect(() => {
        setIsInventoryUser(sessionStorage.getItem('inv_u') === 'true');
        setIsFinanceUser(sessionStorage.getItem('fin_u') === 'true');
        setIsSystemAdmin(sessionStorage.getItem('sys_a') === 'true');
    }, []);

    const childAccordionItemStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: '1.5rem',
    };
    return (
        <>
            <NavLink to='/'>
                <EuiTitle size='xs'>
                    <h2>Bumbuventory</h2>
                </EuiTitle>
            </NavLink>
            <EuiSpacer size='xl' />
            {isFinanceUser ? (
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
                    </div>
                </EuiAccordion>
            ) : null}

            {isInventoryUser || isFinanceUser ? (
                <EuiAccordion
                    id='Inventory'
                    buttonContent='Inventory Management'
                    arrowDisplay='none'
                >
                    <div style={childAccordionItemStyle}>
                        {isInventoryUser ? (
                            <>
                                <StyledNavLink
                                    url='/variant-list'
                                    label='Variant list'
                                />
                                <StyledNavLink
                                    url='/batch-list'
                                    label='Batch list'
                                />
                            </>
                        ) : null}
                        <StyledNavLink
                            url='/stock-list'
                            label='Inventory list'
                        />
                        {isInventoryUser ? (
                            <StyledNavLink
                                url='/production-draft'
                                label='Production draft list'
                            />
                        ) : null}
                    </div>
                </EuiAccordion>
            ) : null}
            {isFinanceUser && (
                <EuiAccordion
                    id='Finance'
                    buttonContent='Finance Management'
                    arrowDisplay='none'
                >
                    <div style={childAccordionItemStyle}>
                        <StyledNavLink
                            url='/top-list'
                            label='Term Of Payment'
                        />
                        <StyledNavLink
                            url='/so-list'
                            label='Sales Invoice list'
                        />
                        <StyledNavLink
                            url='/so-draft-list'
                            label='Sales Invoice Draft list'
                        />
                    </div>
                </EuiAccordion>
            )}
            {isSystemAdmin && (
                <EuiAccordion
                    id='User'
                    buttonContent='System Management'
                    arrowDisplay='none'
                >
                    <div style={childAccordionItemStyle}>
                        <StyledNavLink url='/users' label='User list' />
                    </div>
                </EuiAccordion>
            )}
        </>
    );
};

const Root = () => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(
        sessionStorage.getItem('sideNavState') === 'true'
    );

    return (
        <>
            <EuiPageTemplate panelled={true} grow={true}>
                <Header
                    toggleSideNav={setIsSideNavOpen}
                    sideNavState={isSideNavOpen}
                />
                {isSideNavOpen && (
                    <EuiPageTemplate.Sidebar sticky={true}>
                        <EuiPageBody>
                            <SideNavItem />
                        </EuiPageBody>
                    </EuiPageTemplate.Sidebar>
                )}
                <Outlet />
            </EuiPageTemplate>
        </>
    );
};

export default Root;
