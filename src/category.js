import { Project } from './project.js';

export class Category {
    constructor(name, taskPlanner) {
        this.name = name;
        this.taskPlanner = taskPlanner;
        this.projects = [];
        this.element = this.createElement();
    }

    createElement() {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category');
        categoryDiv.innerHTML = `
            <div class="category-header">
                <h3>${this.name}</h3>
                <button class="delete-category-btn">X</button>
            </div>
            <button class="add-project-btn">Add Project</button>
            <div class="projects"></div>
        `;
        categoryDiv.__category = this;

        const addProjectBtn = categoryDiv.querySelector('.add-project-btn');
        addProjectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addProject();
        });

        const deleteCategoryBtn = categoryDiv.querySelector('.delete-category-btn');
        deleteCategoryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteCategory();
        });

        return categoryDiv;
    }

    addProject() {
        const projectName = prompt('Enter project name:');
        if (projectName) {
            const project = new Project(projectName, this);
            this.projects.push(project);
            this.element.querySelector('.projects').appendChild(project.render());
            this.taskPlanner.saveToLocalStorage();
        }
    }

    deleteCategory() {
        if (confirm('Are you sure you want to delete this category and all its projects?')) {
            this.taskPlanner.deleteCategory(this);
        }
    }

    deleteProject(project) {
        const index = this.projects.indexOf(project);
        if (index > -1) {
            this.projects.splice(index, 1);
            this.element.querySelector('.projects').removeChild(project.element);
            this.taskPlanner.saveToLocalStorage();
        }
    }

    addExistingProject(project) {
        this.projects.push(project);
        this.element.querySelector('.projects').appendChild(project.render());
    }

    render() {
        return this.element;
    }
}