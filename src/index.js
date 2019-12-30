//import * as THREE from '../node_modules/three/build/three.min.js';
//import * as GSAP from '../node_modules/gsap/dist/gsap.min.js';
console.log(window.innerWidth)
var scene = new THREE.Scene(); 
var camera = new THREE.PerspectiveCamera (75,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.z=5

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#e5e5e5");
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
console.log("update");
    renderer.setSize(window.innerWidth , window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;


   
});



var geometry = new THREE.SphereGeometry( 1, 16, 16 );
var material = new THREE.MeshLambertMaterial ({color:0xFFCC00});
var mesh = new THREE.Mesh(geometry,material);
var light = new THREE.PointLight(0xFFFFFF, 1, 500)
light.position.set(10,0,25)
camera.updateProjectionMatrix();
scene.add(light)
scene.add(mesh)
renderer.render(scene ,camera)
