import { Radio } from "lucide-react";

export default function RadioPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/20">
        <Radio size={36} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold">Web Radio</h1>
      <p className="text-[var(--text-secondary)] max-w-md">
        La Web Radio è momentaneamente sospesa. Tornerà presto con una veste rinnovata. 
        Resta sintonizzato!
      </p>
    </div>
  );
}
