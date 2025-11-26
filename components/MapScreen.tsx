import React from 'react';
import { Table } from '../types';

interface MapScreenProps {
  tables: Table[];
  onSelectTable: (tableId: string) => void;
}

const MapScreen: React.FC<MapScreenProps> = ({ tables, onSelectTable }) => {
  
  // Helper to get table by ID
  const getTable = (id: string) => tables.find(t => t.id === id);

  // Reusable Table Circle Component
  const TableCircle = ({ id, className = "" }: { id: string, className?: string }) => {
    const table = getTable(id);
    // If table doesn't exist in data, don't render (or render placeholder)
    if (!table) return <div className={`w-20 h-20 invisible ${className}`} />;

    const isOverCapacity = table.guests.length > 10;

    return (
      <div 
        onClick={() => onSelectTable(id)}
        className={`relative w-24 h-24 rounded-full bg-white border-2 ${isOverCapacity ? 'border-red-400 ring-2 ring-red-100' : 'border-white'} shadow-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ${className}`}
      >
        <span className="text-[10px] text-gray-500 font-bold mb-0.5">{table.category}</span>
        <span className="text-3xl font-serif font-bold text-wedding-primary leading-none">{id}</span>
        <span className="text-[10px] text-gray-400 mt-0.5">桌</span>
        
        {/* Seats Indicator */}
        <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${isOverCapacity ? 'bg-red-500 text-white' : 'bg-wedding-primary text-white'}`}>
           {isOverCapacity && <span className="text-[10px]">⚠️</span>}
           <span className="text-[10px]">{table.guests.length}/10</span>
        </div>
      </div>
    );
  };

  const MainTable = () => {
    const table = getTable("主桌");
    if (!table) return null;
    
    // Main table has capacity of 12
    const capacity = 12;
    const isOverCapacity = table.guests.length > capacity;

    return (
      <div 
        onClick={() => table && onSelectTable("主桌")}
        className={`w-40 h-40 rounded-full bg-white border-4 ${isOverCapacity ? 'border-red-400 ring-4 ring-red-100' : 'border-wedding-primary/20'} shadow-xl flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform mb-8 mx-auto relative z-10`}
      >
        <h2 className="text-3xl font-serif font-bold text-wedding-primary mb-1">主桌</h2>
        <span className="text-xs text-gray-500">Main Table</span>
        {table && (
           <div className={`absolute -bottom-3 ${isOverCapacity ? 'bg-red-500' : 'bg-wedding-primary'} text-white text-xs px-3 py-1 rounded-full shadow-sm`}>
             {isOverCapacity && <span className="mr-1">⚠️</span>}
             {table.guests.length} 位
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-wedding-bg overflow-auto relative">
      <div className="min-h-full min-w-[360px] p-8 pb-32 flex flex-col items-center">
        
        {/* Title / Header */}
        <div className="absolute top-4 left-4 z-0 opacity-10 pointer-events-none">
             <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-wedding-primary">
                 <path d="M20,50 Q40,10 80,50 T100,50" strokeWidth="2" />
             </svg>
        </div>

        {/* Layout Container */}
        <div className="w-full max-w-4xl relative">
          
          {/* Top Section: Main Table */}
          <MainTable />

          {/* Columns Section */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 justify-items-center">
            
            {/* Column 1 */}
            <div className="flex flex-col gap-6 pt-0">
               <TableCircle id="1" />
               <TableCircle id="6" />
               <TableCircle id="10" />
               <TableCircle id="15" />
               <TableCircle id="19" />
               <TableCircle id="23" />
            </div>

            {/* Column 2 (Offset slightly down visually in typical layouts, or aligned) */}
            <div className="flex flex-col gap-6 pt-12">
               <TableCircle id="2" />
               <TableCircle id="7" />
               <TableCircle id="11" />
               <TableCircle id="16" />
               <TableCircle id="20" />
               <TableCircle id="25" />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-6 pt-12">
               <TableCircle id="3" />
               <TableCircle id="8" />
               <TableCircle id="12" />
               <TableCircle id="17" />
               <TableCircle id="21" />
               <TableCircle id="26" />
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-6 pt-0">
               <TableCircle id="5" />
               <TableCircle id="9" />
               <TableCircle id="13" />
               <TableCircle id="18" />
               <TableCircle id="22" />
               <TableCircle id="27" />
               <TableCircle id="28" />
            </div>

          </div>

          {/* Background Decorations (Simple CSS shapes) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] border border-wedding-primary/5 rounded-[4rem] pointer-events-none -z-0" />
          <div className="text-center mt-12 text-wedding-primary/40 font-serif italic">
             令潔 & 正章 婚宴
          </div>

        </div>
      </div>
    </div>
  );
};

export default MapScreen;