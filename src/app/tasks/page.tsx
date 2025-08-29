// "use client"
import React from 'react'

interface Task {
    id: string | number;
    title: string;
    completed: boolean;
}

async function TaskPage() {
    const response = await fetch('http://localhost:3000/api/tasks');
    const tasks: Task[] = await response.json();
    // console.log(tasks);
    return (
        <div>
            <h1>Task List</h1>
            <ul>
                {tasks.map((task: Task) => (
                    <li key={task.id}>
                        {task.title} - {task.completed ? "Completed" : "Pending"}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TaskPage