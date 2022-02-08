export class ShaderDefinition{
    program: WebGLProgram;
    aBind: (gl:WebGL2RenderingContext)=>void;
    uBind:(gl:WebGL2RenderingContext)=>void;

    constructor(program:WebGLProgram,attribBind:(gl:WebGL2RenderingContext)=>void,uniformBind:(gl:WebGL2RenderingContext)=>void){
        this.program = program;
        this.aBind = attribBind;
        this.uBind = uniformBind;        
    }
}




export class Renderer {

    gl:WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    renderPass:Array<ShaderDefinition> = [];

    constructor(canvas:HTMLCanvasElement){
        let c = canvas.getContext("webgl2")!;
        if (c === null) {
            throw ("Unable to initialize WebGL. Your browser or machine may not support it.");
        }
        else{
            this.gl = c;
        }
        this.canvas = canvas;

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        const fill = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER,
            new Float32Array(fill),
            this.gl.STATIC_DRAW);
    }

    /*
    Create canvas sized texture.
    */
    createTexture(): WebGLTexture {
        const texture = this.gl.createTexture();
        if (texture === null) throw "What";
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        let formatted = null;
        let width = this.canvas.width;
        let height = this.canvas.height;

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const border = 0;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
            width, height, border, srcFormat, srcType,
            formatted);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

        return texture;
    }

    /*
    creates a shader of the given type, uploads the source and
    compiles it.
    */
    private loadShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
        if (shader === null) throw "Error loading shader, type: " + type;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            let e = ('An error occurred compiling type '+type+' shader: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            throw e;
        }

        return shader;
    }

    /*
    Initialize a shader program, so Webthis.GL knows how to draw our data
    */
    initShaderProgram(vsSource: string, fsSource: string): WebGLProgram {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = this.gl.createProgram();
        if (shaderProgram === null) throw "Failed creating shader program";
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            throw ('Unable to initialize the shader program: '+this.gl.getProgramInfoLog(shaderProgram));
        }

        return shaderProgram;
    }

    getLastPassTexture() {
        let texture = this.createTexture();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, this.canvas.width, this.canvas.height, 0);
        return texture;
    }

    render(pass:number) {
        //resize();
        let rp = this.renderPass[pass];
        this.gl.useProgram(rp.program);
    
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    
        rp.uBind(this.gl);
    
        const offset = 0;
        const vertexCount = 4;
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    renderToTexture(frameBuffer:WebGLFramebuffer,pass:number){
        //resize();
        let rp = this.renderPass[pass];
        this.gl.useProgram(rp.program);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    
        /*gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/
    
        rp.uBind(this.gl);
    
        const offset = 0;
        const vertexCount = 4;
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    }

    nextPass(rp:ShaderDefinition){
        rp.aBind(this.gl);
        this.renderPass.push(rp);
    }
}