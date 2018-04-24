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
	var dragControls;

	init();
	animate();

// Initialize
function init(){
	window.addEventListener( 'resize', onWindowResize, false );
	
//LIGHTS
	var light = new THREE.HemisphereLight( 0xFFFFFF, 0xDDDDDD, 0.40 );
  	light.position.set( 0.5, 1, 0.75 );
  	scene.add( light );
	
	var lightAmbient = new THREE.AmbientLight( 0xAAAAAA ); // soft white light
	scene.add( lightAmbient );
	
	var spotLight = new THREE.SpotLight(0xFFFFFF, 2);
	spotLight.castShadow = true;
	spotLight.position.set(0,15,0);
	spotLight.shadow.mapSize.width = 2048;
	spotLight.shadow.mapSize.height = 2048;
	spotLight.shadow.camera.far = 3500;
	spotLight.shadow.bias = -0.0001;
	scene.add(spotLight);

//HELPERS
	var axis = new THREE.AxesHelper(5);
	axis.position.y = -2.8;
	
	var grid = new THREE.GridHelper(100, 20 , "rgb(255,0,0)");
	grid.position.y = -2.9;

//Camera
	camera.position.set( 40, 40, 40 );
	camera.lookAt(scene.position);
	controls.enablePan = false;
	controls.update();

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
	var i = 0;
	// zarojelbe 1. az eleresi ut, a 2. a callback function!
	//loader.load('./model/Wood2.json', addModel);
	function addModel(geometry, materials){
		i++;
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = i;
		objects.push(object);
		scene.add(object);
	}



//Sidebar with button functions
	document.getElementById("open").addEventListener ("click", openNav, false);
	document.getElementById("removeMenu").addEventListener ("click", removeObject, false);
	document.getElementById("connectMenu").addEventListener ("click", connectObjects, false);
	document.getElementById("back01").addEventListener ("click", goBack, false);
	document.getElementById("back02").addEventListener ("click", goBack, false);
	document.getElementById("close").addEventListener ("click", closeNav, false);
		
	function openNav() {
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement);
    	document.getElementById("mySidenav").style.width = "250px";
    	document.getElementById("open").style.display = "none";
    	controls.enabled = false;
    	dragControls.activate();
    	camera.position.set( 0, 70, 0 );
    	camera.rotation.y = (-90 * Math.PI) / 180;
    	scene.add(axis);
		scene.add(grid);
		camera.lookAt(scene.position);
	//Eger eventjei
		
    //Sidebar Gombok Eventje
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
	}

	function removeObject(){
		document.getElementById("mySidenav").style.width = "0";
		document.getElementById("removeObject").style.width = "250px";
		dragControls.dispose();
		document.addEventListener( 'mousedown', onDocumentMouseDown1, false );
	}

	function connectObjects(){
		document.getElementById("mySidenav").style.width = "0";
		document.getElementById("connectObjects").style.width = "250px";
		dragControls.dispose();
		document.getElementById("connectButton").addEventListener ("click",  , false);
	}

	function goBack(){
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
		openNav();
	}

	/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
	function closeNav() {
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		dragControls.dispose();
	   	controls.enabled = true;
	    document.getElementById("mySidenav").style.width = "0";
	    document.getElementById("open").style.display = "block";
	    scene.remove(axis);
		scene.remove(grid);
	    camera.position.set( 40, 40, -40 );
	}
}

//Mouse Events
function onDocumentMouseDown1( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ) {
					var x = intersects[0].object.name;
					scene.remove(intersects[0].object);
					objects = objects.filter(function(el) { return el.name !== x;});
				}
			}

function onDocumentMouseDown2( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ) {
					return intersects[0].object;
				}
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
		renderer.render( scene, camera );
}

$("#webGL-container").append(renderer.domElement);
renderer.render(scene,camera);
});