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
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
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
                                        {new Date(
                                            data?.date || ''
                                        ).toLocaleDateString('id-ID')}
                                    </Text>
                                    <Text style={styles.title}>
                                        Created By: {data?.created_by}
                                    </Text>
                                </View>
                                {/* space for 100px */}
                                <View style={{ height: '20px' }} />
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'stretch',
                                        border: '1px solid black',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            width: '20%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                        }}
                                    >
                                        Name
                                    </Text>
                                    <Text
                                        style={{
                                            width: '6%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                            fontSize: 10,
                                        }}
                                    >
                                        Batch
                                    </Text>
                                    <Text
                                        style={{
                                            width: '29%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                        }}
                                    >
                                        Description
                                    </Text>
                                    <Text
                                        style={{
                                            width: '15%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                        }}
                                    >
                                        Price
                                    </Text>
                                    <Text
                                        style={{
                                            width: '6%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                        }}
                                    >
                                        Disc
                                    </Text>
                                    <Text
                                        style={{
                                            width: '6%',
                                            padding: '3px',
                                            borderRight: '1px solid black',
                                        }}
                                    >
                                        Qty
                                    </Text>
                                    <Text
                                        style={{ width: '18%', padding: '3px' }}
                                    >
                                        Total
                                    </Text>
                                </View>
                                <View>
                                    {data?.items.map((itemProps) => {
                                        return (
                                            <View
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'stretch',
                                                    border: '0.5px solid black',
                                                    borderLeft:
                                                        '1px solid black',
                                                    borderRight:
                                                        '1px solid black',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        width: '20%',
                                                        padding: '3px',
                                                        borderLeft:
                                                            '0.5px solid black',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    {itemProps.name}
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '6%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    {itemProps.batch_id}
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '29%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    {itemProps.description}
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '15%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    Rp.{' '}
                                                    {itemProps.price.toLocaleString(
                                                        'id-ID'
                                                    )}
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '6%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    {itemProps.discount} %
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '6%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '1px solid black',
                                                    }}
                                                >
                                                    {itemProps.quantity}
                                                </Text>
                                                <Text
                                                    style={{
                                                        width: '18%',
                                                        padding: '3px',
                                                        borderRight:
                                                            '0.5px solid black',
                                                    }}
                                                >
                                                    Rp .{' '}
                                                    {itemProps.total.toLocaleString(
                                                        'id-ID'
                                                    )}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                <View
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'stretch',
                                    }}
                                >
                                    <Text
                                        style={{
                                            border: '1px solid black',
                                            width: '76%',
                                            padding: '3px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Subtotal
                                    </Text>
                                    <Text
                                        style={{
                                            border: '1px solid black',
                                            borderLeft: '0px',
                                            width: '24%',
                                            padding: '3px',
                                            // center text
                                            textAlign: 'center',
                                            // bold font
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Rp.{' '}
                                        {data?.total.toLocaleString('id-ID')}
                                    </Text>
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
