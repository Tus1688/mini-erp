import {
    EuiModal,
    EuiModalBody,
    EuiSpacer,
    EuiTabbedContent,
    EuiTabbedContentProps,
} from '@elastic/eui';
import { useState } from 'react';


const UserEditModal = ({
    toggleModal,
    tabs
}: {
    toggleModal: (value: React.SetStateAction<boolean>) => void;
    tabs: EuiTabbedContentProps['tabs'];
}) => {
    const [selectedTabs, setSelectedTabs] = useState(tabs[0]);
    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiSpacer size='m' />
            <EuiModalBody>
                <EuiTabbedContent
                    tabs={tabs}
                    selectedTab={selectedTabs}
                    onTabClick={(tab) => setSelectedTabs(tab)}
                />
            </EuiModalBody>
        </EuiModal>
    );
};

export default UserEditModal;
