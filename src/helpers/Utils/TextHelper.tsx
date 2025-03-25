export const GetTextAreaSelection = (elementId: string) => {
    // Obtain the object reference for the <textarea>
    const txtarea = document.getElementById(elementId) as HTMLTextAreaElement;
    // Obtain the index of the first selected character
    var start = txtarea.selectionStart;
    // Obtain the index of the last selected character
    var finish = txtarea.selectionEnd;
    // Obtain the selected text
    var sel = txtarea.value.substring(start, finish);

    return sel;
}

export const RemoveNewLineAndConsecutiveSpaces = (text: string) => text.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ');

export const RemoveConsecutiveSpaces = (text: string) => text.replace(/\s\s+/g, ' ');

export const isValidHttpUrl = (url: string) => {
    try {
        const newUrl = new URL(url);
        return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

export const compareLastNineDigits = (number1: string, number2: string) => {
    // Convert numbers to strings
    const str1 = String(number1);
    const str2 = String(number2);

    // Extract last 9 digits
    const lastNineDigits1 = str1.slice(-9);
    const lastNineDigits2 = str2.slice(-9);

    // Compare
    return lastNineDigits1 === lastNineDigits2;
}