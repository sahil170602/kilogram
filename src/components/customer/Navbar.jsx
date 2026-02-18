export default function Navbar() {
  return (
    <nav className="glass-card sticky top-4 mx-4 p-4 flex justify-between items-center z-50">
      <h1 className="text-primary font-black text-2xl tracking-tighter">KILOGRAM</h1>
      <div className="flex gap-4">
        <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Deliver to: Home</span>
      </div>
    </nav>
  );
}