const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const cantidad = document.getElementById("cantidad");
const recibido = document.getElementById("recibido");

const totalElemento = document.getElementById("total");
const vueltasElemento = document.getElementById("vueltas");
const textoVueltas = document.getElementById("textoVueltas");
const changeBox = document.querySelector(".change-box");
const historial = document.getElementById("historial");
const mensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");

function dinero(valor) {
  return "$ " + Math.round(valor).toLocaleString("es-CO");
}

function avisar(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = "message" + (tipo ? " " + tipo : "");
}

function calcular() {
  const p = Math.max(0, Number(precio.value) || 0);
  const c = Math.max(0, Number(cantidad.value) || 0);
  const total = p * c;
  totalElemento.textContent = dinero(total);

  const sinRecibido = recibido.value.trim() === "";
  const r = sinRecibido ? 0 : Math.max(0, Number(recibido.value) || 0);
  const diferencia = r - total;

  changeBox.classList.toggle("owing", !sinRecibido && diferencia < 0);

  if (sinRecibido) {
    textoVueltas.textContent = "Vueltas por devolver";
    vueltasElemento.textContent = dinero(0);
  } else if (diferencia >= 0) {
    textoVueltas.textContent = "Vueltas por devolver";
    vueltasElemento.textContent = dinero(diferencia);
  } else {
    textoVueltas.textContent = "Dinero faltante";
    vueltasElemento.textContent = dinero(Math.abs(diferencia));
  }

  return { total, recibido: r, diferencia };
}

[precio, cantidad, recibido].forEach(campo => {
  campo.addEventListener("input", calcular);
});

document.getElementById("sumar").addEventListener("click", () => {
  cantidad.value = Math.max(0, Number(cantidad.value) || 0) + 1;
  calcular();
  avisar("Se agregó una unidad.");
});

document.getElementById("restar").addEventListener("click", () => {
  const actual = Math.max(1, Number(cantidad.value) || 1);
  cantidad.value = Math.max(1, actual - 1);
  calcular();
  avisar("Se restó una unidad.");
});

document.getElementById("multiplicar").addEventListener("click", () => {
  const resultado = calcular();
  avisar("Total calculado: " + dinero(resultado.total), "success");
});

document.getElementById("borrar").addEventListener("click", () => {
  nombre.value = "";
  precio.value = "";
  cantidad.value = "1";
  recibido.value = "";
  calcular();
  avisar("Datos del producto borrados.");
  nombre.focus();
});

function cargarProductos() {
  try {
    const guardados = JSON.parse(localStorage.getItem("precioFacilProductos") || "[]");
    return Array.isArray(guardados) ? guardados : [];
  } catch {
    return [];
  }
}

let productos = cargarProductos();

function guardarEnNavegador() {
  try {
    localStorage.setItem("precioFacilProductos", JSON.stringify(productos));
    return true;
  } catch {
    return false;
  }
}

function mostrarHistorial() {
  historial.replaceChildren();
  contador.textContent = `${productos.length} / 10`;

  if (productos.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "empty";
    vacio.textContent = "Todavía no hay productos guardados.";
    historial.appendChild(vacio);
    return;
  }

  productos.forEach(producto => {
    const item = document.createElement("div");
    item.className = "history-item";

    const info = document.createElement("div");
    const titulo = document.createElement("h3");
    const detalle = document.createElement("p");
    const valor = document.createElement("span");

    titulo.textContent = producto.nombre;
    detalle.textContent = `${producto.cantidad} unidad(es) × ${dinero(producto.precio)}`;
    valor.className = "history-price";
    valor.textContent = dinero(producto.total);

    info.append(titulo, detalle);
    item.append(info, valor);
    historial.appendChild(item);
  });
}

document.getElementById("guardar").addEventListener("click", () => {
  const nombreProducto = nombre.value.trim();
  const p = Number(precio.value);
  const c = Number(cantidad.value);
  const recibidoVacio = recibido.value.trim() === "";
  const r = recibidoVacio ? null : Number(recibido.value);

  if (!nombreProducto) {
    avisar("Escribe el nombre del producto.", "error");
    nombre.focus();
    return;
  }
  if (precio.value.trim() === "" || !Number.isFinite(p) || p < 0) {
    avisar("Ingresa un precio válido, igual o mayor que cero.", "error");
    precio.focus();
    return;
  }
  if (cantidad.value.trim() === "" || !Number.isInteger(c) || c < 1) {
    avisar("La cantidad debe ser un número entero mayor que cero.", "error");
    cantidad.focus();
    return;
  }
  if (r !== null && (!Number.isFinite(r) || r < 0)) {
    avisar("El dinero recibido debe ser igual o mayor que cero.", "error");
    recibido.focus();
    return;
  }

  const total = p * c;
  productos.unshift({ nombre: nombreProducto, precio: p, cantidad: c, total });
  productos = productos.slice(0, 10);

  if (!guardarEnNavegador()) {
    productos.shift();
    mostrarHistorial();
    avisar("No se pudo guardar. Revisa el almacenamiento del navegador.", "error");
    return;
  }

  mostrarHistorial();
  avisar("Producto guardado correctamente.", "success");
});

document.getElementById("limpiarHistorial").addEventListener("click", () => {
  if (productos.length === 0) {
    avisar("El historial ya está vacío.");
    return;
  }

  productos = [];
  try {
    localStorage.removeItem("precioFacilProductos");
  } catch {
    avisar("No se pudo borrar el historial del navegador.", "error");
    productos = cargarProductos();
    mostrarHistorial();
    return;
  }

  mostrarHistorial();
  avisar("Historial eliminado.", "success");
});

calcular();
mostrarHistorial();
