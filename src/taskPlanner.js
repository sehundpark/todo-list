import { Category } from './category.js';
import { Project } from './project.js';
import { Task } from './task.js';

export class TaskPlanner {
    constructor() {
        this.categories = [];
        this.initializeElements();
        this.bindEvents();
        this.currentProject = null;
        this.loadFromLocalStorage();
    }

    initializeElements() {
        this.addCategoryBtn = document.getElementById('add-category-btn');
        this.categoriesContainer = document.getElementById('categories');
        this.tasksContainer = document.getElementById('task-list');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskModal = document.getElementById('task-modal');
        this.addTaskForm = document.getElementById('add-task-form');
        this.closeButton = document.querySelector('.close-button');
    }

    bindEvents() {
        this.addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
        this.addTaskBtn.addEventListener('click', () => this.toggleModal());
        this.addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.closeButton.addEventListener('click', () => this.toggleModal());
        this.categoriesContainer.addEventListener('click', (e) => this.handleCategoryClick(e));
    }

    handleCategoryClick(e) {
        if (e.target.classList.contains('project')) {
            const project = e.target.__project;
            this.showTasks(project);
        }
    }

    addCategory(name) {
        const category = new Category(name, this);
        this.categories.push(category); // Add this line
        this.categoriesContainer.appendChild(category.render());
    }

    deleteCategory(category) {
        const index = this.categories.indexOf(category);
        if (index > -1) {
            this.categories.splice(index, 1);
            this.categoriesContainer.removeChild(category.element);
            if (this.currentProject && this.currentProject.category === category) {
                this.currentProject = null;
                this.tasksContainer.innerHTML = '';
                this.addTaskBtn.classList.add('hidden');
            }
            this.saveToLocalStorage();
        }
    }

    showTasks(project) {
        this.currentProject = project;
        this.tasksContainer.innerHTML = '';
        this.addTaskBtn.classList.remove('hidden');
        
        project.tasks.forEach(task => {
            const taskElement = task.render();
            taskElement.__taskPlanner = this;
            this.tasksContainer.appendChild(taskElement);
        });
    }

    toggleModal() {
        this.taskModal.classList.toggle('hidden');
    }

    handleAddTask(e) {
        e.preventDefault();
        if (this.currentProject) {
            const task = new Task(
                document.getElementById('task-title').value,
                document.getElementById('task-desc').value,
                document.getElementById('task-due').value,
                document.getElementById('task-priority').value
            );
            this.currentProject.addTask(task);
            this.showTasks(this.currentProject);
            this.addTaskForm.reset();
            this.toggleModal();
            this.saveToLocalStorage();
        }
    }

    editTask(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-due').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;

        this.toggleModal();

        const submitHandler = (e) => {
            e.preventDefault();
            task.update(
                document.getElementById('task-title').value,
                document.getElementById('task-desc').value,
                document.getElementById('task-due').value,
                document.getElementById('task-priority').value
            );
            
            // Replace the old element with the new one
            const oldElement = task.element;
            const newElement = task.render();
            newElement.__taskPlanner = this;
            oldElement.parentNode.replaceChild(newElement, oldElement);

            this.toggleModal();
            this.saveToLocalStorage();
            this.addTaskForm.removeEventListener('submit', submitHandler);
        };

        this.addTaskForm.addEventListener('submit', submitHandler);
    }

    deleteTask(task) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.currentProject.removeTask(task);
            this.showTasks(this.currentProject);
            this.saveToLocalStorage();
        }
    }

    windowOnClick(e) {
        if (e.target === this.taskModal) {
            this.toggleModal();
        }
    }

    saveToLocalStorage() {
        const data = {
            categories: this.categories.map(category => ({
                name: category.name,
                projects: category.projects.map(project => ({
                    name: project.name,
                    tasks: project.tasks.map(task => task.toJSON())
                }))
            }))
        };
        localStorage.setItem('taskPlannerData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('taskPlannerData'));
        if (data) {
            data.categories.forEach(categoryData => {
                const category = new Category(categoryData.name, this);
                this.categories.push(category);
                this.categoriesContainer.appendChild(category.render());
                categoryData.projects.forEach(projectData => {
                    const project = new Project(projectData.name, category);
                    category.projects.push(project);
                    category.element.querySelector('.projects').appendChild(project.render());
                    projectData.tasks.forEach(taskData => {
                        const task = new Task(taskData.title, taskData.description, taskData.dueDate, taskData.priority);
                        project.addTask(task);
                    });
                });
            });
        }
    }
}