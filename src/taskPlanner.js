import { Category } from './category.js';
import { Project } from './project.js';
import { Task } from './task.js';

export class TaskPlanner {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentProject = null;
        this.loadFromLocalStorage();
    }

    initializeElements() {
        this.addCategoryBtn = document.getElementById('add-category-btn');
        this.categoriesContainer = document.getElementById('categories');
        this.tasksContainer = document.getElementById('tasks-container');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskModal = document.getElementById('task-modal');
        this.addTaskForm = document.getElementById('add-task-form');
        this.closeButton = document.querySelector('.close-button');
    }

    bindEvents() {
        this.addCategoryBtn.addEventListener('click', () => this.handleAddCategory());
        this.categoriesContainer.addEventListener('click', (e) => this.handleCategoryClick(e));
        // Remove the event listener for category clicks if it exists
        this.categoriesContainer.removeEventListener('click', this.handleCategoryClick);
        // Add the event listener with the bound method
        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.categoriesContainer.addEventListener('click', this.handleCategoryClick);
        this.addTaskBtn.addEventListener('click', () => {
            this.toggleModal();
        });
        this.addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.closeButton.addEventListener('click', () => this.toggleModal());
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
        this.categoriesContainer.appendChild(category.render());
    }

    handleCategoryClick(e) {
        if (e.target.classList.contains('project')) {
            const project = e.target.__project;
            this.showTasks(project);
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
            document.getElementById('add-task-form').reset();
            this.toggleModal();
            this.saveToLocalStorage();
        }
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

    toggleModal() {
        this.taskModal.classList.toggle('hidden');
    }

    windowOnClick(e) {
        if (e.target === this.taskModal) {
            this.toggleModal();
        }
    }

    saveToLocalStorage() {
        const data = {
            categories: Array.from(this.categoriesContainer.children).map(categoryEl => {
                const category = categoryEl.__category;
                return {
                    name: category.name,
                    projects: category.projects.map(project => ({
                        name: project.name,
                        tasks: project.tasks.map(task => task.toJSON())
                    }))
                };
            })
        };
        localStorage.setItem('taskPlannerData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('taskPlannerData'));
        if (data) {
            data.categories.forEach(categoryData => {
                const category = new Category(categoryData.name, this);
                this.categoriesContainer.appendChild(category.render());
                categoryData.projects.forEach(projectData => {
                    const project = new Project(projectData.name, category);
                    category.addExistingProject(project);
                    projectData.tasks.forEach(taskData => {
                        const task = new Task(taskData.title, taskData.description, taskData.dueDate, taskData.priority);
                        project.addTask(task);
                    });
                });
            });
        }
    }
}