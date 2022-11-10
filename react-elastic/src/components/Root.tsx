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
    EuiAvatar,
    EuiIcon,
    EuiButton,
    EuiButtonIcon,
} from "@elastic/eui";
import { Outlet } from "react-router-dom";

const Root = () => {
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <EuiHeaderSection
                    grow={false}
                    style={{
                        margin: "1rem 2rem",
                    }}
                >
                    <EuiHeaderSectionItem border="right">
                        <EuiTitle size="m">
                            <h1>Bumbuventory</h1>
                        </EuiTitle>
                    </EuiHeaderSectionItem>
                </EuiHeaderSection>
                <EuiHeaderSection
                    grow={false}
                    style={{
                        margin: "1rem 2rem",
                    }}
                >
                    <EuiHeaderSectionItem border="right">
                        <EuiIcon type="gear" />
                        {/* we get name in session storage */}
                        <EuiAvatar size="m" name="John Doe" />
                    </EuiHeaderSectionItem>
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
                <Outlet />
            </EuiPageTemplate>
        </>
    );
};

export default Root;
