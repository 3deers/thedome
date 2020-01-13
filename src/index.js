//import * as THREE from '../node_modules/three/build/three.min.js';
//import * as GSAP from '../node_modules/gsap/dist/gsap.min.js';
import AstrometryHelper from './AstrometryHelper.js';
import Star from './Star.js';


console.log(window.innerWidth)

let open, renderer, scene, camera, light, tick=false, data,

// starGeo = new THREE.SphereGeometry(1, 1, 1),
starGeo  = new THREE.SphereBufferGeometry(1,1,1),
starMat = new THREE.MeshLambertMaterial({ color: 'red' });

let stars = []
let date = new Date(2020,0,1,12,0,0);

function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '/data/skymap.json', true);
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


    camera.position.x =0
    camera.position.y =0
    camera.position.z =0
    renderer.setClearColor("#fcfcfc");
    renderer.setSize(window.innerWidth, window.innerHeight);
    light.position.set(10, 0, 25)
    camera.updateProjectionMatrix();
    scene.add(light)
     loadJSON(function(json) {
      data = json;
      let num=10000,max=60000,star,coord
        for (let index = 0; index < max; index+=(max/num)) {   
            coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0,date)
            star= new Star (coord.az,coord.alt,data[index].dist,scene, starGeo, starMat)
            stars.push(star)
        }
    });

   
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
   
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
    });

    loop()

    open = true
}

function update() {
          for (let index = 0; index < stars.length; index++) {
                let coord = AstrometryHelper.radec2azel(data[index].ra, data[index].dec, 0, 0,date)
                stars[index].update(coord,data[index].dist)
          }
    //camera.rotation.y += (Math.PI / 180) * 0.2
    // camera.rotation.z += (Math.PI / 180) * 0.2
    //camera.position.z -= 10
     date.setMinutes(date.getMinutes()+1);
   
    
    
    
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
          tick=false
          //console.log("updated");
          
          
        }
        render()


        requestAnimationFrame(loop)
    
    return true;

}




setInterval(allowUpdate,33); // 33 milliseconds = ~ 30 frames per sec
console.log("Oh")
window.onload = init();

