function main() {
    //Retrieve <canvas> element
    window.canvas = document.getElementById('example');
    if (!canvas){
        console.log('Failed to return the <canvas> element');
        return;
    }

    //Get the rendering context
    window.ctx = canvas.getContext('2d');
    clr();
}

function drawVector(v,color){
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');
    x = v.elements[0]*20;
    y = v.elements[1]*20;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(200, 200);
    ctx.lineTo(200+x,200-y);
    ctx.stroke();
    
}

function clr(){
    ctx.fillStyle = "black"; // black screen
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function angleBetween(v1,v2){
    var d = Vector3.dot(v1,v2);
    var m1 = v1.magnitude();
    var m2 = v2.magnitude();
    var m = m1*m2;
    var alph = Math.acos(d/m)
    alph = (alph*180)/(Math.PI);
    return alph;
}

function areaTriangle(v1,v2){
    var v3 = Vector3.cross(v1,v2);
    mag = v3.magnitude();
    aria = mag/2;
    return aria;
}

function handleDrawEvent(){
    clr();
    var v1 = new Vector3([
        document.getElementById("x1_coor").value,
        document.getElementById("y1_coor").value,
        0
    ])
    var v2 = new Vector3([
        document.getElementById("x2_coor").value,
        document.getElementById("y2_coor").value,
        0
    ])
    drawVector(v1,"red");
    drawVector(v2,"blue");
}

function handleDrawOperationEvent(){
    clr();
    var v1 = new Vector3([
        document.getElementById("x1_coor").value,
        document.getElementById("y1_coor").value,
        0
    ])
    var v2 = new Vector3([
        document.getElementById("x2_coor").value,
        document.getElementById("y2_coor").value,
        0
    ])
    drawVector(v1,"red");
    drawVector(v2,"blue");
    var oper = document.getElementById("op").value;
    var scalar = document.getElementById("scalar").value;

    switch(oper){
        case "add":
            var v3 = v1.add(v2);
            drawVector(v3,"green");
            break;
        case "sub":
            var v3 = v1.sub(v2);
            drawVector(v3,"green");
            break;
        case "mul":
            var v3 = v1.mul(scalar);
            var v4 = v2.mul(scalar);
            drawVector(v3,"green");
            drawVector(v4,"green")
            break;
        case "div":
            var v3 = v1.div(scalar);
            var v4 = v2.div(scalar);
            drawVector(v3,"green");
            drawVector(v4,"green")
            break;
        case "mag":
            console.log("v1 Magnitude:" + v1.magnitude())
            console.log("v2 Magnitude:" + v2.magnitude())
            break;
        case "norm":
            v1 = v1.normalize();
            v2 = v2.normalize();
            drawVector(v1,"green");
            drawVector(v2,"green");
            break;
        case "dot":
            console.log("Angle: "+ angleBetween(v1,v2))
            break;
        case "cross":
            aria = areaTriangle(v1,v2);
            console.log("Area of the triangle: "+ aria);
            break;
        default:
            console.log("Error in oper switch");
    }
}