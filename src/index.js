//import * as THREE from '../node_modules/three/build/three.min.js';
//import * as GSAP from '../node_modules/gsap/dist/gsap.min.js';
import AstrometryHelper from './AstrometryHelper.js';
import Star from './Star.js';


console.log(window.innerWidth)

let open, renderer, scene, camera, light, tick = false, data,

  // starGeo = new THREE.SphereGeometry(1, 1, 1),
  starGeo = new THREE.SphereBufferGeometry(1, 1, 1),
  starMat = new THREE.MeshLambertMaterial({ color: 'red' });


var numParticles = 10000;
var positions = new Float32Array(numParticles * 3);
var scales = new Float32Array(numParticles);

let stars = []
let date = new Date(2020, 0, 1, 12, 0, 0);

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



  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  light = new THREE.PointLight(0xFFFFFF, 1, 500)
  tick = false


  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 0
  renderer.setClearColor("#fcfcfc");
  renderer.setSize(window.innerWidth, window.innerHeight);
  light.position.set(10, 0, 25)
  camera.updateProjectionMatrix();
  scene.add(light)
  loadJSON(function (json) {
    data = json
    let star, coord
    coord = AstrometryHelper.radec2azel(data[0].ra, data[0].dec, 0, 0, date)
    var starRef = new Star(0, 0, 0, scene, starGeo, starMat)
    for (let index = 0; index < data.length; index++) {

      starRef = new Star(0, 0, 0, scene, starGeo, starMat)
      coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date)
      starRef.setCoord(coord)
      starRef.setDistance(data[index].dist)
      starRef.setPosition()
      star = starRef
      stars.push(star)
    }
    console.log(stars.length);

  });

  console.log(stars.length + "oh shit")
  console.log(data.length)
  for (var i = 0; i < 60000; i++) {
    
    positions[i] = stars[i].getPosition().x;
    positions[i + 1] = stars[i].getPosition().y;
    positions[i + 2] = stars[i].getPosition().z;

  }
  console.log(positions[0])
  console.log(positions[1])
  console.log(positions[2])
  console.log(stars[0].getDistance())
  console.log(stars[1].getDistance())
  console.log(positions[2])
  var starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var starsMaterial = new THREE.PointsMaterial({ color: 'red' });
  var starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);




  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', () => {

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  });

  loop()

  open = true
}

function update() {
  let coord;
  for (let index = 0; index < stars.length; index++) {
    if(stars[index].getPosition().distanceTo(camera.position)<50){
     coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0,date)
     stars[index].update(coord,data[index].dist)
      stars[index].render()
  }else{
    stars[index].hide()
  }
  }
  // camera.rotation.y += (Math.PI / 180) * 0.2
  // camera.rotation.z += (Math.PI / 180) * 0.2
  camera.position.z += 5
  // date.setMinutes(date.getMinutes()+1);




}

function allowUpdate() {
  tick = true
  console.log("allow updated");
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




setInterval(allowUpdate, 33); // 33 milliseconds = ~ 30 frames per sec
console.log("Oh")
window.onload = init();

