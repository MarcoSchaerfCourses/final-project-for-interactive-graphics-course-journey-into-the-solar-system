// import * as THREE from "./three.min";

var scene = new THREE.Scene();

var secondaryCamera, primaryCamera;
var ready = false;
var translate = true;
var rotateDX = true;
var c = 0;

var secondaryCameraActive = false;
var bullet;

var targetList = [];
var mouse = new THREE.Vector2();
var ray = new THREE.Raycaster();
var shot;
var gui = new dat.GUI();
var targetReached;
var source;
var parameters =
    {
        W: 'Forward',
        S: 'Backward',
        A: 'Left',
        D: 'Right',
        SPACEBAR: 'Reset',
        1: 'Primary Camera',
        4: 'Activate Radar',
        R: 'Fire!',
        f: function () {
            alert("Click on a planet to discover its name!")
        },

    };



// create a global audio source
var sound = new THREE.Audio( new THREE.AudioListener());

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();
audioLoader.load( 'img/starwars.ogg', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop(true);
    sound.setVolume(0.5);

});

gui.add(parameters, 'W').name('W');
gui.add(parameters, 'S').name('S');
gui.add(parameters, 'A').name('A');
gui.add(parameters, 'D').name('D');
gui.add(parameters, 'SPACEBAR').name('SPACEBAR');
gui.add(parameters, 'R').name('R');
gui.add(parameters, '1').name('1');
gui.add(parameters, '4').name('4');

gui.add(parameters, 'f').name('Tip');
gui.open();

// To create a stars background

var starsGeometry = new THREE.Geometry();

for (var i = 0; i < 400000; i++) {

    var star = new THREE.Vector3();
    star.x = THREE.Math.randFloatSpread(2000);
    star.y = THREE.Math.randFloatSpread(2000);
    star.z = THREE.Math.randFloatSpread(2000);

    starsGeometry.vertices.push(star);

}

var starsMaterial = new THREE.PointsMaterial({color: 0x888888});

var starField = new THREE.Points(starsGeometry, starsMaterial);

scene.add(starField);
scene.updateMatrixWorld(true);


//Primary Camera
primaryCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
scene.add(primaryCamera);
scene.updateMatrixWorld(true);
primaryCamera.position.set(0, 375, 1202);
primaryCamera.lookAt(new THREE.Vector3(0, 15, 0));

//Secondary Camera
var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 3000;
secondaryCamera = new THREE.PerspectiveCamera(60, ASPECT, NEAR, FAR);


var pointLight = new THREE.PointLight();

scene.add(pointLight);
scene.updateMatrixWorld(true);


var renderer = new THREE.WebGLRenderer({antialias: true});


// 40 to overcome the browser's scrolling problem
renderer.setSize(window.innerWidth - 40, window.innerHeight - 40);


document.body.appendChild(renderer.domElement);


function Planet(orbitRadius, texturePath, incr, radius, name) {
    var lineMaterial = new THREE.LineBasicMaterial({color: 'aqua'});
    var lineGeometry = new THREE.CircleGeometry(orbitRadius, 1000);
    lineGeometry.vertices.shift();
    this.line = new THREE.Line(lineGeometry, lineMaterial);
    this.line.rotation.x = THREE.Math.degToRad(90);

    this.texture = new THREE.TextureLoader().load(texturePath);

    this.geometry = new THREE.SphereGeometry(radius, 100, 100);
    this.material = new THREE.MeshLambertMaterial({map: this.texture});
    this.planet = new THREE.Mesh(this.geometry, this.material);
    this.position = this.planet.position;
    this.position.set(orbitRadius, 0, 0);
    this.rotation = this.planet.rotation;
    this.orbitRadius = orbitRadius;
    this.date = 0;
    this.clicked = false;
    this.incr = incr;
    this.planet.name = name;

    this.planet.callback = function () {
        console.log(planet.name);
    }
}


function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;



    ray.setFromCamera(mouse, primaryCamera);

    var intersects = ray.intersectObjects(targetList);

    clickedPlanet = intersects[0].object;

    if (clickedPlanet != null) {
        var currentPlanet = scene.getObjectByName(clickedPlanet.name);
        var text = '';
        if (!clickedPlanet.clicked) {
            var loader = new THREE.FontLoader();
            loader.load('HelveticaNeueRegular.json', function (font) {
                var textGeometry = new THREE.TextGeometry(clickedPlanet.name, {

                    font: font,
                    size: 50,
                    height: 10,

                });

                text = new THREE.Mesh(textGeometry);
                currentPlanet.add(text);
                text.translateY(100);
                currentPlanet.clicked = true;
                clickedPlanet.clicked = true;

            });
        } else {
            if (currentPlanet.name == 'saturn') {
                currentPlanet.remove(currentPlanet.children[1]);
            } else {
                currentPlanet.remove(currentPlanet.children[0]);
            }
            clickedPlanet.clicked = false;
        }


    }

}

function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
}

document.addEventListener('mousedown', onDocumentMouseDown, false);

var sunGeometry = new THREE.SphereGeometry(100, 100, 100);
var sunTexture = new THREE.TextureLoader().load('img/sun.jpg');
var sunMaterial = new THREE.MeshBasicMaterial({map: sunTexture});
var sun = new THREE.Mesh(sunGeometry, sunMaterial);

var earth = new Planet(200, 'img/earth.jpeg', 0.005, 8, 'earth');
var mercury = new Planet(140, 'img/mercury.jpeg', 0.008, 3, 'mercury');
var venus = new Planet(172, 'img/venus.jpeg', 0.006, 7, 'venus');
var mars = new Planet(352, 'img/mars.jpeg', 0.0041, 4, 'mars');
var jupiter = new Planet(518, 'img/jupiter.jpeg', 0.0022, 88, 'jupiter');

var saturn = new Planet(650, 'img/saturn.jpeg', 0.00155, 73, 'saturn');
var ringGeometry = new THREE.RingGeometry(85, 110, 32);
var ringTexture = new THREE.TextureLoader().load('img/saturnRings.png');
var ringMaterial = new THREE.MeshLambertMaterial({map: ringTexture, side: THREE.DoubleSide});
var ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = 2;
saturn.planet.add(ring);

var uranus = new Planet(800, 'img/uranus.jpeg', 0.00115, 31, 'uranus');
var neptune = new Planet(900, 'img/neptune.jpeg', 0.0009, 30, 'neptune');
var points = [];

for (var i = 0; i < 10; i++) {
    points.push(new THREE.Vector2(i ^ 3, (i - 5) * 2))
}

var planets = [earth, mercury, venus, mars, jupiter, saturn, uranus, neptune];

for (var p in planets) {
    var planet = planets[p];
    scene.add(planet.planet);
    scene.add(planet.line);
    scene.updateMatrixWorld(true);
    targetList.push(planet.planet);
}
scene.add(sun);
scene.updateMatrixWorld(true);


var mtlLoader = new THREE.MTLLoader();
var radarGeometry = new THREE.BoxGeometry(40, 15, 15);
var radarTexture = new THREE.TextureLoader().load('img/gun.jpg');
var radarMaterial = new THREE.MeshBasicMaterial({map:radarTexture});
var radar = new THREE.Mesh(radarGeometry, radarMaterial);
var radarEnd = new THREE.Mesh(new THREE.LatheGeometry(points, 500), new THREE.MeshBasicMaterial({map:radarTexture}));


var deathStarGroup = new THREE.Object3D();

var activateRadar = false;
var firstTimeRadar = true;
var count = 0;

mtlLoader.load('/solar_system/death-star.mtl', function (materials) {
    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('/solar_system/death-star.obj', function (object) {

            object.position.y += 200;
            object.scale.set(100, 100, 100);
            object.name = 'deathStar';
            radar.position.y = object.position.y;
            radar.rotation.z = (Math.PI / 2);
            radar.rotation.x = -(Math.PI / 2);
            radarEnd.scale.set(0.75, 0.75, 0.75);
            radarEnd.position.x = 25;
            radarEnd.rotation.z = Math.PI / 2;
            radarEnd.name = 'radarend';
            radar.name = 'radar';
            radar.add(radarEnd);
            deathStarGroup.add(object);
            deathStarGroup.add(radar);
            deathStarGroup.name = 'deathstargroup';

            scene.add(deathStarGroup);
            scene.updateMatrixWorld(true);
            ready = true;

        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
        });

});

requestAnimationFrame(render);

var controls = new THREE.OrbitControls(primaryCamera, renderer.domElement);
controls.target = new THREE.Vector3(0, 15, 0);
controls.maxPolarAngle = Math.PI / 2;

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var bullets = [];

function update() {
    var deathStar = scene.getObjectByName('deathstargroup');
    var delta = clock.getDelta();
    var moveDistance = 200 * delta;

    if (keyboard.pressed('R')) {
        deathStar.position.set(0, 200, 0);
    }
    if (secondaryCameraActive) {
        if (keyboard.pressed('W'))
            deathStar.translateZ(-moveDistance);
        if (keyboard.pressed('S'))
            deathStar.translateZ(moveDistance);
        if (keyboard.pressed('A'))
            deathStar.translateX(-moveDistance);
        if (keyboard.pressed("D"))
            deathStar.translateX(moveDistance);
        if (keyboard.pressed("up"))
            deathStar.translateY(moveDistance);
        if (keyboard.pressed("down"))
            deathStar.translateY(-moveDistance);
    } else {
        if (keyboard.pressed('W'))
            deathStar.translateY(moveDistance);
        if (keyboard.pressed('S'))
            deathStar.translateY(-moveDistance);
        if (keyboard.pressed('A'))
            deathStar.translateX(-moveDistance);
        if (keyboard.pressed("D"))
            deathStar.translateX(moveDistance);
        if (keyboard.pressed("up")) {
            deathStar.translateZ(-moveDistance);
        }
        if (keyboard.pressed("down")) {
            deathStar.translateZ(moveDistance);
        }
    }

    if (ready) {
        secondaryCamera.position.set(deathStar.position.x, deathStar.position.y + 275, deathStar.position.z);
        secondaryCamera.rotation.x = -(Math.PI / 8);
        rotationValue = 0.01;
        if (activateRadar) {
            if (translate) {
                secondaryCameraActive = true;
                sound.play();
                if (count < 550) {
                    count += 1;
                    radar.translateX(0.1);
                } else {
                    translate = false;
                }
            } else {
                // FIRST ROTATION
                if (firstTimeRadar && c < Math.PI / 4) {
                    c += rotationValue;
                    radarEnd.rotation.z -= rotationValue;
                } else if (firstTimeRadar) {
                    firstTimeRadar = false;
                }

                if (!firstTimeRadar && rotateDX) {
                    c += rotationValue;
                    radarEnd.rotation.z -=rotationValue;
                    if (c > Math.PI / 4) {
                        rotateDX = false;
                    }
                } else if (!firstTimeRadar && !rotateDX) {
                    c -= rotationValue;
                    radarEnd.rotation.z += rotationValue;
                    if (c < -Math.PI / 4) {
                        rotateDX = true;
                    }
                }
            }
        }
    }

    if (keyboard.pressed("1")) {
        secondaryCameraActive = false;
        controls.enabled = true;
    }
    if (keyboard.pressed("2")) {
        secondaryCameraActive = true;
        controls.enabled = false;
    }
    if (keyboard.pressed('4')) {
        activateRadar = true;
    }

    if (keyboard.pressed('space') && secondaryCameraActive && activateRadar) {
        shot = true;
        targetReached = false;
        bullet = new THREE.Mesh(new THREE.SphereGeometry(2),
            new THREE.MeshBasicMaterial({color: 0xff0000}));

        var radarposition = new THREE.Vector3();
        radarposition.setFromMatrixPosition(radarEnd.matrixWorld);

        bullet.position.x = radarposition.x;
        bullet.position.y = radarposition.y;
        bullet.position.z = radarposition.z;
        bullet.angle = c;
        bullet.target = new THREE.Vector3(1000000*Math.tan(c),radarposition.y,radarposition.z-200);
        bullets.alive = true;
        bullets.push(bullet);
        scene.add(bullet);
        scene.updateMatrixWorld(true);
    }


    controls.update();
}



/**
 * helper function for actually moving shot bullets across the scene
 */
function shootBullets() {


    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i] === undefined) {
            continue;
        }
        if (bullets[i].alive == false) {
            bullets.splice(i, 1);
            continue;
        }
        if(Math.abs(bullets[i].position.x) > Math.abs(bullets[i].target.x) &&
            Math.abs(bullets[i].position.z) > Math.abs(bullets[i].target.z)){
            bullets[i].alive = false;
            scene.remove(bullets[i]);
        }

        bullets[i].position.x += Math.sin(bullets[i].angle);
        bullets[i].position.z -= Math.abs(Math.cos(bullets[i].angle));
    }
}


function render() {

    shootBullets();
    if (secondaryCameraActive) {
        renderer.render(scene, secondaryCamera);
    } else {
        renderer.render(scene, primaryCamera);
    }


    controls.update();
    for (var p in planets) {
        var planet = planets[p];
        planet.date += planet.incr;
        planet.position.set(Math.cos(planet.date) * planet.orbitRadius
            , 0, Math.sin(planet.date) * planet.orbitRadius);

        planet.rotation.y += 0.01;
    }

    update();
    requestAnimationFrame(render);
}


