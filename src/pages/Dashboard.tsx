import React, { useEffect, useState } from "react";
import { MdLibraryBooks, MdMenuBook, MdCheckCircle, MdBookmarkBorder } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { listenToBooksByUser, deleteBook } from "../firebaseBooks";
import { Book } from "../types";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import AddBookModal from "../components/AddBookModal";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ section: string; open: boolean }>({ section: '', open: false });
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const unsub = listenToBooksByUser(userId, setBooks);
    return () => unsub();
  }, [userId]);

  const currentlyReading = books.filter(b => b.status === 'currentlyReading');
  const finished = books.filter(b => b.status === 'finished');
  const wantToRead = books.filter(b => b.status === 'wantToRead');

  return (
    <div style={{ background: '#eafaf3', minHeight: '100vh' }}>
      {/* Add Book Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          style={{ background: '#4CAF93', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          onClick={() => setShowAddModal(true)}
          disabled={!userId}
        >
          + Add Book
        </button>
      </div>
      {/* Overview cards */}
      <section style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Total Books" value={books.length} icon={<MdLibraryBooks size={28} color="#4CAF93" />} />
        <StatCard label="Currently Reading" value={currentlyReading.length} icon={<MdMenuBook size={28} color="#4CAF93" />} />
        <StatCard label="Finished" value={finished.length} icon={<MdCheckCircle size={28} color="#4CAF93" />} />
        <StatCard label="Want to Read" value={wantToRead.length} icon={<MdBookmarkBorder size={28} color="#4CAF93" />} />
      </section>
      {/* Book sections */}
      <Section
        title="Currently Reading"
        count={currentlyReading.length}
        onDeleteBook={() => setDeleteModal({ section: 'currentlyReading', open: true })}
      >
        {currentlyReading.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15, padding: 24, textAlign: 'center', width: '100%' }}>
            You currently have no books on this list.
          </div>
        ) : (
          currentlyReading.map(book => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              progress={`${book.pagesRead}/${book.totalPages} pages`}
              cover={book.cover}
              onUpdate={() => navigate(`/progress/${book.id}`)}
              onDelete={async () => { await deleteBook(book.id); }}
              onClick={() => { setSelectedBook(book); setShowBookModal(true); }}
            />
          ))
        )}
      </Section>
      <Section
        title="Finished"
        count={finished.length}
        onDeleteBook={() => setDeleteModal({ section: 'finished', open: true })}
      >
        {finished.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15, padding: 24, textAlign: 'center', width: '100%' }}>
            You currently have no books on this list.
          </div>
        ) : (
          finished.map(book => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              progress="Completed"
              cover={book.cover}
              rating={book.rating}
              onRate={() => navigate(`/rate/${book.id}`)}
              onDelete={async () => { await deleteBook(book.id); }}
              onClick={() => { setSelectedBook(book); setShowBookModal(true); }}
            />
          ))
        )}
      </Section>
      <Section
        title="Want to Read"
        count={wantToRead.length}
        onDeleteBook={() => setDeleteModal({ section: 'wantToRead', open: true })}
      >
        {wantToRead.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15, padding: 24, textAlign: 'center', width: '100%' }}>
            You currently have no books on this list.
          </div>
        ) : (
          wantToRead.map(book => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              progress={`${book.totalPages} pages`}
              cover={book.cover}
              onDelete={async () => { await deleteBook(book.id); }}
              onClick={() => { setSelectedBook(book); setShowBookModal(true); }}
              // Do not pass onUpdate for wantToRead section
            />
          ))
        )}
      </Section>
      {/* Delete Modal */}
      {deleteModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: 'none', position: 'relative' }}>
            <button onClick={() => { setDeleteModal({ section: '', open: false }); setBookToDelete(null); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Delete a Book</h3>
            {!bookToDelete ? (
              <>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 12 }}>Select a book to delete:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(deleteModal.section === 'currentlyReading' ? currentlyReading : deleteModal.section === 'finished' ? finished : wantToRead).map(book => (
                    <button
                      key={book.id}
                      style={{ background: '#f7f8fa', color: '#222', border: '1px solid #eee', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 15, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                      onClick={() => setBookToDelete(book)}
                    >
                      <img src={book.cover} alt={book.title} style={{ width: 32, height: 48, objectFit: 'cover', borderRadius: 6, background: '#fff' }} />
                      <span style={{ flex: 1 }}>{book.title}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#222', fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Are you sure you want to delete this book?</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <img src={bookToDelete.cover} alt={bookToDelete.title} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{bookToDelete.title}</div>
                    <div style={{ color: '#888', fontSize: 14 }}>{bookToDelete.author}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    style={{ background: '#4CAF93', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                    onClick={async () => {
                      setDeleteModal({ section: '', open: false });
                      setBookToDelete(null);
                      await deleteBook(bookToDelete.id);
                    }}
                  >
                    Yes, delete
                  </button>
                  <button
                    style={{ background: '#eee', color: '#4CAF93', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                    onClick={() => setBookToDelete(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showAddModal && userId && (
        <AddBookModal userId={userId} onClose={() => setShowAddModal(false)} />
      )}
      {showBookModal && selectedBook && (
        <BookModal book={selectedBook} onClose={() => setShowBookModal(false)} />
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px #e0e0e0", padding: 24, flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
    <span>{icon}</span>
    <div>
      <div style={{ fontWeight: 700, fontSize: 22 }}>{value}</div>
      <div style={{ color: "#888", fontSize: 14 }}>{label}</div>
    </div>
  </div>
);

const Section: React.FC<{ title: string; count: number; children: React.ReactNode; onDeleteBook?: () => void }> = ({ title, count, children, onDeleteBook }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#888", fontSize: 14 }}>{count} books</span>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, fontSize: 22, color: "#888" }}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Section menu"
          >
            &#8942;
          </button>
          {menuOpen && (
            <div style={{ position: "absolute", top: 32, right: 0, background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #e0e2e6", padding: 8, zIndex: 20, minWidth: 140 }}>
              <button
                style={{ background: "none", border: "none", color: "#4CAF93", fontWeight: 600, fontSize: 15, cursor: "pointer", padding: "8px 0", width: "100%", textAlign: "center" }}
                onClick={() => { setMenuOpen(false); onDeleteBook && onDeleteBook(); }}
              >
                Delete a book
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, justifyContent: 'flex-start', alignItems: 'center', minHeight: 120 }}>{children}</div>
    </section>
  );
};

const BookCard: React.FC<{
  title: string;
  author: string;
  progress: string;
  cover: string;
  rating?: number;
  onUpdate?: () => void;
  onRate?: () => void;
  id?: string;
  onDelete?: () => void;
  onClick?: () => void;
}> = ({ title, author, progress, cover, rating, onUpdate, onRate, id, onDelete, onClick }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 4px #e0e0e0",
        padding: 16,
        width: 180,
        minHeight: 280,
        maxHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {cover ? (
        <img src={cover} alt={title} style={{ width: 80, height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} />
      ) : (
        <div
          style={{
            width: 80,
            height: 120,
            borderRadius: 8,
            marginBottom: 12,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa',
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 4px #e0e0e0'
          }}
        >
          book cover
        </div>
      )}
      <div
        style={{
          fontWeight: 600,
          fontSize: 16,
          textAlign: "center",
          height: 44,
          lineHeight: "22px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          wordBreak: "break-word"
        }}
        title={title}
      >
        {title}
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 8, textAlign: "center", minHeight: 18 }}>{author}</div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>{progress}</div>
      {typeof rating === "number" && (
        <div style={{ color: "#f7b500", fontSize: 18, marginBottom: 4 }}>{"★".repeat(rating)}<span style={{ color: "#ddd" }}>{"★".repeat(5 - rating)}</span></div>
      )}
      {progress !== "Completed" && onUpdate && (
        <button style={{ background: "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 14, marginTop: 8 }} onClick={e => { e.stopPropagation(); onUpdate && onUpdate(); }}>Update Progress</button>
      )}
      {progress === "Completed" && (
        <button style={{ background: "#4CAF93", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 14, marginTop: 8 }} onClick={e => { e.stopPropagation(); onRate && onRate(); }}>Rate Book</button>
      )}
    </div>
  );
};

// Book Modal


const BookModalContent: React.FC<{ book: Book }> = ({ book }) => {
  const [status, setStatus] = React.useState<Book['status']>(book.status);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const handleStatusButton = (newStatus: Book['status']) => {
    setStatus(newStatus);
    setDirty(newStatus !== book.status);
  };

  const handleSave = async () => {
    if (status === book.status) return;
    setUpdatingStatus(true);
    try {
      const { updateBookProgress } = await import('../firebaseBooks');
      await updateBookProgress(book.id, book.pagesRead, status);
      setDirty(false);
    } catch {}
    setUpdatingStatus(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18, textAlign: 'left' }}>
      {book.cover ? (
        <img src={book.cover} alt={book.title} style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 8, background: '#fff' }} />
      ) : (
        <div style={{ width: 60, height: 90, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontWeight: 600, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', boxShadow: 'inset 0 1px 4px #e0e0e0' }}>book cover</div>
      )}
      <div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>{book.title}</div>
        <div style={{ color: '#888', fontSize: 15 }}>{book.author}</div>
        <div style={{ color: '#888', fontSize: 14 }}>Total: {book.totalPages} pages</div>
        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15, marginRight: 8 }}>Status:</span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => handleStatusButton('wantToRead')}
              style={{ background: status === 'wantToRead' ? '#4CAF93' : '#f7f8fa', color: status === 'wantToRead' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
              disabled={updatingStatus}
            >
              Want to Read
            </button>
            <button
              type="button"
              onClick={() => handleStatusButton('currentlyReading')}
              style={{ background: status === 'currentlyReading' ? '#4CAF93' : '#f7f8fa', color: status === 'currentlyReading' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
              disabled={updatingStatus}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => handleStatusButton('finished')}
              style={{ background: status === 'finished' ? '#4CAF93' : '#f7f8fa', color: status === 'finished' ? '#fff' : '#222', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
              disabled={updatingStatus}
            >
              Completed
            </button>
          </div>
          {dirty && (
            <button
              type="button"
              onClick={handleSave}
              style={{ background: '#4CAF93', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
              disabled={updatingStatus}
            >
              {updatingStatus ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BookModal: React.FC<{ book: Book; onClose: () => void }> = ({ book, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: 'none', position: 'relative', textAlign: 'left' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
      <BookModalContent book={book} />
      {typeof book.rating === 'number' && (
        <div style={{ color: '#222', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
          <span style={{ color: '#222', fontWeight: 600, fontSize: 15 }}>Rating:</span>
          <span style={{ color: '#f7b500', fontSize: 18, marginLeft: 8 }}>{'★'.repeat(book.rating)}<span style={{ color: '#ddd' }}>{'★'.repeat(5 - book.rating)}</span></span>
        </div>
      )}
      {book.status === 'finished' && (
        <div style={{ marginTop: 18, textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Journal Entry:</div>
          <div style={{ background: '#f7f8fa', borderRadius: 8, padding: '8px 0 8px 0', fontSize: 15, color: '#222', whiteSpace: 'pre-line', maxHeight: 180, overflowY: 'auto', textAlign: 'left' }}>{book.journal ? book.journal : <span style={{ color: '#888' }}>No journal entry yet.</span>}</div>
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;
