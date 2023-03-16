import { FaCheck } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import clsx from 'clsx';
import {
	testGroupDataProps,
	TestGroupModalRowsProps,
} from '../Types/WhatsappCampaign.types';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const TestGroupModalRows = ({
	classes,
	searchText,
	testGroupData,
	searchGroupResult,
	onSelectGroup,
	isSelectdGroup,
}: TestGroupModalRowsProps) => {
	const { t: translator } = useTranslation();
	return (
		<Box className={classes.testGroupModalGroupList}>
			{searchText?.length <= 0 ? (
				<>
					{testGroupData?.map((group: testGroupDataProps, index: number) => (
						<div
							key={index}
							className={clsx(classes.searchCon)}
							onClick={() => {
								onSelectGroup(group.GroupID);
							}}>
							<span
								className={
									isSelectdGroup(group.GroupID)
										? classes.greenDoc
										: classes.blueDoc
								}>
								{isSelectdGroup(group.GroupID) ? (
									<FaCheck className={clsx(classes.green)} />
								) : (
									<HiOutlineUserGroup />
								)}
							</span>
							<div className={classes.testGroupModalGroupDiv}>
								<span className={classes.ellipsisText}>{group.GroupName}</span>
								<span style={{ whiteSpace: 'nowrap' }}>
									{group.Recipients}{' '}
									{group.Recipients === 1 ? (
										<>{translator('sms.recipient')}</>
									) : (
										<>{translator('sms.recipients')}</>
									)}
								</span>
							</div>
						</div>
					))}
				</>
			) : (
				<>
					{searchGroupResult?.map(
						(group: testGroupDataProps, index: number) => (
							<div
								key={index}
								className={clsx(classes.searchCon)}
								onClick={() => {
									onSelectGroup(group.GroupID);
								}}>
								<span
									className={
										isSelectdGroup(group.GroupID)
											? classes.greenDoc
											: classes.blueDoc
									}>
									{isSelectdGroup(group.GroupID) ? (
										<FaCheck className={clsx(classes.green)} />
									) : (
										<HiOutlineUserGroup />
									)}
								</span>
								<div className={classes.testGroupModalGroupDiv}>
									<span className={classes.ellipsisText}>
										{group.GroupName}
									</span>
									<span style={{ whiteSpace: 'nowrap' }}>
										{group.Recipients}{' '}
										{group.Recipients === 1 ? (
											<>{translator('sms.recipient')}</>
										) : (
											<>{translator('sms.recipients')}</>
										)}
									</span>
								</div>
							</div>
						)
					)}
				</>
			)}
		</Box>
	);
};

export default TestGroupModalRows;
