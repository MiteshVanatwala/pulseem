import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Box, Button, Grid, TextField, Table, TableBody, TableRow, TableHead, TableCell, TableContainer, Typography } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { MdAdd, MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import DefaultScreen from '../DefaultScreen';
import { Title } from '../../components/managment/Title';
import { Loader } from '../../components/Loader/Loader';
import { toastProps } from '../Whatsapp/Editor/Types/WhatsappCreator.types';
import { resetToastData } from '../Whatsapp/Constant';
import Toast from '../../components/Toast/Toast.component';
import { ManagmentIcon } from '../../components/managment';
import { DeleteIcon, EditIcon } from '../../assets/images/managment';
import CustomTooltip from '../../components/Tooltip/CustomTooltip';
import DynamicConfirmDialog from '../../components/DialogTemplates/DynamicConfirmDialog';
import { getAllUsers, getTeams, saveTeam, deleteTeam } from '../../redux/reducers/SubUserSlice';
import { eSubUserPermissions, SubUserModel, UserRoles } from '../../Models/SubUser/SubUsers';
import { Team, SaveTeamPayload } from '../../Models/Team/Team';
import TeamFormDialog, { AvailableAgent } from './TeamFormDialog';

const Teams = ({ classes }: any) => {
  const { windowSize, isRTL, userRoles } = useSelector((state: any) => state.core);
  const { teams, teamsLoading } = useSelector((state: any) => state?.subUser);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<toastProps['SUCCESS']>(resetToastData);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [openTeamDialog, setOpenTeamDialog] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isSavingTeam, setIsSavingTeam] = useState<boolean>(false);
  const [agentCandidates, setAgentCandidates] = useState<SubUserModel[]>([]);
  const [agentRosterTruncated, setAgentRosterTruncated] = useState<boolean>(false);

  const rowStyle = { head: clsx(classes.tableRowHead, classes.pt10, classes.pb10), root: classes.tableRowRoot };
  const cellStyle = { head: clsx(classes.tableCellHead, classes.noPadding, classes.f16), body: classes.tableCellBody, root: clsx(classes.tableCellRoot, classes.p0) };
  const cellBodyStyle = { body: clsx(classes.tableCellBody, classes.f16), root: clsx(classes.tableCellRoot, classes.noPadding) };

  useEffect(() => {
    const fetchTeams = async () => {
      setShowLoader(true);
      await dispatch(getTeams());
      setShowLoader(false);
    };
    fetchTeams();

    // Fetches the full sub-user roster (not paginated) so the agent picker isn't
    // limited to whichever page of users happens to be on screen.
    const fetchAgentCandidates = async () => {
      const response = await dispatch(getAllUsers({ PageNumber: 1, PageSize: 1000, SearchTerm: '' })) as any;
      if (response?.payload?.StatusCode === 201) {
        const users = response?.payload?.Data?.Users || [];
        setAgentCandidates(users);
        setAgentRosterTruncated((response?.payload?.Data?.TotalRecords || 0) > users.length);
      }
    };
    fetchAgentCandidates();
  }, []);

  // Agent source = permission-flagged sub-users (excludes IsDeleted and not-yet-approved
  // sub-users). Pending Parth's confirmation that the backend keys team membership on SubUserID —
  // if the agent roster is a separate identity (e.g. the WhatsappAgent roster), this line changes.
  const availableAgents: AvailableAgent[] = agentCandidates
    .filter((u) => !u.IsDeleted && u.IsApproved && u.UserPermissionsList?.includes(eSubUserPermissions.AllowWhatsAppToAgent))
    .map((u) => ({ id: u.ID, name: u.UserName }));

  // Client-side filter: Team/GetAll takes no search/query params per the backend contract,
  // so search is done locally against the already-fetched list rather than a server round-trip.
  const filteredTeams: Team[] = isSearching
    ? (teams || []).filter((team: Team) => team.TeamName?.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : (teams || []);

  // Looked up from the raw candidate roster (not the permission-filtered availableAgents) so a
  // team member's name still resolves even if they've since lost the WhatsApp-agent permission.
  const agentNameById = new Map(agentCandidates.map((u) => [u.ID, u.UserName]));
  const getAgentNames = (agentIds: number[]) =>
    (agentIds || []).map((id) => agentNameById.get(id)).filter(Boolean).join(', ');

  const renderToast = () => {
    if (toastMessage.message?.length > 0) {
      setTimeout(() => {
        setToastMessage(resetToastData);
      }, 4000);
      return <Toast data={toastMessage} />;
    }
    return null;
  };

  const saveTeamHandler = async (payload: SaveTeamPayload) => {
    setIsSavingTeam(true);
    const response = await dispatch(saveTeam(payload)) as any;
    if (response?.payload?.StatusCode === 201) {
      setToastMessage({ severity: 'success', color: 'success', message: 'SubUsers.teams.teamSaved', showAnimtionCheck: true });
      setOpenTeamDialog(false);
      setEditingTeam(null);
      dispatch(getTeams());
    } else {
      setToastMessage({ severity: 'error', color: 'error', message: 'SubUsers.teams.genericError', showAnimtionCheck: false });
    }
    setIsSavingTeam(false);
  };

  const deleteTeamHandler = async () => {
    if (!teamToDelete) return;
    const response = await dispatch(deleteTeam(teamToDelete.TeamID)) as any;
    if (response?.payload?.StatusCode === 201) {
      setToastMessage({ severity: 'success', color: 'success', message: 'SubUsers.teams.teamDeleted', showAnimtionCheck: true });
      dispatch(getTeams());
    } else {
      setToastMessage({ severity: 'error', color: 'error', message: 'SubUsers.teams.genericError', showAnimtionCheck: false });
    }
    setTeamToDelete(null);
  };

  const renderSearchSection = () => (
    <Grid container spacing={2} className={clsx(classes.lineTopMarging, 'searchLine')}>
      <Grid item>
        <TextField
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className={clsx(classes.textField, classes.minWidth252)}
          placeholder={t("common.search")}
        />
      </Grid>
      <Grid item>
        <Button
          onClick={() => setIsSearching(true)}
          className={clsx(classes.btn, classes.btnRounded)}
          endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
        >
          {t("campaigns.btnSearchResource1.Text")}
        </Button>
      </Grid>
      {isSearching && (
        <Grid item>
          <Button
            onClick={() => {
              setSearchTerm('');
              setIsSearching(false);
            }}
            className={clsx(classes.btn, classes.btnRounded)}
            endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
          >
            {t("common.clear")}
          </Button>
        </Grid>
      )}
    </Grid>
  );

  const renderTeamRowActions = (team: Team) => (
    userRoles === UserRoles.Admin && (
      <Grid
        container
        direction={windowSize === 'sm' ? 'column' : 'row'}
        justifyContent='center'
      >
        {/* @ts-ignore */}
        <ManagmentIcon
          classes={classes}
          uIcon={<EditIcon width={18} height={20} className={'rowIcon'} />}
          lable={t('campaigns.Image2Resource1.ToolTip')}
          rootClass={classes.paddingIcon}
          onClick={() => { setEditingTeam(team); setOpenTeamDialog(true); }}
        />
        {/* @ts-ignore */}
        <ManagmentIcon
          classes={classes}
          uIcon={<DeleteIcon width={18} height={20} className={'rowIcon'} />}
          lable={t('campaigns.DeleteResource1.HeaderText')}
          rootClass={classes.paddingIcon}
          onClick={() => setTeamToDelete(team)}
        />
      </Grid>
    )
  );

  const renderTeamRow = (team: Team) => {
    const agentNames = getAgentNames(team.AgentIds);
    return (
      <TableRow key={team.TeamID} classes={rowStyle}>
        <TableCell classes={cellBodyStyle} align='center' className={classes.flex2}>{team.TeamName}</TableCell>
        <TableCell classes={cellBodyStyle} align='center' className={clsx(classes.flex2, classes.mlr10)}>
          {agentNames ? (
            // @ts-ignore
            <CustomTooltip
              isSimpleTooltip={false}
              classes={classes}
              interactive={true}
              arrow={true}
              placement={'top'}
              title={<Typography noWrap={false}>{agentNames}</Typography>}
              text={agentNames}
            >
              <div className={clsx(classes.ellipsisText)}>{agentNames}</div>
            </CustomTooltip>
          ) : '-'}
        </TableCell>
        <TableCell
          style={{ minHeight: 80 }}
          classes={cellBodyStyle}
          align='center'
          className={clsx(classes.flex1, classes.noBorderOnLastCell)}>
          {renderTeamRowActions(team)}
        </TableCell>
      </TableRow>
    );
  };

  const renderTeamPhoneRow = (team: Team) => {
    const agentNames = getAgentNames(team.AgentIds);
    return (
      <TableRow key={team.TeamID} component='div' classes={rowStyle}>
        <TableCell style={{ flex: 1 }} classes={{ root: clsx(classes.tableCellRoot, classes.p10) }}>
          <Box className={classes.inlineGrid}>
            <div className={clsx(classes.bold, classes.pt5, classes.f16, classes.w100)}>
              {team.TeamName}
            </div>
          </Box>
          <Box className={clsx(classes.pt5)}>
            {t('SubUsers.teams.agentCount')}: {agentNames || '-'}
          </Box>
          {renderTeamRowActions(team)}
        </TableCell>
      </TableRow>
    );
  };

  const renderTeamsTableHead = () => (
    <TableHead>
      <TableRow classes={rowStyle}>
        <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('SubUsers.teams.name')}</TableCell>
        <TableCell classes={cellStyle} className={classes.flex2} align='center'>{t('SubUsers.teams.agentCount')}</TableCell>
        <TableCell classes={cellStyle} className={clsx(classes.flex1, classes.noBorderOnLastCell)} align='center' />
      </TableRow>
    </TableHead>
  );

  const renderTeamsTableBody = () => {
    if (filteredTeams?.length === 0) {
      return (
        <Box className={clsx(classes.flex, classes.justifyCenterOfCenter)} style={{ height: 50 }}>
          <Typography>{t(isSearching ? "common.NoDataTryFilter" : 'SubUsers.teams.noTeams')}</Typography>
        </Box>
      );
    }

    return (
      <TableBody>
        {filteredTeams?.map(windowSize === 'xs' ? renderTeamPhoneRow : renderTeamRow)}
      </TableBody>
    );
  };

  const renderManagmentLine = () => (
    <Grid container className={clsx(classes.linePadding, classes.pb10)} spacing={2}>
      <Grid item md={8} xs={12} sm={12}>
        {userRoles === UserRoles.Admin && (
          <Button
            className={clsx(classes.btn, classes.btnRounded, classes.marginInlineStart5)}
            endIcon={<MdAdd />}
            onClick={() => { setEditingTeam(null); setOpenTeamDialog(true); }}
          >
            {t('SubUsers.teams.createTeam')}
          </Button>
        )}
      </Grid>
      <Grid item md={4} xs={12} sm={12} className={clsx(classes.groupsLableContainer)}>
        <Typography className={classes.groupsLable}>
          {`${filteredTeams?.length || 0} ${t('SubUsers.teams.teamsCount')}`}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <DefaultScreen
      currentPage='settings'
      subPage='Teams'
      classes={classes}
      containerClass={clsx(classes.management, classes.mb50)}
    >
      <Box className={'topSection'}>
        <Title Text={t('SubUsers.teams.sectionTitle')} classes={classes} />
        {renderSearchSection()}
      </Box>

      {renderManagmentLine()}
      <TableContainer className={classes.tableStyle}>
        <Table className={classes.tableContainer}>
          {windowSize !== 'xs' && renderTeamsTableHead()}
          {renderTeamsTableBody()}
        </Table>
      </TableContainer>
      {renderToast()}

      <TeamFormDialog
        classes={classes}
        isOpen={openTeamDialog}
        onClose={() => { setOpenTeamDialog(false); setEditingTeam(null); }}
        onSaved={saveTeamHandler}
        editRecord={editingTeam}
        availableAgents={availableAgents}
        rosterTruncated={agentRosterTruncated}
        isSaving={isSavingTeam || teamsLoading}
      />

      {teamToDelete && <DynamicConfirmDialog
        classes={classes}
        isOpen={!!teamToDelete}
        title={t('common.Delete')}
        text={t('SubUsers.teams.deleteTeamPrompt')}
        confirmButtonText={t('SubUsers.delete')}
        cancelButtonText='SubUsers.cancel'
        onConfirm={deleteTeamHandler}
        onCancel={() => setTeamToDelete(null)}
        onClose={() => setTeamToDelete(null)}
      />}

      <Loader isOpen={showLoader} zIndex={9999} />
    </DefaultScreen>
  );
};

export default Teams;
