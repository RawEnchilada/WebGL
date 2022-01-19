const canvas = document.querySelector("#Canvas");
let gl = {};
let renderPass = [];
let targetFrameBuffer = null;
let targetTexture = null;

let mousePositionX;
let mousePositionY;

const vsSource = `
precision mediump float;

attribute vec4 aVertexPosition;
varying vec2 inPosition;

void main() {
    inPosition = ((aVertexPosition+vec4(1.0,1.0,1.0,1.0))/2.0).xy;
    gl_Position = aVertexPosition;
}
`;

const fsSource1 = `
precision lowp float;

uniform sampler2D texture;
uniform sampler2D points;
uniform int pointCount;
uniform float screenRatio;
varying vec2 inPosition;
const float pointSize = 0.02;


//decode the x,y coordinates from 4 bytes
vec2 getPoint(int index) {
    vec4 split = texture2D(points, vec2(float(index) / float(pointCount), 0.0));
    vec2 t = vec2(floor(split.x*65280.0+split.y*255.0),floor(split.z*65280.0+split.w*255.0));
    return (t*vec2(screenRatio/65535.0,1.0/65535.0));
}


void main() {
    vec2 position = inPosition*vec2(screenRatio,1.0);
    //vec4 color = vec4(texture2D(texture, position).rgb, 1.0);
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    for(int i = 0; i < 999999; i++){
        if(i >= pointCount) break;
        vec2 point = getPoint(i);
        if(distance(point,position) < pointSize){
            color = vec4(point.x,0.1,point.y,1.0);
            break;
        }
    }    
    gl_FragColor = color;
}
`;

const fsSource2 = `
precision mediump float;

uniform sampler2D texture;
varying vec2 inPosition;



void main() {
    vec4 color = texture2D(texture, inPosition);
    gl_FragColor = vec4(color.rgb,1.0);
}
`;

window.onload = main;


let points = [
    {x: 0.75, y:0.4},
    {x: 0.5, y:0.5},
    {x: 0.25, y:0.25},
    {x: 0.75, y:0.75},
];


function main() {
    gl = canvas.getContext("webgl2");

    

    const shaderProgram = initShaderProgram(vsSource, fsSource1);
    renderPass[0] = ({
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
            texture: gl.getUniformLocation(shaderProgram, 'texture'),
            points: gl.getUniformLocation(shaderProgram, 'points'),
            pointCount: gl.getUniformLocation(shaderProgram, 'pointCount'),
            screenRatio: gl.getUniformLocation(shaderProgram, 'screenRatio')
        },
    });
    const shaderProgram2 = initShaderProgram(vsSource, fsSource2);
    renderPass[1] = ({
        program: shaderProgram2,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition')
        },
        uniformLocations: {
            texture: gl.getUniformLocation(shaderProgram2, 'texture')
        },
    });

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const fill = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(fill),
        gl.STATIC_DRAW);


    targetFrameBuffer = gl.createFramebuffer();
    resize();

        
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.vertexAttribPointer(
            renderPass[0].attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            renderPass[0].attribLocations.vertexPosition);
    }

    canvas.addEventListener("mousemove", event=>{
        mousePositionX = event.clientX/canvas.width;
        mousePositionY = 1-(event.clientY/canvas.height);
    });
        
    renderLoop();
}

function update(){
    points[0].x = mousePositionX;
    points[0].y = mousePositionY;
}


function renderLoop(){
    update();
    renderToTexture(targetFrameBuffer,0);
    render(targetTexture,1);
    window.setTimeout(renderLoop, 1000 / 60);
}

function renderToTexture(frameBuffer,pass){
    resize();
    let rp = renderPass[pass];
    gl.useProgram(rp.program);

    let lastPass = getLastPassTexture();

    
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    /*gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFromArray(points));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, lastPass);
    gl.uniform1i(rp.uniformLocations.points, 0);
    gl.uniform1i(rp.uniformLocations.texture, 1);
    gl.uniform1i(rp.uniformLocations.pointCount, points.length);
    gl.uniform1f(rp.uniformLocations.screenRatio, canvas.width/canvas.height);


    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}

function render(sourceTexture,pass) {
    resize();
    let rp = renderPass[pass];
    gl.useProgram(rp.program);

    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
    gl.uniform1i(rp.uniformLocations.texture, 1);


    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}



/*
Initialize a shader program, so WebGL knows how to draw our data
*/
function initShaderProgram(vsSource, fsSource) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

/*
creates a shader of the given type, uploads the source and
compiles it.
*/
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/*
if an array is passed, a 1d encoded texture is returned
else a canvas sized empty texture is returned
*/
function textureFromArray(array) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let formatted = null;
    let width = canvas.width;
    let height = canvas.height;
    if(Array.isArray(array) && array.length > 0){
        formatted = encodeArray(array);
        width = array.length;
        height = 1;
    }

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        formatted);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    return texture;
}

/*
Splitting up every number into 2 bytes to keep precision when passing as texture
*/
function encodeArray(array){
    let butchered = new Uint8Array(array.length*4);
    let i = 0;
    for(let point of array){
        let x = Math.floor(point.x*65535).toString(2);
        let y = Math.floor(point.y*65535).toString(2);
        while(x.length < 16) {
            x = "0" + x;
        }
        while(y.length < 16) {
            y = "0" + y;
        }
        butchered[i++] = parseInt(x.slice(0,8),2);
        butchered[i++] = parseInt(x.slice(8,16),2);
        butchered[i++] = parseInt(y.slice(0,8),2);
        butchered[i++] = parseInt(y.slice(8,16),2);
    }
    return butchered;
}

function resize(){
    if(canvas.width != window.innerWidth || canvas.height != window.innerHeight){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        targetTexture = textureFromArray(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, targetFrameBuffer);
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, 0);
    }
}

function getLastPassTexture(){
    let texture = textureFromArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, canvas.width, canvas.height, 0);
    return texture;
}