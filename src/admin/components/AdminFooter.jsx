// src/admin/components/AdminFooter.jsx
export default function AdminFooter() {
  return (
    <footer className="bg-black border-top border-secondary mt-auto">
      <div className="container text-center text-secondary py-3">
        © {new Date().getFullYear()} Stuffies — Panel Administrativo
      </div>
    </footer>
  );
}
