//Starter Code taken from Lucas's Monday Section
// Shaders (GLSL)
let VSHADER=`
    precision mediump float;

    attribute vec3 a_Position; // (x,y)
    void main(){
        gl_Position = vec4(a_Position, 1.0);
    }
`;

let FSHADER=`
    precision mediump float;

    void main(){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;


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

    //get n & bool inputs
    var n = Number(document.getElementById("n_in").value);
    if(n < 0){
        console.log("Negative amount of sides.");
        return -1;
    }
    var endcaps = false;
    var end_in = document.getElementById("end_bool").value;
    if(end_in == "end_true"){
        endcaps = true;
    }

    //create triangle
    tri = tri_creat(n);

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

    //Send triangle to GPU (via vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, tri, gl.STATIC_DRAW);

    //create indicies
    var indicies = ind_creat(n,endcaps);

    //use code from lab to draw
    let indexBuffer = gl.createBuffer();
    if(!indexBuffer){
        console.log("Error creating indic buffer");
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);
    gl.drawElements(gl.LINE_LOOP, indicies.length, gl.UNSIGNED_SHORT, 0);
    
}

function clr(){
    //Clear: clears. call if you need to clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function tri_creat(n_in){
    //create triangles in CPU memory
    var n = Number (n_in);
    var tri = new Float32Array(6*(n+1));
    //back plane
    //center point
    tri[0] = 0.0;
    tri[1] = 0.0;
    tri[2] = 0.0;
    for(let i = 0; i < n; i++){
        let angle = (2*i*Math.PI)/(n);
        tri[3*(i+1)] = Math.cos(angle);
        tri[3*(i+1)+1] = Math.sin(angle);
        tri[3*(i+1)+2] = 0.0;
    }
    //front plane
    //center point
    tri[3*(n+1)] = 0.0;
    tri[3*(n+1)+1] = 0.0;
    tri[3*(n+1)+2] = 1.0;
    var j = Number (0);
    for(let i = n+2; i < 2*(n)+2; i++){
        let angle = (2*j*Math.PI)/(n);
        tri[3*i] = Math.cos(angle);
        tri[3*i+1] = Math.sin(angle);
        tri[3*i+2] = 1.0;
        j++;
    }
    return tri;
}

//help was taken from
//https://piazza.com/class/kjxgyhjz6y573g?cid=45
function ind_creat(n, endcaps){
    //if statement here depending on endcaps
    //connection to the center (endcaps)
    if(endcaps == true){
        //Create indices buffer
        var indicies = new Uint16Array(12*(n));
        for(let i = 0; i < n; i++){
            indicies[3*i] = Number(0);
            indicies[3*i+1] = Number(i) + Number(1);
            if(i == n-1){
                indicies[3*i+2] = Number(1);
            }
            else{
                indicies[3*i+2] = Number(i)+Number(2);
            }
        }
        //endcaps (?)
        for(let i = 0; i < n; i++){
            indicies[3*i+3*n] = Number(indicies[3*i]) + Number(n) + Number(1);
            indicies[3*i+1+3*n] = Number(indicies[3*i+1]) + Number(n) + Number(1);
            indicies[3*i+2+3*n] = Number(indicies[3*i+2]) + Number(n) + Number(1);
        }
        //top to bottom (vertical) triangles
        for(let i = 0; i < n; i++){
            if(i < n-1){
                indicies[6*n+6*i] = Number(i)+Number(1);
                indicies[6*n+6*i+1] = Number(i)+Number(2);
                indicies[6*n+6*i+2] = Number(i)+Number(n)+Number(3);
                indicies[6*n+6*i+3] =  Number(i)+Number(n)+Number(3);
                indicies[6*n+6*i+4] =  Number(i)+Number(2);
                indicies[6*n+6*i+5] =  Number(i)+Number(1);
            }
            else{
                indicies[6*n+6*i] = Number(i)+Number(1);
                indicies[6*n+6*i+1] = Number(1);
                indicies[6*n+6*i+2] = Number(n)+Number(2);
                indicies[6*n+i*6+3] = Number(n)+Number(2);
                indicies[6*n+i*6+4] = Number(i)+Number(n)+Number(2);
                indicies[6*n+i*6+5] = Number(i)+Number(1);
                //hoping there's a better way to do this in the future
                //not doing every single item as Number(x) caused issues in driver.html
            }
        }
    }
    //with no endcaps, only side connectors are generated
    else{
        //Create indices buffer (smaller)
        var indicies = new Uint16Array(6*(n));
        for(let i = 0; i < n; i++){
            if(i < n-1){
                indicies[6*i] = Number(i)+Number(1);
                indicies[6*i+1] = Number(i)+Number(2);
                indicies[6*i+2] = Number(i)+Number(n)+Number(3);
                indicies[6*i+3] =  Number(i)+Number(n)+Number(3);
                indicies[6*i+4] =  Number(i)+Number(2);
                indicies[6*i+5] =  Number(i)+Number(1);
            }
            else{
                indicies[6*i] = Number(i)+Number(1);
                indicies[6*i+1] = Number(1);
                indicies[6*i+2] = Number(n)+Number(2);
                indicies[i*6+3] = Number(n)+Number(2);
                indicies[i*6+4] = Number(i)+Number(n)+Number(2);
                indicies[i*6+5] = Number(i)+Number(1);
            }
        }
    }
    return indicies;
}