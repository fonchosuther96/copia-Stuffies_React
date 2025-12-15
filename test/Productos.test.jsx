// src/test/Productos.test.jsx
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Productos from "../src/pages/Productos"; // 👈 CORRECTO

describe("Productos", () => {
  it("renderiza la página de productos", () => {
    render(
      <BrowserRouter>
        <Productos />
      </BrowserRouter>
    );

    expect(screen.getByText(/productos/i)).toBeInTheDocument();
  });
});
