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
        projectDiv.textContent = this.name;
        projectDiv.__project = this;
        return projectDiv;
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