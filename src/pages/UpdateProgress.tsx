import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookById } from "../firebaseBookSingle";
import { updateBookProgress } from "../firebaseBooks";
import { Book, BookStatus } from "../types";

const UpdateProgress: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    getBookById(bookId)
      .then(b => {
        if (b) {
          setBook(b);
          setPagesRead(b.pagesRead); // Always update pagesRead to latest from Firestore
        } else {
          setError("Book not found.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load book.");
        setLoading(false);
      });
  }, [bookId]);

  if (loading) return <div>Loading...</div>;
  if (error || !book) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error || 'Book not found.'}</div>;

  const percent = Math.round((pagesRead / book.totalPages) * 100);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pagesRead > book.totalPages) {
      setError(`Pages read cannot exceed total pages (${book.totalPages}).`);
      return;
    }
    setUpdating(true);
    let newStatus: BookStatus = book.status;
    if (pagesRead >= book.totalPages) {
      newStatus = 'finished';
    } else if (pagesRead > 0) {
      newStatus = 'currentlyReading';
    } else {
      newStatus = 'wantToRead';
    }
    try {
      console.log('UpdateProgress: calling updateBookProgress', { bookId: book.id, pagesRead, newStatus });
      await updateBookProgress(book.id, pagesRead, newStatus);
      console.log('UpdateProgress: updateBookProgress finished');
      setUpdating(false);
      navigate("/");
    } catch (err) {
      console.error('UpdateProgress: updateBookProgress error', err);
      setUpdating(false);
      setError('Failed to update progress. Please try again.');
    }
  };

  return (
    <div style={{ background: '#eafaf3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0 }}>Update Reading Progress</h2>
          <Link to="/" style={{ color: "#4CAF93", fontWeight: 500, textDecoration: "none", fontSize: 16, lineHeight: '26px' }}>&larr; Back to Dashboard</Link>
        </div>
        <div style={{ color: "#888", fontSize: 16, marginBottom: 32 }}>Track your reading progress and automatically mark books as finished</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px #e0e2e6", padding: 32, maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {book.cover ? (
            <img src={book.cover} alt={book.title} style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 8, marginRight: 24 }} />
          ) : (
            <div style={{ width: 80, height: 120, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontWeight: 600, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', boxShadow: 'inset 0 1px 4px #e0e0e0', marginRight: 24 }}>book cover</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{book.title}</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>{book.author}</div>
            <div style={{ color: "#888", fontSize: 14 }}>Total: {book.totalPages} pages</div>
            <span style={{ background: "#eee", color: "#4CAF93", fontWeight: 600, fontSize: 13, borderRadius: 8, padding: "2px 10px", marginLeft: 8 }}>{book.status}</span>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>Current Progress</div>
          <div style={{ background: "#eee", borderRadius: 8, height: 10, width: "100%", marginBottom: 4 }}>
            <div style={{ background: "#4CAF93", height: 10, borderRadius: 8, width: `${percent}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ color: "#222", fontWeight: 600, fontSize: 15 }}>{pagesRead}/{book.totalPages} pages ({percent}%)</div>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <form onSubmit={handleUpdate} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <label htmlFor="pagesRead" style={{ fontWeight: 500, fontSize: 15 }}>Pages Read</label>
          <input
            id="pagesRead"
            type="number"
            min={0}
            max={book.totalPages}
            value={pagesRead === 0 ? '' : pagesRead}
            onChange={e => {
              const val = e.target.value;
              // Only allow numbers and empty string
              if (val === '') {
                setPagesRead(0);
              } else {
                const num = Number(val);
                if (!isNaN(num)) {
                  setPagesRead(num);
                }
              }
            }}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 16, width: 100 }}
          />
          <button
            type="submit"
            style={{ background: updating ? "#a5d6c7" : "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: updating ? "not-allowed" : "pointer" }}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Progress"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgress;
