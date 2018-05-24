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
	var log = document.getElementById("log");

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
	var planeMaterial = new THREE.MeshLambertMaterial({color:0xFFFFFF});
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
	function addNegator(geometry, materials){
		o++;
		var object = new THREE.Mesh(geometry, materials);
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
		var object = new THREE.Mesh(geometry, materials);
		object.scale.set( 2.5, 2.5, 2.5);
		object.position.set( 0, -2, 0);
		object.rotation.set( 0, 0, 0);
		object.castShadow = true;
		object.name = "Andgate" + o;
		object.userData.connectedOnce = false;
		object.userData.input1 = 0;
		object.userData.input2 = 0;
		object.userData.output = function(){if(object.userData.input1 == 1 && object.userData.input2 == 1) return 1; else return 0;};
		objects.push(object);
		scene.add(object);
	}

	function addEndObject(geometry, materials){
		o++;
		var object = new THREE.Mesh(geometry, materials);
		object.material.color.setHex( 0x000000 );
		object.scale.set( 0.9, 0.9, 0.9);
		object.position.set( 0, -3, 0);
		object.rotation.set( 0, Math.PI, 0);
		object.castShadow = true;
		object.name = "EndObject" + o;
		object.userData.connectedOnce = false;
		object.userData.input = 0;
		object.userData.colour = function(){ if(object.userData.input == 1) object.material.color.setHex( 0xFFFF00 ); else object.material.color.setHex( 0x000000 ); };
		objects.push(object);
		scene.add(object);
	}

/*
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
*/
	//Sidebar with button functions
	document.getElementById("open").addEventListener ("click", openNav, false);
	document.getElementById("addMenu").addEventListener ("click", addObjects, false);
	document.getElementById("removeMenu").addEventListener ("click", removeObject, false);
	document.getElementById("connectMenu").addEventListener ("click", connectObjects, false);
	document.getElementById("back01").addEventListener ("click", goBack, false);
	document.getElementById("back02").addEventListener ("click", goBack, false);
	document.getElementById("back03").addEventListener ("click", goBack, false);
	document.getElementById("close").addEventListener ("click", closeNav, false);
	document.getElementById("close1").addEventListener ("click", closeNav, false);
	document.getElementById("close2").addEventListener ("click", closeNav, false);
	document.getElementById("close3").addEventListener ("click", closeNav, false);
		
	function openNav() {
		dragControls = new THREE.DragControls( objects, camera, renderer.domElement);
		controls.enabled = false;
		dragControls.activate();
		selectedObjects = [];
    	document.getElementById("mySidenav").style.width = "250px";
    	document.getElementById("open").style.display = "none";
    	camera.position.set( 0, 60, 0 );
    	camera.rotation.y = (-90 * Math.PI) / 180;
    	scene.add(axis);
		scene.add(grid);
		camera.lookAt(scene.position);
	}

	function addObjects(){
    	document.getElementById("mySidenav").style.width = "0";
    	document.getElementById("addObjects").style.width = "250px";

		document.getElementById("add_negator").onclick = function() {
			loader.load('./model/Negator.json', addNegator);
		};

		document.getElementById("add_andgate").onclick = function() {
			loader.load('./model/TwoInput.json', addAndGate); 
		};
	/*
		document.getElementById("add_nandgate").onclick = function() {
			loader.load('./model/TwoInputNegate.json', addNandGate); 
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
		*/
		document.getElementById("add_endobject").onclick = function() {
			loader.load('./model/endobject.json', addEndObject); 
		};
	}

	function removeObject(){
		dragControls.dispose();
		document.getElementById("mySidenav").style.width = "0";
		document.getElementById("removeObject").style.width = "250px";
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
		document.removeEventListener( 'mousedown', onDocumentMouseDown2, false );
		document.removeEventListener( 'mousedown', onDocumentMouseDown1, false );
		dragControls.dispose();
	   	controls.enabled = true;
		document.getElementById("removeObject").style.width = "0";
		document.getElementById("connectObjects").style.width = "0";
		document.getElementById("addObjects").style.width = "0";
	    document.getElementById("mySidenav").style.width = "0";
	    document.getElementById("open").style.display = "block";
	    scene.remove(axis);
		scene.remove(grid);
	    camera.position.set( 40, 40, -40 );
	}

	function connectObjects(){
		dragControls.dispose();
		document.getElementById("mySidenav").style.width = "0";
		document.getElementById("connectObjects").style.width = "250px";
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
		console.log(name);
		if(selectedObjects[0].userData.connectedOnce == true && selectedObjects[0].name.search("Andgate") + 1 == false){
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
			if(selectedObjects[0].position.x > selectedObjects[1].position.x){
				selectedObjects[0].userData.input1 = selectedObjects[1].userData.output();

				var vector1 = new THREE.Vector3( selectedObjects[0].position.x - 0.75, selectedObjects[0].position.y, selectedObjects[0].position.z);
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
				selectedObjects[0].userData.input2 = selectedObjects[1].userData.output();
				var vector1 = new THREE.Vector3( selectedObjects[0].position.x + 0.75, selectedObjects[0].position.y, selectedObjects[0].position.z);
				var vector2 = new THREE.Vector3( selectedObjects[1].position.x, selectedObjects[1].position.y, selectedObjects[1].position.z);

				geometry1.vertices.push(vector1);
				geometry1.vertices.push(vector2);
		
				var line = new THREE.Line( geometry1, material );
				line.name = "Line" + j;

				connectingLines.push(selectedObjects[0]);
				connectingLines.push(selectedObjects[1]);
				connectingLines.push(line);
				scene.add(line);
			}
			
		}
		j = j + 1;
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
							if(x == connectingLines[i]){
								var z = scene.getObjectByName(connectingLines[i+2].name);
								console.log(connectingLines[i+2].name);
								connectingLines.splice(i, 3);
								scene.remove(z);
								i = -3;
							}
							if(x == connectingLines[i+1]){
								var z = scene.getObjectByName(connectingLines[i+2].name);
								console.log(connectingLines[i+2].name);
								connectingLines.splice(i, 3);
								scene.remove(z);
								i = -3;
							}
						}
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
					connectingLines[i+2].geometry.vertices[0] = new THREE.Vector3( connectingLines[i].position.x, connectingLines[i].position.y + 1, connectingLines[i].position.z);
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x,  connectingLines[i].position.y + 1 , connectingLines[i].position.z + 2);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  connectingLines[i+1].position.y , connectingLines[i+1].position.z - 3);
					connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
				}
				/*else if(){
					connectingLines[i+2].geometry.vertices[0] = new THREE.Vector3( connectingLines[i].position.x - 0.75, connectingLines[i].position.y , connectingLines[i].position.z);
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x - 0.75, (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);
				}else if(connectingLines[i].position.x < connectingLines[i+1].geometry.vertices[0].x){
					connectingLines[i+2].geometry.vertices[0] = new THREE.Vector3( connectingLines[i].position.x + 0.75, connectingLines[i].position.y , connectingLines[i].position.z);
					connectingLines[i+2].geometry.vertices[1] = new THREE.Vector3( connectingLines[i].position.x + 0.75, (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i].position.z + 3);
					connectingLines[i+2].geometry.vertices[2] = new THREE.Vector3( connectingLines[i+1].position.x,  (connectingLines[i].position.y + connectingLines[i+1].position.y) / 2 , connectingLines[i+1].position.z - 3);	
				}*/
		connectingLines[i+2].geometry.vertices[3] = connectingLines[i+1].position;
		connectingLines[i+2].geometry.verticesNeedUpdate = true;
				
		}
	}
}

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