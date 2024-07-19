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
        this.isEditing = false;
        this.taskBeingEdited = null;
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
        this.addTaskForm.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
        this.closeButton.addEventListener('click', () => this.toggleModal());
        this.categoriesContainer.addEventListener('click', (e) => this.handleCategoryClick(e));
    }

    handleCategoryClick(e) {
        if (e.target.classList.contains('project')) {
            const project = e.target.__project;
            this.showTasks(project);
        }
    }

    handleAddCategory() {
        const categoryName = prompt('Enter category name:');
        if (categoryName) {
            this.addCategory(categoryName);
            this.saveToLocalStorage();
        }
    }

    addCategory(name) {
        const category = new Category(name, this);
        this.categories.push(category);
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
            task.taskPlanner = this;
            this.tasksContainer.appendChild(taskElement);
        });
    }

    toggleModal() {
        this.taskModal.classList.toggle('hidden');
        if (this.taskModal.classList.contains('hidden')) {
            // Reset form when closing
            this.addTaskForm.reset();
            this.isEditing = false;
            this.taskBeingEdited = null;
            document.querySelector('#add-task-form button[type="submit"]').textContent = 'Add Task';
        }
    }    

    handleTaskFormSubmit(e) {
        e.preventDefault();
        if (this.currentProject) {
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-desc').value;
            const dueDate = document.getElementById('task-due').value;
            const priority = document.getElementById('task-priority').value;
    
            if (this.isEditing && this.taskBeingEdited) {
                // Update existing task
                this.taskBeingEdited.update(title, description, dueDate, priority);
                this.isEditing = false;
                this.taskBeingEdited.taskPlanner = this;
                this.taskBeingEdited = null;
            } else {
                // Add new task
                const task = new Task(title, description, dueDate, priority);
                this.currentProject.addTask(task);
                task.taskPlanner = this;
                const taskElement = task.render();
                this.tasksContainer.appendChild(taskElement);
            }
    
            this.addTaskForm.reset();
            this.toggleModal();
            this.saveToLocalStorage();
    
            // Reset the submit button text
            document.querySelector('#add-task-form button[type="submit"]').textContent = 'Add Task';
        }
    }    

    editTask(task) {
        this.isEditing = true;
        this.taskBeingEdited = task;
    
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.description;
        document.getElementById('task-due').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
    
        // Change the submit button text
        document.querySelector('#add-task-form button[type="submit"]').textContent = 'Update Task';
    
        this.toggleModal();
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