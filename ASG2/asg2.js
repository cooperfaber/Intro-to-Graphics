//Starter Code taken from Lucas's Section
// Shaders (GLSL)
let VSHADER=`
    precision mediump float;

    attribute vec3 a_Position; // (x,y)

    
    uniform vec3 u_Color;
    uniform vec3 u_lightColor;
    uniform vec3 u_lightDirection;

    varying vec4 v_Color;

    uniform mat4 u_Model;
    void main(){
        gl_Position = u_Model * vec4(a_Position, 1.0);
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

//let u_Color = null;
let modelMatrix = new Matrix4();
let cylinders = [];

//uniform locations
let u_Model = null;
let u_Color = null;
let v_Color = null;

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

    //Get/Set u_color from fragment shader

    gl.uniform3f(u_Color, cyl.color[0],cyl.color[1],cyl.color[2]);

    //send data to GPU
    gl.bufferData(gl.ARRAY_BUFFER, cyl.verticies, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cyl.indices, gl.STATIC_DRAW);
    //draw it
    gl.drawElements(gl.TRIANGLES, cyl.indices.length, gl.UNSIGNED_SHORT, 0);

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
    u_Model = gl.getUniformLocation(gl.program,"u_Model");
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    //get n & bool inputs
    var n = Number(document.getElementById("n_in").value);
    if(n < 0){
        console.log("Negative amount of sides.");
        return -1;
    }
    var endcaps = true;

    //create triangle
    let cylinder = new Cylinder(n,[1.0,0.0,0.0]); // TODO: call new Cylinder()
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

    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log("Error creating vert buffer");
        return -1;
    }

    //inform GPU that vertexBuffer has vertex data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Config GPU to read triangle array in pairs of 2-bytes
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);



    //use code from lab to draw
    let indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log("Error creating indic buffer");
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    for(let cyl of cylinders) {
        console.log(cyl.verticies);
        console.log(cyl.indices);
        draw(cyl);
    } 
}

function onChangeRotate(value){
    let index = document.getElementById("cylSelect").value;
    let x_bool = document.getElementById("x").checked;
    let y_bool = document.getElementById("y").checked;
    let z_bool = document.getElementById("z").checked;
    var cyl = cylinders[index-1];
    if(x_bool){
        cyl.setRotate(value,cyl.rotate[1],cyl.rotate[2]);
    }
    if(y_bool){
        cyl.setRotate(cyl.rotate[0],value,cyl.rotate[2]);
    }
    if(z_bool){
        cyl.setRotate(cyl.rotate[0],cyl.rotate[1],value);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}

function onChangeScale(value){
    let index = document.getElementById("cylSelect").value;
    let v = value/100;
    let x_bool = document.getElementById("x").checked;
    let y_bool = document.getElementById("y").checked;
    let z_bool = document.getElementById("z").checked;
    var cyl = cylinders[index-1];
    if(x_bool){
        cyl.setScale(v,0,0);
    }
    if(y_bool){
        cyl.setScale(cyl.scale[0],v,0);
    }
    if(z_bool){
        cyl.setScale(cyl.scale[0],cyl.scale[1],v);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}

function onChangeTranslate(value){
    let index = document.getElementById("cylSelect").value;
    let v = value/100;
    let x_bool = document.getElementById("x").checked;
    let y_bool = document.getElementById("y").checked;
    //as z is the viewpoint, it is left out of translations
    var cyl = cylinders[index-1];
    if(x_bool){
        cyl.setTranslate(v,cyl.translate[1],0);
    }
    if(y_bool){
        cyl.setTranslate(cyl.translate[0],v,0);
    }
    clr();
    for(let cyl of cylinders) {
        draw(cyl);
    }
}

function clr(){
    //Clear: clears. call if you need to clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
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