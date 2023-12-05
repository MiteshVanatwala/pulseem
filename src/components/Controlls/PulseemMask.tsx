import MaskedInput from 'react-text-mask';

interface TextMaskCustomProps {
    inputRef: (ref: HTMLInputElement | null) => void;
    value: String;
}

const PulseemMask = (props: TextMaskCustomProps) => {
    const { inputRef, value, ...other } = props;

    return (
        <MaskedInput
            {...other}
            value={value}
            ref={(ref: any) => {
                inputRef(ref ? ref.inputElement : null);
            }}
            mask={[value !== '' ? value : '*******************']}
            placeholderChar={'\u2000'}
            showMask
        />
    );
}

export default PulseemMask;