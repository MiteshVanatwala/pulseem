import { useSelector } from 'react-redux';
import { coreProps, WhatsappTipsProps } from '../Types/WhatsappCreator.types';

const WhatsappTips = ({ classes }: WhatsappTipsProps) => {
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	return (
		<div className={classes.whatsappTipsWrapper}>
			{isRTL ? (
				<>
					<span className='title'>טיפים לאישור התבנית שלך</span>
					<p>אל תיצור תבנית המורכבת מיותר מדי משתנים או תבנית כללית מאוד.</p>
					<p>אל תכלול משתנים "צפים" - ללא טקסט לפני או אחרי המשתנה.</p>
					<p>
						אל תכלול קישורים מקוצרים כלליים כגון: <b>bit.ly</b> or <b>goo.gl</b>
					</p>
					<p>
						אל תוסיף קישורים הכוללים דומיינים שאינם שייכים לעסק ששולח את
						הקמפיין.
					</p>
					<p>אל תערבב מספר שפות בתבנית - צור תבנית לכל שפה</p>
					<p>יש להגיה בקפידה את הטקסט, האיות והפיסוק</p>
					<p>לאחר אישור התבנית, לא ניתן לשנותה</p>
				</>
			) : (
				<>
					<span className='title'>Tips to get your template approved</span>
					<p>
						Don't create a template consisting of too many variables or a very
						general template.
					</p>
					<p>
						Don't include "floating" variables - without text before or after
						the variable.
					</p>
					<p>
						Don't include generic shortened links such as: <b>bit.ly</b> or{' '}
						<b>goo.gl</b>
					</p>
					<p>
						Don't add links inculding domains which are not belong to the
						bussiness sending the campagin.
					</p>
					<p>
						Don't mix multiple languages in the template - create a template for
						each langauge
					</p>
					<p>The text, spelling and punctuation must be carefully proofread</p>
					<p>Once the template is approved, it cannot be changed</p>
				</>
			)}
		</div>
	);
};
export default WhatsappTips;
