import { ClassesType } from '../../../Classes.types';

export type paginationProps = {
	classes: ClassesType['classes'];
	rows: number;
	page: number;
	rowsPerPageOptions: number[];
	rowsPerPage: number;
	returnPageOne: boolean;
	onRowsPerPageChange: (rowsNumber: number) => void;
	onPageChange: (pageNumber: number) => void;
};
