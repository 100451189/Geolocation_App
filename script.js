//Se definen las variables necesarias
let marker = ""; //Marcador de posición del usuario en el mapa
let distanciaAlarma = 1; //Distancia (radio) a la que saltará la alarma por proximación 
let latitude; //Latitud del usuario
let longitude; //Longitud del usuario
let yourPos; //Sirve para registrar el marcador actualizado del usuario


//Variable que incluye una imagen svg que sustituye al marcador predeterminado
const customIcon = L.icon({ iconUrl: "./marker-map.svg", iconSize: [40,40]});
//Otro svg que muestra la ubicación actual del usuario al centrar el mapa
const yourPosition = L.icon({ iconUrl: "./yourMarker.svg", iconSize: [40,40]});
//Canciones mp3 incluidas para poder hacer saltar la alarma
var song1 = new Audio('Bad, Bad Leroy Brown.mp3');
var song2 = new Audio('Thunderstruck.mp3');
var song3 = new Audio('Still standing.mp3');
var song = song1; //Se establece como predeterminada en caso de que el usuario no cambie la canción

function obtenerLocalizacionInicial(){
  //Función empleada para obtener la localización inicial del usuario al abrirse la aplicación
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onSuccess(position){
  /*Función de devolución de llamada, que se llamará cada vez que se actualice la posición del usuario.
  A continuación se actualizan las posiciones de los usuarios que han sido obtenidas con la nueva llamada*/
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  //Se modifica la imagen que se está mostrando del mapa a la posición actual del usuario
  yourPosition.setView([latitude,longitude]);
}

function onError(){
  //Funcion empleada para lanzar una excepción en caso de producirse un error al tratar de obtener la localización del usuario
  throw ("Se ha producido un error al tratar de obtener la localización");
}

function seguirLocalizacion(position) {
  //Función que obtiene las posiciones y llama a la comprobación de la distancia que hay hasta el destino
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  distanciaDestino();
}  

function distanciaDestino() {
  //Funcion para comprobar la distancia definida por el usuario y verificar si se encuentra a rango de activación de la alarma
  let distancia = document.getElementById("km_dist").value; //Recoge el valor establecido por el usuario en la opción de configuración
  //Si el valor establecido por el usuario es negativo o nulo (no ha escrito nada), el valor de la distancia será el default (1km)
  if (distancia < 0 || distancia == ""){
    distancia = distanciaAlarma;
  }
  //Obtiene la latitud y longitud del marcador actual
  let latitudMarcador = marker.getLatLng().lat;
  let longitudMarcador = marker.getLatLng().lng;
  let distanciaUsuarioMarcador = km_de_distancia(latitude, longitude, latitudMarcador, longitudMarcador);
  
  //Se evalúa si el usuario ya se encuentra dentro del rango establecido respecto al marcador definido
  if (distanciaUsuarioMarcador < distancia) {
    navigator.vibrate(1500);//La alarma vibra 1.5 segundos
    song.play(); //Se activa la canción que esté establecida
    document.querySelector(".alarma").style.display = "flex"; //Se hace visible el reloj en pantalla para su desactivación
  }
}


function km_de_distancia(lat1, lon1, lat2, lon2) {
  //Función para calcular la distancia en km entre dos coordenadas pasadas por parámetros (usuario y marcador de destino)
  var radioTierra = 6371; // Radio de la Tierra en kilómetros
  //Se convierte la diferencia de latitud y longitud entre ambos puntos de grados a radianes
  var dLat = degToRad(lat2 - lat1);
  var dLon = degToRad(lon2 - lon1);
  //Se aplica una fórmula llamada "fórmula de Haversine" para calcular la distancia entre dos puntos en una esfera
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //Distancia en kilómetros
  var distancia_act = radioTierra * c; 
  return distancia_act;
}

function degToRad(degrees) {
  //Función para convertir grados a radiones y poder operar con ellos
  return degrees * (Math.PI / 180);
}

function actualizarLocalizacion(){
  //Esta función sirve para rastrear la localización del usuario a lo largo de su recorrido en el transporte
  navigator.geolocation.watchPosition(seguirLocalizacion, onError)
}

function colocarMarcador(e){
  //Se crea el marcador que indica la posición deseada por el usuario.
   if (marker == ""){
    //Si no existe un marcador, se asigna uno donde el usuario clickee
    marker = L.marker(e.latlng, {icon: customIcon}).bindPopup("Tu Destino").addTo(mymap);
  }
  else{
    //En caso de existir uno, se actualizará
    marker.setLatLng(e.latlng).bindPopup("Tu Destino");
  }
  distanciaDestino();
}

function quitarMarcador(marcador, tiempo_espera){
  //Función empleada para hacer desaparecer un marcador en caso de ser necesario
  setTimeout(()=> {mymap.removeLayer(marcador);}, tiempo_espera);
}

function centrar(){
  /*Funcion encargada de devolver al usuario en pantalla a la posicion en la 
  que se encuentra actualmente, de acuerdo con su ubicación GPS.*/
  mymap.setView([latitude, longitude], 15); //Se muestra el mapa en dicha posición
  //Se crea un nuevo marcador con el svg personalizado que se muestra en el mapa indicando donde está el usuario
  var yourMarker = L.marker([latitude, longitude],{icon: yourPosition}).bindPopup("Tu ubicación").openPopup().addTo(mymap);
  /*Para hacerlo más dinámico y no tener tantos marcadores en el mapa, se establece que desaparezca el marcador generado
  al cabo de pasar unos pocos segundos (1,5) que sean suficientes para el usuario ver dicho marcador*/
  quitarMarcador(yourMarker,1500);  
}


function abrirMenu(){
  //Función para abrir la ventana de opciones de personalización
  document.querySelector(".popup").style.display = "flex";
}

function desaparecerBotonPersonalizacion(){
  //Función para hacer desaparecer el boton cuando se presiona la opcion de musica o distancia
  document.querySelector("#boton-personalizar").style.display = "none";
}

function activarBotonPersonalizacion(){
  //Función para hacer desaparecer el boton cuando se presiona la opcion de musica o distancia
  document.querySelector("#boton-personalizar").style.display = "flex";
}
  
function cerrarPersonalizacion(){
  //Función para cerrar la ventana de personalización cuando se toca la cruz de cerrado
  document.querySelector(".popup").style.display = "none";
}

function abrirDisplayMusica(){
  //Función para abrir la ventana en la que se selecciona la música
  document.querySelector(".popup_musica").style.display = "flex";
}

function cerrarDisplayMusica(){
  //Función para cerrar la ventana en la que se selecciona la música
  document.querySelector(".popup_musica").style.display = "none";

}

function abrirSettingsDistancia(){
  //Función para abrir la ventana en la que se puede modificar el radio de distancia para que salte la alarma
  document.querySelector(".popup_distancia").style.display = "flex";
}

function cerrarSettingsDistancia(){
  //Función para abrir la ventana en la que se puede modificar el radio de distancia para que salte la alarma
  document.querySelector(".popup_distancia").style.display = "none";
}

function mensajeSeleccionado(boton_seleccionar){
  //Función usada para gestionar la selección de canciones en el display de música de la alarma
  boton_seleccionar.innerText = "Seleccionado";
  //Se determina que canción es la que se ha seleccionado y se asigna a la variable song
  switch(boton_seleccionar.id){
    case "seleccion_leroy":
      song = song1;
      break;
    case "seleccion_acdc":
      song = song2;
      break;
    case "seleccion_elton":
      song = song3;
      break;
  }
  setTimeout(function(){
    boton_seleccionar.innerText = "Seleccionar";
  }, 1000);
}

function pararAlarma(){
  //Esta función apaga y quita de la pantalla la alarma que haya saltado
  document.querySelector(".alarma").style.display = "none";
  //Paramos la música de la alarma
  song.pause();
}


//AQUÍ COMIENZA EL PROGRAMA PRINCIPAL QUE EJECUTA EL FUNCIONAMIENTO DE LA APP
//Cuando se genera el mapa al abrir la aplicación, el punto de inicio mostrado es la zona de Moncloa en Madrid.
const mymap = L.map('sample_map').setView([40.43547, -3.7317], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
  maxZoom: 18
}).addTo(mymap);

//Solicita al usuario compartir su ubicación GPS para poder registrar su posición inicial
obtenerLocalizacionInicial();
//Se invoca la función previamente definida cada vez que se recibe un click en algún punto del mapa
mymap.on('click', colocarMarcador);
//Se evalua la ubicación del usuario de manera continua
actualizarLocalizacion();


