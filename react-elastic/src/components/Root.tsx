import React, { ReactElement } from "react";
import {
    EuiPageTemplate,
    EuiPageHeader,
    EuiPageBody,
    EuiText,
    EuiHeader,
    EuiHeaderSection,
    EuiHeaderSectionItem,
    EuiHeaderLogo,
    EuiSpacer,
    EuiTitle,
} from "@elastic/eui";

const Root = () => {
    const buttons: React.ReactNode[] = [<div>test</div>, <div>test2</div>];
    return (
        <>
            {/* make a stick header that consists of item  */}
            <EuiHeader
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    backgroundColor: "transparent",
                    backdropFilter: "blur(100px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <EuiHeaderLogo iconType="logoElastic">
                    <EuiTitle size="s">
                        <h1>Bumbuventory</h1>
                    </EuiTitle>
                </EuiHeaderLogo>
                <EuiHeaderSection grow={true}>
                    <EuiHeaderSectionItem border="right"></EuiHeaderSectionItem>
                </EuiHeaderSection>
            </EuiHeader>
            <EuiPageTemplate panelled={true} offset={undefined} grow={true}>
                <EuiPageTemplate.Sidebar sticky={true}>
                    <EuiPageBody
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>test</div>
                        <div>test2</div>
                    </EuiPageBody>
                </EuiPageTemplate.Sidebar>
                <EuiPageTemplate.Header>
                    {/* add pageTitle of Bumbuventory */}
                    <EuiPageHeader
                        pageTitle="Bumbuventory"
                        rightSideItems={buttons ? buttons : undefined}
                    />
                </EuiPageTemplate.Header>
                <EuiText grow={false}>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                    <h1>test</h1>
                </EuiText>
            </EuiPageTemplate>
        </>
    );
};

export default Root;
