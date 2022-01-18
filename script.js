const canvas = document.querySelector("#Canvas");

const vsSource = `
precision mediump float;

attribute vec4 aVertexPosition;
varying vec2 inPosition;

void main() {
    inPosition = ((aVertexPosition+vec4(1.0,1.0,1.0,1.0))/2.0).xy;
    gl_Position = aVertexPosition;
}
`;

const fsSource = `
precision mediump float;

uniform sampler2D points;
uniform int pointCount;
uniform float screenRatio;
varying vec2 inPosition;
const float pointSize = 0.05;


//decode the x,y coordinates from 4 bytes
vec2 getPoint(int index) {
    vec4 split = texture2D(points, vec2(float(index) / float(pointCount), 0.0));
    return ((vec2(split.r*65280.0+split.g*255.0,split.b*65280.0+split.a*255.0)/65535.0)*vec2(screenRatio,1.0));
}


void main() {
    vec2 position = inPosition*vec2(screenRatio,1.0);
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    for(int i = 0; i < 999999; i++){
        if(i >= pointCount) break;
        vec2 point = getPoint(i);
        if(abs(position.x-point.x) < pointSize && abs(position.y-point.y) < pointSize){
            color = vec4(1.0,0.0,0.0,1.0);
            break;
        }
    }    
    gl_FragColor = color;
}
`;

window.onload = main;





function main() {
    const gl = canvas.getContext("webgl2");

    

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
        },
        uniformLocations: {
            points: gl.getUniformLocation(shaderProgram, 'points'),
            pointCount: gl.getUniformLocation(shaderProgram, 'pointCount'),
            screenRatio: gl.getUniformLocation(shaderProgram, 'screenRatio')
        },
    };

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    
    gl.useProgram(programInfo.program);

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
        
    let points = [
        {x: 1.0, y:0.1},
        {x: 0.7, y:0.5},
        {x: 0.2, y:0.0},
        {x: 0.5, y:0.5}
    ];

    render(gl, programInfo, points);
}


function render(gl, programInfo, points) {

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureFromArray(gl,points));
    gl.uniform1i(programInfo.uniformLocations.points, 0);
    gl.uniform1i(programInfo.uniformLocations.pointCount, points.length);
    gl.uniform1f(programInfo.uniformLocations.screenRatio, canvas.width/canvas.height);


    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}



//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
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


function textureFromArray(gl, array) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let formatted = encodeArray(array);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = array.length;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        formatted);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

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
        butchered[i++] = parseInt(x.slice(0,8),2);
        butchered[i++] = parseInt(x.slice(8,16),2);
        butchered[i++] = parseInt(y.slice(0,8),2);
        butchered[i++] = parseInt(y.slice(8,16),2);
    }
    return butchered;
}