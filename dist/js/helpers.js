/* Replace placeholders in HTML */
export const setHtmlTemplate = (src, elementPlaceholder, replaceWithElementId) => {
    fetch(src)
        .then(res => res.text())
        .then(data => {
            const parser = new DOMParser();

            const document = parser.parseFromString(data, "text/html");

            const htmlElement = document.getElementById(replaceWithElementId);

            elementPlaceholder.replaceWith(htmlElement);
        });
};

