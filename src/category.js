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
            <h3>${this.name}</h3>
            <button class="add-project-btn">Add Project</button>
            <div class="projects"></div>
        `;
        categoryDiv.__category = this;

        const addProjectBtn = categoryDiv.querySelector('.add-project-btn');
        addProjectBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            this.addProject();
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

    addExistingProject(project) {
        this.projects.push(project);
        this.element.querySelector('.projects').appendChild(project.render());
    }

    render() {
        return this.element;
    }
}