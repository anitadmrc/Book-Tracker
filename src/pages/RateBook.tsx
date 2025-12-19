import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getBookById } from "../firebaseBookSingle";
import { updateBookRating } from "../firebaseBooks";
import { Book } from "../types";

const RateBook: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [journal, setJournal] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    getBookById(bookId)
      .then(b => {
        if (b) {
          setBook(b);
          setRating(b.rating || 0);
          setJournal(b.journal || "");
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

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setSubmitting(true);
    try {
      await updateBookRating(book.id, rating, journal);
      setSubmitting(false);
      navigate("/");
    } catch (err) {
      setError("Failed to update rating. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !book) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error || 'Book not found.'}</div>;

  return (
    <div style={{ background: '#eafaf3', minHeight: '100vh' }}>
        <div style={{ maxWidth: 600, margin: "0 auto", marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ fontWeight: 700, fontSize: 26, margin: 0 }}>Rate Book</h2>
            <Link to="/" style={{ color: "#4CAF93", fontWeight: 500, textDecoration: "none", fontSize: 16, lineHeight: '26px' }}>&larr; Back to Dashboard</Link>
          </div>
          <div style={{ color: "#888", fontSize: 16, marginBottom: 32 }}>Give your rating for this book</div>
        </div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: "0 2px 8px #e0e2e6", padding: 32, maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <img src={book.cover} alt={book.title} style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 8, marginRight: 24 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{book.title}</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>{book.author}</div>
            <div style={{ color: "#888", fontSize: 14 }}>Total: {book.totalPages} pages</div>
          </div>
        </div>
        <form onSubmit={handleRate} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: '100%' }}>
          <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>Your Rating:</div>
          <div style={{ display: "flex", gap: 8, fontSize: 32, marginBottom: 16 }}>
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                style={{ cursor: "pointer", color: star <= rating ? "#f7b500" : "#ddd", transition: "color 0.2s" }}
                onClick={() => setRating(star)}
                data-testid={`star-${star}`}
              >
                ★
              </span>
            ))}
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label htmlFor="journal" style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', textAlign: 'center' }}>Your Thoughts (Journal Entry):</label>
            <textarea
              id="journal"
              value={journal}
              onChange={e => setJournal(e.target.value)}
              placeholder="Share your thoughts, opinions, or a review of this book..."
              style={{ width: '80%', minHeight: 90, borderRadius: 8, border: '1px solid rgba(221,221,221,0.5)', padding: 12, fontSize: 15, resize: 'vertical', marginBottom: 8, fontFamily: 'inherit', textAlign: 'left', color: '#222', outline: 'none', boxShadow: '0 0 0 2px rgba(0,0,0,0.5)' }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.5)'}
              onBlur={e => e.target.style.boxShadow = 'none'}
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            style={{ background: submitting ? "#a5d6c7" : "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer" }}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Rating & Journal"}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
};

export default RateBook;
