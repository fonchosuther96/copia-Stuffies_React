import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import Perfil from "../src/pages/Perfil.jsx";
import { AuthContext } from "../src/context/AuthContext.jsx";
import api from "../src/api";

vi.mock("../src/api", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

test("renderiza perfil y carga datos", async () => {
  api.get.mockResolvedValueOnce({
    data: {
      rut: "12345678-9",
      nombre: "Admin",
      apellido: "Stuffies",
      email: "admin@duoc.cl",
      direccion: "Santiago",
      username: "adminstuffies",
    },
  });

  render(
    <AuthContext.Provider value={{ logout: vi.fn() }}>
      <BrowserRouter>
        <Perfil />
      </BrowserRouter>
    </AuthContext.Provider>
  );

  // ✅ esperamos que cargue un valor real del form
  expect(await screen.findByDisplayValue("Admin")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Stuffies")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Santiago")).toBeInTheDocument();
  expect(screen.getByDisplayValue("admin@duoc.cl")).toBeInTheDocument();
});
