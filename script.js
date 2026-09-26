// Referencias al canvas y su contexto de dibujo
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
const puntajeEl = document.getElementById("puntaje");

// Referencias a las pantallas de menú y juego
const menu = document.getElementById("menu");
const pantallaJuego = document.getElementById("pantallaJuego");
const botonJugar = document.getElementById("botonJugar");
const botonSkins = document.getElementById("botonSkins");
const botonTienda = document.getElementById("botonTienda");
const botonNiveles = document.getElementById("botonNiveles");

// Referencias a los botones táctiles de dirección
const btnArriba = document.getElementById("btnArriba");
const btnAbajo = document.getElementById("btnAbajo");
const btnIzquierda = document.getElementById("btnIzquierda");
const btnDerecha = document.getElementById("btnDerecha");

// Referencias a la pantalla de fin de juego
const pantallaGameOver = document.getElementById("pantallaGameOver");
const puntajeFinalEl = document.getElementById("puntajeFinal");
const botonReiniciar = document.getElementById("botonReiniciar");
const botonMenu = document.getElementById("botonMenu");
const mensajeFin = document.getElementById("mensajeFin");
const recordMenuEl = document.getElementById("recordMenu");
const recordFinalEl = document.getElementById("recordFinal");
const recordJuegoEl = document.getElementById("recordJuego");
const avisoNuevoRecord = document.getElementById("avisoNuevoRecord");
const lineaPuntajeFinal = document.getElementById("lineaPuntajeFinal");

const tamCelda = 20; // tamaño de cada cuadradito del tablero
const columnas = canvas.width / tamCelda;
const filas = canvas.height / tamCelda;

let serpiente;
let direccion;
let direccionSiguiente;
let comida;
let puntaje;
let velocidad = 150; // milisegundos entre movimientos
let juegoTerminado;

// El récord se guarda en el propio navegador, no requiere servidor ni login
let record = Number(localStorage.getItem("recordSnake")) || 0;
recordMenuEl.textContent = record;

// Compara el puntaje actual contra el récord guardado y lo actualiza si lo supera.
// Devuelve true si se batió el récord, para poder mostrar el aviso correspondiente.
function actualizarRecordSiCorresponde() {
  const esNuevoRecord = puntaje > record;
  if (esNuevoRecord) {
    record = puntaje;
    localStorage.setItem("recordSnake", record);
  }
  recordMenuEl.textContent = record;
  recordJuegoEl.textContent = record;
  recordFinalEl.textContent = record;
  return esNuevoRecord;
}

// Deja todo el estado del juego como al arrancar (se usa al jugar y al reiniciar)
function iniciarEstadoDelJuego() {
  serpiente = [{ x: 10, y: 10 }]; // empieza con un solo segmento
  direccion = { x: 0, y: 0 }; // dirección con la que se movió la última vez
  direccionSiguiente = { x: 0, y: 0 }; // dirección pedida, se aplica en el próximo movimiento
  comida = generarComida();
  puntaje = 0;
  juegoTerminado = false;
  puntajeEl.textContent = puntaje;
  recordJuegoEl.textContent = record;
}

// Genera una posición aleatoria para la comida
function generarComida() {
  return {
    x: Math.floor(Math.random() * columnas),
    y: Math.floor(Math.random() * filas)
  };
}

// Guarda la dirección pedida, comparando siempre contra la última dirección
// realmente aplicada (no contra otro pedido que ya esté en cola). Esto evita
// que dos teclas apretadas muy rápido, antes del próximo movimiento, terminen
// mandando a la serpiente contra su propio cuerpo sin que se vea en pantalla.
function cambiarDireccion(nuevaX, nuevaY) {
  if (nuevaX !== 0 && direccion.x === 0) direccionSiguiente = { x: nuevaX, y: 0 };
  if (nuevaY !== 0 && direccion.y === 0) direccionSiguiente = { x: 0, y: nuevaY };
}

// Escucha las flechas del teclado para cambiar de dirección
document.addEventListener("keydown", (evento) => {
  switch (evento.key) {
    case "ArrowUp":
      cambiarDireccion(0, -1);
      break;
    case "ArrowDown":
      cambiarDireccion(0, 1);
      break;
    case "ArrowLeft":
      cambiarDireccion(-1, 0);
      break;
    case "ArrowRight":
      cambiarDireccion(1, 0);
      break;
  }
});

// Los botones táctiles usan la misma función que el teclado
btnArriba.addEventListener("click", () => cambiarDireccion(0, -1));
btnAbajo.addEventListener("click", () => cambiarDireccion(0, 1));
btnIzquierda.addEventListener("click", () => cambiarDireccion(-1, 0));
btnDerecha.addEventListener("click", () => cambiarDireccion(1, 0));

function actualizar() {
  if (juegoTerminado) return;

  // Recién acá se "confirma" el giro pedido, una sola vez por movimiento
  direccion = direccionSiguiente;

  // Si todavía no apretó ninguna tecla, no se mueve
  if (direccion.x === 0 && direccion.y === 0) return;

  const cabezaActual = serpiente[0];
  const nuevaCabeza = {
    x: cabezaActual.x + direccion.x,
    y: cabezaActual.y + direccion.y
  };

  // Choque contra la pared
  if (
    nuevaCabeza.x < 0 ||
    nuevaCabeza.x >= columnas ||
    nuevaCabeza.y < 0 ||
    nuevaCabeza.y >= filas
  ) {
    terminarJuego();
    return;
  }

  // Choque contra su propio cuerpo
  const chocaConCuerpo = serpiente.some(
    (segmento) => segmento.x === nuevaCabeza.x && segmento.y === nuevaCabeza.y
  );
  if (chocaConCuerpo) {
    terminarJuego();
    return;
  }

  serpiente.unshift(nuevaCabeza); // agrega la nueva cabeza adelante

  // Si come, suma puntos y genera comida nueva; si no, se achica la cola
  if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
    puntaje += 10;
    puntajeEl.textContent = puntaje;

    // Si la serpiente ya ocupa todas las celdas, no queda lugar para más comida: ganó
    if (serpiente.length === columnas * filas) {
      terminarJuego(true);
      return;
    }

    comida = generarComida();
  } else {
    serpiente.pop();
  }
}

function dibujar() {
  // Limpia el tablero
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dibuja la serpiente
  ctx.fillStyle = "#4caf50";
  serpiente.forEach((segmento) => {
    ctx.fillRect(
      segmento.x * tamCelda,
      segmento.y * tamCelda,
      tamCelda - 2,
      tamCelda - 2
    );
  });

  // Dibuja la comida
  ctx.fillStyle = "#e53935";
  ctx.fillRect(
    comida.x * tamCelda,
    comida.y * tamCelda,
    tamCelda - 2,
    tamCelda - 2
  );
}

function terminarJuego(gano) {
  juegoTerminado = true;
  mensajeFin.textContent = gano ? "¡Ganaste! Llenaste todo el tablero" : "Perdiste";
  puntajeFinalEl.textContent = puntaje;
  const esNuevoRecord = actualizarRecordSiCorresponde();
  avisoNuevoRecord.classList.toggle("oculto", !esNuevoRecord);
  lineaPuntajeFinal.classList.toggle("textoVerde", esNuevoRecord);
  lineaPuntajeFinal.classList.toggle("textoRojo", !esNuevoRecord);
  pantallaGameOver.classList.remove("oculto");
}

function bucleDelJuego() {
  actualizar();
  dibujar();
  // Deja de programar la próxima vuelta apenas termina el juego
  if (!juegoTerminado) {
    setTimeout(bucleDelJuego, velocidad);
  }
}

// Cuando se aprieta "Jugar", arranca el estado del juego, se esconde el menú y comienza el bucle
botonJugar.addEventListener("click", () => {
  iniciarEstadoDelJuego();
  menu.classList.add("oculto");
  pantallaJuego.classList.remove("oculto");
  canvas.focus();
  bucleDelJuego();
});

// Todavía sin funcionalidad, se van a activar cuando armemos cada sección
botonSkins.addEventListener("click", () => alert("Skins: muy pronto vas a poder elegir el look de tu serpiente."));
botonTienda.addEventListener("click", () => alert("Tienda: acá vas a poder gastar tus monedas en skins."));
botonNiveles.addEventListener("click", () => alert("Niveles: acá vas a poder elegir la dificultad."));

// Reiniciar: vuelve a arrancar el juego sin salir de la pantalla de juego
botonReiniciar.addEventListener("click", () => {
  iniciarEstadoDelJuego();
  pantallaGameOver.classList.add("oculto");
  bucleDelJuego();
});

// Menú: vuelve a la pantalla de inicio
botonMenu.addEventListener("click", () => {
  pantallaGameOver.classList.add("oculto");
  pantallaJuego.classList.add("oculto");
  menu.classList.remove("oculto");
});
