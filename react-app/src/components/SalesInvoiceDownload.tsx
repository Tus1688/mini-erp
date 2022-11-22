import {
    EuiButton,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
} from '@elastic/eui';
import { salesInvoiceSpecific } from '../type/SalesInvoice';
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    PDFViewer,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
        fontSize: 12,
    },
    title: {
        fontWeight: 'black',
    },
    text: {
        margin: 12,
        textAlign: 'justify',
    },
});

const SalesInvoiceDownload = ({
    data,
    toggleModal,
}: {
    data: salesInvoiceSpecific | undefined;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    Download sales invoice {data?.id}
                </EuiModalHeaderTitle>
                <EuiModalBody>
                    <PDFViewer style={{ height: '430px' }} showToolbar={false}>
                        <Document
                            creator='bumbuventory, bumbu47 inventory management system'
                            producer='bumbuventory, bumbu47 inventory management system'
                        >
                            <Page size='A4' style={styles.body}>
                                <View style={{display: 'flex', flexDirection: 'column'}}>
                                    <Text style={styles.title}>
                                        Sales Invoice ID: {data?.id}
                                    </Text>
                                    <Text style={styles.title}>
                                        Customer Name: {data?.customer_name}
                                    </Text>
                                    <Text style={styles.title}>
                                        Term Of Payment: {data?.top_name}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={styles.title}>
                                        Sales Invoice Date:{' '}
                                        {new Date(data?.date || '').toLocaleDateString('id-ID')}
                                    </Text>
                                    <Text style={styles.title}>
                                        Created By: {data?.created_by}
                                    </Text>
                                </View>
                                <View>
                                    {/* for each data.items as itemProps map it as table  */} 
                                    {data?.items.map((itemProps) => {
                                        return (
                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                                                <Text>
                                                    {itemProps.name}{' '}
                                                </Text>
                                                <Text>
                                                    {itemProps.batch_id}{' '}
                                                </Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </Page>
                        </Document>
                    </PDFViewer>
                </EuiModalBody>
                <EuiModalFooter>
                    <EuiButton onClick={() => toggleModal(false)}>
                        Close
                    </EuiButton>
                </EuiModalFooter>
            </EuiModalHeader>
        </EuiModal>
    );
};

export default SalesInvoiceDownload;
