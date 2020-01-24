//import * as THREE from '../node_modules/three/build/three.min.js';
//import * as GSAP from '../node_modules/gsap/dist/gsap.min.js';
import AstrometryHelper from './AstrometryHelper.js';
import Star from './Star.js';


console.log(window.innerWidth)
/**MAIN SCENE */
let renderer, scene, camera, light, tick;
let date = new Date(2020, 0, 1, 12, 0, 0);
var textureLoader = new THREE.TextureLoader();
let controls 
/**STARS */
let starGeo = new THREE.SphereBufferGeometry(1, 1, 1),
  starMat = new THREE.MeshLambertMaterial({ color: 'red' }),
  
  sprite = textureLoader.load( './assets/img/star-2.png' ),
  sprite2 = textureLoader.load( './assets/img/death-star.png' ),
  starPartMat= new THREE.PointsMaterial( { size: 5, sizeAttenuation: true,blending: THREE.AdditiveBlending, map: sprite, alphaTest: 0.5, transparent: true } ),
  data,
  stars = [];


/**STARFIELD */
let numParticles, positions, scales;
let starsGeometry, starsMaterial, starField;


function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', '/data/skymap.json', false);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);
}


function init() {


  /**LinitScene*/
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor("#010101");
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.updateProjectionMatrix();

  light = new THREE.PointLight(0xFFFFFF, 1, 500)
  light.position.set(10, 0, 25)
  scene.add(light)

  /**LOADING DATA */
  loadJSON(function (json) { data = json });

  /**initStars */
  let star, starRef, coord
  coord = AstrometryHelper.radec2azel(data[0].ra, data[0].dec, 0, 0, date)
  for (let index = 0; index < data.length; index++) {
    starRef = new Star(0, 0, 0, scene, starGeo, starMat)
    coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date)
    starRef.setCoord(coord)
    starRef.setDistance(data[index].dist)
    starRef.setPosition()
    star = starRef
    stars.push(star)
  }

  /**initStarField */
  var numParticles = stars.length;
  var positions = new Float32Array(numParticles * 3);

  for (var i = 0, index = 0; i < numParticles; i++ , index += 3) { //hay pillin que no era ++ era +=3 jejeje

    positions[index] = stars[i].getPosition().x;
    positions[index + 1] = stars[i].getPosition().y;
    positions[index + 2] = stars[i].getPosition().z;

  }


  starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsMaterial = new THREE.PointsMaterial({ color: 'red' });
  starField = new THREE.Points(starsGeometry, starPartMat);
  scene.add(starField);




  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', () => {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  });

  tick = false
  renderer.domElement.addEventListener('mousedown', downClbk);
renderer.domElement.addEventListener('mouseup', upClbk);

  loop()

}

function update() {
  let coord;
  // let UTCDays = date.getTime()
  // let LST = AstrometryHelper.getLST(UTCDays,0);


  for (let index = 0, particle = 0; index < stars.length; index++ , particle += 3) {
    coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date)
    stars[index].update(coord, data[index].dist)

     starField.geometry.attributes.position.array[particle] = stars[index].getPosition().x;
     starField.geometry.attributes.position.array[particle + 1] = stars[index].getPosition().y;
     starField.geometry.attributes.position.array[particle + 2] = stars[index].getPosition().z
     if (stars[index].getPosition().distanceTo(camera.position) < 100) {
       stars[index].show(scene)
     } else {
       stars[index].hide(scene)
     }
  }
  starField.geometry.attributes.position.needsUpdate = true;
  //camera.rotation.y += (Math.PI / 180) * 0.2
  //camera.rotation.z += (Math.PI / 180) * 0.2
  //camera.position.z -= 1
  date.setMinutes(date.getMinutes() - 1);




}

function allowUpdate() {
  tick = true
  //console.log("allow updated");
}

function render() {
  renderer.render(scene, camera);
}

function loop() {

  // tick=true;
  //Procesamos el input
  //TODO
  //Si es el momento de updatear, updateamos
  //ELAPSED_TIME > UPDATE_TICK_TIME
  if (tick) {

    update();
    tick = false
    //console.log("updated");


  }
  render()


  requestAnimationFrame(loop)

  return true;

}

/* The Important Bit */

var startX, startY;
function downClbk(e) {
  renderer.domElement.addEventListener('mousemove', moveClbk);
  startX = e.clientX; startY = e.clientY;
}
function upClbk(e) {
  renderer.domElement.removeEventListener('mousemove', moveClbk);
}
function moveClbk(e) {
  var delX = e.clientX - startX;
  var delY = e.clientY - startY;
  var width = window.innerWidth, height = window.innerHeight, min = Math.min(width, height);
  camera.rotation.x += delY/min;
  camera.rotation.y += delX/min;
  startX = e.clientX; startY = e.clientY;
  renderer.render(scene, camera);
}

setInterval(allowUpdate, 33); // 33 milliseconds = ~ 30 frames per sec
console.log("Oh")
window.onload = init();

