const API_URL = "http://localhost:8080"; //Guardamos la direccion del backend 

//Buscamos si ya había algun carrito guardado en el navegador 
let carritoId = localStorage.getItem("carritoId");

//El carrito se crea al cargar la pagina , cuando se abre la pagina se ejecuta eso 
window.onload = async function () {
  console.log("JS cargado");

  // si no tenemos carrito guardado, se crea uno
  if (!carritoId) {
    await crearCarrito();
  }

  if (document.getElementById("tabla-carrito")) {
    await cargarCarrito();
  }
};

async function crearCarrito() {
  const fecha = Date.now(); //numero basado en la hora actual

  const res = await fetch(`${API_URL}/api/carrito`, {
    method: "POST", //creamos el carrito con un POST
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      idUsuario: fecha,
      email: "usuario" + fecha + "@test.com", //cada email tiene que ser unico 
      totalPrecio: 0
    })
  });

  console.log("Crear carrito:", res.status);
  // si va bien muestra 201, si no va bien muestra el error porque en el backend tengo @ResponseStatus(HttpStatus.BAD_REQUEST) y el error se muestra en res.status

  if (!res.ok) {
    alert("Error al crear carrito: " + res.status);
    return;
  }


  // El backend responde con el carrito creado 
  const carrito = await res.json();

  //guardamos el ID y lo guardamos tmb en el localstorage
  carritoId = carrito.idCarrito;
  localStorage.setItem("carritoId", carritoId);

  console.log("Carrito creado:", carritoId);
}

async function anadirProducto(idArticulo, precioUnitario) {
  if (!carritoId) {
    await crearCarrito();
  }

  const res = await fetch(`${API_URL}/api/carrito/${carritoId}/lineas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      idArticulo: idArticulo,
      precioUnitario: precioUnitario,
      numUnidades: 1,
      costeLinea: precioUnitario
    })
  });

  console.log("Añadir producto:", res.status);

  if (!res.ok) {
    alert("Error al añadir producto: " + res.status);
    return;
  }

  alert("Producto añadido al carrito");
    window.location.href = "carrito.html";

  alert("Producto añadido al carrito");
}

async function cargarCarrito() {
  const res = await fetch(`${API_URL}/api/lineas`);

  console.log("Cargar carrito:", res.status);

  if (!res.ok) {
    alert("Error al cargar carrito: " + res.status);
    return;
  }

  //convierte la respuesta JSON en lista de JAVASCRIPT 
  const lineas = await res.json();

  console.log("Líneas recibidas:", lineas);

  if (lineas.length === 0) {
    document.getElementById("tabla-carrito").innerHTML =
      "<tr><td colspan='5'>Carrito vacío</td></tr>";
    document.getElementById("total-final").innerText = "0 €";
    return;
  }


  let html = "";
  let total = 0; //AQUI SUMAMOS EL TOTAL FINAL 

  // AQUI CREAMOS LA TABLA RECORRIENDO TODOS LOS DATOS YA GUARDADOS
  lineas.forEach(linea => {
    html += `
      <tr>
        <td>Artículo ${linea.idArticulo}</td>
        <td>${linea.numUnidades}</td>
        <td>${linea.precioUnitario / 100} €</td>
        <td>${linea.costeLinea / 100} €</td>
        <td><button onclick="eliminarCarrito(${linea.idLinea})">Eliminar</button></td>
      </tr>
    `;

    total += linea.costeLinea;
  });

  // AQUI MOSTRAMOS LA TABLA Y EL TOTAL FINAL
  document.getElementById("tabla-carrito").innerHTML = html;
  document.getElementById("total-final").innerText = (total / 100) + " €";
}

async function eliminarCarrito(idLinea){
  const res= await fetch(`${API_URL}/api/carrito/${carritoId}/lineas/${idLinea}`, {
    method: "DELETE"
  });
  
  console.log("Eliminar línea:", res.status);

  if (!res.ok) {
    alert("Error al eliminar el producto: " + res.status);
    return;
  }

  await cargarCarrito(); // recarga el carrito para mostrar los cambios

}

