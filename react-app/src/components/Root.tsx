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
} from '@elastic/eui';
import { useState } from 'react';
import { Link, Outlet, redirect } from 'react-router-dom';

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
    const selectItem = (name: string) => {
        setSelectedItem(name);
        
    }

    return (
        <EuiSideNav
            items={[
                {
                    id: 1,
                    name: 'Dashboard',
                },
            ]}
        />
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
