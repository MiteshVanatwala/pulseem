import { useSelector } from 'react-redux';
import { coreProps, WhatsappTipsProps } from '../Types/WhatsappCreator.types';

const WhatsappTips = ({ classes }: WhatsappTipsProps) => {
	const { isRTL } = useSelector((state: { core: coreProps }) => state.core);
	return (
		<div className={classes.whatsappTipsWrapper}>
			{isRTL ? (
				<>
					<span className='title'>טעויות נפוצות המובילות לדחיית תבנית:</span>
					<p>יותר מדי משתנים או תבנית כללית מאד</p>
					<p>משתנים "צפים" - ללא טקסט לפני או אחרי המשתנה</p>
					<p>
						קישורים מקוצרים כלליים כגון: <b>bit.ly</b> or <b>goo.gl</b>
					</p>
					<p>קישורים הכוללים דומיינים שאינם שייכים לעסק שלכם</p>
					<p>טעויות בטקסט, באיות או בפיסוק</p>
					<span className='title'>
						שימו לב! לאחר אישור התבנית, לא ניתן לשנותה
					</span>
				</>
			) : (
				<>
					<span className='title'>
						Common mistakes leading to rejection:
					</span>
					<p>Too many variables or a very general template.</p>
					<p>
						"Floating" variables - without text before or after the variable.
					</p>
					<p>
						Generic shortened links such as: <b>bit.ly</b> or <b>goo.gl</b>
					</p>
					<p>Links to domains other than yours</p>
					<p>Text, spelling and punctuation mistakes</p>
					<span className='title'>
						Please notice!  once the template is approved, it cannot be changed
					</span>
				</>
			)}
		</div>
	);
};
export default WhatsappTips;
