import {defVS,defFS,pointFS} from './shaders';
import {Renderer, ShaderDefinition} from './gl_modules';

const canvas:HTMLCanvasElement = document.querySelector('#Canvas')!;
let renderer:Renderer = new Renderer(canvas);
let gl = renderer.gl;

let previousFrameBuffer:WebGLFramebuffer|null = null;
let previousTexture: WebGLTexture| null = null;

let currentFrameBuffer: WebGLFramebuffer | null = null;
let currentTexture: WebGLTexture| null = null;

let mousePositionX:number;
let mousePositionY:number;
let points:Array<{x:number,y:number,s:number}> = [];
let forces:Array<{x:number,y:number}> = [];
let ttl:Array<number> = [];

const fps = 60;
const pointSize = 0.02;
const defaulTTL = 10000;

window.onload = main;

function main():void{
    const numComponents = 2;
    const type = WebGL2RenderingContext.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    const shaderProgram0 = renderer.initShaderProgram(defVS, pointFS);
    renderer.nextPass(new ShaderDefinition(
        shaderProgram0,
        (gl)=>{
            gl.vertexAttribPointer(
                gl.getAttribLocation(shaderProgram0, 'aVertexPosition'),
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                gl.getAttribLocation(shaderProgram0, 'aVertexPosition'));

        },
        (gl)=>{
            let pfv = new Float32Array(1000);
            let sfv = new Float32Array(500);
            let n = 0;
            for(let i = 0; i < Math.min(points.length,500); i++){
                pfv[n++] = points[i].x;
                pfv[n++] = points[i].y;
                sfv[i] = points[i].s;
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, previousTexture);

            gl.uniform1i(gl.getUniformLocation(shaderProgram0, 'texture'), 0);
            gl.uniform2fv(gl.getUniformLocation(shaderProgram0, 'points'), pfv);
            gl.uniform1i(gl.getUniformLocation(shaderProgram0, 'pointCount'), Math.min(points.length,500));
            gl.uniform1fv(gl.getUniformLocation(shaderProgram0, 'pointSize'), sfv);
            gl.uniform1f(gl.getUniformLocation(shaderProgram0, 'screenRatio'), window.innerWidth/window.innerHeight);
        }
    ));

    const shaderProgram1 = renderer.initShaderProgram(defVS, defFS);
    renderer.nextPass(new ShaderDefinition(
        shaderProgram1,
        (gl)=>{
            gl.vertexAttribPointer(
                gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                gl.getAttribLocation(shaderProgram1, 'aVertexPosition'));

        },
        (gl)=>{
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, currentTexture);

            gl.uniform1i(gl.getUniformLocation(shaderProgram1, 'texture'), 0);
        }
    ));


    currentFrameBuffer = gl.createFramebuffer();
    previousFrameBuffer = gl.createFramebuffer();
    resize();

    canvas.addEventListener("mousemove", event=>{
        mousePositionX = event.clientX/window.innerWidth;
        mousePositionY = 1-(event.clientY/window.innerHeight);
    });
    window.addEventListener("mousedown", event=>onPress(event));
    window.addEventListener("resize",()=>resize());
        
    renderLoop();
}

function update(){
    for(let i = points.length-1; i >= 0; i--){
        ttl[i]--;
        if(ttl[i] <= 0){
            removePoint(i);
        }else{
            let d = distance(points[i].x,points[i].y,mousePositionX,mousePositionY);
            if(d < 0.1)points[i].s = Math.max(pointSize,pointSize*(1-d));
            points[i].x += forces[i].x;
            points[i].y += forces[i].y;
            if(forces[i].x > 0)forces[i].x -= 0.005/fps;
            if(forces[i].y > -1)forces[i].y -= 0.05/fps;
            if(points[i].x < 0)removePoint(i);
        }
    }
}


function renderLoop(){
    update();

    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFrameBuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentTexture, 0);

    renderer.renderToTexture(currentFrameBuffer!,0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, previousFrameBuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, previousTexture, 0);

    renderer.renderToTexture(previousFrameBuffer!,1);
    renderer.render(1);
    window.setTimeout(renderLoop, 1000 / fps);
}



function resize():void{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    previousTexture = renderer.createTexture();
    currentTexture = renderer.createTexture();
}

function onPress(event:MouseEvent):void{
    addPoint(mousePositionX,mousePositionY,Math.random()*0.02-0.01,0.03);
}

function addPoint(x:number,y:number,fx:number,fy:number):void{
    if(points.length >= 500)return;
    points.push({x:x,y:y,s:pointSize});
    forces.push({x:fx,y:fy});
    ttl.push(defaulTTL);
}

function removePoint(i:number):void{
    forces.splice(i,1);
    points.splice(i,1);
    ttl.splice(i,1);
}

function distance(x1:number,y1:number,x2:number,y2:number):number{
    return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));
}

