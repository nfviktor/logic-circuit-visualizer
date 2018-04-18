$(function(){

	

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight, 1, 1000);
	var renderer = new THREE.WebGLRenderer({antialias: true});
	var controls = new THREE.OrbitControls( camera );
	controls.maxPolarAngle = Math.PI / 2;

	renderer.setClearColor( 0x00BFFF );
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.soft = true;

// custom global variables
	var raycaster = new THREE.Raycaster();
	var objects = [];
	var mouse = new THREE.Vector2();

	init();
	animate();

// Initialize
	function init(){
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
	
	//LIGHTS
	/*
	var light = new THREE.HemisphereLight( 0x00BFFF, 0xeeeeee, 0.75 );
  	light.position.set( 0.5, 1, 0.75 );
  	scene.add( light );*/
	
	var lightAmbient = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( lightAmbient );
	
	var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
	//spotLight.castShadow = true;
	directionalLight.position.set(1,1,1);
	scene.add(directionalLight);

	//HELPERS
	var axis = new THREE.AxesHelper(5);
	axis.position.y = -3;
	scene.add(axis);

	var grid = new THREE.GridHelper(100, 20 , "rgb(255,0,0)");
	grid.position.y = -3;
	scene.add(grid);
	
	//Camera
	camera.position.set( 80, 80, 80 );
	camera.lookAt(scene.position);
	controls.update();

	//teszt drag controls
	/*
	var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
	dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
	dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );
	*/

	//Plane geometry
	var planeGeometry = new THREE.PlaneGeometry(1000,1000,1000);
	var planeMaterial = new THREE.MeshLambertMaterial({color:0x693109});
	var plane = new THREE.Mesh(planeGeometry,planeMaterial);
	plane.position.y = -3;
	plane.rotation.x = -0.5*Math.PI;
	plane.receiveShadow = true;
	scene.add(plane);

	//-import rész
	var loader = new THREE.JSONLoader();
	// zarojelbe 1. az eleresi ut, a 2. a callback function!
	//loader.load('./model/Wood2.json', addModel);

	function addModel(geometry, materials){
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 3, 3, 3);
		//Math.floor((Math.random() * 10) + 1); - return random number between 1-10;
		object.position.set(1,1,1);
		object.rotation.set(0.5*Math.PI , Math.PI / 2, Math.PI / 2);
		scene.add(object);
		objects.push(object);
	}

	//-Gombok Eventje
	document.getElementById("add_negator").onclick = function() {
		loader.load('./model/Negator.json', addModel); 
	};

	document.getElementById("add_andgate").onclick = function() {
		loader.load('./model/TwoInput.json', addModel); 
	};

	document.getElementById("add_nandgate").onclick = function() {
		loader.load('./model/TwoInputNegate.json', addModel); 
	};

	document.getElementById("add_orgate").onclick = function() {
		loader.load('./model/TwoInput.json', addModel); 
	};	

	document.getElementById("add_norgate").onclick = function() {
		loader.load('./model/TwoInputNegate.json', addModel); 
	};

	document.getElementById("add_xorgate").onclick = function() {
		loader.load('./model/TwoInput.json', addModel); 
	};
	
	document.getElementById("remove").onclick = function() {

	};

	document.getElementById("edit").onclick = function() {

	};
	
}

//Mouse Events
function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			}

function onDocumentMouseDown( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ) {
					console.log("THERE!!!");
				}
				console.log(mouse);
			}	

function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}	

//animate function
function animate() {
    	requestAnimationFrame( animate );
		render();		
		update();
}

function update(){	
		controls.update();
}

function render() {
		// find intersections
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( objects );
		if ( intersects.length > 0 ) {
			console.log("there");
		}
		renderer.render( scene, camera );
}
	

$("#webGL-container").append(renderer.domElement);
renderer.render(scene,camera);
});