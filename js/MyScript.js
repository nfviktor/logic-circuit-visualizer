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
	var selectingCubes = [];
	var selectedObjects = [];
	var connectingLines = [];
	var logHelper = 1;
	var helpChanger = 0;

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
	var axis = new THREE.AxesHelper(10);
	axis.position.y = -2.45;
	
	var grid = new THREE.GridHelper(100, 50 , "rgb(255,0,0)");
	grid.position.y = -2.54;

	//Camera
	camera.position.set( 40, 40, 40 );
	camera.lookAt(scene.position);
	controls.enablePan = false;
	controls.update();

	//Plane geometry
	var planeGeometry = new THREE.PlaneGeometry(1000,1000,1000);
	var planeMaterial = new THREE.MeshLambertMaterial({color:0xAAAAAA});
	var plane = new THREE.Mesh(planeGeometry,planeMaterial);
	plane.position.y = -2.6;
	plane.rotation.x = -0.5*Math.PI;
	plane.receiveShadow = true;
	scene.add(plane);

	//-import rész
	var loader = new THREE.JSONLoader();
	var o = 0;
	// zarojelbe 1. az eleresi ut, a 2. a callback function!
	//loader.load('./model/Wood2.json', addModel);

	function addInput(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/AndGate.png') });
		console.log(materials1);
		geometry.computeMorphNormals();
		materials1.morphTargets = true;
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 1.5, 1.5, 1.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( Math.PI, Math.PI, Math.PI);
		object.castShadow = true;
		object.name = "InputSwitch" + o;
		object.userData.out = 0;
		object.userData.setOutput = function(){if(object.userData.out == 0) {object.userData.out = 1 ;}else object.userData.out = 0; };
		object.userData.output = function(){return object.userData.out;};
		objects.push(object);
		scene.add(object);
	}

	function addNegator(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/Negator.png') });
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2, 2, 2);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "Negator" + o;
		object.userData.connectedOnce = false;
		object.userData.input = 0;
		object.userData.output = function(){if(object.userData.input == 1) return 0; else return 1;};
		objects.push(object);
		scene.add(object);
	}

	function addAndGate(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/AndGate.png') });
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "AndGate" + o;

		object.userData.connectedOnce = false;

		object.userData.leftPin = [];
		object.userData.leftPin.setposition = function(){ 
			object.userData.leftPin.position = new THREE.Vector3(object.position.x - 0.68 , object.position.y , object.position.z );
			return object.userData.leftPin.position;
		};
		object.userData.leftPin.connectedOnce = false;
		object.userData.leftPin.input = 0;
		object.userData.leftPin.name = "Leftinput";

		object.userData.rightPin = [];
		object.userData.rightPin.setposition = function(){ 
			object.userData.rightPin.position = new THREE.Vector3(object.position.x + 0.68 , object.position.y, object.position.z );
			return object.userData.rightPin.position;
		};
		object.userData.rightPin.connectedOnce = false;
		object.userData.rightPin.input = 0;
		object.userData.rightPin.name = "Rightinput";

		object.userData.output = function(){if(object.userData.leftPin.input == 1 && object.userData.rightPin.input == 1) return 1; else return 0;};
		objects.push(object);
		scene.add(object);
	}

	function addNandGate(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/AndGate.png') });
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "NandGate" + o;

		object.userData.connectedOnce = false;

		object.userData.leftPin = [];
		object.userData.leftPin.setposition = function(){ 
			object.userData.leftPin.position = new THREE.Vector3(object.position.x - 0.68 , object.position.y , object.position.z );
			return object.userData.leftPin.position;
		};
		object.userData.leftPin.connectedOnce = false;
		object.userData.leftPin.input = 0;
		object.userData.leftPin.name = "Leftinput";

		object.userData.rightPin = [];
		object.userData.rightPin.setposition = function(){ 
			object.userData.rightPin.position = new THREE.Vector3(object.position.x + 0.68 , object.position.y, object.position.z );
			return object.userData.rightPin.position;
		};
		object.userData.rightPin.connectedOnce = false;
		object.userData.rightPin.input = 0;
		object.userData.rightPin.name = "Rightinput";

		object.userData.output = function(){if(object.userData.leftPin.input == 1 && object.userData.rightPin.input == 1) return 0; else return 1;};
		objects.push(object);
		scene.add(object);
	}

	function addOrGate(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/OrGate.png') });
		materials1.side = THREE.DoubleSide;
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "OrGate" + o;

		object.userData.connectedOnce = false;

		object.userData.leftPin = [];
		object.userData.leftPin.setposition = function(){ 
			object.userData.leftPin.position = new THREE.Vector3(object.position.x - 0.68 , object.position.y , object.position.z );
			return object.userData.leftPin.position;
		};
		object.userData.leftPin.connectedOnce = false;
		object.userData.leftPin.input = 0;
		object.userData.leftPin.name = "Leftinput";

		object.userData.rightPin = [];
		object.userData.rightPin.setposition = function(){ 
			object.userData.rightPin.position = new THREE.Vector3(object.position.x + 0.68 , object.position.y, object.position.z );
			return object.userData.rightPin.position;
		};
		object.userData.rightPin.connectedOnce = false;
		object.userData.rightPin.input = 0;
		object.userData.rightPin.name = "Rightinput";

		object.userData.output = function(){if(object.userData.leftPin.input == 1 || object.userData.rightPin.input == 1) return 1; else return 0;};
		objects.push(object);
		scene.add(object);
	}

	function addNorGate(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/OrGate.png') });
		materials1.side = THREE.DoubleSide;
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "NorGate" + o;

		object.userData.connectedOnce = false;

		object.userData.leftPin = [];
		object.userData.leftPin.setposition = function(){ 
			object.userData.leftPin.position = new THREE.Vector3(object.position.x - 0.68 , object.position.y , object.position.z );
			return object.userData.leftPin.position;
		};
		object.userData.leftPin.connectedOnce = false;
		object.userData.leftPin.input = 0;
		object.userData.leftPin.name = "Leftinput";

		object.userData.rightPin = [];
		object.userData.rightPin.setposition = function(){ 
			object.userData.rightPin.position = new THREE.Vector3(object.position.x + 0.68 , object.position.y, object.position.z );
			return object.userData.rightPin.position;
		};
		object.userData.rightPin.connectedOnce = false;
		object.userData.rightPin.input = 0;
		object.userData.rightPin.name = "Rightinput";

		object.userData.output = function(){if(object.userData.leftPin.input == 1 || object.userData.rightPin.input == 1) return 1; else return 0;};
		objects.push(object);
		scene.add(object);
	}

	function addXorGate(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/XorGate.png') });
		materials1.side = THREE.DoubleSide;
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "XorGate" + o;

		object.userData.connectedOnce = false;

		object.userData.leftPin = [];
		object.userData.leftPin.setposition = function(){ 
			object.userData.leftPin.position = new THREE.Vector3(object.position.x - 0.68 , object.position.y , object.position.z );
			return object.userData.leftPin.position;
		};
		object.userData.leftPin.connectedOnce = false;
		object.userData.leftPin.input = 0;
		object.userData.leftPin.name = "Leftinput";

		object.userData.rightPin = [];
		object.userData.rightPin.setposition = function(){ 
			object.userData.rightPin.position = new THREE.Vector3(object.position.x + 0.68 , object.position.y, object.position.z );
			return object.userData.rightPin.position;
		};
		object.userData.rightPin.connectedOnce = false;
		object.userData.rightPin.input = 0;
		object.userData.rightPin.name = "Rightinput";

		object.userData.output = function(){if(object.userData.leftPin.input == 1 || object.userData.rightPin.input == 1) return 1; else return 0;};
		objects.push(object);
		scene.add(object);
	}

	function addEndObject(geometry, materials){
		o++;
		var materials1 = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('./model/Textures/EndObjectOff.png') });
		materials1.side = THREE.DoubleSide;
		var object = new THREE.Mesh(geometry, materials1);
		object.scale.set( 2, 2, 2);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "EndObject" + o;
		object.userData.connectedOnce = false;
		object.userData.input = 0;
		object.userData.material1 = THREE.ImageUtils.loadTexture( './model/Textures/EndObjectOn.png' ); ;
		object.userData.material2 = THREE.ImageUtils.loadTexture( './model/Textures/EndObjectOff.png' );
		object.userData.colour = function(){ 
			if(object.userData.input == 1){
				object.material.map = object.userData.material1; 
				object.material.needsUpdate = true;
			}else if(object.userData.input == 0){
				object.material.map = object.userData.material2;
				object.material.needsUpdate = true;
			};
		}
		objects.push(object);
		scene.add(object);
	}


	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//Sidebar with button functions
	document.getElementById("EditMode").addEventListener ("click", openNav, false);
	document.getElementById("ViewMode").addEventListener ("click", closeNav, false);
	document.getElementById("addMenu").addEventListener ("click", addObjects, false);
	document.getElementById("removeMenu").addEventListener ("click", removeObject, false);
	document.getElementById("connectMenu").addEventListener ("click", connectObjects, false);
	document.getElementById("back01").addEventListener ("click", goBack, false);
	document.getElementById("back02").addEventListener ("click", goBack, false);
	document.getElementById("back03").addEventListener ("click", goBack, false);

	//Helpbar with button functions
	document.getElementById("hide").addEventListener ("click", closeHelpBar, false);
	document.getElementById("openHelp").addEventListener ("click", openHelpBar, false);

	function openHelpBar() {
		document.getElementById("helpRead").style.width = "220px";
		document.getElementById("openHelp").style.width = "0";
	}

	function closeHelpBar() {
		document.getElementById("helpRead").style.width = "0";
		document.getElementById("openHelp").style.width = "100px";
	}
	
	function openNav() {
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement);
		controls.enabled = false;
		dragControls.activate();
		selectedObjects = [];
    	document.getElementById("chooseMenu").style.width = "220px";
    	camera.position.set( 0, 60, 0 );
    	camera.rotation.y = (-90 * Math.PI) / 180;
    	scene.add(axis);
		scene.add(grid);
		camera.lookAt(scene.position);
		document.addEventListener( 'mousedown', onDocumentMouseDown3, false );
	}

	function addObjects(){
    	document.getElementById("chooseMenu").style.width = "0";
    	document.getElementById("addObjects").style.width = "220px";

    	document.getElementById("add_input").onclick = function() {
    		loader.load('./model/InputObjectJoinedTextured001.json', addInput);
    	};

		document.getElementById("add_negator").onclick = function() {
			loader.load('./model/NegatorJoinedTextured001.json', addNegator);
		};

		document.getElementById("add_andgate").onclick = function() {
			loader.load('./model/AndGateJoinedTextured001.json', addAndGate); 
		};
	
		document.getElementById("add_nandgate").onclick = function() {
			loader.load('./model/NandGateJoinedTextured001.json', addNandGate); 
		};

		document.getElementById("add_orgate").onclick = function() {
			loader.load('./model/OrGateJoinedTextured001.json', addOrGate); 
		};	

		document.getElementById("add_norgate").onclick = function() {
			loader.load('./model/NorGateJoinedTextured001.json', addNorGate); 
		};

		document.getElementById("add_xorgate").onclick = function() {
			loader.load('./model/XorGateJoinedTextured001.json', addXorGate); 
		};
		
		document.getElementById("add_endobject").onclick = function() {
			loader.load('./model/EndObjectJoinedTextured001.json', addEndObject); 
		};
	}

	function removeObject(){
		dragControls.dispose();
		document.getElementById("chooseMenu").style.width = "0";
		document.getElementById("removeObject").style.width = "220px";
		document.addEventListener( 'mousedown', onDocumentMouseDown1, false );
	}

	function goBack(){
		dragControls.dispose();
		document.removeEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
		document.getElementById("addObjects").style.width = "0";
		openNav();
	}

	function closeNav() {
		document.removeEventListener( 'mousedown', onDocumentMouseDown3, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		dragControls.dispose();
	   	controls.enabled = true;
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
		document.getElementById("addObjects").style.width = "0";
	    document.getElementById("chooseMenu").style.width = "0";
	    scene.remove(axis);
		scene.remove(grid);
	    camera.position.set( 40, 40, -40 );
	}

	function connectObjects(){
		dragControls.dispose();
		document.getElementById("chooseMenu").style.width = "0";
		document.getElementById("connectObjects").style.width = "220px";
		document.addEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.getElementById("connectButton").addEventListener ("click", connectThem , false);
	}

	function connectThem(){
		drawLine();
		selectedObjects = [];
	}

	function drawLine(){
		var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
		var geometry1 = [];
		geometry1 = new THREE.Geometry();

		var name = selectedObjects[0].name;
		if((name.search("Negator") + 1 == true && selectedObjects[0].userData.connectedOnce == true) ||  
			(name.search("EndObject") + 1 == true && selectedObjects[0].userData.connectedOnce == true)){
			for(var i = 0; i < connectingLines.length; i=i+3){
				if(selectedObjects[0] == connectingLines[i]){
					var z = scene.getObjectByName(connectingLines[i+2].name);
					console.log(connectingLines[i+2].name);
					connectingLines.splice(i, 3);
					scene.remove(z);
					i = -3;
				}
			}
		}
		
		if(name.search("Negator") + 1 == true){
			selectedObjects[0].userData.input = selectedObjects[1].userData.output();
			selectedObjects[0].userData.connectedOnce = true;

			var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
			var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

			geometry1.vertices.push(vector1);
			geometry1.vertices.push(vector2);
		
			var line = new THREE.Line( geometry1, material );
			line.name = "Line" + j;

			connectingLines.push(selectedObjects[0]);
			connectingLines.push(selectedObjects[1]);
			connectingLines.push(line);
			scene.add(line);

		}else if(name.search("EndObject") + 1 == true){
			selectedObjects[0].userData.input = selectedObjects[1].userData.output();
			selectedObjects[0].userData.colour();
			selectedObjects[0].userData.connectedOnce = true;
			
			var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
			var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

			geometry1.vertices.push(vector1);
			geometry1.vertices.push(vector2);
		
			var line = new THREE.Line( geometry1, material );
			line.name = "Line" + j;

			connectingLines.push(selectedObjects[0]);
			connectingLines.push(selectedObjects[1]);
			connectingLines.push(line);
			scene.add(line);

		}else{
			console.log(selectedObjects[0].userData.leftPin, selectedObjects[0].userData.rightPin);
			var num1 = selectedObjects[0].userData.leftPin.setposition();
			var num2 = selectedObjects[0].userData.rightPin.setposition();
			var distance1 = 0;
			var distance2 = 0;
			distance1 = Math.abs(num1.x - selectedObjects[1].position.x);
			distance2 = Math.abs(num2.x - selectedObjects[1].position.x);

			console.log(distance1, distance2);
			
			if(selectedObjects[0].userData.leftPin.connectedOnce == false && selectedObjects[0].userData.rightPin.connectedOnce == false){
				if(distance1 < distance2){
					var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
					var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

					geometry1.vertices.push(vector1);
					geometry1.vertices.push(vector2);
		
					var line = new THREE.Line( geometry1, material );
					line.name = "Line" + j;
					
					selectedObjects[0].userData.leftPin.connectedOnce = true;
					console.log(selectedObjects[0].userData.leftPin.connectedOnce);
					connectingLines.push(selectedObjects[0].userData.leftPin);
					connectingLines.push(selectedObjects[1]);
					connectingLines.push(line);
					scene.add(line);

				}else if(distance1 > distance2){
					var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
					var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

					geometry1.vertices.push(vector1);
					geometry1.vertices.push(vector2);
		
					var line = new THREE.Line( geometry1, material );
					line.name = "Line" + j;

					selectedObjects[0].userData.rightPin.connectedOnce = true;
					connectingLines.push(selectedObjects[0].userData.rightPin);
					connectingLines.push(selectedObjects[1]);
					connectingLines.push(line);
					scene.add(line);
				}
			}else if(selectedObjects[0].userData.leftPin.connectedOnce == true && selectedObjects[0].userData.rightPin.connectedOnce == false){
				var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
				var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

				geometry1.vertices.push(vector1);
				geometry1.vertices.push(vector2);
		
				var line = new THREE.Line( geometry1, material );
				line.name = "Line" + j;
				
				selectedObjects[0].userData.rightPin.connectedOnce = true;
				connectingLines.push(selectedObjects[0].userData.rightPin);
				connectingLines.push(selectedObjects[1]);
				connectingLines.push(line);
				scene.add(line);
			}else if(selectedObjects[0].userData.leftPin.connectedOnce == false && selectedObjects[0].userData.rightPin.connectedOnce == true){
				var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
				var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

				geometry1.vertices.push(vector1);
				geometry1.vertices.push(vector2);
		
				var line = new THREE.Line( geometry1, material );
				line.name = "Line" + j;
				
				selectedObjects[0].userData.leftPin.connectedOnce = true;
				connectingLines.push(selectedObjects[0].userData.leftPin);
				connectingLines.push(selectedObjects[1]);
				connectingLines.push(line);
				scene.add(line);
			}else if(selectedObjects[0].userData.leftPin.connectedOnce == true && selectedObjects[0].userData.rightPin.connectedOnce == true){
				if(distance1 < distance2){

					for(var i = 0; i < connectingLines.length; i=i+3){
						if(selectedObjects[0].userData.leftPin == connectingLines[i]){
							var z = scene.getObjectByName(connectingLines[i+2].name);
							console.log(connectingLines[i+2].name);
							connectingLines.splice(i, 3);
							scene.remove(z);
							i = -3;
						}
					}

					var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
					var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

					geometry1.vertices.push(vector1);
					geometry1.vertices.push(vector2);
		
					var line = new THREE.Line( geometry1, material );
					line.name = "Line" + j;

					selectedObjects[0].userData.leftPin.connectedOnce = true;
					connectingLines.push(selectedObjects[0].userData.leftPin);
					connectingLines.push(selectedObjects[1]);
					connectingLines.push(line);
					scene.add(line);

				}else if(distance1 > distance2){

					for(var i = 0; i < connectingLines.length; i=i+3){
						if(selectedObjects[0].userData.rightPin == connectingLines[i]){
							var z = scene.getObjectByName(connectingLines[i+2].name);
							console.log(connectingLines[i+2].name);
							connectingLines.splice(i, 3);
							scene.remove(z);
							i = -3;
						}
					}
					var vector1 = new THREE.Vector3( selectedObjects[0].position.x, selectedObjects[0].position.y, selectedObjects[0].position.z);
					var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

					geometry1.vertices.push(vector1);
					geometry1.vertices.push(vector2);
		
					var line = new THREE.Line( geometry1, material );
					line.name = "Line" + j;

					selectedObjects[0].userData.rightPin.connectedOnce = true;
					connectingLines.push(selectedObjects[0].userData.rightPin);
					connectingLines.push(selectedObjects[1]);
					connectingLines.push(line);
					scene.add(line);
				}
			}	
		}
		j = j + 1;
	}
}

function onDocumentMouseDown3( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ){
					var x = intersects[0].object;
						if(x.name.search("InputSwitch") + 1 == true){
							if(x.userData.out == 0){
								x.userData.setOutput();
								x.morphTargetInfluences[0] = 0;
								x.morphTargetInfluences[31] = 1;
							}else{
								x.userData.setOutput();
								x.morphTargetInfluences[31] = 0;
								x.morphTargetInfluences[0] = 1;
							}
						}
					}
				}


function onDocumentMouseDown1( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				raycaster.setFromCamera( mouse, camera );
				var intersects = raycaster.intersectObjects( objects );
				if ( intersects.length > 0 ){
					x = intersects[0].object;
					for(var i = 0; i < connectingLines.length; i=i+3){
						if(connectingLines[i] !== undefined){
							if(x == connectingLines[i] || x.userData.rightPin == connectingLines[i] || x.userData.leftPin == connectingLines[0]){
								var z = scene.getObjectByName(connectingLines[i+2].name);
								connectingLines.splice(i, 3);
								scene.remove(z);
								i = -3;
							}
							if(x == connectingLines[i+1]){
								if(connectingLines[i].name.search("Negator") + 1 == true || connectingLines[i].name.search("EndObject") + 1 == true){
									connectingLines[i].userData.input = 0;
									if(connectingLines[i].name.search("EndObject") + 1 == true)
										connectingLines[i].userData.colour();
								}else if(connectingLines[i].name.search("Leftinput") + 1 == true || connectingLines[i].name.search("Rightinput") + 1 == true){
									connectingLines[i].input = 0;
								}
								var z = scene.getObjectByName(connectingLines[i+2].name);
								connectingLines.splice(i, 3);
								scene.remove(z);
								i = -3;
							}
						}
					}
					scene.remove(intersects[0].object);
					objects = objects.filter(function(el) { return el.name !== x.name;});
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
			if(connectingLines[i].name.search("Negator") + 1 == true){
				connectingLines[i].userData.input = connectingLines[i+1].userData.output();
				connectingLines[i+2].geometry.vertices[0] = connectingLines[i].position;
				connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
				connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);
				connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				connectingLines[i+2].geometry.verticesNeedUpdate = true;
			}else if (connectingLines[i].name.search("EndObject") + 1 == true){
					connectingLines[i].userData.input = connectingLines[i+1].userData.output();
					connectingLines[i].userData.colour();
					connectingLines[i+2].geometry.vertices[0] = new THREE.Vector3( connectingLines[i].position.x, connectingLines[i].position.y , connectingLines[i].position.z);
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x,  connectingLines[i].position.y , connectingLines[i].position.z + 2);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  connectingLines[i+1].position.y , connectingLines[i+1].position.z - 2);
					connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				}
				else if(connectingLines[i].name.search("Leftinput") + 1 == true){
					connectingLines[i].input = connectingLines[i+1].userData.output();
					connectingLines[i+2].geometry.vertices[0] = connectingLines[i].setposition();
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x, (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);
					connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				}else if(connectingLines[i].name.search("Rightinput") + 1 == true){
					connectingLines[i].input = connectingLines[i+1].userData.output();
					connectingLines[i+2].geometry.vertices[0] = connectingLines[i].setposition();
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x, (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);
					connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				}else if(connectingLines[i].name.search("InputSwitch") + 1 == true){
					connectingLines[i].input = connectingLines[i+1].userData.output();
					connectingLines[i+2].geometry.vertices[0] = connectingLines[i].setposition();
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x, (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);
					connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				}
		connectingLines[i+2].geometry.verticesNeedUpdate = true;
				
		}
	}
}

function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function animate() {
    	requestAnimationFrame( animate );
    		raycaster.setFromCamera( mouse, camera );
			var intersects = raycaster.intersectObjects( objects );
			if ( intersects.length > 0 ) {
				if(logHelper==1){
					var name = intersects[0].object.name;
					var input = "";
					var output = "";
					if(name.search("Negator") + 1 == true){
						input = intersects[0].object.userData.input;
						output = intersects[0].object.userData.output();
					}else if(name.search("EndObject") + 1 == true){
						input = intersects[0].object.userData.input;
						output = "";
					}else if(name.search("InputSwitch") + 1 == true){
						input = "";
						output = intersects[0].object.userData.output();
					}else{
						input = '<br />Left In.: ' + intersects[0].object.userData.leftPin.input + '<br />Right In.: ' + intersects[0].object.userData.rightPin.input;
						output = intersects[0].object.userData.output();
					}
					var loggingText = document.createElement('span'); // is a node
					loggingText.innerHTML = 'Object name: '+intersects[0].object.name+
					'<br />'+'Object output: '+output+
					'<br />'+'Object Inputs: '+input;
					document.getElementById("log").appendChild(loggingText);
				}
				logHelper=2;
				document.getElementById("log").style.display = "block";
			}else{
				logHelper=1;
				document.getElementById("log").innerHTML = "";
				document.getElementById("log").style.display = "none";
			}

		if(document.getElementById("chooseMenu").style.width == "220px"){
			console.log("i see chooseMenu");
			document.getElementById("helpText").innerHTML = "Choose between Adding, Removing an object to the scene, or Connect objects together. ";
		}else if(document.getElementById("addObjects").style.width == "220px"){
			console.log("i see chooseMenu");
			document.getElementById("helpText").innerHTML = "Click on a button on the Sidebar to add an object to our Scene.";
		}else if(document.getElementById("removeObject").style.width == "220px"){
			console.log("i see Remove Objects");
			document.getElementById("helpText").innerHTML = "Click on an Object to remove it from the Scene. ";
		}else if(document.getElementById("connectObjects").style.width == "220px"){
			console.log("i see connect objects");
			document.getElementById("helpText").innerHTML = "Click on objects to Connect them together. 1. is  ";
		}else{
			document.getElementById("helpText").innerHTML = "You are in View Mode. <br />You can rotate the camera with left mouse button, and zoom with mouse wheel.";
		}
		

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