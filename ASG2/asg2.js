// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    uniform vec3 u_Color;
    uniform vec3 u_lightColor;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    void main() {
        vec3 lightDir = normalize(u_lightDirection);

        // Transfoming the normal vector to handle object transormations
        vec3 normal = normalize(u_NormalMatrix * vec4(a_Normal, 1.0)).xyz;

        // Calculates the diffuse light (flat shading)
        float nDotL = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = u_lightColor * u_Color * nDotL;

        v_Color = vec4(diffuse, 1.0);

        gl_Position = u_ModelMatrix * vec4(a_Position, 1.0);
    }
`;

let FSHADER=`
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

// Cubes in the world
let lightRotate = new Matrix4();
let lightDirection = new Vector3([0.0, 1.0, -1.0]);
let cubes = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_Color = null;
let u_lightColor = null;
let u_lightDirection = null;

function drawCube(cube) {
    // Update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(cube.translate[0], cube.translate[1], cube.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(cube.rotate[0], 1, 0, 0);
    modelMatrix.rotate(cube.rotate[1], 0, 1, 0);
    modelMatrix.rotate(cube.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(cube.scale[0], cube.scale[1], cube.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, cube.color[0], cube.color[1], cube.color[2]);

    // Send vertices and indices from cube to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

    // Draw cube
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
}

function onCubeCreation() {
    let cube2 = new Cube([0.0, 0.0, 1.0]);
    cubes.push(cube2);

    let newOption = document.createElement("option");
    newOption.text = "Cube " + cubes.length;
    newOption.value = cubes.length;
    let cubeSelect = document.getElementById('cubeSelect');
    cubeSelect.add(newOption);
}

function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}

cubeAngle = 0.0;
function draw() {
    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    lightDirection = new Vector3([0.0, 0.0, -4.0]);

    for(let cube of cubes) {
        drawCube(cube);
    }

    requestAnimationFrame(draw);
}

function addCube(color) {
    // Create a new cube
    let cube = new Cube(color);
    cubes.push(cube);

    // Add an option in the selector
    let selector = document.getElementById("cubeSelect");
    let cubeOption = document.createElement("option");
    cubeOption.text = "Cube " + cubes.length;
    cubeOption.value = cubes.length - 1;
    selector.add(cubeOption);

    // Activate the cube we just created
    selector.value = cubeOption.value;

    return cube;
}

function onRotationInput(value) {
    // Get the selected cube
    let selector = document.getElementById("cubeSelect");
    let selectedCube = cubes[selector.value];

    selectedCube.setRotate(0.0, value, 0.0);
}

function main() {
    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compiling both shaders and sending them to the GPU
    if(!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders.");
        return -1;
    }

    // Retrieve uniforms from shaders
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");

    let cube1 = addCube([1.0, 0.0, 0.0]);
    cube1.setTranslate(0.45, 0, -0.8);
    cube1.setScale(0.1, 0.1, 0.1);

    let cube2 = addCube([0.0, 0.0, 1.0]);
    cube2.setTranslate(-0.45, 0, 0);
    cube2.setScale(0.1, 0.1, 0.1);

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    // Set light data
    gl.uniform3f(u_lightColor, 1.0, 1.0, 1.0);
    gl.uniform3fv(u_lightDirection, lightDirection.elements);

    draw();
}
