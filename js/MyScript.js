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
	var j = 0;
	var objects = [];
	var selectedObjects = [];
	var connectingLines = [];

	var raycaster = new THREE.Raycaster();
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
	var o = 0;
	// zarojelbe 1. az eleresi ut, a 2. a callback function!
	//loader.load('./model/Wood2.json', addModel);
	function addNegator(geometry, materials){
		o++;
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "Negator" + o;
		objects.push(object);
		scene.add(object);
	}

	function addAndGate(geometry, materials){
		o++;
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "Andgate" + o;
		objects.push(object);
		scene.add(object);
	}

	function addNandGate(geometry, materials){
		o++;
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "NandGate" + o;
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
	document.getElementById("close1").addEventListener ("click", closeNav, false);
	document.getElementById("close2").addEventListener ("click", closeNav, false);
		
	function openNav() {
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement);
		selectedObjects = [];
    	document.getElementById("mySidenav").style.width = "250px";
    	document.getElementById("open").style.display = "none";
    	controls.enabled = false;
    	dragControls.activate();
    	camera.position.set( 0, 70, 0 );
    	camera.rotation.y = (-90 * Math.PI) / 180;
    	scene.add(axis);
		scene.add(grid);
		camera.lookAt(scene.position);
		
    //Sidebar Gombok Eventje
		document.getElementById("add_negator").onclick = function() {
			loader.load('./model/Negator.json', addNegator);
		};

		document.getElementById("add_andgate").onclick = function() {
			loader.load('./model/TwoInput.json', addAndGate); 
		};
	
		document.getElementById("add_nandgate").onclick = function() {
			loader.load('./model/TwoInputNegate.json', addNandGate); 
		};
/*
		document.getElementById("add_orgate").onclick = function() {
			loader.load('./model/TwoInput.json', addModel); 
		};	

		document.getElementById("add_norgate").onclick = function() {
			loader.load('./model/TwoInputNegate.json', addModel); 
		};

		document.getElementById("add_xorgate").onclick = function() {
			loader.load('./model/TwoInput.json', addModel); 
		};
		*/
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
		document.addEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.getElementById("connectButton").addEventListener ("click", connectThem , false);
	}

	function connectThem(){
		/*console.log("Position of",selectedObjects[0].name , " : " ,selectedObjects[0].position);
		console.log("Position of",selectedObjects[1].name , " : " ,selectedObjects[1].position);*/
		drawLine();
		setInput(selectedObjects[0], selectedObjects[1]);
		//console.log(selectedObjects);
		selectedObjects = [];
	}

	function drawLine(){

		var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
		var geometry1 = [];
		geometry1 = new THREE.Geometry();

		var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
		geometry1.vertices.push(vector1);

		var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);
		geometry1.vertices.push(vector2);
		
		var line = new THREE.Line( geometry1, material );
		line.name = "Line" + j;
		connectingLines.push(selectedObjects[0]);
		connectingLines.push(selectedObjects[1]);
		connectingLines.push(line);
		j = j + 1;
		console.log(j);
		//console.log(connectingLines);
		scene.add(line);
	}

	function goBack(){
		document.removeEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
		openNav();
	}

	/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
	function closeNav() {
		document.removeEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		dragControls.dispose();
	   	controls.enabled = true;
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
	    document.getElementById("mySidenav").style.width = "0";
	    document.getElementById("open").style.display = "block";
	    scene.remove(axis);
		scene.remove(grid);
	    camera.position.set( 40, 40, -40 );
	}
	
	function setInput(output, input1){
		//Here goes something;
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
					console.log(connectingLines);
					console.log(connectingLines.length);
					for(var i = 0; i < connectingLines.length; i=i+3){
						if(x == connectingLines[i].name){
							console.log(connectingLines[i+2].name);
							var z = scene.getObjectByName(connectingLines[i+2].name);
							scene.remove(z)
							connectingLines.splice(i, 3);
							i = 0;
						}
						if(connectingLines[i+1].name !== undefined && x == connectingLines[i+1].name){
							var z = scene.getObjectByName(connectingLines[i+2].name);
							console.log(connectingLines[i+2].name);
							connectingLines.splice(i, 3);
							scene.remove(z);
							i = 0;
						}
						console.log(connectingLines);
					}

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
					if(selectedObjects.length < 1){
						selectedObjects[0] = intersects[0].object;
						console.log(selectedObjects);
					}else if(selectedObjects[0].name == intersects[0].object.name){
						console.log("Cant connect with itself!");
						console.log(selectedObjects);
					}else{
						selectedObjects[1] = selectedObjects[0];
						selectedObjects[0] = intersects[0].object;
						console.log(selectedObjects);
					}
				}
			}

function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}	

function onObjectMove(){
	if(connectingLines[0] === 0 || connectingLines[0] === undefined || connectingLines[0] === ""){

	}else{
		for(var i = 0; i < connectingLines.length; i=i+3){
			//console.log(i);
			//console.log(connectingLines.length);
			//console.log(connectingLines);
			//console.log(connectingLines[i+2].geometry.vertices);
			//console.log("Line1.",connectingLines[i+2].geometry.vertices[i]);
			//console.log("Line2",connectingLines[i+2].geometry.vertices[i+1]);
			//console.log("Position of First",connectingLines[i].position);
			//console.log("Position of First",connectingLines[i+1].position);

			connectingLines[i+2].geometry.vertices[0] = connectingLines[i].position;
			connectingLines[i+2].geometry.vertices[1] = connectingLines[i+1].position;
			connectingLines[i+2].geometry.verticesNeedUpdate = true;
		}
	}
}

//animate function
function animate() {
    	requestAnimationFrame( animate );
    	onObjectMove();
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