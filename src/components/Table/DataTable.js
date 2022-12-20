import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';


const DataTable = ({
    children,
    tableContainer = { classes: undefined, className: '' },
    table = { classes: undefined, className: '' },
    tableHead = { tableHeadCells: [{ label: '', icon: <></>, classes: undefined, className: '', align: '' }], classes: undefined, className: '' },
    ...props
}) => {

    return (
        <TableContainer component={Paper} className={tableContainer.className ?? ''} classes={tableContainer.classes}>
            <Table className={table.className ?? ''} aria-label="customized table" classes={table.classes}>
                <TableHead>
                    <TableRow classes={tableHead.classes} className={tableHead.className ?? ''}>
                        {tableHead.tableHeadCells?.map((obj, i) => <TableCell key={i} classes={obj.classes} className={obj.className ?? ''} align={obj.align ?? ''}>
                            <div style={{ maxWidth: '100%', maxHeight: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>{obj.label ?? ''} {obj.icon}</div>
                        </TableCell>)}
                    </TableRow>
                </TableHead>
                {
                    children
                }
            </Table>
        </TableContainer>
    );
}

export default DataTable