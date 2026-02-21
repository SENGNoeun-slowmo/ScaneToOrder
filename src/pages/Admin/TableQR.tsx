import React, { useState } from 'react';
import { useTables } from '../../hooks/useMenu';
import { supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, Download, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const TableQR: React.FC = () => {
  const { data: tables, isLoading } = useTables();
  const queryClient = useQueryClient();
  const [newTableNumber, setNewTableNumber] = useState('');

  const addTableMutation = useMutation({
    mutationFn: async (tableNumber: string) => {
      const { error } = await supabase.from('tables').insert([{ table_number: tableNumber }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setNewTableNumber('');
      toast.success('Table added successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Error adding table'),
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tables').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted');
    },
  });

  const generateUrl = (tableId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/table/${tableId}`;
  };

  const downloadQR = (tableNumber: string, tableId: string) => {
    const svg = document.getElementById(`qr-${tableId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 80; // Add space for text
      
      if (ctx) {
        // Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR
        ctx.drawImage(img, 20, 20);
        
        // Draw Text
        ctx.fillStyle = "black";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, canvas.height - 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `Table-${tableNumber}-QR.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) return <div className="p-8">Loading tables...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Table & QR Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Add New Table</h2>
        <form 
          className="flex space-x-4" 
          onSubmit={(e) => {
            e.preventDefault();
            if (newTableNumber.trim()) addTableMutation.mutate(newTableNumber.trim());
          }}
        >
          <input
            type="text"
            required
            placeholder="e.g. T1, 04, VIP"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={addTableMutation.isPending || !newTableNumber.trim()}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center"
          >
            <Plus size={20} className="mr-2" /> Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables?.map((table) => (
          <div key={table.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="mx-auto w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center p-4 border border-gray-100 mb-4">
                <QRCodeSVG
                  id={`qr-${table.id}`}
                  value={generateUrl(table.id)}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1">
                Table {table.table_number}
              </h3>
              <a 
                href={generateUrl(table.id)} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-orange-500 hover:underline break-all"
              >
                {generateUrl(table.id)}
              </a>
            </div>
            <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100 pb-1">
              <button
                onClick={() => downloadQR(table.table_number, table.id)}
                className="py-3 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
              >
                <Download size={18} className="mr-2" /> Download
              </button>
              <button
                onClick={() => { if(confirm(`Delete Table ${table.table_number}?`)) deleteTableMutation.mutate(table.id) }}
                className="py-3 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 font-medium transition-colors"
              >
                <Trash2 size={18} className="mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
        {tables?.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            <Table2 className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No tables found. Add one above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
