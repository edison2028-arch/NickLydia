import React, { useState, useEffect } from 'react';
import SearchScreen from './components/SearchScreen';
import MapScreen from './components/MapScreen';
import TableModal from './components/TableModal';
import { ViewState, Table, Guest } from './types';
import { INITIAL_SEATING_DATA } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('SEARCH');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  
  // App State
  const [tables, setTables] = useState<Table[]>([]);

  // Initialize Data
  useEffect(() => {
    // In a real app, check localStorage first
    const savedData = localStorage.getItem('wedding_seating_data');
    if (savedData) {
      setTables(JSON.parse(savedData));
    } else {
      // Transform raw constants to stateful objects
      const initialTables: Table[] = INITIAL_SEATING_DATA.map(raw => ({
        ...raw,
        guests: raw.guests.map((name, idx) => ({
          id: `${raw.id}-${idx}-${Date.now()}`, // Unique ID
          name: name,
          isPlusOne: false,
          isCheckedIn: false,
        }))
      }));
      setTables(initialTables);
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem('wedding_seating_data', JSON.stringify(tables));
    }
  }, [tables]);

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
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id !== tableId) return table;
        // Generate a robust unique ID to ensure delete works reliably
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
    });
  };

  const removeGuest = (tableId: string, guestId: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id !== tableId) return table;

        // 1. Check if guest exists
        const guestToRemove = table.guests.find(g => g.id === guestId);
        if (!guestToRemove) return table;

        // 2. Identify IDs to remove (Guest + their +1s)
        const idsToRemove = new Set<string>();
        idsToRemove.add(guestId);

        // Find children (recursive not strictly needed as currently only 1 level of +1 is supported by UI, but good to be safe)
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
    });
  };

  const updateGuestName = (tableId: string, guestId: string, newName: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
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
    });
  };

  const updateTableCategory = (tableId: string, newCategory: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          return { ...table, category: newCategory };
        }
        return table;
      });
    });
  };

  const updateTableNote = (tableId: string, newNote: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          return { ...table, note: newNote };
        }
        return table;
      });
    });
  };

  const handleToggleCheckIn = (tableId: string, guestId: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
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
    });
  };
  
  const addPlusOne = (tableId: string, parentGuestId: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
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
    });
  };

  const removePlusOne = (tableId: string, parentGuestId: string) => {
    setTables(prevTables => {
      return prevTables.map(table => {
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
    });
  };

  const moveGuest = (guestId: string, targetTableId: string) => {
    setTables(prevTables => {
      // 1. Find the guest and all their linked +1s
      let guestsToMove: Guest[] = [];
      let sourceTableId = '';

      // Locate guests
      prevTables.forEach(t => {
        const primary = t.guests.find(g => g.id === guestId);
        if (primary) {
          sourceTableId = t.id;
          guestsToMove.push(primary);
          // Find children
          const children = t.guests.filter(g => g.parentId === guestId);
          guestsToMove = [...guestsToMove, ...children];
        }
      });

      if (!sourceTableId || sourceTableId === targetTableId) return prevTables;

      // REMOVED CAPACITY CHECK to allow unlimited guests

      // 2. Perform Move
      return prevTables.map(table => {
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
    });
  };

  // derived selected table
  const selectedTable = tables.find(t => t.id === selectedTableId) || null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-wedding-bg">
      
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