class Cylinder {

    constructor(n_in, r, g, b) {
        //init statements
        var n = Number (n_in);
        //make repeat twice
        this.verticies = new Float32Array(18*(n)+6);
        this.normals = new Float32Array(18*(n)+6);
        this.indices = new Uint16Array(12*(n));
        this.color = [];

        //VERTICIES

        //faces of cylinder
        for(let i = 0; i < n; i++){
            //Upper right corner of face
            if(i == (n-1)){
                this.verticies[12*i] = Math.cos(getAngle(0,n));
                this.verticies[12*i+1] = Math.sin(getAngle(0,n));
                this.verticies[12*i+2] = 1;
            }
            else{
                this.verticies[12*i] = Math.cos(getAngle(i+1,n));
                this.verticies[12*i+1] = Math.sin(getAngle(i+1,n));
                this.verticies[12*i+2] = 1;
            }
            //Upper Left corner of face
            this.verticies[12*i+3] = Math.cos(getAngle(i,n));
            this.verticies[12*i+4] = Math.sin(getAngle(i,n));
            this.verticies[12*i+5] = 1;

            //Bottom Left corner of face
            this.verticies[12*i+6] = Math.cos(getAngle(i,n));
            this.verticies[12*i+7] = Math.sin(getAngle(i,n));
            this.verticies[12*i+8] = 0;

            //Bottom Right corner of face
            if(i == (n-1)){
                this.verticies[12*i+9] = Math.cos(getAngle(0,n));
                this.verticies[12*i+10] = Math.sin(getAngle(0,n));
                this.verticies[12*i+11] = 0;
            }
            else{
                this.verticies[12*i+9] = Math.cos(getAngle(i+1,n));
                this.verticies[12*i+10] = Math.sin(getAngle(i+1,n));
                this.verticies[12*i+11] = 0;
            }
        }

        //top & bottom of shape
        //12*n+12 = 12*(n+1)
        //loop @ 3(vertex/loop)*i(iterations)+12(current)+coor
        //top
        for(let i = 0; i < n; i++){
            this.verticies[3*i+12*n] = Math.cos(getAngle(i,n));
            this.verticies[3*i+12*n+1] = Math.sin(getAngle(i,n));
            this.verticies[3*i+12*n+2] = 1;
        }
        //Fills to 15(n)
        //fill top center
        this.verticies[15*(n)] = 0.0;
        this.verticies[15*(n)+1] = 0.0;
        this.verticies[15*(n)+2] = 1.0;

        //bottom
        for(let i = 0; i < n; i++){
            this.verticies[3*i+15*n+3] = Math.cos(getAngle(i,n));
            this.verticies[3*i+15*n+4] = Math.sin(getAngle(i,n));
            this.verticies[3*i+15*n+5] = 0;
        }

        //fill bottom center 
        this.verticies[18*(n)+3] = 0.0;
        this.verticies[18*(n)+4] = 0.0;
        this.verticies[18*(n)+5] = 0.0;


        //INDICIES
        //side face indices
        for(let i = 0; i < n; i++){
            //upper right->upper left->bottom left
            this.indices[6*i] = Number(0)+ 4*i;
            this.indices[6*i+1] = Number(1) + 4*i;
            this.indices[6*i+2] = Number(2) + 4*i;
            //upper right->bottom left->bottom right
            this.indices[6*i+3] = Number(0)+ 4*i;
            this.indices[6*i+4] = Number(1) + 4*i + 1;
            this.indices[6*i+5] = Number(2) + 4*i + 1;
        }
        //up to 6n filled


        //upper face indices
        //as before, loop index @ 6n(state on start)+3*(iterations)+coor
        for(let i = 0; i < n; i++){
            this.indices[3*i+6*n] = 5*n;
            if(i != (n-1)){
                this.indices[3*i+6*n+1] = 4*n + i;
                this.indices[3*i+6*n+2] = 4*n + i + 1;
            }
            else{
                this.indices[3*i+6*n+1] = 5*n - 1;
                this.indices[3*i+6*n+2] = 4*n;
            }
        }
        //up to 9n filled

        //bottom face indices
        //as above, loop index @ 9n(state on start)+3*(iterations)+coor
        for(let i = 0; i < n; i++){
            //top face is n+1 vert, so bottom center is 5*n+n+1
            this.indices[3*i+9*n] = 6*n+1;
            if(i != (n-1)){
                this.indices[3*i+9*n+1] = 5*n + i + 1;
                this.indices[3*i+9*n+2] = 5*n + i + 2;
            }
            else{
                this.indices[3*i+9*n+1] = 6*n;
                this.indices[3*i+9*n+2] = 5*n + 1;
            }
        }
        //completely filled

        //NORMALS
        //given a face:
        // b-------a
        // |-------|
        // |-------|
        // c-------d
        //let V_a=bx-ax,by-ay,bz-aZ;V_B=cx-bx,cy-by,cz-bz
        //normal to all verts on face (4) is V_b (CROSS) V_a

        //Do all faces
        //n iterations, n faces
        for(let i = 0; i < n; i++){
            //need to set V_a, V_b
            //xa, ya, za are v[0,1,2]
            let xa = this.verticies[12*i+0];
            let ya = this.verticies[12*i+1];
            let za = this.verticies[12*i+2];
            //xb, yb, zb are v[3,4,5]
            let xb = this.verticies[12*i+3];
            let yb = this.verticies[12*i+4];
            let zb = this.verticies[12*i+5]
            //xc, yc, zc are v[6,7,8]
            let xc = this.verticies[12*i+6];
            let yc = this.verticies[12*i+7];
            let zc = this.verticies[12*i+8];

            let V_a = new Vector3([xb-xa,yb-ya,zb-za]);
            let V_b = new Vector3([xc-xb,yc-yb,zc-zb]);
            //v[6-11] have same x,y, so iterate past for next face
            let V_c = Vector3.cross(V_a,V_b);
            //each vertex on face has same normal, so v[0-2]=v[3-5]=v[6-8]=v[9-11]
            //normalize before assignment, to keep all normals as unit vectors
            //V_c.normalize();
            this.normals[12*i] = V_c.elements[0];
            this.normals[12*i+1] = V_c.elements[1];
            this.normals[12*i+2] = V_c.elements[2];
            this.normals[12*i+3] = V_c.elements[0];
            this.normals[12*i+4] = V_c.elements[1];
            this.normals[12*i+5] = V_c.elements[2];
            this.normals[12*i+6] = V_c.elements[0];
            this.normals[12*i+7] = V_c.elements[1];
            this.normals[12*i+8] = V_c.elements[2];
            this.normals[12*i+9] = V_c.elements[0];
            this.normals[12*i+10] = V_c.elements[1];
            this.normals[12*i+11] = V_c.elements[2];
        }

        //top
        //since top is x-y plane, normal should just be (0,0,1)
        //n verts on top, plus 1 for center
        //top verts start at 12n of vert array
        //now set 3*n of normal array to above normal
        //at 12n normals at start, fills to 15n+3
        for(let i = 0; i < n+1; i++){
            this.normals[3*i+12*n] = 0;
            this.normals[3*i+12*n+1] = 0;
            this.normals[3*i+12*n+2] = 1;
        }

        //bottom
        //same as top, except normal is (0,0,-1)
        //at 15n+3 to start, fills to 18n+6
        for(let i = 0; i < n+1; i++){
            this.normals[3*i+15*n+3] = 0;
            this.normals[3*i+15*n+4] = 0;
            this.normals[3*i+15*n+5] = -1;
        }

        console.log(this.verticies);
        console.log(this.normals);
        //VAR SET
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;
        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];
    }




    //TRANSFORMATIONS
    setScale(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
    }

    setRotate(x, y, z) {
        this.rotate[0] = x;
        this.rotate[1] = y;
        this.rotate[2] = z;
    }

    setTranslate(x, y, z) {
        this.translate[0] = x;
        this.translate[1] = y;
        this.translate[2] = z;
    }
}

//short helper function for iterative angle creation
function  getAngle(x,n){
    let angle = (2*x*Math.PI)/(n)
    return angle;
}
