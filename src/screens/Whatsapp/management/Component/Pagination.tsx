import { BaseSyntheticEvent, KeyboardEvent, useState } from 'react';
import { Typography, Grid, TextField, IconButton } from '@material-ui/core';
import { PageArrowIcon } from '../../../../assets/images/managment';
import { useTranslation } from 'react-i18next';
import { paginationProps } from '../Types/Management.types';
import { IoIosArrowDown } from 'react-icons/io';

export const Pagination = ({
	classes,
	rows = 0,
	page = 1,
	rowsPerPageOptions = [],
	rowsPerPage,
	onRowsPerPageChange,
	onPageChange,
	returnPageOne = true,
}: paginationProps) => {
	const { t: translator } = useTranslation();
	const pages: number = Math.ceil(rows / rowsPerPage);
	const [innerPage, setPage] = useState<number>(1);
	const [isTyping, setTyping] = useState<boolean>(false);

	const handleKeyPress = (event: KeyboardEvent) => {
		let isNumber = /^[0-9]*$/;
		if (!event.key.match(isNumber) || event.key === 'e' || event.key === '.') {
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	};
	const handelPageChange = (event: BaseSyntheticEvent) => {
		let currentPage = parseInt(event.target.value);
		if (currentPage > pages) {
			currentPage = pages;
		}
		if (currentPage >= 1 && currentPage <= pages) {
			onPageChange(currentPage);
		}
		setTyping(true);
		setPage(currentPage);
	};

	const handleRowsPerPageChange = (event: BaseSyntheticEvent) => {
		const value = parseInt(event.target.value);
		if (value !== rowsPerPage) {
			onRowsPerPageChange(value);
			if (returnPageOne === true) {
				onPageChange(1);
			}
		}
	};

	const renderRowNumbers = () => {
		return (
			<Grid item className={classes.tablePadingtonGridItem}>
				<Typography>
					<>{translator('common.rowNumber')}</>
				</Typography>
				<TextField
					select
					className={classes.tablePaginationSelect}
					variant='standard'
					SelectProps={{
            native: true,
            IconComponent: () => <IoIosArrowDown className='MuiSelect-icon' />
          }}
					value={rowsPerPage}
					onChange={handleRowsPerPageChange}>
					{rowsPerPageOptions.map((option: number) => (
						<option key={option.toString()} value={option}>
							{option}
						</option>
					))}
				</TextField>
			</Grid>
		);
	};

	const renderPageNumbers = () => {
		const pageNum = innerPage ? innerPage.toString() : '';
		return (
			<Grid item className={classes.tablePadingtonGridItem}>
				{page > 1 && (
					<IconButton
						onClick={() => {
							setTyping(false);
							onPageChange(page - 1);
						}}
						size='small'
						className={classes.tablePadingtonArrowOppisite}>
						<PageArrowIcon />
					</IconButton>
				)}
				<Typography>
					<>{translator('common.page')}</>
				</Typography>
				<TextField
					dir='ltr'
					error={isTyping && innerPage > page}
					type='number'
					value={isTyping ? pageNum : page.toString()}
					onBlur={() => setTyping(false)}
					onKeyPress={handleKeyPress}
					onChange={handelPageChange}
					variant='outlined'
					margin='none'
					size='small'
					className={classes.tablePadingtonTextFeild}
				/>
				<Typography>
					<>{translator('common.outOf')}</> {pages === 0 ? 1 : pages}
				</Typography>
				{page < pages && (
					<IconButton
						onClick={() => {
							setTyping(false);
							onPageChange(page + 1);
						}}
						size='small'
						className={classes.tablePadingtonArrow}>
						<PageArrowIcon />
					</IconButton>
				)}
			</Grid>
		);
	};
	return (
		<Grid
			container
			justifyContent='space-between'
			className={classes.tablePadingtonGridContainer}>
			{renderRowNumbers()}
			{renderPageNumbers()}
		</Grid>
	);
};
export default Pagination;
