import React, { useState } from "react";
import { BookStatus, Book } from "../types";
import { addBook } from "../firebaseBooks";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=";

interface AddBookModalProps {
  userId: string;
  onClose: () => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ userId, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [status, setStatus] = useState<BookStatus>("wantToRead");
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualPages, setManualPages] = useState(0);
  const [manualCover, setManualCover] = useState("");
  const [manualStatus, setManualStatus] = useState<BookStatus>("wantToRead");
  const [manualPagesRead, setManualPagesRead] = useState(0);

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSelected(null); // Reset selected so results show
    try {
      const res = await fetch(GOOGLE_BOOKS_API + encodeURIComponent(query));
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      setError("Failed to fetch books.");
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!selected) return;
    if (status === "currentlyReading" && pagesRead > (selected.volumeInfo.pageCount || 0)) {
      setError(`Pages read cannot exceed total pages (${selected.volumeInfo.pageCount || 0}).`);
      return;
    }
    const book: Omit<Book, "id"> = {
      title: selected.volumeInfo.title,
      author: selected.volumeInfo.authors?.join(", ") || "Unknown",
      cover: selected.volumeInfo.imageLinks?.thumbnail || "",
      totalPages: selected.volumeInfo.pageCount || 0,
      pagesRead: status === "finished" ? selected.volumeInfo.pageCount || 0 : status === "currentlyReading" ? pagesRead : 0,
      status,
      userId,
    };
    await addBook(book);
    onClose();
  };

  const handleManualAdd = async () => {
    if (!manualTitle.trim() || !manualAuthor.trim() || manualPages <= 0) {
      setError("Please fill in all required fields and enter a valid page count.");
      return;
    }
    if (manualStatus === "currentlyReading" && manualPagesRead > manualPages) {
      setError(`Pages read cannot exceed total pages (${manualPages}).`);
      return;
    }
    const book: Omit<Book, "id"> = {
      title: manualTitle,
      author: manualAuthor,
      cover: manualCover,
      totalPages: manualPages,
      pagesRead: manualStatus === "finished" ? manualPages : manualStatus === "currentlyReading" ? manualPagesRead : 0,
      status: manualStatus,
      userId,
    };
    await addBook(book);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 420, maxHeight: 600, overflowY: "auto", boxShadow: "none", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Add a Book</h2>
        {!manualMode && !selected ? (
          <>
            <form onSubmit={searchBooks} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN"
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
                autoFocus
              />
              <button type="submit" style={{ background: "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 16, cursor: "pointer", minWidth: 100 }} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
            <button onClick={() => {
              setManualMode(true);
              setError("");
              setResults([]);
            }} style={{ background: "#eee", color: "#4CAF93", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%", marginBottom: 8 }}>
              Can't find your book? Add manually
            </button>
          </>
        ) : null}
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        {manualMode && (
          <form onSubmit={e => { e.preventDefault(); handleManualAdd(); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              placeholder="Book Title*"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
              required
              autoFocus
            />
            <input
              type="text"
              value={manualAuthor}
              onChange={e => setManualAuthor(e.target.value)}
              placeholder="Author*"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
              required
            />
            <input
              type="number"
              min={1}
              value={manualPages === 0 ? '' : manualPages}
              onChange={e => {
                const val = e.target.value;
                if (val === '') {
                  setManualPages(0);
                } else {
                  const num = Number(val);
                  if (!isNaN(num)) {
                    setManualPages(num);
                  }
                }
              }}
              placeholder="Total Pages*"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
              required
            />
            <input
              type="text"
              value={manualCover}
              onChange={e => setManualCover(e.target.value)}
              placeholder="Cover Image URL (optional)"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
            />
            <div style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 500, fontSize: 15, marginRight: 8 }}>Status:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setManualStatus('wantToRead')}
                  style={{ background: manualStatus === 'wantToRead' ? '#4CAF93' : '#f7f8fa', color: manualStatus === 'wantToRead' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                >
                  Want to Read
                </button>
                <button
                  type="button"
                  onClick={() => setManualStatus('currentlyReading')}
                  style={{ background: manualStatus === 'currentlyReading' ? '#4CAF93' : '#f7f8fa', color: manualStatus === 'currentlyReading' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setManualStatus('finished')}
                  style={{ background: manualStatus === 'finished' ? '#4CAF93' : '#f7f8fa', color: manualStatus === 'finished' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 8, padding: '8px 16px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                >
                  Completed
                </button>
              </div>
            </div>
            {manualStatus === "currentlyReading" && (
              <div>
                <label style={{ fontWeight: 500, fontSize: 15, marginRight: 8 }}>Pages Read:</label>
                <input
                  type="number"
                  min={0}
                  max={manualPages}
                  value={manualPagesRead === 0 ? '' : manualPagesRead}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      setManualPagesRead(0);
                    } else {
                      const num = Number(val);
                      if (!isNaN(num)) {
                        setManualPagesRead(num);
                      }
                    }
                  }}
                  style={{ border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 16, width: 100 }}
                />
              </div>
            )}
            <button type="submit" style={{ background: "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%" }}>
              Add Book
            </button>
            <button type="button" onClick={() => {
              setManualMode(false);
              setError("");
              setResults([]);
            }} style={{ background: "none", color: "#4CAF93", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%", marginTop: 8 }}>
              Back to Search
            </button>
          </form>
        )}
        {!selected && !manualMode && results.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {results.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 10, borderBottom: "1px solid #eee", cursor: "pointer" }} onClick={() => setSelected(item)}>
                <img src={item.volumeInfo.imageLinks?.thumbnail || ""} alt={item.volumeInfo.title} style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 6, background: "#f7f8fa" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{item.volumeInfo.title}</div>
                  <div style={{ color: "#888", fontSize: 14 }}>{item.volumeInfo.authors?.join(", ")}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{item.volumeInfo.pageCount} pages</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selected && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <img src={selected.volumeInfo.imageLinks?.thumbnail || ""} alt={selected.volumeInfo.title} style={{ width: 60, height: 90, objectFit: "cover", borderRadius: 8, background: "#f7f8fa" }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{selected.volumeInfo.title}</div>
                <div style={{ color: "#888", fontSize: 14 }}>{selected.volumeInfo.authors?.join(", ")}</div>
                <div style={{ color: "#888", fontSize: 13 }}>{selected.volumeInfo.pageCount} pages</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500, fontSize: 15, marginRight: 8 }}>Status:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStatus('wantToRead')}
                  style={{
                    background: status === 'wantToRead' ? '#4CAF93' : '#f7f8fa',
                    color: status === 'wantToRead' ? '#fff' : '#222',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Want to Read
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('currentlyReading')}
                  style={{
                    background: status === 'currentlyReading' ? '#4CAF93' : '#f7f8fa',
                    color: status === 'currentlyReading' ? '#fff' : '#222',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('finished')}
                  style={{
                    background: status === 'finished' ? '#4CAF93' : '#f7f8fa',
                    color: status === 'finished' ? '#fff' : '#222',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  Completed
                </button>
              </div>
            </div>
            {status === "currentlyReading" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginRight: 8 }}>Pages Read:</label>
                <input
                  type="number"
                  min={0}
                  max={selected.volumeInfo.pageCount || 0}
                  value={pagesRead === 0 ? '' : pagesRead}
                  onChange={e => {
                    const val = e.target.value;
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
              </div>
            )}
            <button onClick={handleAdd} style={{ background: "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%" }}>
              Add Book
            </button>
            <button onClick={() => setSelected(null)} style={{ background: "none", color: "#4CAF93", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%", marginTop: 8 }}>
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBookModal;
