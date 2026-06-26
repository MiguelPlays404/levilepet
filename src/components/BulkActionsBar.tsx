import { Trash2, X, CheckSquare } from "lucide-react";

interface Props {
  count: number;
  onClear: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  totalVisible: number;
  deleting?: boolean;
}

export function BulkActionsBar({ count, onClear, onSelectAll, onDelete, totalVisible, deleting }: Props) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] border border-primary/40 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
      <span className="text-sm text-white font-heading">
        <span className="text-primary font-bold">{count}</span> selecionado{count > 1 ? "s" : ""}
      </span>
      <button onClick={onSelectAll} className="px-3 py-1.5 rounded-lg text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white flex items-center gap-1">
        <CheckSquare className="w-3.5 h-3.5" /> Selecionar todos ({totalVisible})
      </button>
      <button onClick={onClear} className="px-3 py-1.5 rounded-lg text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white flex items-center gap-1">
        <X className="w-3.5 h-3.5" /> Limpar
      </button>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="px-4 py-1.5 rounded-lg text-xs bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-1 disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" /> {deleting ? "Excluindo..." : `Excluir ${count}`}
      </button>
    </div>
  );
}
