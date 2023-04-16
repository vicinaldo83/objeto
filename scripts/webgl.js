//Essa função não é minha, apenas um truque simples para fazer o canvas preencher a tela
function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
   
    return needResize;
}

const _vertex = `#version 300 es

in vec4 position;

void main() {
    gl_Position = position;
}
`;


const _fragment = `#version 300 es

precision highp float; 
out vec4 outColor;
 
void main() {
  outColor = vec4(1, 0, 0.5, 1);
}

`;


export class ShadersSource {
    constructor (vid, fid, v=undefined, f=undefined) {        
        this.vertex = {id: vid, source: (v) ? v : _vertex};
        this.fragment = {id: fid, source: (f) ? f : _fragment};
    }

}

export class Point { 
    constructor (x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    arr2d () {
        return new Float32Array([this.x, this.y]);
    }

    arr3d() {
        return new Float32Array([this.x, this.y, this.z]);
    }

    static flatten(d, ...args) {
        let arr = [];
        if(d == 2) {
            args.forEach( (p) => {
                arr.push(p.x, p.y);
            });
        }

        else {
            args.forEach( (p) => {
                arr.push(p.x, p.y, p.z);
            });
        }

        return new Float32Array(arr);
    }
}


export class WebGL {
    constructor (id, fullscrean=true) {
        let canvas = document.getElementById(id);
        this.gl = canvas.getContext("webgl2");

        if (!canvas && !this.gl){
            console.error("Não foi possível inicializar WebGL");
        }
        else { 
            if (fullscrean) resizeCanvasToDisplaySize(canvas);
            this.gl.viewport(0, 0, canvas.width, canvas.height);
            
            this.shader = new ShadersSource(
                this.gl.VERTEX_SHADER,
                this.gl.FRAGMENT_SHADER);

            this.sucess = true;
        }

        this.buffers = {}
        this.buffers_type = {
            "array": this.gl.ARRAY_BUFFER
        };

        this.usages = {
            "static" : this.gl.STATIC_DRAW
        };

        this.primitive = {
            "points" : this.gl.POINTS,
            "lines" : this.gl.LINES,
            "triangle" : this.gl.TRIANGLES
        };

        this.data_types = {
            "float" : this.gl.FLOAT
        };
    }

    createShader (t) {
        let id = this.shader[t].id;
        let source = this.shader[t].source;
        let shader = this.gl.createShader(id)

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            return shader;
        }
        else { 
            console.error(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
        }
    }

    createProgram (...args_shaders) {
        let program = this.gl.createProgram();

        args_shaders.forEach((s) => {
            this.gl.attachShader(program, s);
        })

        this.gl.linkProgram(program);

        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            return program;
        }
        else {
            console.error(this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
         }
    }
    
    createBuffer (n, t) {
        this.buffers[n] = {ref: this.gl.createBuffer(), type: this.buffers_type[t]};
    }
    
    insertData (n, i, u) {
        this.gl.bindBuffer(this.buffers[n].type, this.buffers[n].ref);
        this.gl.bufferData(this.buffers[n].type, i, this.usages[u])
    }

    
    getAttrId (p, a) {
        return this.gl.getAttribLocation(p, a);
    }

    createVertex () {
        let va = this.gl.createVertexArray();
        this.gl.bindVertexArray(va);

        return va;        
    }

    updateVertex (att_id, s, t, normalize=false, stride=0, offset=0) {
        this.gl.enableVertexAttribArray(att_id);
        this.gl.vertexAttribPointer(att_id, s, this.data_types[t], normalize, stride, offset)
    }

    clear () {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    draw (p, v, pt, o, c) {
        if(this.primitive[pt] === undefined) {
            console.error("Não foi encontrada nenhuma forma primitiva com o nome: " + pt);
            return;
        }

        this.gl.useProgram(p);
        this.gl.bindVertexArray(v);
        this.gl.drawArrays(this.primitive[pt], o, c)
    }
}