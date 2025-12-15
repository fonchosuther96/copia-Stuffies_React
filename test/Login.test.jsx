import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

import Login from "../src/pages/Login";
import { AuthContext } from "../src/context/AuthContext.jsx";

test("renderiza formulario de login", () => {
  render(
    <AuthContext.Provider value={{ login: vi.fn(), logout: vi.fn() }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );

  expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
});
