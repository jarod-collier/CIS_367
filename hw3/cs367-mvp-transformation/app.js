import createContext from 'gl-context';
import GLGeometry from 'gl-geometry';
import createShader from 'gl-shader-core';
import {mat4, glMatrix} from 'gl-matrix';
import fsOne from './shaders/fs_onecolor.glsl';
import vsOne from './shaders/vs_onecolor.glsl';
import vsMulti from './shaders/vs_vertexcolor.glsl';
import fsMulti from './shaders/fs_vertexcolor.glsl';
import Cone from './geometry/Cone';
import Polygonal from './geometry/Polygonal';
import Arrow from './model/Arrow';
import Axes from './model/Axes';
import Body from "./geometry/Body";
import LegPairs from "./geometry/LegPairs";
import ArmPairs from "./geometry/ArmPairs";
import Head from "./geometry/Head";
import EntireBody from "./geometry/EntireBody";
import Torus from "./geometry/Torus";
import Orb from "./geometry/Orb";

const POINTS_ON_CIRCLE = 30;
const IDENTITY = mat4.create();

const EYE_POSITION = [20, 15, 6];
const GAZE_POINT = [0, 0, 0]; // 0, 0, .3
const CAMERA_UP = [0, 0, 1]; //0 , 0 , 1

// Desired speed of animation
const SUIT_FLY_SPEED = 60.0;// degrees per second
const SUIT_ROTATE_SPEED = 90.0;
const ORB_SPIN_SPEED = 120; // degrees per second
let canvas, gl;
let suitMove, suitRotate, orbSpin, orbMove1, orbMove2, orbMove3;

// geometric objects
let axes, entireBody, torus, orb1, orb2, orb3;
let oneColorShader = null;
let multiColorShader = null;
let projectionMatrix, viewMatrix;
let cameraCF, entireBodyCF, torusCF, orbCF1, orbCF2, orbCF3;
let lastRenderTime = 0;
let cameraRollAngle = 0,
    cameraDistance = 0;
let coneRevolution, coneSpin, hexaSpin;

// Inject this render() function into the GLGeometry class
const renderMixin = {
    render(shader, coordFrame) {
        this.bind(shader);
        shader.uniforms.modelView = viewMatrix;
        shader.uniforms.projection = projectionMatrix;
        shader.uniforms.objectCoordFrame = coordFrame;
        this.draw();
        this.unbind();
    }
};
Object.assign(GLGeometry.prototype, renderMixin);

const myObjectRenderer = (geoObject, frame) => {
    if (multiColorShader) {
        // The following line invokes render() defined in the mixin
        geoObject.render(multiColorShader, frame);
    }
};

let orbTranslate1 = 0;
let orbTranslate2 = 0;
let orbTranslate3 = 0;
let distanceOrbsTravel = 8;
let orbTeleportTime = 40;
let countTime = 40;

function renderFunc() {
    const now = Date.now();
    const deltaTime = now - lastRenderTime; // in millisecond
    lastRenderTime = now;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // By calculating angle from speed, you will experience
    // consistent animation outcome regardless of the actual hardware speed
    // On slower hardware deltaTime will hold a larger value
    // On faster hardware deltaTime will hold a smaller value
    mat4.fromRotation(
        suitMove,
        glMatrix.toRadian((deltaTime * SUIT_FLY_SPEED) / 1000),
        [0, 1, 0]
    );
    // Fly around y-axis
    mat4.multiply(entireBodyCF, suitMove, entireBodyCF);

    // Fly to the right
    mat4.fromTranslation(suitMove, [0, .1, 0]);
    mat4.multiply(entireBodyCF, entireBodyCF, suitMove);

    //Rotate while flying
    mat4.fromRotation(
        suitRotate,
        glMatrix.toRadian((deltaTime * SUIT_ROTATE_SPEED) / 1000),
        [0, 0, 1]
    );
    mat4.multiply(entireBodyCF, entireBodyCF, suitRotate);

    // Orb1 rotate
    mat4.fromRotation(
        orbSpin,
        glMatrix.toRadian((deltaTime * ORB_SPIN_SPEED) / 1000),
        [0, 1, 1]
    );
    mat4.multiply(orbCF1, orbCF1, orbSpin);

    if (countTime % orbTeleportTime == 0) {
        mat4.fromTranslation(orbMove1, [0, distanceOrbsTravel * Math.sin(orbTranslate1 - 1), 0]);
        mat4.multiply(orbCF1, orbMove1, orbCF1);
        orbTranslate1++;
    }

    // Orb2 rotate
    mat4.fromRotation(
        orbSpin,
        glMatrix.toRadian((deltaTime * ORB_SPIN_SPEED) / 1000),
        [1, 1, 0]
    );
    mat4.multiply(orbCF2, orbCF2, orbSpin);

    if (countTime % (orbTeleportTime + 5) == 0) {
        mat4.fromTranslation(orbMove2, [distanceOrbsTravel * Math.sin(orbTranslate2 - 1), 0, 0]);
        mat4.multiply(orbCF2, orbMove2, orbCF2);
        orbTranslate2++;
    }

    // Orb3 rotate
    mat4.fromRotation(
        orbSpin,
        glMatrix.toRadian((deltaTime * ORB_SPIN_SPEED) / 1000),
        [1, 0, 1]
    );
    mat4.multiply(orbCF3, orbCF3, orbSpin);

    if (countTime % (orbTeleportTime + 10) == 0) {
        mat4.fromTranslation(orbMove3, [0, 0, distanceOrbsTravel * Math.sin(orbTranslate3 - 1)]);
        mat4.multiply(orbCF3, orbMove3, orbCF3);
        orbTranslate3++;
    }

    countTime++;

    // To render ObjectGroup, supply a rendering function and coord frame
    axes.render(myObjectRenderer, IDENTITY);
    entireBody.render(myObjectRenderer, entireBodyCF);
    orb1.render(myObjectRenderer, orbCF1);
    orb2.render(myObjectRenderer, orbCF2);
    orb3.render(myObjectRenderer, orbCF3);
}

function onWindowResized() {
    // Keep the screen aspect ratio at 4:3
    // Keep the canvas as wide as the browser visible width
    let w = window.innerWidth - 16;
    let h = 0.75 * w; // recalculate the canvas height to maintain 4:3 ratio
    if (canvas.offsetTop + h + 16 > window.innerHeight) {
        // the canvas is too tall, take the maximum available height
        canvas.height = window.innerHeight - canvas.offsetTop - 16;
        canvas.width = (4 / 3) * canvas.height;
    } else {
        canvas.width = w;
        canvas.height = h;
    }

    // Tell webGL that the canvas size has changed
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function onRollAngleChanged(ev) {
    // Determine how much we have to rotate from the current angle
    const delta = cameraRollAngle - ev.target.value;
    cameraRollAngle = ev.target.value;

    // Create a rotation matrix (around the camera axis = Z)
    const rota = mat4.fromRotation(mat4.create(), glMatrix.toRadian(delta), [
        0,
        0,
        1
    ]);
    // Update the camera coordinate frame
    mat4.multiply(cameraCF, cameraCF, rota);
    // recalculate view matrix from the camera CF
    mat4.invert(viewMatrix, cameraCF);
}

function onCameraPositionChanged(ev) {
    const delta = cameraDistance - ev.target.value;
    cameraDistance = ev.target.value;
    const trans = mat4.fromTranslation(mat4.create(), [0, 0, delta]);
    // Update the camera coordinate frame
    mat4.multiply(cameraCF, cameraCF, trans);
    // recalculate view matrix from the camera CF
    mat4.invert(viewMatrix, cameraCF);
}

function onProjectionTypeChanged(ev) {
    const type = ev.target.value;
    const viewScaler = 10;
    switch (type) {
        case 'orthotop':
            mat4.ortho(projectionMatrix, (-4 / 3) * viewScaler, (+4 / 3) * viewScaler,
                -1 * viewScaler, +1 * viewScaler, -4 * viewScaler, +6 * viewScaler);
            mat4.identity(viewMatrix);
            break;
        case 'orthofront':
            mat4.ortho(projectionMatrix, (-4 / 3) * viewScaler, (+4 / 3) * viewScaler,
                -1 * viewScaler, +1 * viewScaler, -4 * viewScaler, +6 * viewScaler);
            mat4.lookAt(viewMatrix, [1, 0, 0], [0, 0, 0], CAMERA_UP);
            break;
        case 'orthoside':
            mat4.ortho(projectionMatrix, (-4 / 3) * viewScaler, (+4 / 3) * viewScaler,
                -1 * viewScaler, +1 * viewScaler, -4 * viewScaler, +6 * viewScaler);
            mat4.lookAt(viewMatrix, [0, 1, 0], [0, 0, 0], CAMERA_UP);
            break;
        case 'perspective':
            mat4.perspective(projectionMatrix, glMatrix.toRadian(45), 4 / 3, 0.1 * viewScaler, 6 * viewScaler);
            mat4.lookAt(viewMatrix, EYE_POSITION, GAZE_POINT, CAMERA_UP);
    }
}

// JavaScript does not have main(). We just make it up.
// This function is actually called from index.js
export default function main() {
    // Setup canvas and its render function
    canvas = document.getElementById('mycanvas');
    gl = createContext(canvas, {}, renderFunc);
    projectionMatrix = mat4.create();
    viewMatrix = mat4.create();
    cameraCF = mat4.create();

    suitMove = mat4.create();
    suitRotate = mat4.create();
    orbSpin = mat4.create();
    orbMove1 = mat4.create();
    orbMove2 = mat4.create();
    orbMove3 = mat4.create();

    // //Creates entire body CF
    entireBodyCF = mat4.fromTranslation(mat4.create(), [-6, -2, 0]);
    orbCF1 = mat4.fromTranslation(mat4.create(), [0, 0, 0]);
    orbCF2 = mat4.fromTranslation(mat4.create(), [0, 0, 0]);
    orbCF3 = mat4.fromTranslation(mat4.create(), [0, 0, 0]);


    // Use perspective projection with 90-degree field-of-view
    // screen aspect ratio 4:3, near plane at z=0.1 far-plane at z=20
    const viewScaler = 10;
    mat4.perspective(projectionMatrix, glMatrix.toRadian(45), 4 / 3, 0.1 * viewScaler, 6 * viewScaler);
    mat4.lookAt(viewMatrix, EYE_POSITION, GAZE_POINT, CAMERA_UP);
    mat4.invert(cameraCF, viewMatrix);

    // Setup event listeners
    window.addEventListener('resize', onWindowResized);
    document
        .getElementById('cameraRoll')
        .addEventListener('input', onRollAngleChanged);
    document
        .getElementById('cameraZ')
        .addEventListener('input', onCameraPositionChanged);
    document
        .getElementById('projectionType')
        .addEventListener('change', onProjectionTypeChanged);
    onWindowResized(); // call it once to force a manual resize

    gl.clearColor(0.0, 0.0, 0.0, 1); // Use black to clear the canvas

    gl.enable(gl.DEPTH_TEST); // Use DEPTH buffer for hidden surface removal

    // Define our 3D objects here

    entireBody = new EntireBody({
        glContext: gl,
        positionAttribute: 'vertexPos',
        colorAttribute: 'vertexCol'
    });

    axes = new Axes({
        glContext: gl,
        positionAttribute: 'vertexPos',
        colorAttribute: 'vertexCol'
    });

    orb1 = new Orb({
        glContext: gl,
        positionAttribute: 'vertexPos',
        colorAttribute: 'vertexCol'
    });

    orb2 = new Orb({
        glContext: gl,
        positionAttribute: 'vertexPos',
        colorAttribute: 'vertexCol'
    });

    orb3 = new Orb({
        glContext: gl,
        positionAttribute: 'vertexPos',
        colorAttribute: 'vertexCol'
    });

    multiColorShader = createShader(
        gl,
        vsMulti,
        fsMulti,
        [
            {type: 'mat4', name: 'modelView'},
            {type: 'mat4', name: 'projection'},
            {type: 'mat4', name: 'objectCoordFrame'}
        ],
        // but it defines two attribute variables
        [{type: 'vec3', name: 'vertexPos'}, {type: 'vec3', name: 'vertexCol'}]
    );
};
