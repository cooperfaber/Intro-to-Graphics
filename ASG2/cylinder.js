class Cylinder {
    //    v0----- v1
    //   /|      /|
    //  v6------v5|
    //  | |     | |
    //  | |v2---|-|v3
    //  |/      |/
    //  v7------v4
    constructor(n_in, color) {
        /*this.vertices = new Float32Array([   // Coordinates
             1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
             1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
             1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
            -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
             1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
          ]);*/

          this.normals = new Float32Array([    // Normal
           0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
           1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
           0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
          -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
           0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
           0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
         ]);

         //create triangles in CPU memory
        var n = Number (n_in);
        //make repeat twice
        this.verticies = new Float32Array(6*(n+1));
        this.normals = new Float32Array(6*(n+1));
        this.indices = new Uint16Array(12*(n));
        //back plane
        //center point
        this.verticies[0] = 0.0;
        this.verticies[1] = 0.0;
        this.verticies[2] = 1.0;
        //this.verticies[6*n]= 0.0;
        for(let i = 0; i < n; i++){
            let angle = (2*i*Math.PI)/(n);
            this.verticies[3*(i+1)] = Math.cos(angle);
            this.verticies[3*(i+1)+1] = Math.sin(angle);
            this.verticies[3*(i+1)+2] = 1.0;
        }
        //front plane
        //center point
        this.verticies[3*(n+1)] = 0.0;
        this.verticies[3*(n+1)+1] = 0.0;
        this.verticies[3*(n+1)+2] = 0.0;
        var j = Number (0);
        for(let i = n+2; i < 2*(n)+2; i++){
            let angle = (2*j*Math.PI)/(n);
            this.verticies[3*i] = Math.cos(angle);
            this.verticies[3*i+1] = Math.sin(angle);
            this.verticies[3*i+2] = 0.0;
            j++;
        }
        //front plane indices
        for(let i = 0; i < n; i++){
            this.indices[3*i] = Number(0);
            this.indices[3*i+1] = Number(i) + Number(1);
            if(i == n-1){
                this.indices[3*i+2] = Number(1);
            }
            else{
                this.indices[3*i+2] = Number(i)+Number(2);
            }
        }
        //back plane indices
        for(let i = 0; i < n; i++){
            this.indices[3*i+3*n] = Number(this.indices[3*i]) + Number(n) + Number(1);
            this.indices[3*i+1+3*n] = Number(this.indices[3*i+1]) + Number(n) + Number(1);
            this.indices[3*i+2+3*n] = Number(this.indices[3*i+2]) + Number(n) + Number(1);
        }
        //top to bottom (vertical) triangles
        for(let i = 0; i < n; i++){
            if(i < n-1){
                this.indices[6*n+6*i] = Number(i)+Number(2);
                //this.indices[6*n+6*i] = Number(i)+Number(n)+Number(3)
                this.indices[6*n+6*i+1] = Number(i)+Number(1);
                //this.indices[6*n+6*i+2] = Number(i)+Number(1)
                this.indices[6*n+6*i+2] = Number(i)+Number(n)+Number(2);
                this.indices[6*n+6*i+3] =  Number(i)+Number(n)+Number(2);
                //this.indices[6*n+6*i+3] = Number(i)+Number(1);
                this.indices[6*n+6*i+4] =  Number(i)+Number(6);
                //this.indices[6*n+6*i+5] = Number(i)+Number(n)+Number(2);
                this.indices[6*n+6*i+5] =  Number(i)+Number(2);
            }
            else{
                //this.indices[6*n+6*i] = Number(i)+Number(1);
                this.indices[6*n+6*i] = Number(1)
                this.indices[6*n+6*i+1] = Number(i)+Number(1);
                this.indices[6*n+6*i+2] = Number(n)+Number(4);
                this.indices[6*n+i*6+3] = Number(n)+Number(4);
                this.indices[6*n+i*6+4] = Number(n)+Number(2);
                this.indices[6*n+i*6+5] = Number(1);
                //hoping there's a better way to do this in the future
                //not doing every single item as Number(x) caused issues in driver.html
            }
        }
        this.color = color;
        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];
    }

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
