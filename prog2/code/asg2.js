//Starter Code taken from Lucas's Section
// Shaders (GLSL)
let VSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_Model;
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

        gl_Position = u_Model* vec4(a_Position, 1.0);
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

//uniform locations
let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();
let u_Model = null;
let u_Color = null;
let lightRotate = new Matrix4();
let lightDirection = new Vector3([1.0, 1.0, 1.0]);
let cylinders = [];

function draw(cyl){
    //set model matrix to identity
    modelMatrix.setIdentity();
    //update model matrix combining operations
    // Apply translation for this part of the animal
    modelMatrix.translate(cyl.translate[0], cyl.translate[1], cyl.translate[2]);

    // Apply rotations for this part of the animal
    modelMatrix.rotate(cyl.rotate[0], 1, 0, 0);
    modelMatrix.rotate(cyl.rotate[1], 0, 1, 0);
    modelMatrix.rotate(cyl.rotate[2], 0, 0, 1);

    // Apply scaling for this part of the animal
    modelMatrix.scale(cyl.scale[0], cyl.scale[1], cyl.scale[2]);
    gl.uniformMatrix4fv(u_Model, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    //Get/Set u_color from fragment shader
    gl.uniform3f(u_Color, cyl.color[0],cyl.color[1],cyl.color[2]);

    //send data to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cyl.verticies, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cyl.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cyl.indices, gl.STATIC_DRAW);
    //draw it
    if(document.getElementById("wire").checked){
        gl.drawElements(gl.LINE_LOOP, cyl.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    else{
        gl.drawElements(gl.TRIANGLES, cyl.indices.length, gl.UNSIGNED_SHORT, 0);
    }

}
function main(){
    //Get canvas tag
    canvas = document.getElementById("cvs1");

    //Get rendering context
    gl = canvas.getContext("webgl");
    if(!gl){
        console.log("Failed to get webgl context");
        return -1;
    }
    clr();
}

function handleDrawEvent(){
    clr();
    //Compiling both shaders & sending them to GPU
    if(!initShaders(gl, VSHADER, FSHADER)){
        console.log("Failed to initialize shaders");
        return -1;
    }
    //Retieve uniforms from shaders
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_Model = gl.getUniformLocation(gl.program, "u_Model");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_lightColor = gl.getUniformLocation(gl.program, "u_lightColor");
    u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");
    //get n & bool inputs
    var n = Number(document.getElementById("n_in").value);
    if(n < 0){
        console.log("Negative amount of sides.");
        return -1;
    }
    var endcaps = true;

    //create cylinder
    let col = (document.getElementById("color_in").value);
    console.log(col.substring(1,3));
    let r_str = "0x" + col.substring(1,3);
    r = parseInt(r_str)/255;
    console.log(r);
    let g_str = "0x" + col.substring(3,5);
    g = parseInt(g_str)/255;
    console.log(g);
    let b_str = "0x" + col.substring(5,7);
    b = parseInt(b_str)/255;
    console.log(b);
    let cylinder = new Cylinder(n,r,g,b); // TODO: call new Cylinder()
    cylinder.setScale(0.25,0.25,0.25);
    cylinders.push(cylinder)

    var cylOption = document.createElement("option");
    cylOption.text = "Cylinder " + cylinders.length;
    cylOption.value = cylinders.length;

    var cylSelect = document.getElementById("cylSelect");
    cylSelect.add(cylOption);
    cylSelect.value = cylinders.length;

    for(let i = 0; i < cylinder.indices.length; i+=3){
        console.log(cylinder.indices[i] + "," + cylinder.indices[i+1] + "," + cylinder.indices[i+2]);
    }

    vertexBuffer = initBuffer("a_Position",3);
    normalBuffer = initBuffer("a_Normal",3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log("Error creating indic buffer");
        return -1;
    }

    //set light data
    gl.uniform3f(u_lightColor,1.0,1.0,1.0);
    gl.uniform3fv(u_lightDirection,lightDirection.elements);

    for(let cyl of cylinders) {
        console.log(cyl.verticies);
        console.log(cyl.indices);
        draw(cyl);
    } 
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

function onChangeRotate(value, coor){
    let index = document.getElementById("cylSelect").value;
    var cyl = cylinders[index-1];
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
    let index = document.getElementById("cylSelect").value;
    let v = value/100;
    //as z is the viewpoint, it is left out of translations
    var cyl = cylinders[index-1];
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
    let index = document.getElementById("cylSelect").value;
    let v = value/100;
    //as z is the viewpoint, it is left out of translations
    var cyl = cylinders[index-1];
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

function clr(){
    //Clear: clears. call if you need to clear
    let graey = 128/255;
    gl.clearColor(graey, graey, graey, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function reset(){
    cylinders = [];
    clr();
    var select = document.getElementById("cylSelect");
    var length = select.options.length;
    for (i = length-1; i >= 1; i--) {
      select.options[i] = null;
    }
}