// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform vec3 u_eyePosition;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    uniform vec3 u_Color;

    uniform vec3 u_diffuseColor;
    uniform vec3 u_ambientColor;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;
    uniform vec3 u_lightPosition;

    varying vec4 v_Color;

    void main() {
        // Mapping obj coord system to world coord system
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);

        vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal
        vec3 l = normalize(u_lightPosition - worldPos.xyz); // Light direction
        vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction
        vec3 r = reflect(l, n); // Reflected light direction

        // Ambient light (flat shading)
        vec3 ambient = u_ambientColor * u_Color;

        // Diffuse light (flat shading)
        float nDotL = max(dot(l, n), 0.0);
        vec3 diffuse = u_diffuseColor * u_Color * nDotL;

        // Specular light
        float rDotV = max(dot(r, v), 0.0);
        float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
        vec3 specular = u_specularColor * u_Color * rDotVPowAlpha;

        // Final light color
        v_Color = vec4(ambient + diffuse + specular, 1.0);

        gl_Position = worldPos;
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
let lightPosition = new Vector3([1.0, 1.0, -1.0]);
let eyePosition = new Vector3([0.0, 0.0, 0.0]);

let models = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_Color = null;
let u_diffuseColor = null;
let u_ambientColor = null;
let u_specularColor = null;
let u_specularAlpha = null;
let u_lightPosition = null;
let u_eyePosition = null;

function drawModel(model) {
    // Update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    // Apply translation for this part of the animal
    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Set u_Color variable from fragment shader
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

    // Send vertices and indices from model to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.verticies, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);

    // Draw model
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function onCubeCreation() {
    let cube2 = new Cube([0.0, 0.0, 1.0]);
    models.push(cube2);

    let newOption = document.createElement("option");
    newOption.text = "Cube " + models.length;
    newOption.value = models.length;
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

function draw() {
    // Draw frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for(let m of models) {
        drawModel(m);
    }

    requestAnimationFrame(draw);
}

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "cylinder":
            model = new Cylinder(16,color[0],color[1],color[2]);
            break;
        case "sphere":
            model = new Sphere(color, 13);
            break;
    }

    if(model) {
        models.push(model);

        // Add an option in the selector
        let selector = document.getElementById("cubeSelect");
        let cubeOption = document.createElement("option");
        cubeOption.text = shapeType + " " + models.length;
        cubeOption.value = models.length - 1;
        selector.add(cubeOption);

        // Activate the cube we just created
        selector.value = cubeOption.value;
    }

    return model;
}

function onRotationInput(value) {
    // Get the selected cube
    let selector = document.getElementById("cubeSelect");
    let selectedCube = models[selector.value];

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
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor = gl.getUniformLocation(gl.program, "u_diffuseColor");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");

    u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");

    // let cube1 = addModel([1.0, 0.0, 0.0], "cube");
    // cube1.setTranslate(-0.25, 0.0, 0.0);
    // cube1.setScale(0.1, 0.1, 0.1);

    let sphere = addModel([1.0, 0.0, 0.0], "cylinder");
    sphere.setTranslate(0.0, 0.0, 0.0);
    sphere.setScale(0.75, 0.75, 0.75);

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    // Set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);

    gl.uniform1f(u_specularAlpha, 32.0);

    gl.uniform3fv(u_eyePosition, eyePosition.elements);
    gl.uniform3fv(u_lightPosition, lightPosition.elements);

    draw();
}

function onChangeRotate(value, coor){
    let index = document.getElementById("cubeSelect").value;
    var cyl = models[index];
    if(coor == 'x'){
        cyl.setRotate(value,cyl.rotate[1],cyl.rotate[2]);
    }
    if(coor == 'y'){
        cyl.setRotate(cyl.rotate[0],value,cyl.rotate[2]);
    }
    if(coor == 'z'){
        cyl.setRotate(cyl.rotate[0],cyl.rotate[1],value);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}

function onChangeScale(value, coor){
    let index = document.getElementById("cubeSelect").value;
    let v = value/100;
    //as z is the viewpoint, it is left out of translations
    var cyl = models[index];
    if(coor == 'x'){
        cyl.setScale(v,cyl.scale[1],cyl.scale[2]);
    }
    if(coor == 'y'){
        cyl.setScale(cyl.scale[0],v,cyl.scale[2]);
    }
    if(coor == 'z'){
        cyl.setScale(cyl.scale[0],cyl.scale[1],v);
    }
    //special for convience
    if (coor == 'a'){
        cyl.setScale(v,v,v);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}


function onChangeTranslate(value, coor){
    let index = document.getElementById("cubeSelect").value;
    let v = value/100;
    //as z is the viewpoint, it is left out of translations
    var cyl = models[index];
    if(coor == 'x'){
        cyl.setTranslate(v,cyl.translate[1],cyl.translate[2]);
    }
    if(coor == 'y'){
        cyl.setTranslate(cyl.translate[0],v,cyl.translate[2]);
    }
    if(coor == 'z'){
        cyl.setTranslate(cyl.translate[0],cyl.translate[1],v);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}

function handleDrawEvent(){
    let cyl = addModel([0.1, 0.25, 0.75], "cylinder")
}