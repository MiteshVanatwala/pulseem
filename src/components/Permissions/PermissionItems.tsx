import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { StateType } from "../../Models/StateTypes";
import { Divider, FormControlLabel, Grid, Typography } from "@material-ui/core";
import clsx from 'clsx';
import PulseemSwitch from "../Controlls/PulseemSwitch";
import { PermissionTypes } from "../../config/enum";
import { eSubUserPermissions, SubUserModel } from "../../Models/SubUser/SubUsers";
import _ from "lodash";

interface refs {
  classes: any;
  userDetails: SubUserModel;
  updateSubUserDetails: any;
  permissions: Permissions;
  updatePermissions: any;
}

interface Permissions {
  accessType: any;
  allowSending: boolean;
  allowExport: boolean;
  allowDeleting: boolean;
  allowSubUsers: boolean;
}

const PermissionItems = ({ classes, userDetails, updateSubUserDetails, permissions, updatePermissions }: refs) => {
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { t } = useTranslation();
  const isFirstMount = useRef(true);

  const [errors, setErrors] = useState({
    accessType: '',
    limitedAccess: '',
  });

  const reloadForm = () => {
    setErrors({
      accessType: '',
      limitedAccess: '',
    });

    updatePermissions({
      accessType: PermissionTypes.ReadOnly,
      allowSending: false,
      allowExport: false,
      allowDeleting: false,
      allowSubUsers: false
    });

    updateSubUserDetails({
      ...userDetails,
      SubUserPermissions: [eSubUserPermissions.HideRecipients].join(','),
      UserPermissionsList: [eSubUserPermissions.HideRecipients]
    })
  }

  useEffect(() => {
    if (isFirstMount.current) {
      reloadForm();
      isFirstMount.current = false;
    }
  }, [])

  return <>
    <Grid container className={clsx(isRTL ? classes.rowReverse : null)} spacing={2}>
      <Grid item md={12} xs={12}>
        <div className={clsx(classes.f18, classes.bold, classes.pb10, classes.pt30)}>{t('SubUsers.permissions')}</div>
        <Divider className={clsx(classes.mb10, classes.bgBlack)} />
      </Grid>
      <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
        <Typography>
          {t('SubUsers.admin')}
        </Typography>
      </Grid>
      <Grid item md={1} xs={1} className={clsx(classes.textRight)}>
        <FormControlLabel
          control={
            <PulseemSwitch
              id="1"
              switchType='ios'
              classes={classes}
              onColor="#0371ad"
              handleDiameter={20}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              className={clsx({ [classes.rtlSwitch]: isRTL })}
              checked={permissions.accessType === PermissionTypes.Admin}
              onChange={(e: any) => {
                if (e.target.checked) {
                  updateSubUserDetails({
                    ...userDetails,
                    SubUserPermissions: [eSubUserPermissions.AllowSend, eSubUserPermissions.AllowExport, eSubUserPermissions.AllowDelete, eSubUserPermissions.AllowSubUsers].join(','),
                    UserPermissionsList: [eSubUserPermissions.AllowSend, eSubUserPermissions.AllowExport, eSubUserPermissions.AllowDelete, eSubUserPermissions.AllowSubUsers]
                  })
                }
                updatePermissions({
                  ...permissions,
                  accessType: permissions.accessType === PermissionTypes.Admin ? '' : PermissionTypes.Admin
                })
              }}
            />
          }
          label=''
        />
      </Grid>
    </Grid>

    <Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
      <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
        <Typography>
          {t('SubUsers.limitedAccess')}
          <Typography className={clsx(errors.limitedAccess ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
            {errors.limitedAccess}
          </Typography>
        </Typography>
      </Grid>
      <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
        <FormControlLabel
          control={
            <PulseemSwitch
              id="1"
              switchType='ios'
              classes={classes}
              onColor="#0371ad"
              handleDiameter={20}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              className={clsx({ [classes.rtlSwitch]: isRTL })}
              checked={permissions.accessType === PermissionTypes.LimitedAccess}
              onChange={(e: any) => {
                const newPermissions = userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.HideRecipients });
                updateSubUserDetails({
                  ...userDetails,
                  SubUserPermissions: newPermissions.join(','),
                  UserPermissionsList: newPermissions
                });
                updatePermissions({
                  ...permissions,
                  accessType: permissions.accessType === PermissionTypes.LimitedAccess ? '' : PermissionTypes.LimitedAccess
                })
              }}
            />
          }
          label=''
        />
      </Grid>

      {
        permissions.accessType === PermissionTypes.LimitedAccess && (
          <>
            <Grid container className={clsx(isRTL ? classes.rowReverse : null)} style={{ marginInline: 55 }}>
              <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
                {t('SubUsers.allowSending')}
              </Grid>
              <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
                <FormControlLabel
                  control={
                    <PulseemSwitch
                      id="1"
                      switchType='ios'
                      classes={classes}
                      onColor="#0371ad"
                      handleDiameter={20}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      className={clsx({ [classes.rtlSwitch]: isRTL })}
                      checked={permissions.allowSending === true}
                      onChange={(e: any) => {
                        if (!e.target.checked) {
                          updatePermissions({ ...permissions, allowSending: false })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSend }).join(','),
                            UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSend })
                          })
                        }
                        else {
                          updatePermissions({ ...permissions, allowSending: true })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSend].join(','),
                            UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSend]
                          })

                        }
                      }}
                    />
                  }
                  label=''
                />
              </Grid>
            </Grid>

            <Grid container className={clsx(isRTL ? classes.rowReverse : null)} style={{ marginInline: 55 }}>
              <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
                {t('SubUsers.allowExport')}
              </Grid>
              <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
                <FormControlLabel
                  control={
                    <PulseemSwitch
                      id="1"
                      switchType='ios'
                      classes={classes}
                      onColor="#0371ad"
                      handleDiameter={20}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      className={clsx({ [classes.rtlSwitch]: isRTL })}
                      checked={permissions.allowExport === true}
                      onChange={(e: any) => {
                        if (!e.target.checked) {
                          updatePermissions({ ...permissions, allowExport: false })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowExport }).join(','),
                            UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowExport })
                          })
                        }
                        else {
                          updatePermissions({ ...permissions, allowExport: true })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowExport].join(','),
                            UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowExport]
                          })

                        }
                      }}
                    />
                  }
                  label=''
                />
              </Grid>
            </Grid>

            <Grid container className={clsx(isRTL ? classes.rowReverse : null)} style={{ marginInline: 55 }}>
              <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
                {t('SubUsers.allowDeleting')}
              </Grid>
              <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
                <FormControlLabel
                  control={
                    <PulseemSwitch
                      id="1"
                      switchType='ios'
                      classes={classes}
                      onColor="#0371ad"
                      handleDiameter={20}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      className={clsx({ [classes.rtlSwitch]: isRTL })}
                      checked={permissions.allowDeleting === true}
                      onChange={(e: any) => {
                        if (!e.target.checked) {
                          updatePermissions({ ...permissions, allowDeleting: false })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowDelete }).join(','),
                            UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowDelete })
                          })
                        }
                        else {
                          updatePermissions({ ...permissions, allowDeleting: true })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowDelete].join(','),
                            UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowDelete]
                          })

                        }
                      }}
                    />
                  }
                  label=''
                />
              </Grid>
            </Grid>

            <Grid container className={clsx(isRTL ? classes.rowReverse : null)} style={{ marginInline: 55 }}>
              <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)} style={{ paddingInline: 10 }}>
                {t('SubUsers.userCreation')}
              </Grid>
              <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
                <FormControlLabel
                  control={
                    <PulseemSwitch
                      id="1"
                      switchType='ios'
                      classes={classes}
                      onColor="#0371ad"
                      handleDiameter={20}
                      boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                      activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                      height={15}
                      className={clsx({ [classes.rtlSwitch]: isRTL })}
                      checked={permissions.allowSubUsers === true}
                      onChange={(e: any) => {
                        if (!e.target.checked) {
                          updatePermissions({ ...permissions, allowSubUsers: false })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSubUsers }).join(','),
                            UserPermissionsList: userDetails.UserPermissionsList.filter((x: any) => { return x !== eSubUserPermissions.AllowSubUsers })
                          })
                        }
                        else {
                          updatePermissions({ ...permissions, allowSubUsers: true })
                          updateSubUserDetails({
                            ...userDetails,
                            SubUserPermissions: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSubUsers].join(','),
                            UserPermissionsList: [...userDetails.UserPermissionsList, eSubUserPermissions.AllowSubUsers]
                          })

                        }
                      }}
                    />
                  }
                  label=''
                />
              </Grid>
            </Grid>

          </>
        )
      }
    </Grid>

    <Grid container className={clsx(isRTL ? classes.rowReverse : null)}>
      <Grid item md={11} xs={11} className={clsx(classes.pt10, classes.dFlex, classes.alignItemsCenter)}>
        {t('SubUsers.readOnly')}
      </Grid>
      <Grid item md={1} xs={1} className={clsx(classes.textRight, classes.pt10)}>
        <FormControlLabel
          control={
            <PulseemSwitch
              id="1"
              switchType='ios'
              classes={classes}
              onColor="#0371ad"
              handleDiameter={20}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={15}
              className={clsx({ [classes.rtlSwitch]: isRTL })}
              checked={permissions.accessType === PermissionTypes.ReadOnly}
              onChange={(e: any) => {
                if (permissions.accessType !== PermissionTypes.ReadOnly) {
                  updateSubUserDetails({
                    ...userDetails,
                    SubUserPermissions: '5',
                    UserPermissionsList: [eSubUserPermissions.HideRecipients]
                  })
                }
                else {
                  updateSubUserDetails({
                    ...userDetails,
                    SubUserPermissions: '',
                    UserPermissionsList: []
                  })
                }
                updatePermissions({
                  ...permissions,
                  accessType: permissions.accessType === PermissionTypes.ReadOnly ? '' : PermissionTypes.ReadOnly
                })
              }}
            />
          }
          label=''
        />
      </Grid>
    </Grid>
  </>
}

export default PermissionItems;