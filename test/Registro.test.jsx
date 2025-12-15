import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Registro from "../src/pages/Registro";

test("muestra error si se envía vacío", () => {
  render(
    <BrowserRouter>
      <Registro />
    </BrowserRouter>
  );

  // ✅ botón específico
  fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

  expect(screen.getByText(/Ingresa tu RUN/i)).toBeInTheDocument();
});
