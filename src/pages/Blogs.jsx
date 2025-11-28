import { useState } from "react";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("*");

  const blogs = [
    {
      id: 1,
      titulo: "Historias que visten distinto",
      categoria: "Estilo",
      imagen: "https://i.postimg.cc/c1tCdkFD/465774227-1555299911858674-8770776235640415682-n.jpg",
      descripcion: "Moda, creatividad y experiencias que trascienden la ropa.",
    },
    {
      id: 2,
      titulo: "Estilo y Cultura Urbana",
      categoria: "Noticias",
      imagen: "https://i.postimg.cc/DZ8ZJxnw/471439700-1320291502318476-2747705394923225044-n.jpg",
      descripcion: "Tendencias y consejos para inspirar tu look diario.",
    },
    {
      id: 3,
      titulo: "Diseño Local con Identidad",
      categoria: "Noticias",
      imagen: "https://i.postimg.cc/ZR2qr65F/IMG-1170.jpg",
      descripcion: "La moda chilena como reflejo de una nueva generación creativa.",
    },
  ];

  const filtrados = blogs.filter(
    (b) =>
      (category === "*" || b.categoria === category) &&
      b.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      {/* Hero */}
      <section className="hero py-5">
        <div className="container">
          <div className="hero-content">
            <h2>BLOGS</h2>
            <p>
              “Más que ropa: historias, estilos y novedades que te inspiran a vestir distinto.”
            </p>
            <a href="/productos" className="btn btn-primary">
              Ver productos
            </a>
          </div>
        </div>
      </section>

      {/* Carrusel */}
      <section className="carousel-section">
        <div className="container">
          <div id="stuffiesCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#stuffiesCarousel" data-bs-slide-to="0" className="active" />
              <button type="button" data-bs-target="#stuffiesCarousel" data-bs-slide-to="1" />
              <button type="button" data-bs-target="#stuffiesCarousel" data-bs-slide-to="2" />
            </div>

            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  src="https://i.postimg.cc/PxD35Mgg/DADOS.png"
                  className="d-block w-100"
                  alt="Nuestra Historia"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Blogs</h5>
                  <p>"Descubre las historias que tenemos para contar."</p>
                </div>
              </div>

              <div className="carousel-item">
                <img
                  src="https://i.postimg.cc/Dz8pthBy/448330999-1571729430349986-3007445543010160619-n.jpg"
                  className="d-block w-100"
                  alt="Historias"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Historias que Visten Distinto</h5>
                  <p>“Moda, creatividad y experiencias que trascienden la ropa.”</p>
                </div>
              </div>

              <div className="carousel-item">
                <img
                  src="https://i.postimg.cc/DwCYj0QM/IMG-1162-2.jpg"
                  className="d-block w-100"
                  alt="Cultura Urbana"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Estilo y Cultura Urbana</h5>
                  <p>“Tendencias, consejos y novedades para inspirar tu look diario.”</p>
                </div>
              </div>
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#stuffiesCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>

            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#stuffiesCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lista de blogs */}
      <section className="blogs-list py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-between align-items-md-end mb-3">
            <div>
              <h3 className="text-light m-0">Últimas entradas</h3>
              <small className="text-secondary">Historias, tendencias y consejos.</small>
            </div>

            <div className="d-flex gap-2">
              <input
                className="form-control"
                placeholder="Buscar en blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="*">Todas</option>
                <option value="Noticias">Noticias</option>
                <option value="Estilo">Estilo</option>
                <option value="Tutoriales">Tutoriales</option>
              </select>
              <button className="btn btn-primary" onClick={() => {}}>
                Filtrar
              </button>
            </div>
          </div>

          {/* Grid de blogs */}
          <div id="blogs-grid" className="row g-4">
            {filtrados.map((b) => (
              <div className="col-md-4" key={b.id}>
                <div className="card blog-card h-100">
                  <img src={b.imagen} className="card-img-top" alt={b.titulo} />
                  <div className="card-body">
                    <h5 className="card-title">{b.titulo}</h5>
                    <p className="card-text">{b.descripcion}</p>
                    <span className="badge bg-secondary">{b.categoria}</span>
                  </div>
                </div>
              </div>
            ))}

            {filtrados.length === 0 && (
              <p className="text-secondary text-center mt-4">
                No se encontraron resultados.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
