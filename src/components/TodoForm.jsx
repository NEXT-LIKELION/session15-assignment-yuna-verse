import { useState, useEffect } from "react";
import { addTodo } from "../lib/firebase";

function TodoForm({ onSuccess, editingTodo, onUpdate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (editingTodo) {
            setTitle(editingTodo.title || "");
            if (editingTodo.dueDate) {
                const date = new Date(editingTodo.dueDate);
                setDueDate(date.toISOString().split("T")[0]);
            } else {
                setDueDate("");
            }
        }
    }, [editingTodo]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDueDate("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("제목을 입력해 주세요.");
            return;
        }

        if (!dueDate) {
            setError("마감일을 설정해 주세요.");
            return;
        }

        try {
            if (editingTodo) {
                await onUpdate(editingTodo.id, {
                    title,
                    description,
                    dueDate: new Date(dueDate),
                });
            } else {
                // Add mode
                const id = await addTodo(title, description, new Date(dueDate));
                if (id && onSuccess) {
                    onSuccess({
                        id,
                        title,
                        description,
                        dueDate: new Date(dueDate),
                        completed: false,
                        createdAt: new Date(),
                    });
                }
            }
            resetForm();
        } catch (error) {
            console.error(error);
            setError("할 일을 저장하는 중에 오류가 발생했습니다.");
        }
    };

    return (
        <div className="todo-form">
            <h3>{editingTodo ? "할 일 수정하기" : "새 할 일 추가하기"}</h3>
            <form onSubmit={handleSubmit}>
                {error && <p className="error">{error}</p>}

                <div className="form-group">
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="할 일 제목"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">설명</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="세부 내용을 입력하세요"
                        rows="3"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="dueDate">마감일</label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit">
                        {editingTodo ? "수정하기" : "추가하기"}
                    </button>
                    {editingTodo && (
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                if (onUpdate) {
                                    onUpdate(null);
                                }
                            }}
                        >
                            취소
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default TodoForm;
