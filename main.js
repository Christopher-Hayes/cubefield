var camera, scene, renderer;
var triangle; // the object the user controls("spaceship"), there is only one 'triangle' in CUBEfield!
var plane; // ground landscape floor w/e
var xSpeed; // x (side to side) speed of the triangle
var zOffset; // position of triangle
var camOffset; // camera offset is a little softer than xOffset
var stars;
var starSpeed;
var numCubes = 100;
var leftArrow, rightArrow;
var timeElapse;
var cubeAdd; // need a way to add cubes at a steady rate
var score;
var phase; // -1 = pre-game screen, 0 = pause, 1 = in-game, (post-game = pre-game)
var composer;
var level; // level of difficulty (increases as game goes on)
var levelBreak; // timer for time break between levels
var width, height;
var rotStart = 0;
var mCubes;     // array of Cube objects
// settings
var stnDiff = 0;    // difficulty   { rookie,   skilled,    master }
var stnBounce = 0;  // bounce       { none,     some,       too much }
var stnCam = 0;     // camera       { hawk,     chase,      1st person }
var stnBlock = 0;   // blocks       { normal,   falling,    pop up }
// UI
var uiNewGame   = document.getElementById( "newGame" );
var uiScore     = document.getElementById( "score" );
var uiHScore    = document.getElementById( "highScore" );
var uiInfo      = document.getElementById( "info" );
var uiSettings  = document.getElementById( "settings" );
var uiPause     = document.getElementById( "pause" );

init();
animate();

// --- INITIALIZATION ---------------------------------------------------------

function init() {
  // viewport
	width = window.innerWidth;
	height = window.innerHeight;
  // init members
	levelBreak = 0;
	level = 0;
	phase = -1;
	score = 0;
	camOffset = 0;
	timeElapse = new Date().getTime();
  totalElapse = 0;
	zOffset = 0;
	xSpeed = 0;
  leftArrow = rightArrow = false;
	mCubes = [];
	starSpeed = [];
	stars = [];

  // scene
	scene = new THREE.Scene();
	var light = new THREE.AmbientLight( 0xffffff ); // soft white light
	scene.add( light );

  // Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor( 0xffffff, 0 );
  renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );

  // Camera
	camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 1000 );
  camera.position.x = 0;
	camera.position.y = 0.25;  // 0.05   close-up
	camera.position.z = 2.0;   // 0.40   close-up

	// Ground plane
	var ground = new THREE.PlaneBufferGeometry(300, 75, 20);
	plane = new THREE.Mesh(ground, new THREE.MeshBasicMaterial({ color: 0xC8C8C8 }));
	plane.rotation.x += -0.5 * Math.PI;
	plane.position.y = -0.001;
	scene.add(plane);

	// Cubes
	for (var c = 0; c < numCubes; c++) {
    mCubes[ c ] = new Cube(scene);
  }

	// Player triangle
	var triGeo = new THREE.Geometry();

  // player triangle - vectors
	triGeo.vertices.push(
		new THREE.Vector3(  0.000, 0.000, -0.150 ),
		new THREE.Vector3( -0.017, 0.000,  0.040 ),
		new THREE.Vector3(  0.017, 0.000,  0.040 ),
		new THREE.Vector3(  0.000, 0.013,  0.020 )
	);
    // player triangle - push faces
	triGeo.faces.push( new THREE.Face3( 3, 0, 1 ) );
	triGeo.faces.push( new THREE.Face3( 1, 2, 3 ) );
	triGeo.faces.push( new THREE.Face3( 2, 0, 3 ) );
	triangle = new THREE.Mesh(triGeo, new THREE.MeshBasicMaterial({ color: 0x646464 }));
	triangle.position.y = -2.0;
	scene.add(triangle);

  // player triangle - edges
  var edgeGeo = new THREE.EdgesGeometry(triGeo);
	var edges = new THREE.LineSegments(edgeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
	scene.add(edges);

	// stars (level 2 background)
	initStars();

  // init ui
	uiScore.style.visibility = "hidden";
  document.getElementById("highScore").innerHTML = (Math.floor(getCookie() / 100) / 10).toString();

  setPreGame();
}

// Init stars
function initStars() {
  stars = [];

  // Texture/material
  var texture = new THREE.TextureLoader().load('assets/images/star.png');
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var geo = new THREE.BoxBufferGeometry(.5, .5, .1);

  // Build stars
  for (var i = 0; i < 10; i++) {
    starSpeed[i] = [];

    // Build mesh
    stars[i] = new THREE.Mesh(geo, material);

    // Set position/rotation
    stars[i].position.z = 5;
    stars[i].position.x = Math.random() * 20 - 10;
    stars[i].position.y = Math.random() * 10;
    stars[i].rotation.z = Math.random() * 2 * Math.PI;

    // Set velocity
    starSpeed[i][0] = Math.random() * 0.003 - 0.0015;
    starSpeed[i][1] = Math.random() * 0.003 - 0.0015;

    // Add to scene
    scene.add(stars[i]);
  }
}

// Set params/globals for new game
function gameReset() {
  // UI
  uiNewGame.style.visibility = "hidden";
  uiInfo.style.visibility = "hidden";
  uiScore.style.color = "#808080";
  uiScore.style.visibility = "visible";
	document.body.style.backgroundColor = "#A3A3A3";
  uiSettings.classList.remove( "settingsVis" );
  // Blur render
  document.querySelector('canvas').style.filter = 'blur(0px)';
    
	score = 0;
	// camOffset = 0;
	timeElapse = new Date().getTime();
	zOffset = 0;
	xSpeed = 0;
	triangle.position.y = 0.0;

  // cubes
	for( var c of mCubes ) {
    c.reset(stnBlock, true, stnDiff);
  }

  // hide stars
  for ( var s of stars ) {
    s.position.z = 5;
  }

  var k = Math.PI - ( this.camera.rotation.z % ( 2*Math.PI ));
  rotStart = ( Math.PI - Math.abs( k )) * Math.sign( k );
  totalElapse = 0;
	phase = 1; 
}

// Reset game upon finish
function setPreGame() {
  // UI
  uiScore.style.color = "black";
  document.body.style.backgroundColor = "#A3A3A3";
  // Show UI
  uiNewGame.style.visibility = "visible";
  uiInfo.style.visibility = "visible";
  uiSettings.classList.add( "settingsVis" );
  // Blur render
  document.querySelector('canvas').style.filter = 'blur(5px)';
  
  // cubes
  for (var c of mCubes) {
    c.updateDesign(0);
  }
  
  level = 0;
  plane.material.color.setHex( 0xC8C8C8 );

  // hide stars
  for (var s of stars) {
    s.position.z = 5;
  }
}

// level effects/shaders
function newLevel() {
  // Update level vars
	levelBreak = new Date().getTime();
	level++;

  // Update design of cubes
  for (var c of mCubes) {
    c.updateDesign(level % 5);
  }

  // Update design of plane (ground)
	switch (level % 5) {

		case 0:
			plane.material.color.setHex(0xC8C8C8);
			document.body.style.backgroundColor = "#FFFFFF";
      break;

		case 1:
			plane.material.color.setHex(0x000000);
			document.body.style.backgroundColor = "#000000";

      // show stars
      for (var s of stars) {
        s.position.z = -50;
      }
			break;

		case 2:
			plane.material.color.setHex( 0x969696 );
			document.body.style.backgroundColor = "#969696";

      // hide stars
      for( var s of stars ) {
        s.position.z = 5;
      }
			break;

		case 3:
			plane.material.color.setHex( 0xffffff );
      document.body.style.backgroundColor = "#FFFFFF";
			break;

		case 4:
			plane.material.color.setHex( 0x969696 );
      document.body.style.backgroundColor = "#969696";
	}
}

// --- GAME LOOP --------------------------------------------------------------
function animate() {
	requestAnimationFrame(animate);

  // Time elapsed
  var now = (new Date()).getTime();
	var elapse = now - timeElapse;
	timeElapse = now;
  var rate = elapse / 100;

  // Game state
	switch (phase) {

    // Pre-game
		case -1:
			// Demo mode in background
      xSpeed *= 0.99;
      camOffset *= 0.99;
      camera.rotation.z += 0.0005;
			updateCubes(rate * 0.2);
			break;

    // Pause
		case 0:
			break;

    // In-game
		case 1:  
      // --- User Input -------------------------------------------------------
      if (!rightArrow && !leftArrow) {
        // No arrow key input
        xSpeed *= 0.6 * rate;
      } else {
        // Arrow key input
        if (leftArrow) {
          xSpeed += 0.02 * rate;
        }
        if (rightArrow) {
          xSpeed -= 0.02 * rate;
        }
      }
      // Horizontal speed limits
      xSpeed = Math.max( -0.02, Math.min( 0.02, xSpeed ));

      // --- Z speed ----------------------------------------------------------
      zOffset += 0.1 * elapse / 15;

      // --- Scoring ----------------------------------------------------------
      score = zOffset * ( 10 + level * 5 );
      totalElapse += elapse;
      uiScore.innerHTML = (Math.round(totalElapse / 100) / 10).toString();

      // --- Camera -----------------------------------------------------------
      // Lean camera on left/right arrow
      camOffset += xSpeed * 0.1;
      if (!rightArrow && !leftArrow) {
        camOffset /= 1.3;
      }
      camOffset = Math.min( 0.02, Math.max( -0.02, camOffset ));

      // Camera rotation
      rotStart *= 0.98;
			camera.rotation.z = (camOffset / 0.03) * 0.05 * Math.PI + rotStart;

      // New level
			if ((level + 1) * 30000 < totalElapse) {
        newLevel();
      }

      // Break between levels (no cubes)
			if (levelBreak != -1 && now - levelBreak > 5000) {
				levelBreak = -1;
			}

			// Update position of cubes + add cubes or remove cubes
			updateCubes(elapse / 70);
	}

  // Update stars
	updateStars();

  // Render
  if (phase == 1) {
    renderer.setClearColor( 0xffffff, 0 );
    renderer.render( scene, camera );
  } else {
    renderer.setClearColor( 0xa3a3a3, 1 );
    renderer.render( scene, camera );
    // composer.render();
  }
}

// --- UPDATE -----------------------------------------------------------------

// UPDATE stars
function updateStars() {
  for (var s = 0; s < stars.length; s++) {
    // Reset position of stars that go out of bounds
    if (stars[ s ].position.x < -10 ||
        stars[ s ].position.x > 10 ||
        stars[ s ].position.y < 0 ||
        stars[ s ].position.y > 10 )
    {
      stars[ s ].position.x = Math.random() * 20 - 10;
      stars[ s ].position.y = Math.random() * 10;
    }
    // Update star position
    stars[ s ].position.x += starSpeed[ s ][ 0 ];
    stars[ s ].position.y += starSpeed[ s ][ 1 ];
    stars[ s ].rotation.z += 0.003;
  }
}

// UPDATE cubes
function updateCubes( elapse ) {
	for( var c of mCubes ) {
        var collision = c.update( elapse, levelBreak, level, stnBounce, stnBlock, stnDiff );
        if( phase == 1 && collision ) {
            logHighscore();
            phase = -1;
            setPreGame();
            break;
        }
    }
}

// UPDATE camera position
function setCam() {
    switch( stnCam ) {
        case 0:
            camera.position.x = 0;
            camera.position.y = 0.25;
            camera.position.z = 2.0;
            break;
        case 1:
            camera.position.x = 0;
            camera.position.y = 0.05;
            camera.position.z = 0.40;
            break;
        case 2:
            camera.position.x = 0;
            camera.position.y = 0.02;
            camera.position.z = 0.0;
    }
}
// --- EVENT HANDLING ---------------------------------------------------------

// Window Resize
document.addEventListener('resize', (e) => {
    width = window.innerWidth;
	height = window.innerHeight;
    // renderer
    renderer.setSize( width, height );
    // camera
	camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 1000 );
    setCam();
});

// Key Down
document.addEventListener('keydown', (e) => {
  if (e.keyCode == null) {
    // touch input event
    if( e.pageX > width * 0.5 ) {
      rightArrow = true;
    }else {
      leftArrow = true;
    }
  } else {
    // key input event
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 37 ) {
      leftArrow = true;
    }else if ( key == 39 ) {
       rightArrow = true;
    }else if ( key == 80 ) { // (p)ause
       pauseGameScreen();
    }
  }
});

// Key Up
document.addEventListener('keyup', (e) => {
  if (e.keyCode == null) {
    // touch input event
    rightArrow = false;
    leftArrow = false;
  } else {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 37) {
      leftArrow = false;
    } else if (key == 39) {
      rightArrow = false;
    }
  }
});
// pause screen
function pauseGameScreen() {
	if( phase == 0 ) {
		phase = 1;
        uiPause.style.visibility = "hidden";
        uiPause.style.opacity = 0.0;
	}else if( phase == 1 ) {
		phase = 0;
        uiPause.style.visibility = "visible";
        uiPause.style.opacity = 1.0;
	}
}
// return to menu mouse click at pause screen
function returnToMenu() {
    uiPause.style.opacity = 0.0;
    uiPause.style.visibility = "hidden";
    logHighscore();
    rotOffset = (new Date()).getTime() % 50000;
    phase = -1;
    setPreGame();
}

// --- SETTINGS ---------------------------------------------------------------

// Difficulty settings click event
function updateDiff (target) {
    stnDiff = target;
    var opt = document.getElementById( "difficulty" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
}

// Bounce settings click event
function updateBounce( target ) {
    stnBounce = target;
    var opt = document.getElementById( "bounce" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    
}
// camera settings click event
function updateCam( target ) {
    stnCam = target;
    var opt = document.getElementById( "camera" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    setCam();
}
// blocks settings click event
function updateBlock( target ) {
    stnBlock = target;
    var opt = document.getElementById( "block" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    for( var c of mCubes ) c.reset( stnBlock, false, stnDiff );
    document.getElementById( "bounce" ).style.opacity = target > 0 ? "1.0" : "0.0";
}

// --- COOKIE highscore logging -----------------------------------------------

// Log highscore
function logHighscore() {
	if( totalElapse > parseInt(getCookie()) || getCookie() == "" ) {
		setCookie( totalElapse );
		uiHScore.innerHTML = (Math.floor(totalElapse / 100) / 10).toString();
	}else {
		uiHScore.innerHTML = (Math.floor(getCookie() / 100) / 10).toString();
	}
}

// Set highscore cookie
function setCookie(score) {
    document.cookie = "highscore=" + score.toString() + "; ";
}

// Get highscore cookie
function getCookie() {
  var name = "highscore=";
  var ca = document.cookie.split(';');
  for (var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring( 1 );
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
