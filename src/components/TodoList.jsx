import { useState, useEffect } from "react";
import { getTodos, deleteTodo, updateTodo } from "../lib/firebase";
import TodoForm from "./TodoForm";

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTodo, setEditingTodo] = useState(null);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const todosData = await getTodos();
                setTodos(todosData);
            } catch (error) {
                console.error("목록을 로딩하는 데 에러가 발생했습니다.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTodos();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteTodo(id);
            setTodos(todos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error("할 일을 삭제하는 데 에러가 발생했습니다.", error);
        }
    };

    const handleEdit = (todo) => {
        setEditingTodo(todo);
    };

    const handleUpdate = async (id, updatedTodo) => {
        try {
            await updateTodo(id, updatedTodo);
            setTodos(
                todos.map((todo) =>
                    todo.id === id ? { ...todo, ...updatedTodo } : todo
                )
            );
            setEditingTodo(null);
        } catch (error) {
            console.error("할 일을 수정하는 데 에러가 발생했습니다.", error);
        }
    };

    const handleToggleComplete = async (id, completed) => {
        try {
            await updateTodo(id, { completed: !completed });
            setTodos(
                todos.map((todo) =>
                    todo.id === id ? { ...todo, completed: !completed } : todo
                )
            );
        } catch (error) {
            console.error("상태를 변경하는 데 에러가 발생했습니다.", error);
        }
    };

    const handleAddSuccess = (newTodo) => {
        setTodos([newTodo, ...todos]);
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="todo-list">
            <h2>할 일 목록</h2>
            <TodoForm
                onSuccess={handleAddSuccess}
                editingTodo={editingTodo}
                onUpdate={handleUpdate}
            />

            {todos.length === 0 ? (
                <p>할 일이 없습니다.</p>
            ) : (
                <ul>
                    {todos.map((todo) => (
                        <li
                            key={todo.id}
                            className={todo.completed ? "completed" : ""}
                        >
                            <div className="todo-header">
                                <h3>{todo.title}</h3>
                                <div className="todo-actions">
                                    <input
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() =>
                                            handleToggleComplete(
                                                todo.id,
                                                todo.completed
                                            )
                                        }
                                    />
                                    <button onClick={() => handleEdit(todo)}>
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(todo.id)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                            <p className="todo-description">
                                {todo.description}
                            </p>
                            <p className="todo-due-date">
                                마감일:{" "}
                                {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TodoList;
