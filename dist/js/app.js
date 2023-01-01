import { setHtmlTemplate } from './helpers.js';

const headerPlaceholder = document.querySelector('.header-placeholder');
// const footerPlaceholder = document.querySelector('.footer-placeholder');

setHtmlTemplate('./templates/header.html', headerPlaceholder, 'header');
// setHtmlTemplate('./templates/footer.html', footerPlaceholder);

// DOM Elements
const todoBody = document.querySelector('#new-todo');
const todoForm = document.querySelector('#todo-form');
const todoItemsContainer = document.querySelector('#todo-items');
const categoriesList = document.querySelector('#categories');
const categoriesElements = document.querySelectorAll('.todo-list__categories-item');

// Class which defines app state
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

const onChangeInputName = (todoObject) => (e) => {
    todoObject.editBody(e.target.value);
}

class TodoItem {
    constructor(body) {
        this.body = body;
        this.date = getCurrentDate();
        this.isCompleted = false;
        this.id = generateId();
    }

    editBody(newBody) {
        this.body = newBody;
    }

    /*Change todo status*/
    toggleCompleted() {
        this.isCompleted = !this.isCompleted;
    }

    /*Creating HTML container for TodoItem */
    createHtmlElement() {
        const { body, date, id, isCompleted } = this;

        const todoItemContainer = document.createElement('div');

        todoItemContainer.classList.add('todo-item');
        todoItemContainer.dataset.id = id;

        todoItemContainer.innerHTML = `
        <input type="checkbox" class="todo-item__checkbox" ${ isCompleted ? "checked" : '' }>
        <div class="todo-item__description">
          <input type="text"
                 name="todo-name" 
                 class="todo-item__name" 
                 value="${ body }"
                 readonly>
          <span  class="todo-item__date">${ date }</span>
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
        todoBody.addEventListener('change', onChangeInputName(this));

        return todoItemContainer;
    }

    editTodo() {
        const todoComponent = document.querySelector(`.todo-item[data-id='${ this.id }']`);

        const input = todoComponent.querySelector('.todo-item__name');

        input.classList.toggle('todo-item__name--is-focus');

        input.readOnly = false;

        input.focus();
    }
}


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
}

const todoItems = new Todos();

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

function filterTodoActiveItems(todo) {
    return !todo.isCompleted
}

function filterTodoCompletedItems(todo) {
    return todo.isCompleted
}

function createTodo(e) {
    e.preventDefault();

    const todoItem = new TodoItem(todoBody.value);

    todoItems.pushTodo(todoItem);

    app.render();

    todoBody.value = '';
}

function deleteTodo(event) {
    const todoId = event.target.closest('.todo-item').dataset.id;

    todoItems.deleteTodo(todoId);

    app.render();
}

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

/*------------------------------------------------------HELPERS------------------------------------------------------*/

function getCurrentDate() {
    const dateObj = new Date();
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

todoForm.addEventListener('submit', createTodo);
