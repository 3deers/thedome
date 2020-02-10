//import * as THREE from '../node_modules/three/build/three.min.js';
//import * as GSAP from '../node_modules/gsap/dist/gsap.min.js';
import AstrometryHelper from './AstrometryHelper.js';
import Star from './Star.js';
import Pick3D from './Pick3D.js';

console.log(window.innerWidth)
/**MAIN SCENE */
let renderer, scene, pick3D, camera, light, tick;
let date = new Date(2020, 0, 1, 12, 0, 0);

/**STARS */
let starGeo = new THREE.SphereBufferGeometry(1, 1, 1),
  starMat = new THREE.MeshLambertMaterial({ color: 'red' }),
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

  pick3D = new Pick3D();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor("#fcfcfc");
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 1000;
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
  starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);




  document.body.appendChild(renderer.domElement);

  window.addEventListener('mousedown', function (event) {
    pick3D.setPickPosition(event);
    pick3D.pick(scene.children, camera);
  });

  window.addEventListener('mouseup', pick3D.clearPickPosition());

  window.addEventListener('resize', () => {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  });

  tick = false
  loop()

}

function update() {
  let coord;

  for (let index = 0, particle = 0; index < stars.length; index++ , particle += 3) {
    coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date)
    //coord = {az:Math.random(),alt:Math.random()}
    stars[index].update(coord, data[index].dist)

    // starField.geometry.attributes.position.array[particle] = stars[index].getPosition().x;
    // starField.geometry.attributes.position.array[particle + 1] = stars[index].getPosition().y;
    // starField.geometry.attributes.position.array[particle + 2] = stars[index].getPosition().z;

    if (stars[index].getPosition().distanceTo(camera.position) < 100) {
      stars[index].show(scene)
    } else {
      stars[index].hide(scene)
    }
  }
  starField.geometry.attributes.position.needsUpdate = true;
  camera.rotation.y += (Math.PI / 180) * 0.2
  camera.rotation.z += (Math.PI / 180) * 0.2
  camera.position.z -= 1
  //date.setMinutes(date.getMinutes() - 1);




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


  }
  render()
  requestAnimationFrame(loop)

  return true;

}




setInterval(allowUpdate, 120); // 33 milliseconds = ~ 30 frames per sec
console.log("Oh")
window.onload = init();

