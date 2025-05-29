import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChronoSidebar from '../ChronoSidebar';
import ChronoDesign from '../assets/ChronoDesign.png';

function HomePage() {
  const [user, setUser] = useState(null);
  const [dropdownChoices, setDropdownChoices] = useState(() => {
    const saved = sessionStorage.getItem('dropdownChoices');
    return saved ? JSON.parse(saved) : ['Profile 1', 'Profile 2', 'Profile 3', 'Profile 4', 'Profile 5'];
  });
  const [userChoice, setUserChoice] = useState(() => {
    return dropdownChoices.length > 0 ? dropdownChoices[0] : '';
  });
  const [committedChoice, setCommittedChoice] = useState(() => {
    return dropdownChoices.length > 0 ? dropdownChoices[0] : '';
  });
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(() => {
    return dropdownChoices.length > 0 ? 0 : null;
  });
  const [notesByProfile, setNotesByProfile] = useState(() => {
    const saved = sessionStorage.getItem('notesByProfile');
    return saved ? JSON.parse(saved) : {};
  });
  const [newNote, setNewNote] = useState('');
  const [activeFormats, setActiveFormats] = useState(new Set());
  const navigate = useNavigate();
  const noteInputRef = useRef(null);

  // Persist dropdownChoices to sessionStorage when changed
  useEffect(() => {
    sessionStorage.setItem('dropdownChoices', JSON.stringify(dropdownChoices));
  }, [dropdownChoices]);

  // Persist notesByProfile to sessionStorage when changed
  useEffect(() => {
    sessionStorage.setItem('notesByProfile', JSON.stringify(notesByProfile));
  }, [notesByProfile]);

  useEffect(() => {
    // Get user data from session storage
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      setUser(userData);
    }
  }, []);

  // Set notes for current committedChoice
  const notes = notesByProfile[committedChoice] || [];

  // Set userChoice to first choice when dropdown is shown and userChoice is empty, only on open
  const prevShowDropdown = useRef(false);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    if (showDropdown && !prevShowDropdown.current && dropdownChoices.length > 0) {
      if (userChoice.trim() === '') {
        setUserChoice(dropdownChoices[0]);
        setCommittedChoice(dropdownChoices[0]);
        setSelectedChoiceIndex(0);
      }
    }
    prevShowDropdown.current = showDropdown;
  }, [showDropdown, userChoice, dropdownChoices]);

  const updateActiveFormats = () => {
    const formats = new Set();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
    if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
    if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
    if (document.queryCommandState('outdent')) formats.add('outdent');
    if (document.queryCommandState('indent')) formats.add('indent');
    setActiveFormats(formats);
  };

  const handleBoldClick = () => {
    document.execCommand('bold', false, null);
    noteInputRef.current.focus();
    updateActiveFormats();
  };

  const handleInput = () => {
    setNewNote(noteInputRef.current.innerHTML);
    updateActiveFormats();
  };

  const handleSaveNote = () => {
    if (newNote.trim() === '') return;
    const updatedNotes = [newNote, ...notes];
    setNotesByProfile(prev => {
      const updated = { ...prev };
      updated[committedChoice] = updatedNotes;
      return updated;
    });
    // Save notes to session storage handled by useEffect
    // Clear input
    noteInputRef.current.innerHTML = '';
    setNewNote('');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 flex">
      <ChronoSidebar />
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-purple-600 rounded-lg flex items-center justify-center">
                  <img src={ChronoDesign} alt="ChronoDesign" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Chrono Notes</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <label htmlFor="profileDropdown" className="text-gray-700 font-medium">
                  Choose profile
                </label>
                <div className="relative" tabIndex={0} onBlur={(e) => {
                  setTimeout(() => setShowDropdown(false), 150);
                }}>
                  <input
                    id="profileDropdown"
                    type="text"
                    value={userChoice}
                    onChange={(e) => setUserChoice(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (
                          selectedChoiceIndex !== null &&
                          userChoice.trim() !== '' &&
                          userChoice.trim() !== dropdownChoices[selectedChoiceIndex]
                        ) {
                          const oldChoice = dropdownChoices[selectedChoiceIndex];
                          const newChoice = userChoice.trim();
                          // Check for duplicate (case-insensitive)
                          const duplicate = dropdownChoices.some((choice, idx) => idx !== selectedChoiceIndex && choice.toLowerCase() === newChoice.toLowerCase());
                          if (duplicate) {
                            alert('Duplicate choice. Please enter another.');
                            return;
                          }
                          setDropdownChoices(prev => {
                            const newChoices = [...prev];
                            if (newChoices.length === 5) {
                              newChoices[selectedChoiceIndex] = newChoice;
                            }
                            return newChoices;
                          });
                          // Migrate notesByProfile key from oldChoice to newChoice
                          setNotesByProfile(prev => {
                            const updated = { ...prev };
                            if (updated[oldChoice]) {
                              updated[newChoice] = updated[oldChoice];
                              delete updated[oldChoice];
                            }
                            return updated;
                          });
                          setCommittedChoice(newChoice);
                        }
                        setShowDropdown(true);
                      }
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                    placeholder="Select or type"
                    autoComplete="off"
                    tabIndex={0}
                  />
                  {showDropdown && (
                    <ul className="absolute w-32 max-h-40 overflow-auto border border-gray-300 bg-white rounded shadow-lg z-10" style={{ top: '2.5rem' }}>
                      {dropdownChoices.map((choice, index) => (
                        <li
                          key={index}
                          className="px-2 py-1 cursor-pointer hover:bg-purple-200"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setUserChoice(choice);
                            setSelectedChoiceIndex(index);
                            setCommittedChoice(choice);
                            setShowDropdown(false);
                          }}
                        >
                          {choice}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-gray-700">Welcome, {user.username}!</span>
                <button
                  onClick={() => navigate('/settings')}
                  className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center"
                  title="Profile Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                    <path d="M6 20v-2c0-2.21 3.58-4 6-4s6 1.79 6 4v2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-4">
          <h2 className="text-xl font-semibold mb-4">Your Notes</h2>

          {/* Rich Text Input with Formatting Buttons */}
          <div className="mb-4">
            <div className="mb-2 flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  document.execCommand('bold', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 font-bold ${activeFormats.has('bold') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('italic', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 italic ${activeFormats.has('italic') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Italic"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('underline', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 underline ${activeFormats.has('underline') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Underline"
                title="Underline"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('justifyLeft', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 ${activeFormats.has('justifyLeft') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Align Left"
                title="Align Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 10h12M3 14h18M3 18h12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('justifyCenter', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 ${activeFormats.has('justifyCenter') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Align Center"
                title="Align Center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 10h10M3 14h18M7 18h10" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('justifyRight', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 ${activeFormats.has('justifyRight') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Align Right"
                title="Align Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M9 10h6M3 14h18M9 18h6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('outdent', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 ${activeFormats.has('outdent') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Outdent"
                title="Outdent"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={() => {
                  document.execCommand('indent', false, null);
                  updateActiveFormats();
                }}
                className={`px-3 py-1 rounded hover:bg-gray-300 ${activeFormats.has('indent') ? 'bg-gray-400' : 'bg-gray-200'}`}
                aria-label="Indent"
                title="Indent"
              >
                {'>'}
              </button>
            </div>
            <div
              ref={noteInputRef}
              contentEditable
              onInput={handleInput}
              className="min-h-[100px] p-2 border border-gray-300 rounded bg-white focus:outline-none"
              aria-label="Note input"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-gray-600">You have no notes yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {notes.map((note, index) => (
                <div key={index} className="bg-white p-3 rounded shadow relative">
                  <button
                    onClick={() => {
                      const updatedNotes = notes.filter((_, i) => i !== index);
                      setNotesByProfile(prev => {
                        const updated = { ...prev };
                        updated[committedChoice] = updatedNotes;
                        return updated;
                      });
                      sessionStorage.setItem(`notes_${user.username}`, JSON.stringify(updatedNotes));
                    }}
                    className="absolute top-1 right-1 text-red-600 hover:text-red-800 font-bold"
                    aria-label="Delete Note"
                    title="Delete Note"
                  >
                    &times;
                  </button>
                  <div dangerouslySetInnerHTML={{ __html: note }} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
