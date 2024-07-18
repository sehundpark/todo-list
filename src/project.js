export class Project {
    constructor(name, category) {
        this.name = name;
        this.category = category;
        this.tasks = [];
        this.element = this.createElement();
    }

    createElement() {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('project');
        projectDiv.innerHTML = `
            <span>${this.name}</span>
            <button class="delete-project-btn">X</button>
        `;
        projectDiv.__project = this;

        const deleteProjectBtn = projectDiv.querySelector('.delete-project-btn');
        deleteProjectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteProject();
        });

        return projectDiv;
    }

    deleteProject() {
        if (confirm('Are you sure you want to delete this project and all its tasks?')) {
            this.category.deleteProject(this);
        }
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(task) {
        const index = this.tasks.findIndex(t => t === task);
        if (index > -1) {
            this.tasks.splice(index, 1);
        }
    }

    render() {
        return this.element;
    }
}