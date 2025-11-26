import React, { useState } from 'react';
import { Table, Guest } from '../types';

interface TableModalProps {
  table: Table;
  allTables: Table[];
  onClose: () => void;
  onViewMap: () => void;
  onAddManualGuest: (tableId: string, name: string) => void;
  onRemoveGuest: (tableId: string, guestId: string) => void;
  onUpdateGuestName: (tableId: string, guestId: string, newName: string) => void;
  onUpdateTableCategory: (tableId: string, newCategory: string) => void;
  onUpdateTableNote: (tableId: string, newNote: string) => void;
  onToggleCheckIn: (tableId: string, guestId: string) => void;
  onAddPlusOne: (tableId: string, parentGuestId: string) => void;
  onRemovePlusOne: (tableId: string, parentGuestId: string) => void;
  onMoveGuest: (guestId: string, targetTableId: string) => void;
}

const TableModal: React.FC<TableModalProps> = ({ 
  table, 
  allTables,
  onClose, 
  onViewMap,
  onAddManualGuest,
  onRemoveGuest,
  onUpdateGuestName,
  onUpdateTableCategory,
  onUpdateTableNote,
  onToggleCheckIn,
  onAddPlusOne,
  onRemovePlusOne,
  onMoveGuest
}) => {
  const [movingGuestId, setMovingGuestId] = useState<string | null>(null);
  const [addingName, setAddingName] = useState<string>('');
  const [addingSlotIndex, setAddingSlotIndex] = useState<number | null>(null);
  
  // Edit Guest State
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Edit Table Category State
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Edit Note State
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Capacity Logic: Main Table = 12, Others = 10
  const capacity = table.id === '主桌' ? 12 : 10;
  
  // Generate slots: At least capacity, but expand if there are more guests
  // We add +1 to allow adding a new guest always at the end
  const slotCount = Math.max(capacity, table.guests.length + 1);
  
  const slots = Array.from({ length: slotCount }, (_, i) => {
    return table.guests[i] || null;
  });

  const handleStartMove = (guest: Guest) => {
    setMovingGuestId(guest.id);
  };

  const handleConfirmMove = (targetTableId: string) => {
    if (movingGuestId) {
      onMoveGuest(movingGuestId, targetTableId);
      setMovingGuestId(null);
    }
  };

  const handleSaveNewGuest = () => {
    if (addingName.trim()) {
      onAddManualGuest(table.id, addingName.trim());
      setAddingName('');
      setAddingSlotIndex(null);
    }
  };

  const startEditing = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setEditingName(guest.name);
  };

  const saveEditing = (guestId: string) => {
    if (editingName.trim()) {
      onUpdateGuestName(table.id, guestId, editingName.trim());
      setEditingGuestId(null);
    }
  };

  // Category Edit Handlers
  const handleStartEditCategory = () => {
    setEditingCategoryName(table.category);
    setIsEditingCategory(true);
  };

  const handleSaveCategory = () => {
    if (editingCategoryName.trim()) {
      onUpdateTableCategory(table.id, editingCategoryName.trim());
    }
    setIsEditingCategory(false);
  };

  // Note Edit Handlers
  const handleStartEditNote = () => {
    setNoteText(table.note || '');
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    onUpdateTableNote(table.id, noteText.trim());
    setIsEditingNote(false);
  };

  const getPlusOneCount = (guestId: string) => {
    return table.guests.filter(g => g.parentId === guestId).length;
  };

  const isOverCapacity = table.guests.length > capacity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Card Container */}
      <div className="relative bg-[#f5f5f4] w-full max-w-md h-[85vh] sm:h-[80vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-wedding-primary flex items-center gap-2">
              <span className="bg-wedding-primary text-white text-xs px-2 py-1 rounded">
                {table.id === '主桌' ? 'VIP' : `TABLE ${table.id}`}
              </span>
              <span>{table.id === '主桌' ? '主桌' : `桌次 ${table.id}`}</span>
            </h2>
            
             {/* Editable Category Section */}
             <div className="text-stone-500 text-sm mt-1 flex items-center gap-2 min-h-[28px]">
              {isEditingCategory ? (
                <div className="flex items-center gap-2 mt-1">
                   <input 
                      type="text" 
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="border border-stone-300 rounded px-2 py-0.5 text-sm w-32 focus:outline-none focus:border-wedding-primary"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
                   />
                   <button onClick={handleSaveCategory} className="text-green-600 hover:bg-green-50 rounded p-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   </button>
                   <button onClick={() => setIsEditingCategory(false)} className="text-red-500 hover:bg-red-50 rounded p-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                   </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={handleStartEditCategory}>
                   <span className="font-bold">{table.category}</span>
                   <span className="text-stone-300 group-hover:text-stone-400">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                     </svg>
                   </span>
                   <span className="text-stone-300 mx-1">•</span>
                   <span className={`${isOverCapacity ? 'text-red-600 font-bold' : ''}`}>
                     {table.guests.length} 位賓客
                     {isOverCapacity && <span className="ml-1">⚠️ (超額 {table.guests.length - capacity})</span>}
                   </span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-stone-100">
          
          {slots.map((guest, idx) => (
            <div key={guest ? guest.id : `empty-${idx}`} className="w-full">
              {guest ? (
                // Guest Card (Matches design style)
                <div className={`flex bg-white rounded-r-xl rounded-l-md shadow-sm border ${idx >= capacity ? 'border-red-200 ring-1 ring-red-100' : 'border-stone-200'} overflow-hidden min-h-[140px]`}>
                  {/* Left Bar (Wine Red or Green based on status) */}
                  <div className={`w-24 ${guest.isCheckedIn ? 'bg-[#22c55e]' : (idx >= capacity ? 'bg-rose-500' : 'bg-wedding-primary')} flex flex-col items-center justify-center text-white shrink-0 p-2 transition-colors duration-300`}>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                       {guest.isCheckedIn ? 'Check-in' : 'Table'}
                    </span>
                    <span className="text-4xl font-serif font-bold leading-none">{table.id === '主桌' ? 'VIP' : table.id}</span>
                    {guest.isCheckedIn && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-4 flex flex-col relative">
                    
                    {/* Top Row: Details & Actions */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 mr-2">
                        {editingGuestId === guest.id ? (
                           <div className="flex gap-2 items-center mb-1">
                             <input 
                               type="text"
                               value={editingName}
                               onChange={(e) => setEditingName(e.target.value)}
                               className="w-full border border-stone-300 rounded px-2 py-1 text-lg font-bold"
                               autoFocus
                               onKeyDown={(e) => e.key === 'Enter' && saveEditing(guest.id)}
                             />
                             <button onClick={() => saveEditing(guest.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             </button>
                             <button onClick={() => setEditingGuestId(null)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                           </div>
                        ) : (
                          <div className="flex items-baseline gap-2 flex-wrap relative group">
                            <h3 
                              onClick={() => startEditing(guest)}
                              className={`text-xl font-bold cursor-pointer hover:underline decoration-stone-300 underline-offset-4 ${guest.isCheckedIn ? 'text-green-700' : 'text-stone-800'}`}
                            >
                              {guest.name}
                            </h3>
                            <span className="text-xs text-stone-400">
                              {guest.isPlusOne ? '親友' : table.category}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${idx >= capacity ? 'bg-red-50 text-red-600 border-red-100' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                            {idx < capacity ? `座位 ${idx + 1}` : `加座 ${idx + 1} ⚠️`}
                          </span>
                          {guest.isPlusOne && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                              攜伴
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Top Right Action Icons */}
                      {editingGuestId !== guest.id && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => startEditing(guest)}
                            className="text-stone-400 hover:text-wedding-primary p-2 rounded-full hover:bg-stone-100 transition-colors"
                            title="編輯"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          {/* Delete Button */}
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveGuest(table.id, guest.id);
                            }}
                            className="text-stone-400 hover:text-red-600 p-2 rounded-full hover:bg-stone-100 transition-colors"
                            title="移除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Move Interface (if active) */}
                    {movingGuestId === guest.id ? (
                      <div className="absolute inset-0 bg-white z-10 flex flex-col justify-center px-4 animate-in fade-in zoom-in duration-200">
                         <label className="text-sm font-bold text-stone-600 mb-2">移動至哪個桌次?</label>
                         <select 
                            className="w-full p-2 border border-stone-300 rounded mb-2 text-sm bg-stone-50"
                            onChange={(e) => handleConfirmMove(e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>請選擇...</option>
                            {allTables.map(t => (
                              <option 
                                key={t.id} 
                                value={t.id}
                                disabled={t.id === table.id}
                              >
                                {t.id === '主桌' ? '主桌' : `${t.id}桌`} - {t.category} ({t.guests.length}人)
                              </option>
                            ))}
                         </select>
                         <button 
                            onClick={() => setMovingGuestId(null)}
                            className="text-xs text-stone-500 underline text-center"
                         >
                           取消移動
                         </button>
                      </div>
                    ) : (
                      /* Bottom Row: Actions */
                      <div className="mt-auto pt-3 flex items-end justify-between gap-3 border-t border-dashed border-stone-100">
                        <div className="flex gap-2 w-full">
                          <button 
                             onClick={() => onToggleCheckIn(table.id, guest.id)}
                             className={`flex-1 text-sm font-bold py-2 rounded shadow-md active:scale-95 transition-all duration-300
                                ${guest.isCheckedIn 
                                    ? 'bg-[#22c55e] hover:bg-green-600 text-white' 
                                    : 'bg-wedding-primary hover:bg-[#8a2626] text-white'}`}
                          >
                            {guest.isCheckedIn ? '已入座' : '確認入座'}
                          </button>
                          
                          {!guest.isPlusOne && (
                             <button 
                               onClick={() => handleStartMove(guest)}
                               className="px-3 py-2 bg-white border border-stone-300 text-stone-600 text-sm font-bold rounded shadow-sm hover:bg-stone-50 active:scale-95 transition-transform whitespace-nowrap"
                             >
                               更換桌次
                             </button>
                          )}
                        </div>

                        {/* Counter (+1 Control) */}
                        {!guest.isPlusOne && (
                          <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200 shrink-0">
                            <button 
                              onClick={() => onRemovePlusOne(table.id, guest.id)}
                              disabled={getPlusOneCount(guest.id) === 0}
                              className="w-8 h-9 flex items-center justify-center text-stone-500 hover:text-red-500 disabled:opacity-30 font-bold"
                            >
                              －
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-stone-700">
                              {getPlusOneCount(guest.id)}
                            </span>
                            <button 
                              onClick={() => onAddPlusOne(table.id, guest.id)}
                              className="w-8 h-9 flex items-center justify-center text-stone-500 hover:text-green-600 font-bold"
                            >
                              ＋
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty Slot
                <div className="w-full h-[80px] border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors">
                  {addingSlotIndex === idx ? (
                    <div className="flex gap-2 p-2 w-full max-w-[90%]">
                      <input 
                        autoFocus
                        type="text"
                        placeholder="輸入賓客姓名..."
                        className="flex-1 px-3 py-2 rounded border border-stone-300 focus:outline-none focus:ring-2 focus:ring-wedding-primary"
                        value={addingName}
                        onChange={(e) => setAddingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNewGuest()}
                      />
                      <button 
                        onClick={handleSaveNewGuest}
                        className="bg-wedding-primary text-white px-4 rounded font-bold"
                      >
                        OK
                      </button>
                      <button 
                        onClick={() => {
                          setAddingSlotIndex(null);
                          setAddingName('');
                        }}
                        className="text-stone-400 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingSlotIndex(idx)}
                      className="flex items-center gap-2 text-stone-400 font-bold hover:text-wedding-primary transition-colors w-full h-full justify-center"
                    >
                      <span className="text-xl">＋</span>
                      <span>
                        {idx < capacity ? `新增賓客到此位 (${idx + 1})` : `新增加座 (${idx + 1})`}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Table Note Section */}
          <div className="mt-4">
            {isEditingNote ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <label className="font-bold text-stone-900 block mb-2 text-sm">編輯備註</label>
                <textarea
                  className="w-full p-2 border border-yellow-300 rounded bg-white text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-stone-400"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="輸入備註事項 (例如: 兒童椅 x 2)..."
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button 
                    onClick={() => setIsEditingNote(false)}
                    className="px-3 py-1 text-xs font-bold text-stone-500 hover:bg-stone-100 rounded"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSaveNote}
                    className="px-3 py-1 text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 rounded"
                  >
                    儲存
                  </button>
                </div>
              </div>
            ) : (
              table.note ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-yellow-800 text-sm relative group">
                   <span className="text-xl">📝</span>
                   <div className="flex-1">
                     <span className="font-bold block mb-1">備註事項</span>
                     {table.note}
                   </div>
                   <button 
                     onClick={handleStartEditNote}
                     className="absolute top-2 right-2 p-1 text-yellow-600/50 hover:text-yellow-700 rounded hover:bg-yellow-100"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                </div>
              ) : (
                <button 
                  onClick={handleStartEditNote}
                  className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 font-bold hover:text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <span>📝</span> 新增備註事項
                </button>
              )
            )}
          </div>

          {/* Padding for bottom scroll */}
          <div className="h-20" />
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex shrink-0">
           <button 
            onClick={onViewMap}
            className="flex-1 bg-stone-800 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
            </svg>
            查看平面圖位置
          </button>
        </div>

      </div>
    </div>
  );
};

export default TableModal;