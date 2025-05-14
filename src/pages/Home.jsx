import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPosts } from "../lib/firebase";

function Home({ posts: propPosts }) {
    const [posts, setPosts] = useState(propPosts || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (propPosts && propPosts.length > 0) {
                    setPosts(propPosts);
                } else {
                    try {
                        const postList = await getPosts();
                        setPosts(postList);
                    } catch (error) {
                        console.warn("Failed to connect to Firestore:", error);
                        setPosts([]);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [propPosts]);

    return (
        <div className="container">
            <h1 className="title">Posts</h1>

            <div className="actions">
                <Link to="/create">
                    <button className="btn">Create Post</button>
                </Link>
                <Link to="/todos">
                    <button className="btn btn-todo">To Do List</button>
                </Link>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <ul className="post-list">
                    {posts.length === 0 ? (
                        <p className="no-posts">No posts found.</p>
                    ) : (
                        posts.map((post) => (
                            <li key={post.id} className="post-item">
                                <Link to={`/edit/${post.id}`}>
                                    <strong>{post.title}</strong>
                                    <p>{post.content}</p>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}

export default Home;
