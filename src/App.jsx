import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TodoPage from "./pages/TodoPage.jsx";
import "./App.css";
import "./components/Todo.css";
function App() {
    return (
        <Router>
            <Routes>
                {/* Todo 리스트 (메인 페이지로 설정) */}
                <Route path="/" element={<TodoPage />} />
            </Routes>
        </Router>
    );
}
export default App;
