import { setHtmlTemplate } from './helpers.js';

const headerPlaceholder = document.querySelector('.header-placeholder');
// const footerPlaceholder = document.querySelector('.footer-placeholder');

setHtmlTemplate('./templates/header.html', headerPlaceholder, 'header');
// setHtmlTemplate('./templates/footer.html', footerPlaceholder);
