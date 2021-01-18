import * as THREE from 'three';
import fragment from '../shaders/fragment.glsl'
import vertex from '../shaders/vertex.glsl'
import mask from '../img/mask.png'
import t1 from '../img/t1.png'
import t2 from '../img/t2.png'
let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor() {

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );    
    document.getElementById('container').appendChild( this.renderer.domElement );
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();
    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(t2),
    ]
    this.mask = new THREE.TextureLoader().load(mask);
    this.time = 0;
    this.move = 0;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.addMesh();    

    this.mouseEffects();
    this.render();
  }

  mouseEffects(){
    window.addEventListener('mousewheel', (e)=> {
      this.move +=e.wheelDeltaY/1000;
    })
  }

  addMesh() {    
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: {type: "f", value: 0},
        t1: {type: "t", value: this.textures[0]},
        t2: {type: "t", value: this.textures[1]},
        mask: {type: "t", value: this.mask},
        move: {type: "f", value: 0},
        time: {type: "f", value: 0}
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
    let number = 512*512;
    this.geometry = new THREE.BufferGeometry( );
    this.positions = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3),3);
    this.speed = new THREE.BufferAttribute(new Float32Array(number),1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number),1);
    function rand(a,b){
      return a + (b-a)*Math.random();
    }

    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {        
        this.positions.setXYZ(index,posX*2,(j-256)*2,0)
        this.coordinates.setXYZ(index,i,j,0)
        this.offset.setX(index,rand(-1000,1000))
        this.speed.setX(index,rand(0.4,1))
        index++;
      }      
    }

    this.geometry.setAttribute("position",this.positions)
    this.geometry.setAttribute("aCoordinates",this.coordinates)
    this.geometry.setAttribute("aSpeed",this.speed)
    this.geometry.setAttribute("aOffset",this.offset)
    this.mesh = new THREE.Points( this.geometry, this.material );
	  this.scene.add( this.mesh );
  }

  render(){
    this.time++;
    // this.mesh.rotation.x += 0.01;
	  // this.mesh.rotation.y += 0.02;    
	  this.material.uniforms.time.value = this.time;
	  this.material.uniforms.move.value = this.move;
    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch();