
import AstrometryHelper from './AstrometryHelper.js';
import Star from './Star.js';
import Planet from './Planet.js';



/**MAIN SCENE */
var renderer, scene, camera, light, tick;
var date = new Date('January 01 , 2000 00:10:00');
var textureLoader = new THREE.TextureLoader();
var controls,cameraDir=new THREE.Vector3( );;
var accelerationDelta = {push:0,pitch:0,bend:0};

/**STARS */
var starGeometry = new THREE.SphereBufferGeometry(4, 4, 4);
var starMaterial = new THREE.MeshBasicMaterial({ color: 'yellow' });
var moonGeometry = new THREE.SphereBufferGeometry(10, 10, 10)
var moonMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
var sprite = textureLoader.load('./assets/img/star-2.png');
var sprite2 = textureLoader.load('./assets/img/death-star.png');
var data;
var stars = [];

/**PLANETS */
var moon;


/**STARFIELD */
var starFieldMaterial = new THREE.PointsMaterial({ size: 10, sizeAttenuation: true, blending: THREE.AdditiveBlending, map: sprite, alphaTest: 0.9, transparent: true });
var starFieldGeometry = new THREE.BufferGeometry();
var starField;


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

function initScene() {

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor("#010101");
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.updateProjectionMatrix();

  light = new THREE.PointLight(0xFFFFFF, 1, 500, 1000)
  light.position.set(10, 0, 25)
  scene.add(light)


}

function initPlanets(params) {
  var tmpCoord
  tmpCoord = AstrometryHelper.CalculateHorizontalCoordinatesMoon(0, 0, date)
  moon = new Planet(tmpCoord.az, tmpCoord.alt, tmpCoord.dist, scene, moonGeometry, moonMaterial)
  console.log(moon.getDistance())
}

function initStars() {
  /**StarObjects */
  var tmpStar, tmpCoord

  for (var index = 0; index < data.length; index++) {
    tmpStar = new Star(0, 0, 0, scene, starGeometry, starMaterial)
    tmpCoord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date)
    tmpStar.setCoord(tmpCoord)
    tmpStar.setDistance(data[index].dist)
    tmpStar.setPosition()
    stars.push(tmpStar)
  }

  /**StarField BufferGeometry */
  var numStars = stars.length;
  var starFieldPositions = new Float32Array(numStars * 3);

  for (var i = 0, index = 0; i < numStars; i++ , index += 3) { //hay pillin que no era ++ era +=3 jejeje

    starFieldPositions[index] = stars[i].getPosition().x;
    starFieldPositions[index + 1] = stars[i].getPosition().y;
    starFieldPositions[index + 2] = stars[i].getPosition().z;

  }

  starFieldGeometry.setAttribute('position', new THREE.BufferAttribute(starFieldPositions, 3));
  starField = new THREE.Points(starFieldGeometry, starFieldMaterial);

  scene.add(starField);
}

function initInputHandlers() {

  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
  });
  renderer.domElement.addEventListener('mousedown', downClbk);
  renderer.domElement.addEventListener('mouseup', upClbk);
  document.addEventListener('keydown', keyDown);

}

function init() {

  initScene();

  /**LOADING DATA */
  loadJSON(function (json) { data = json });

  initStars()
  initPlanets()

  initInputHandlers()
  tick = false
  loop()

}

function update() {
  var coord;
  var UTCDays = date.getTime()
  var LST = AstrometryHelper.getLST(UTCDays, 0);

  for (var index = 0, particle = 0; index < stars.length; index++ , particle += 3) {
    coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0, date, LST)
    stars[index].update(coord, data[index].dist)

    starField.geometry.attributes.position.array[particle] = stars[index].getPosition().x;
    starField.geometry.attributes.position.array[particle + 1] = stars[index].getPosition().y;
    starField.geometry.attributes.position.array[particle + 2] = stars[index].getPosition().z

    if (stars[index].getPosition().distanceTo(camera.position) < 100) {
      //stars[index].show(scene) //
    } else {
      stars[index].hide(scene)
    }
  }
  starField.geometry.attributes.position.needsUpdate = true;

  coord = AstrometryHelper.CalculateHorizontalCoordinatesMoon(0, 0, date)
  moon.update(coord)


  //date.setMinutes(date.getMinutes() + 1);


  if(accelerationDelta.push != 0){
    if(accelerationDelta.push < 0.5 && accelerationDelta.push > -0.5){
      accelerationDelta.push = 0;
    } 
    else if (accelerationDelta.push < 0){
      accelerationDelta.push += 0.1
    } else{
      accelerationDelta.push -= 0.1
    }
  }

  camera.getWorldDirection(cameraDir);
    //camera.position.z+= 1 * accelerationDelta.push
    camera.position.addScaledVector(cameraDir, accelerationDelta.push);

  console.clear()
  console.log(moon.getCoord());
  console.log(moon.getPosition());
  console.log(date);

}

function allowUpdate() {
  tick = true
  //console.log("allow updated");
}

function render() {
  renderer.render(scene, camera);
}

function loop() {

 
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
  camera.rotation.x += delY / min;
  camera.rotation.y += delX / min;
  startX = e.clientX; startY = e.clientY;
  //renderer.render(scene, camera);
}
function keyDown(e) {


  if (e.keyCode == '38') {
    accelerationDelta.push += 0.4
  }
  else if (e.keyCode == '40') {
    accelerationDelta.push -= 0.4  
    // down arrow
  }
  else if (e.keyCode == '37') {
    // left arrow
  }
  else if (e.keyCode == '39') {
    // right arrow
  }

  renderer.render(scene, camera);
}

setInterval(allowUpdate, 33); // 33 milliseconds = ~ 30 frames per sec
console.log("Oh")
window.onload = init();

