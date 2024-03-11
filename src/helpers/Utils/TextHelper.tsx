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