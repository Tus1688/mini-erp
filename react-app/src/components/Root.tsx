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
} from '@elastic/eui';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

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

const SideNavItem = () => {
    const [selectedItemName, setSelectedItem] = useState<string | null>(null);
    const selectItem = (name: string, url?: string) => {
        setSelectedItem(name);
        console.log(name)
        if (url) {
            console.log(url);
        }
    };

    const createItem = (name: string, data: {} = {}, url?: string) => {
        return {
            id: name,
            name: name,
            isSelected: selectedItemName === name,
            onClick: () => selectItem(name, url),
            ...data,
        };
    };

    const sideNav = [
        createItem('Home', {
            items: [
                createItem('Customers', {
                    // emphasize: true,
                    // isOpen: true,
                    items: [
                        createItem('Get Customers', {href: '/customers'}),
                        createItem('Add Customer', {href: '/customers/add'}),
                    ],
                }),
                createItem('Inventory', {
                    items: [
                        createItem('Get Stock'),
                        createItem('Get Production Draft'),
                        createItem('Create Production Entry'),
                        createItem('Approve Production Draft')
                    ]
                }),
                createItem('Finance',{
                    items: [
                        createItem('Get Sales Invoices'),
                        createItem('Get Sales Invoices draft'),
                        createItem('Create Sales Invoice draft'),
                        createItem('Approve Sales Invoice draft')
                    ]
                }),
                createItem('Settings', {
                    items: [
                        createItem('Get Users'),
                        createItem('Add User'),
                    ]
                })
            ],
            href: '/',
        }, "/"),
    ];

    return <EuiSideNav items={sideNav} />;
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
