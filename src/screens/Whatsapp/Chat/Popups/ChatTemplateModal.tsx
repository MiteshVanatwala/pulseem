import { Button, Box, Dialog, Grid } from '@material-ui/core';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import '../css/ChatTemplate.css';
import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { chatModalProps } from '../Types/WhatsappChat.type';

const ChatTemplateModal = ({ classes, isOpen, onClose }: chatModalProps) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const { t: translator } = useTranslation();
	return (
		<>
			<Dialog
				fullScreen={fullScreen}
				open={isOpen}
				onClose={onClose}
				aria-labelledby='responsive-dialog-title'>
				<div className={classes.alertModal}>
					<div id='responsive-dialog-title' className={classes.alertModalTitle}>
						{/* {title} */}
						Choose Template
					</div>
					<Box className={classes.alertModalClose}>
						<Close fontSize={'small'} onClick={onClose} />
					</Box>
					<Box className={classes.alertModalInfoWrapper}>
						<Box className={classes.alertModalInfo}>
							<InfoOutlined fontSize={'small'} onClick={onClose} />
						</Box>
					</Box>
					<div className={classes.alertModalContent}>
						<ul className={classes.validationAlertModalUl}>
							{/* {requiredFields?.map((requiredField: string, index: number) => (
								<li key={index} className={classes.infoAlertModalLi}>
									{requiredField}
								</li>
							))} */}

							<section className='accordion'>
								<input type='checkbox' name='collapse' id='handle1' />
								<h2 className='handle'>
									<label htmlFor='handle1'>
										<FaChevronRight
											style={{
												marginRight: '10px',
												fontSize: '0.7rem',
												fontFamily: 'fontawesome',
											}}
										/>
										26A. Trappist Single
									</label>
								</h2>
								<div className='content'>
									<Grid container className={classes.chatTemplateModalTemplateDataWrapper}>
										<Grid item>
											<p>
												<strong>Overall Impression:</strong> A pale, bitter,
												highly attenuated and well carbonated Trappist ale,
												showing a fruity-spicy Trappist yeast character, a
												spicy-floral hop profile, and a soft, supportive
												grainy-sweet malt palate.
											</p>
											<p>
												<strong>History:</strong> While Trappist breweries have
												a tradition of brewing a lower-strength beer as a monk’s
												daily ration, the bitter, pale beer this style describes
												is a relatively modern invention reflecting current
												tastes. Westvleteren first brewed theirs in 1999, but
												replaced older lower-gravity products.
											</p>
										</Grid>
										<Grid item>
											<Button
												className='ok-button'
												size='small'
												variant='contained'
												color='primary'
												autoFocus
												onClick={onClose}>
												<>Choose</>
											</Button>
										</Grid>
									</Grid>
								</div>
							</section>
							<section className='accordion'>
								<input type='checkbox' name='collapse2' id='handle2' />
								<h2 className='handle'>
									<label htmlFor='handle2'>
										<FaChevronRight
											style={{
												marginRight: '10px',
												fontSize: '0.7rem',
												fontFamily: 'fontawesome',
											}}
										/>
										26B. Belgian Dubbel
									</label>
								</h2>
								<div className='content'>
									<p>
										<strong>Overall Impression:</strong> A deep reddish-copper,
										moderately strong, malty, complex Trappist ale with rich
										malty flavors, dark or dried fruit esters, and light alcohol
										blended together in a malty presentation that still finishes
										fairly dry.
									</p>
									<p>
										<strong>History:</strong> Originated at monasteries in the
										Middle Ages, and was revived in the mid-1800s after the
										Napoleonic era.
									</p>
									<div
										style={{
											display: 'flex',
											alignItems: 'right',
											justifyContent: 'right',
										}}>
										<Button
											className='ok-button'
											size='small'
											variant='contained'
											color='primary'
											autoFocus
											onClick={onClose}>
											<>Choose</>
										</Button>
									</div>
								</div>
							</section>
							<section className='accordion'>
								<input type='checkbox' name='collapse2' id='handle3' />
								<h2 className='handle'>
									<label htmlFor='handle3'>
										<FaChevronRight
											style={{
												marginRight: '10px',
												fontSize: '0.7rem',
												fontFamily: 'fontawesome',
											}}
										/>
										26C. Belgian Tripel
									</label>
								</h2>
								<div className='content'>
									<p>
										<strong>Overall Impression:</strong> A pale, somewhat spicy,
										dry, strong Trappist ale with a pleasant rounded malt flavor
										and firm bitterness. Quite aromatic, with spicy, fruity, and
										light alcohol notes combining with the supportive clean malt
										character to produce a surprisingly drinkable beverage
										considering the high alcohol level.
									</p>
									<p>
										<strong>History:</strong> Originally popularized by the
										Trappist monastery at Westmalle.
									</p>
									<div
										style={{
											display: 'flex',
											alignItems: 'right',
											justifyContent: 'right',
										}}>
										<Button
											className='ok-button'
											size='small'
											variant='contained'
											color='primary'
											autoFocus
											onClick={onClose}>
											<>Choose</>
										</Button>
									</div>
								</div>
							</section>
						</ul>
					</div>
					{/* <Grid container className={classes.alertModalAction}>
						<Button
							className='ok-button'
							variant='contained'
							color='primary'
							autoFocus
							onClick={onClose}>
							<>{translator('whatsapp.alertModal.okButtonText')}</>
						</Button>
					</Grid> */}
				</div>
			</Dialog>
		</>
	);
};

export default ChatTemplateModal;
