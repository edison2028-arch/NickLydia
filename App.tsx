
import React, { useState, useEffect } from 'react';
import SearchScreen from './components/SearchScreen';
import MapScreen from './components/MapScreen';
import TableModal from './components/TableModal';
import { ViewState, Table, Guest } from './types';
import { INITIAL_SEATING_DATA } from './constants';

// Firebase imports
import { db } from './firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('SEARCH');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // App State
  const [tables, setTables] = useState<Table[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Data (Firebase or Local)
  useEffect(() => {
    // 1. Prepare Initial Data Structure
    const defaultTables: Table[] = INITIAL_SEATING_DATA.map(raw => ({
      ...raw,
      guests: raw.guests.map((name, idx) => ({
        id: `${raw.id}-${idx}-${Date.now()}`, // Unique ID
        name: name,
        isPlusOne: false,
        isCheckedIn: false,
      }))
    }));

    if (db) {
      console.log("Connecting to Firebase...");
      // Subscribe to Firestore updates
      const unsub = onSnapshot(doc(db, "wedding", "seating_chart"), (docSnap) => {
        if (docSnap.exists()) {
          // Sync from Cloud
          const data = docSnap.data();
          if (data && data.tables) {
             setTables(data.tables);
             setIsOnline(true);
          }
        } else {
          // Cloud empty, initialize it with default
          setDoc(doc(db, "wedding", "seating_chart"), { tables: defaultTables })
            .then(() => console.log("Initialized Firebase DB"))
            .catch(e => console.error("Error init DB", e));
          
          setTables(defaultTables);
          setIsOnline(true);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firebase connection error:", error);
        setIsOnline(false); // Fallback to local if permission denied or network error
        loadLocal(defaultTables);
        setLoading(false);
      });

      return () => unsub();
    } else {
      // Offline / Local Mode
      loadLocal(defaultTables);
      setLoading(false);
    }
  }, []);

  const loadLocal = (defaultTables: Table[]) => {
    const savedData = localStorage.getItem('wedding_seating_data');
    if (savedData) {
      setTables(JSON.parse(savedData));
    } else {
      setTables(defaultTables);
    }
  };

  // Helper to save data (Router between Cloud and Local)
  const saveTables = (newTables: Table[]) => {
    // Optimistic UI update
    setTables(newTables);

    if (db && isOnline) {
      // Save to Cloud
      setDoc(doc(db, "wedding", "seating_chart"), { tables: newTables })
        .catch(err => {
          console.error("Save failed:", err);
          alert("儲存失敗，請檢查網路連線");
        });
    } else {
      // Save to Local
      localStorage.setItem('wedding_seating_data', JSON.stringify(newTables));
    }
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
  };

  const handleCloseModal = () => {
    setSelectedTableId(null);
  };

  const handleGoToMap = () => {
    setSelectedTableId(null);
    setCurrentView('MAP');
  };

  // --- Logic for Guests ---

  const addManualGuest = (tableId: string, name: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;
      // Generate a robust unique ID
      const newGuest: Guest = {
        id: `manual-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: name,
        isPlusOne: false,
        isCheckedIn: false
      };
      return {
        ...table,
        guests: [...table.guests, newGuest]
      };
    });
    saveTables(newTables);
  };

  const removeGuest = (tableId: string, guestId: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;

      // 1. Check if guest exists
      const guestToRemove = table.guests.find(g => g.id === guestId);
      if (!guestToRemove) return table;

      // 2. Identify IDs to remove (Guest + their +1s)
      const idsToRemove = new Set<string>();
      idsToRemove.add(guestId);

      // Find children
      table.guests.forEach(g => {
        if (g.parentId === guestId) {
          idsToRemove.add(g.id);
        }
      });

      // 3. Filter
      return {
        ...table,
        guests: table.guests.filter(g => !idsToRemove.has(g.id))
      };
    });
    saveTables(newTables);
  };

  const updateGuestName = (tableId: string, guestId: string, newName: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;
      return {
        ...table,
        guests: table.guests.map(g => {
          if (g.id === guestId) {
            return { ...g, name: newName };
          }
          return g;
        })
      };
    });
    saveTables(newTables);
  };

  const updateTableCategory = (tableId: string, newCategory: string) => {
    const newTables = tables.map(table => {
      if (table.id === tableId) {
        return { ...table, category: newCategory };
      }
      return table;
    });
    saveTables(newTables);
  };

  const updateTableNote = (tableId: string, newNote: string) => {
    const newTables = tables.map(table => {
      if (table.id === tableId) {
        return { ...table, note: newNote };
      }
      return table;
    });
    saveTables(newTables);
  };

  const handleToggleCheckIn = (tableId: string, guestId: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;
      return {
        ...table,
        guests: table.guests.map(guest => {
          if (guest.id === guestId) {
            return { ...guest, isCheckedIn: !guest.isCheckedIn };
          }
          return guest;
        })
      };
    });
    saveTables(newTables);
  };
  
  const addPlusOne = (tableId: string, parentGuestId: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;

      const parent = table.guests.find(g => g.id === parentGuestId);
      if (!parent) return table;

      const newGuest: Guest = {
        id: `plusone-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: `${parent.name}-親友`,
        isPlusOne: true,
        isCheckedIn: false,
        parentId: parentGuestId
      };

      return {
        ...table,
        guests: [...table.guests, newGuest]
      };
    });
    saveTables(newTables);
  };

  const removePlusOne = (tableId: string, parentGuestId: string) => {
    const newTables = tables.map(table => {
      if (table.id !== tableId) return table;

      // Find the LAST plus one added by this parent
      const children = table.guests.filter(g => g.parentId === parentGuestId);
      if (children.length === 0) return table;

      const lastChild = children[children.length - 1];

      return {
        ...table,
        guests: table.guests.filter(g => g.id !== lastChild.id)
      };
    });
    saveTables(newTables);
  };

  const moveGuest = (guestId: string, targetTableId: string) => {
    // 1. Find the guest and all their linked +1s
    let guestsToMove: Guest[] = [];
    let sourceTableId = '';

    // Locate guests
    tables.forEach(t => {
      const primary = t.guests.find(g => g.id === guestId);
      if (primary) {
        sourceTableId = t.id;
        guestsToMove.push(primary);
        // Find children
        const children = t.guests.filter(g => g.parentId === guestId);
        guestsToMove = [...guestsToMove, ...children];
      }
    });

    if (!sourceTableId || sourceTableId === targetTableId) return;

    // 2. Perform Move
    const newTables = tables.map(table => {
      // Remove from source
      if (table.id === sourceTableId) {
        return {
          ...table,
          guests: table.guests.filter(g => !guestsToMove.find(m => m.id === g.id))
        };
      }
      // Add to target
      if (table.id === targetTableId) {
        return {
          ...table,
          guests: [...table.guests, ...guestsToMove]
        };
      }
      return table;
    });
    saveTables(newTables);
  };

  // derived selected table
  const selectedTable = tables.find(t => t.id === selectedTableId) || null;

  if (loading) {
     return (
        <div className="h-screen w-screen flex items-center justify-center bg-wedding-bg">
           <div className="text-wedding-primary font-serif animate-pulse text-xl">載入座位表中...</div>
        </div>
     );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-wedding-bg">
      
      {/* Cloud Status Indicator */}
      <div className="absolute top-0 right-0 p-2 z-50">
        {isOnline ? (
          <span className="flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        ) : (
          <span className="relative inline-flex rounded-full h-3 w-3 bg-stone-400" title="Offline Mode"></span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentView === 'SEARCH' && (
          <SearchScreen 
            tables={tables}
            onSelectTable={(id) => handleSelectTable(id)}
            onToggleCheckIn={handleToggleCheckIn}
            onAddPlusOne={addPlusOne}
            onRemovePlusOne={removePlusOne}
            onMoveGuest={moveGuest}
            onRemoveGuest={removeGuest}
          />
        )}
        {currentView === 'MAP' && (
          <MapScreen 
            tables={tables}
            onSelectTable={handleSelectTable} 
          />
        )}
      </div>

      {/* Modal Overlay */}
      {selectedTable && (
        <TableModal 
          table={selectedTable}
          allTables={tables} 
          onClose={handleCloseModal}
          onViewMap={handleGoToMap}
          onAddManualGuest={addManualGuest}
          onRemoveGuest={removeGuest}
          onUpdateGuestName={updateGuestName}
          onUpdateTableCategory={updateTableCategory}
          onUpdateTableNote={updateTableNote}
          onToggleCheckIn={handleToggleCheckIn}
          onAddPlusOne={addPlusOne}
          onRemovePlusOne={removePlusOne}
          onMoveGuest={moveGuest}
        />
      )}

      {/* Bottom Navigation Bar */}
      <div className="h-16 bg-white/90 backdrop-blur-md border-t border-wedding-primary/10 flex justify-around items-center z-40 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setCurrentView('SEARCH')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === 'SEARCH' ? 'text-wedding-primary' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-bold font-serif">找座位</span>
        </button>

        <button 
          onClick={() => setCurrentView('MAP')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === 'MAP' ? 'text-wedding-primary' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
          </svg>
          <span className="text-xs font-bold font-serif">平面圖</span>
        </button>
      </div>

    </div>
  );
};

export default App;
