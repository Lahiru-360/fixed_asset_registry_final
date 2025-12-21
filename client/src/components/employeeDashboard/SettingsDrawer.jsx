// Updated SettingsDrawer.jsx (full width on small screens)
export default function SettingsDrawer({ open, onClose }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-background shadow-xl border-l border-muted transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">My Settings</h2>

        <p className="opacity-70 mb-3 text-sm">Editable fields coming soon…</p>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
