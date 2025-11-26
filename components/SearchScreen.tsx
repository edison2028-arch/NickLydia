import React, { useState, useMemo } from 'react';
import { Table, SearchResult } from '../types';

interface SearchScreenProps {
  tables: Table[];
  onSelectTable: (tableId: string) => void;
  onToggleCheckIn: (tableId: string, guestId: string) => void;
  onAddPlusOne: (tableId: string, parentGuestId: string) => void;
  onRemovePlusOne: (tableId: string, parentGuestId: string) => void;
  onMoveGuest: (guestId: string, targetTableId: string) => void;
  onRemoveGuest: (tableId: string, guestId: string) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ 
  tables, 
  onSelectTable,
  onToggleCheckIn,
  onAddPlusOne,
  onRemovePlusOne,
  onMoveGuest,
  onRemoveGuest
}) => {
  const [query, setQuery] = useState('');
  const [movingGuestId, setMovingGuestId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerms = query.toLowerCase().trim();
    const matches: SearchResult[] = [];

    tables.forEach(table => {
      table.guests.forEach(guest => {
        if (guest.name.toLowerCase().includes(searchTerms)) {
          matches.push({
            tableId: table.id,
            guestId: guest.id,
            guestName: guest.name,
            category: table.category,
            isCheckedIn: guest.isCheckedIn,
            isPlusOne: guest.isPlusOne
          });
        }
      });
    });

    return matches;
  }, [query, tables]);

  // Helper to count +1s for a specific guest
  const getPlusOneCount = (tableId: string, guestId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return 0;
    return table.guests.filter(g => g.parentId === guestId).length;
  };

  const handleConfirmMove = (guestId: string, targetTableId: string) => {
    if (guestId && targetTableId) {
      onMoveGuest(guestId, targetTableId);
      setMovingGuestId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-wedding-bg">
      {/* Header */}
      <div className="bg-wedding-bg p-6 pb-8 pt-12 z-10 sticky top-0">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-serif text-wedding-primary font-bold mb-2">
            歡迎蒞臨
           </h1>
           <div className="h-1 w-12 bg-wedding-primary mx-auto mb-2 opacity-50 rounded-full"></div>
           <p className="text-wedding-text text-sm opacity-80 tracking-widest uppercase">Wedding Seating Chart</p>
        </div>
        
        <div className="relative max-w-md mx-auto shadow-lg rounded-full">
          <input
            type="text"
            className="w-full bg-white border-2 border-white rounded-full py-4 px-6 text-lg text-wedding-text focus:outline-none focus:ring-2 focus:ring-wedding-primary/30 transition-all placeholder-gray-300"
            placeholder="請輸入姓名搜尋..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-wedding-primary text-white p-2 rounded-full shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {query === '' ? (
          <div className="flex flex-col items-center justify-center h-48 text-wedding-text/30">
            <p className="font-serif italic text-lg">Input your name to find your seat</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>找不到符合 "{query}" 的結果</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            {results.map((result, idx) => (
              <div 
                key={`${result.tableId}-${result.guestId}-${idx}`}
                className="flex flex-col bg-white rounded-r-xl rounded-l-md shadow-sm border border-stone-200 overflow-hidden"
              >
                {/* Top Section: Info (Similar to Card) */}
                <div className="flex min-h-[100px]">
                   {/* Left Bar */}
                  <div 
                    className={`w-24 ${result.isCheckedIn ? 'bg-[#22c55e]' : 'bg-wedding-primary'} flex flex-col items-center justify-center text-white shrink-0 p-2 transition-colors duration-300`}
                    onClick={() => onSelectTable(result.tableId)}
                  >
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                      {result.isCheckedIn ? 'CHECK-IN' : 'TABLE'}
                    </span>
                    <span className="text-3xl font-serif font-bold leading-none mt-1">
                      {result.tableId === '主桌' ? 'VIP' : result.tableId}
                    </span>
                     {result.isCheckedIn && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-4 flex flex-col justify-center relative">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className={`text-xl font-bold ${result.isCheckedIn ? 'text-green-700' : 'text-stone-800'}`}>
                        {result.guestName}
                      </h3>
                      {result.isPlusOne && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                          攜伴
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm text-stone-500">{result.category}</p>
                      <button 
                         onClick={() => onSelectTable(result.tableId)}
                         className="text-xs text-stone-400 hover:text-wedding-primary font-bold flex items-center gap-1"
                      >
                        檢視全桌 <span className="text-base">→</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Action Bar (Direct Controls) */}
                {movingGuestId === result.guestId ? (
                   /* Move UI */
                   <div className="bg-stone-50 p-3 border-t border-stone-100 animate-in fade-in slide-in-from-top-2">
                     <label className="text-xs font-bold text-stone-500 mb-1 block">移動至:</label>
                     <div className="flex gap-2">
                        <select 
                          className="flex-1 text-sm border border-stone-300 rounded p-2"
                          onChange={(e) => handleConfirmMove(result.guestId, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>選擇桌次...</option>
                          {tables.map(t => (
                            <option key={t.id} value={t.id} disabled={t.id === result.tableId}>
                              {t.id === '主桌' ? '主桌' : `${t.id}桌`} - {t.category}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => setMovingGuestId(null)}
                          className="px-3 py-1 text-xs text-stone-500 font-bold border border-stone-300 rounded bg-white"
                        >
                          取消
                        </button>
                     </div>
                   </div>
                ) : (
                  /* Standard Actions */
                  <div className="flex items-center justify-between p-3 bg-stone-50 border-t border-stone-100 gap-3">
                    {/* Check In Button */}
                    <button 
                      onClick={() => onToggleCheckIn(result.tableId, result.guestId)}
                      className={`flex-1 py-2 px-3 rounded text-sm font-bold shadow-sm transition-colors
                        ${result.isCheckedIn 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'}`}
                    >
                      {result.isCheckedIn ? '已入座' : '確認入座'}
                    </button>

                    {/* Move Button (Only for primary guests) */}
                    {!result.isPlusOne && (
                       <button 
                         onClick={() => setMovingGuestId(result.guestId)}
                         className="px-3 py-2 bg-white border border-stone-300 text-stone-600 rounded text-sm font-bold hover:bg-stone-100"
                       >
                         更換桌次
                       </button>
                    )}

                    {/* Plus One Counter (Only for primary guests) */}
                    {!result.isPlusOne && (
                      <div className="flex items-center bg-white rounded border border-stone-300 shrink-0 h-[38px]">
                        <button 
                          onClick={() => onRemovePlusOne(result.tableId, result.guestId)}
                          disabled={getPlusOneCount(result.tableId, result.guestId) === 0}
                          className="w-8 h-full text-stone-500 hover:text-red-500 disabled:opacity-30 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-stone-700">
                          {getPlusOneCount(result.tableId, result.guestId)}
                        </span>
                        <button 
                          onClick={() => onAddPlusOne(result.tableId, result.guestId)}
                          className="w-8 h-full text-stone-500 hover:text-green-600 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}

                     {/* Delete Button (Trash) */}
                     <button
                        onClick={() => onRemoveGuest(result.tableId, result.guestId)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;