import { useState } from "react";
import { aplicarValidaciones } from "../utils/validaciones";

/**
 * @param {object} initialState  Estado inicial del form (ej: { nombre:"", correo:"", comentario:"" })
 * @param {object} rules         Reglas por campo (ej: { nombre:[requerido], ... })
 * @param {function} onValid     Callback si pasa validación (form limpio)
 */
export default function useFormValidation(initialState, rules, onValid) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const validate = (draft = form) => aplicarValidaciones(draft, rules);

  const validateAndSubmit = (e) => {
    e?.preventDefault?.();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onValid?.(form, { setForm, setErrors });
  };

  // clase de input según error
  const cls = (name, base = "form-control") =>
    `${base}${errors[name] ? " is-invalid" : ""}`;

  // renderiza feedback
  const Msg = ({ name }) =>
    errors[name] ? <div className="invalid-feedback">{errors[name]}</div> : null;

  return { form, setField, errors, setErrors, validate, validateAndSubmit, cls, Msg };
}