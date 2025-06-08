const { useState, useEffect } = React;

function App() {
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [readingLists, setReadingLists] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/${activeTab}`);
            const data = await response.json();
            switch (activeTab) {
                case 'books':
                    setBooks(data);
                    break;
                case 'authors':
                    setAuthors(data);
                    break;
                case 'reviews':
                    setReviews(data);
                    break;
                case 'reading-lists':
                    setReadingLists(data);
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'books':
                return (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Publisher</th>
                                    <th>Year</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.BOOK_ID}>
                                        <td>{book.TITLE}</td>
                                        <td>{book.AUTHOR_NAME}</td>
                                        <td>{book.PUBLISHER}</td>
                                        <td>{book.YEAR_PUBLISHED}</td>
                                        <td>{book.CATEGORY_NAME}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'authors':
                return (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Bio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {authors.map(author => (
                                    <tr key={author.AUTHOR_ID}>
                                        <td>{author.NAME}</td>
                                        <td>{author.BIO}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>User</th>
                                    <th>Rating</th>
                                    <th>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review.REVIEW_ID}>
                                        <td>{review.TITLE}</td>
                                        <td>{review.USERNAME}</td>
                                        <td>{review.RATING}</td>
                                        <td>{review.CONTENT}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'reading-lists':
                return (
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Book</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readingLists.map(list => (
                                    <tr key={list.LIST_ID}>
                                        <td>{list.USERNAME}</td>
                                        <td>{list.TITLE}</td>
                                        <td>{list.STATUS}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Book Management System</h1>
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
                        onClick={() => setActiveTab('books')}
                    >
                        Books
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'authors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('authors')}
                    >
                        Authors
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'reading-lists' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reading-lists')}
                    >
                        Reading Lists
                    </button>
                </li>
            </ul>
            {renderContent()}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root')); 