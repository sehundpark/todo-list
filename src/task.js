export class Task {
    constructor(title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
        this.element = null;
        this.createTaskElement();
    }

    createTaskElement() {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task', `priority-${this.priority}`);
        taskDiv.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${this.completed ? 'checked' : ''}>
            <div class="task-content">
                <h3>${this.title}</h3>
                <p>${this.description}</p>
                <p>Due: ${this.dueDate}</p>
                <p>Priority: ${this.priority}</p>
            </div>
            <div class="task-actions">
                <button class="edit-task">Edit</button>
                <button class="delete-task">Delete</button>
            </div>
        `;
        taskDiv.__task = this;

        const checkbox = taskDiv.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => this.toggleCompleted());

        const editButton = taskDiv.querySelector('.edit-task');
        const deleteButton = taskDiv.querySelector('.delete-task');

        editButton.addEventListener('click', () => this.edit());
        deleteButton.addEventListener('click', () => this.delete());

        this.element = taskDiv;
    }

    toggleCompleted() {
        this.completed = !this.completed;
        this.element.classList.toggle('completed', this.completed);
        if (this.taskPlanner) {
            this.taskPlanner.saveToLocalStorage();
        }
    }

    edit() {
        if (this.taskPlanner) {
            this.taskPlanner.editTask(this);
        }
    }

    delete() {
        if (this.taskPlanner) {
            this.taskPlanner.deleteTask(this);
        }
    }

    update(title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        const oldElement = this.element;
        this.createTaskElement(); // Recreate the element with updated information
        this.element.querySelector('.task-checkbox').checked = this.completed;
        if (oldElement && oldElement.parentNode) {
            oldElement.parentNode.replaceChild(this.element, oldElement);
        }
    }

    render() {
        return this.element;
    }

    toJSON() {
        return {
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            priority: this.priority,
            completed: this.completed
        };
    }
}