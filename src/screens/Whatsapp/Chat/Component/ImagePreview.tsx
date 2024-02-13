import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePreviewProps } from '../Types/WhatsappChat.type';

const ImagePreview = ({
	src,
	placeholderImg,
	errorImg,
	classes,
	...props
}: ImagePreviewProps) => {
	const { t: translator } = useTranslation();
	const [imgSrc, setSrc] = useState(placeholderImg || src);
	const [isError, setIsError] = useState<boolean>(false);
	const onLoad = useCallback(() => {
		setSrc(src);
	}, [src]);
	const onError = useCallback(() => {
		setIsError(true);
		setSrc(errorImg || placeholderImg);
	}, [errorImg, placeholderImg]);
	useEffect(() => {
		const img = new Image();
		img.src = src as string;
		img.addEventListener('load', onLoad);
		img.addEventListener('error', onError);
		return () => {
			img.removeEventListener('load', onLoad);
			img.removeEventListener('error', onError);
		};
	}, [src, onLoad, onError]);
	return !isError ? (
		<img {...props} alt={imgSrc} src={imgSrc} />
	) : (
		<a className={classes.whatsappImageErrorMsg}  href={src} target='_blank' rel='noreferrer'>
			<>{translator('whatsappCampaign.chatMediaErrorMsg')}</>
		</a>
	);
};

export default ImagePreview;
