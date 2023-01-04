import { setHtmlTemplate } from './helpers.js';

const headerPlaceholder = document.querySelector('.header-placeholder');
// const footerPlaceholder = document.querySelector('.footer-placeholder');

setHtmlTemplate('./templates/header.html', headerPlaceholder, 'header');
// setHtmlTemplate('./templates/footer.html', footerPlaceholder);

/*--------------------------------------------DOM ELEMENTS------------------------------------------------------------*/

const todoBody = document.querySelector('#new-todo-text');
const addTodoBtn = document.querySelector('#add-todo-btn');
const todoItemsContainer = document.querySelector('#todo-items');
const categoriesList = document.querySelector('#categories');
const categoriesElements = document.querySelectorAll('.todo-list__categories-item');
const searchBox = document.querySelector('#search-box-input');

/*-----------------------------------------------APP CLASS------------------------------------------------------------*/

class App {
    constructor() {
        this.selectedCategory = 'all';
    }

    setSelectedCategory(chosenCategory) {
        this.selectedCategory = chosenCategory
    }

    render() {
        todoItemsContainer.innerHTML = '';

        const htmlElements = todoItems[this.selectedCategory].map((todoItem) => todoItem.createHtmlElement());

        todoItemsContainer.append(...htmlElements);
    }
}

const app = new App();

/*-------------------------------------Event listeners functions for editing todo_item--------------------------------------*/

const onChangeInputName = (todoObject) => (e) => {
    const value = e.target.innerText;

    todoObject.editBody(value);
}

const onClickEnter = (e) => {
    if (e.key === 'Enter') {
        e.target.classList.remove('todo-item__name--is-focus');

        e.target.contentEditable = false;
    }
}

/*-----------------------------------------TODO_ITEM CLASS------------------------------------------------------------*/

class TodoItem {
    constructor(body) {
        this.body = body;
        this.date = new Date();
        this.isCompleted = false;
        this.id = generateId();
    }

    editBody(newBody) {
        this.body = newBody;
    }

    /*--------Change todo_item status------*/

    toggleCompleted() {
        this.isCompleted = !this.isCompleted;
    }

    /*------Creating HTML container for TodoItem-----*/

    createHtmlElement() {
        const { body, date, id, isCompleted } = this;

        const normalizedDate = normalizeDate(date);

        const todoItemContainer = document.createElement('div');

        todoItemContainer.classList.add('todo-item');
        todoItemContainer.dataset.id = id;


        todoItemContainer.innerHTML = `
        <input type="checkbox" class="todo-item__checkbox" ${ isCompleted ? "checked" : '' }>
        <div class="todo-item__description">
           <span class="todo-item__name" 
                  role="textbox"
                  id="todo-name"
                  >${ body }</span>
           <span  class="todo-item__date">${ normalizedDate }</span>
        </div>
        <div class="todo-item__icons">
          <img src="images/icon-edit.png" 
               class="todo-item__icon"
               role="button"
               data-button-type="edit"
               alt="edit">
               
          <img src="images/icon-delete.png" 
               class="todo-item__icon"
               role="button" 
               data-button-type="delete"
               alt="delete">
        </div>
    `

        const deleteButton = todoItemContainer.querySelector('[data-button-type=delete]');
        const editButton = todoItemContainer.querySelector('[data-button-type=edit]');
        const todoBody = todoItemContainer.querySelector('.todo-item__name');

        deleteButton.addEventListener('click', deleteTodo);
        editButton.addEventListener('click', this.editTodo.bind(this));
        todoBody.addEventListener('input', onChangeInputName(this));
        todoBody.addEventListener('keypress', onClickEnter);

        todoItemContainer.addEventListener('click', todoContainerOnClick(editButton, todoBody));

        return todoItemContainer;
    }

    editTodo() {
        const todoComponent = document.querySelector(`.todo-item[data-id='${ this.id }']`);

        const input = todoComponent.querySelector('.todo-item__name');

        input.classList.toggle('todo-item__name--is-focus');

        const isFocused = input.classList.contains('todo-item__name--is-focus');

        if (isFocused) {
            input.contentEditable = true;

            input.focus();
        } else {
            input.blur();

            input.classList.remove('todo-item__name--is-focus');

            input.contentEditable = false;
        }
    }
}


function todoContainerOnClick(editButton, todoBody) {
    const htmlElements = [editButton, todoBody];

    return ({ target }) => {
        const isTodoContainer = htmlElements.some(htmlElement => htmlElement === target);

        if (isTodoContainer) {
            return;
        }

        if (todoBody.classList.contains('todo-item__name--is-focus')) {
            todoBody.classList.remove('todo-item__name--is-focus');

            todoBody.contentEditable = false;
        }
    }
}

/*------------------------------------------------TODOS CLASS---------------------------------------------------------*/

class Todos {
    constructor() {
        this.todos = [];
    }

    get all() {
        return this.todos;
    }

    get active() {
        return this.todos.filter(filterTodoActiveItems);
    }

    get completed() {
        return this.todos.filter(filterTodoCompletedItems);
    }

    pushTodo(todo) {
        this.todos.push(todo);
    }

    deleteTodo(todoId) {
        this.todos = this.todos.filter((todo) => todo.id !== todoId);
    }

    sortTodos(sortBy, orderBy) {
        this.todos = sortItems(this.todos, sortBy, orderBy)
    }
}

const todoItems = new Todos();

/*-----------------------------------------SELECT CATEGORY-----------------------------------------------------------*/

function selectCategory({ target }) {
    const selectedCategory = target.getAttribute('data-category');

    app.setSelectedCategory(selectedCategory);

    if (!selectedCategory) {
        return;
    }

    categoriesElements.forEach((categoryItem) =>
        categoryItem.dataset.category === selectedCategory
            ? categoryItem.classList.add('todo-list__categories-item--active')
            : categoryItem.classList.remove('todo-list__categories-item--active')
    );

    app.render();
}


categoriesList.addEventListener('click', selectCategory);

/*----------------------------------------FILTER ACTIVE COMPLETED ITEMS-----------------------------------------------*/

function filterTodoActiveItems(todo) {
    return !todo.isCompleted
}

function filterTodoCompletedItems(todo) {
    return todo.isCompleted
}

/*--------------------------------------------------CREATE ITEM-------------------------------------------------------*/

function createTodo(e) {
    e.preventDefault();

    if (!todoBody.value.trim()) {
        return;
    }

    const todoItem = new TodoItem(todoBody.value);

    todoItems.pushTodo(todoItem);

    app.render();

    todoBody.value = '';
}

addTodoBtn.addEventListener('click', createTodo);

/*-----------------------------------------------------DELETE ITEM----------------------------------------------------*/

function deleteTodo(event) {
    const todoId = event.target.closest('.todo-item').dataset.id;

    todoItems.deleteTodo(todoId);

    app.render();
}

/*---------------------------------------------TOGGLE ITEM STATUS----------------------------------------------------*/

function toggleTodoStatus(e) {
    if (e.target.type !== 'checkbox') {
        return;
    }

    const todoElement = e.target.closest('[data-id]');

    const selectedTodoId = todoElement.getAttribute('data-id');

    const selectedTodo = todoItems.all.find((todo) => todo.id === selectedTodoId);

    selectedTodo.toggleCompleted();

    app.render();
}

todoItemsContainer.addEventListener('change', toggleTodoStatus);

/*------------------------------------------------------SORT ITEMS---------------------------------------------------*/

const sortBy = document.querySelector('.todo-list__sort-by');

const sortPopup = document.querySelector('#sort-popup');

const showPopup = () => {
    sortPopup.classList.add('sort-popup--is-open');
};

const closePopup = () => {
    sortPopup.classList.remove('sort-popup--is-open');
};

function sortOnClick(e) {
    const [sortBy, orderBy] = e.target.dataset.sortOption.split('-');

    todoItems.sortTodos(sortBy, orderBy)

    app.render();
}

const sortingFunctions = {
    alphabetical: (itemOne, itemTwo) => itemOne.body > itemTwo.body ? 0 : -1,
    date: (itemOne, itemTwo) => itemOne.date - itemTwo.date
}

function sortItems(items, sortBy, orderBy) {
    const sortingFunction = sortingFunctions[sortBy];

    return orderBy === 'asc'
        ? items.sort(sortingFunction)
        : items.sort(sortingFunction).reverse()
}

sortBy.addEventListener('mouseenter', showPopup);

sortBy.addEventListener('mouseleave', closePopup);

sortPopup.addEventListener('click', sortOnClick)

/*--------------------------------------------------SEARCH ITEM-------------------------------------------------------*/

const searchTodoItem = ({ target }) => {
    const normalizedValue = target.value.trim();

    const todoItemsElements = document.querySelectorAll('.todo-item');

    todoItemsElements.forEach((todoElement) => {
        const { innerText } = todoElement.querySelector('.todo-item__name');

        innerText.includes(normalizedValue)
            ? todoElement.classList.remove('todo-item--is-hidden')
            : todoElement.classList.add('todo-item--is-hidden')
    });
};

searchBox.addEventListener('input', searchTodoItem);

/*------------------------------------------------------HELPERS------------------------------------------------------*/

function normalizeDate(dateObj) {
    const monthIndex = dateObj.getMonth();
    const month = getNormalizedMonth(monthIndex);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dayOfWeekIndex = dateObj.getDay();
    const dayOfWeek = getDayOfWeek(dayOfWeekIndex);
    const year = dateObj.getFullYear();

    return `${ month } ${ day }, ${ year }, ${ dayOfWeek }`
}

function getNormalizedMonth(monthIndex) {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    return months[monthIndex];
}

function getDayOfWeek(dayIndex) {
    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    return days[dayIndex];
}

function generateId() {
    return Math.random().toString(16).slice(2);
}
