/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./gl_modules.ts":
/*!***********************!*\
  !*** ./gl_modules.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Renderer = exports.ShaderDefinition = void 0;
var ShaderDefinition = /** @class */ (function () {
    function ShaderDefinition(program, attribBind, uniformBind) {
        this.program = program;
        this.aBind = attribBind;
        this.uBind = uniformBind;
    }
    return ShaderDefinition;
}());
exports.ShaderDefinition = ShaderDefinition;
var Renderer = /** @class */ (function () {
    function Renderer(canvas) {
        this.renderPass = [];
        var c = canvas.getContext("webgl2");
        if (c === null) {
            throw ("Unable to initialize WebGL. Your browser or machine may not support it.");
        }
        else {
            this.gl = c;
        }
        this.canvas = canvas;
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        var fill = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(fill), this.gl.STATIC_DRAW);
    }
    /*
    Create canvas sized texture.
    */
    Renderer.prototype.createTexture = function () {
        var texture = this.gl.createTexture();
        if (texture === null)
            throw "What";
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        var formatted = null;
        var width = this.canvas.width;
        var height = this.canvas.height;
        var level = 0;
        var internalFormat = this.gl.RGBA;
        var border = 0;
        var srcFormat = this.gl.RGBA;
        var srcType = this.gl.UNSIGNED_BYTE;
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, formatted);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        return texture;
    };
    /*
    creates a shader of the given type, uploads the source and
    compiles it.
    */
    Renderer.prototype.loadShader = function (type, source) {
        var shader = this.gl.createShader(type);
        if (shader === null)
            throw "Error loading shader, type: " + type;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            var e = ('An error occurred compiling type ' + type + ' shader: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            throw e;
        }
        return shader;
    };
    /*
    Initialize a shader program, so Webthis.GL knows how to draw our data
    */
    Renderer.prototype.initShaderProgram = function (vsSource, fsSource) {
        var vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        var fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
        var shaderProgram = this.gl.createProgram();
        if (shaderProgram === null)
            throw "Failed creating shader program";
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            throw ('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
        }
        return shaderProgram;
    };
    Renderer.prototype.getLastPassTexture = function () {
        var texture = this.createTexture();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 0, 0, this.canvas.width, this.canvas.height, 0);
        return texture;
    };
    Renderer.prototype.render = function (pass) {
        //resize();
        var rp = this.renderPass[pass];
        this.gl.useProgram(rp.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        rp.uBind(this.gl);
        var offset = 0;
        var vertexCount = 4;
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    };
    Renderer.prototype.renderToTexture = function (frameBuffer, pass) {
        //resize();
        var rp = this.renderPass[pass];
        this.gl.useProgram(rp.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        /*gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/
        rp.uBind(this.gl);
        var offset = 0;
        var vertexCount = 4;
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    };
    Renderer.prototype.nextPass = function (rp) {
        rp.aBind(this.gl);
        this.renderPass.push(rp);
    };
    return Renderer;
}());
exports.Renderer = Renderer;


/***/ }),

/***/ "./shaders.ts":
/*!********************!*\
  !*** ./shaders.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defFS = exports.pointFS = exports.defVS = void 0;
exports.defVS = "\nprecision mediump float;\n\nattribute vec4 aVertexPosition;\nvarying vec2 inPosition;\n\nvoid main() {\n    inPosition = ((aVertexPosition+vec4(1.0,1.0,1.0,1.0))/2.0).xy;\n    gl_Position = aVertexPosition;\n}\n";
exports.pointFS = "\nprecision mediump float;\n\nuniform sampler2D texture;\nuniform vec2 points[500];\nuniform float pointSize[500];\nuniform int pointCount;\nuniform float screenRatio;\n\nvarying vec2 inPosition;\n\n\nvoid main() {\n    vec2 position = inPosition*vec2(screenRatio,1.0);\n\n    vec3 color = vec3(0.0,0.0,0.0);\n    vec4 prevColor = vec4(texture2D(texture, inPosition).rgb, 1.0);\n    if(length(prevColor.rgb) < 0.3)prevColor = vec4(0,0,0,1.0);\n    for(int i = 0; i < 500; i++){\n        if(i >= pointCount) break;\n        float dist = distance(points[i]*vec2(screenRatio,1.0),position);\n        if(dist < pointSize[i]){\n            float weight = 1.0-dist/pointSize[i];\n            color = vec3(points[i].x,0.1,points[i].y)*vec3(weight,weight,weight);\n            break;\n        }\n    }\n    gl_FragColor = vec4(color,1.0)+prevColor*0.95;\n}\n";
exports.defFS = "\nprecision mediump float;\n\nuniform sampler2D texture;\n\nvarying vec2 inPosition;\n\n\n\nvoid main() {\n    vec4 color = texture2D(texture, inPosition);\n    gl_FragColor = vec4(color.rgb,1.0);\n}\n";


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************!*\
  !*** ./script.ts ***!
  \*******************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var shaders_1 = __webpack_require__(/*! ./shaders */ "./shaders.ts");
var gl_modules_1 = __webpack_require__(/*! ./gl_modules */ "./gl_modules.ts");
var canvas = document.querySelector('#Canvas');
var renderer = new gl_modules_1.Renderer(canvas);
var gl = renderer.gl;
var previousFrameBuffer = null;
var previousTexture = null;
var currentFrameBuffer = null;
var currentTexture = null;
var mousePositionX;
var mousePositionY;
var points = [];
var forces = [];
var ttl = [];
var tick = 0;
var fps = 60;
var pointSize = 0.02;
var defaulTTL = 3000;
window.onload = main;
function main() {
    var numComponents = 2;
    var type = WebGL2RenderingContext.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    var shaderProgram0 = renderer.initShaderProgram(shaders_1.defVS, shaders_1.pointFS);
    renderer.nextPass(new gl_modules_1.ShaderDefinition(shaderProgram0, function (gl) {
        gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram0, 'aVertexPosition'), numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram0, 'aVertexPosition'));
    }, function (gl) {
        var pfv = new Float32Array(1000);
        var sfv = new Float32Array(500);
        var n = 0;
        for (var i = 0; i < Math.min(points.length, 500); i++) {
            pfv[n++] = points[i].x;
            pfv[n++] = points[i].y;
            sfv[i] = points[i].s;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, previousTexture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram0, 'texture'), 0);
        gl.uniform2fv(gl.getUniformLocation(shaderProgram0, 'points'), pfv);
        gl.uniform1i(gl.getUniformLocation(shaderProgram0, 'pointCount'), Math.min(points.length, 500));
        gl.uniform1fv(gl.getUniformLocation(shaderProgram0, 'pointSize'), sfv);
        gl.uniform1f(gl.getUniformLocation(shaderProgram0, 'screenRatio'), window.innerWidth / window.innerHeight);
    }));
    var shaderProgram1 = renderer.initShaderProgram(shaders_1.defVS, shaders_1.defFS);
    renderer.nextPass(new gl_modules_1.ShaderDefinition(shaderProgram1, function (gl) {
        gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram1, 'aVertexPosition'), numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram1, 'aVertexPosition'));
    }, function (gl) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram1, 'texture'), 0);
    }));
    currentFrameBuffer = gl.createFramebuffer();
    previousFrameBuffer = gl.createFramebuffer();
    resize();
    canvas.addEventListener("mousemove", function (event) {
        mousePositionX = event.clientX / window.innerWidth;
        mousePositionY = 1 - (event.clientY / window.innerHeight);
    });
    window.addEventListener("mousedown", function (event) { return onPress(event); });
    window.addEventListener("resize", function () { return resize(); });
    renderLoop();
}
function update() {
    for (var i = points.length - 1; i >= 0; i--) {
        ttl[i]--;
        if (ttl[i] <= 0) {
            removePoint(i);
        }
        else {
            var d = distance(points[i].x, points[i].y, mousePositionX, mousePositionY);
            if (d < 0.05)
                points[i].s = Math.max(pointSize, pointSize + pointSize * (1 - (d / 0.05)));
            points[i].x += forces[i].x;
            points[i].y += forces[i].y;
            if (forces[i].x > 0)
                forces[i].x -= 0.005 / fps;
            if (forces[i].y > -1)
                forces[i].y -= 0.05 / fps;
            if (points[i].x < 0)
                removePoint(i);
        }
    }
    tick++;
    if (tick % 10 == 0) {
        addPoint(Math.random(), Math.random() / 2, Math.random() * 0.02 - 0.01, 0.03);
    }
}
function renderLoop() {
    update();
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentTexture, 0);
    renderer.renderToTexture(currentFrameBuffer, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, previousFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, previousTexture, 0);
    renderer.renderToTexture(previousFrameBuffer, 1);
    renderer.render(1);
    window.setTimeout(renderLoop, 1000 / fps);
}
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    previousTexture = renderer.createTexture();
    currentTexture = renderer.createTexture();
}
function onPress(event) {
    addPoint(mousePositionX, mousePositionY, Math.random() * 0.02 - 0.01, 0.03);
}
function addPoint(x, y, fx, fy) {
    if (points.length >= 500)
        return;
    points.push({ x: x, y: y, s: pointSize });
    forces.push({ x: fx, y: fy });
    ttl.push(defaulTTL);
}
function removePoint(i) {
    forces.splice(i, 1);
    points.splice(i, 1);
    ttl.splice(i, 1);
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsMEJBQTBCO0FBQzVDLGtCQUFrQixjQUFjO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vZ2xfbW9kdWxlcy50cyIsIndlYnBhY2s6Ly8vLi9zaGFkZXJzLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zY3JpcHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJlbmRlcmVyID0gZXhwb3J0cy5TaGFkZXJEZWZpbml0aW9uID0gdm9pZCAwO1xudmFyIFNoYWRlckRlZmluaXRpb24gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2hhZGVyRGVmaW5pdGlvbihwcm9ncmFtLCBhdHRyaWJCaW5kLCB1bmlmb3JtQmluZCkge1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBwcm9ncmFtO1xuICAgICAgICB0aGlzLmFCaW5kID0gYXR0cmliQmluZDtcbiAgICAgICAgdGhpcy51QmluZCA9IHVuaWZvcm1CaW5kO1xuICAgIH1cbiAgICByZXR1cm4gU2hhZGVyRGVmaW5pdGlvbjtcbn0oKSk7XG5leHBvcnRzLlNoYWRlckRlZmluaXRpb24gPSBTaGFkZXJEZWZpbml0aW9uO1xudmFyIFJlbmRlcmVyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlbmRlcmVyKGNhbnZhcykge1xuICAgICAgICB0aGlzLnJlbmRlclBhc3MgPSBbXTtcbiAgICAgICAgdmFyIGMgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiKTtcbiAgICAgICAgaWYgKGMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IChcIlVuYWJsZSB0byBpbml0aWFsaXplIFdlYkdMLiBZb3VyIGJyb3dzZXIgb3IgbWFjaGluZSBtYXkgbm90IHN1cHBvcnQgaXQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbCA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgICAgIHZhciBidWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcik7XG4gICAgICAgIHZhciBmaWxsID0gW1xuICAgICAgICAgICAgMS4wLCAxLjAsXG4gICAgICAgICAgICAtMS4wLCAxLjAsXG4gICAgICAgICAgICAxLjAsIC0xLjAsXG4gICAgICAgICAgICAtMS4wLCAtMS4wXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YSh0aGlzLmdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShmaWxsKSwgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgfVxuICAgIC8qXG4gICAgQ3JlYXRlIGNhbnZhcyBzaXplZCB0ZXh0dXJlLlxuICAgICovXG4gICAgUmVuZGVyZXIucHJvdG90eXBlLmNyZWF0ZVRleHR1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0ZXh0dXJlID0gdGhpcy5nbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGlmICh0ZXh0dXJlID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgXCJXaGF0XCI7XG4gICAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGhpcy5nbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcbiAgICAgICAgdmFyIGZvcm1hdHRlZCA9IG51bGw7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICB2YXIgbGV2ZWwgPSAwO1xuICAgICAgICB2YXIgaW50ZXJuYWxGb3JtYXQgPSB0aGlzLmdsLlJHQkE7XG4gICAgICAgIHZhciBib3JkZXIgPSAwO1xuICAgICAgICB2YXIgc3JjRm9ybWF0ID0gdGhpcy5nbC5SR0JBO1xuICAgICAgICB2YXIgc3JjVHlwZSA9IHRoaXMuZ2wuVU5TSUdORURfQllURTtcbiAgICAgICAgdGhpcy5nbC50ZXhJbWFnZTJEKHRoaXMuZ2wuVEVYVFVSRV8yRCwgbGV2ZWwsIGludGVybmFsRm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCBib3JkZXIsIHNyY0Zvcm1hdCwgc3JjVHlwZSwgZm9ybWF0dGVkKTtcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMuZ2wuTkVBUkVTVCk7XG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB0aGlzLmdsLk5FQVJFU1QpO1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9O1xuICAgIC8qXG4gICAgY3JlYXRlcyBhIHNoYWRlciBvZiB0aGUgZ2l2ZW4gdHlwZSwgdXBsb2FkcyB0aGUgc291cmNlIGFuZFxuICAgIGNvbXBpbGVzIGl0LlxuICAgICovXG4gICAgUmVuZGVyZXIucHJvdG90eXBlLmxvYWRTaGFkZXIgPSBmdW5jdGlvbiAodHlwZSwgc291cmNlKSB7XG4gICAgICAgIHZhciBzaGFkZXIgPSB0aGlzLmdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgICAgICAgaWYgKHNoYWRlciA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IFwiRXJyb3IgbG9hZGluZyBzaGFkZXIsIHR5cGU6IFwiICsgdHlwZTtcbiAgICAgICAgdGhpcy5nbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgICAgICB0aGlzLmdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgaWYgKCF0aGlzLmdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIHRoaXMuZ2wuQ09NUElMRV9TVEFUVVMpKSB7XG4gICAgICAgICAgICB2YXIgZSA9ICgnQW4gZXJyb3Igb2NjdXJyZWQgY29tcGlsaW5nIHR5cGUgJyArIHR5cGUgKyAnIHNoYWRlcjogJyArIHRoaXMuZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfTtcbiAgICAvKlxuICAgIEluaXRpYWxpemUgYSBzaGFkZXIgcHJvZ3JhbSwgc28gV2VidGhpcy5HTCBrbm93cyBob3cgdG8gZHJhdyBvdXIgZGF0YVxuICAgICovXG4gICAgUmVuZGVyZXIucHJvdG90eXBlLmluaXRTaGFkZXJQcm9ncmFtID0gZnVuY3Rpb24gKHZzU291cmNlLCBmc1NvdXJjZSkge1xuICAgICAgICB2YXIgdmVydGV4U2hhZGVyID0gdGhpcy5sb2FkU2hhZGVyKHRoaXMuZ2wuVkVSVEVYX1NIQURFUiwgdnNTb3VyY2UpO1xuICAgICAgICB2YXIgZnJhZ21lbnRTaGFkZXIgPSB0aGlzLmxvYWRTaGFkZXIodGhpcy5nbC5GUkFHTUVOVF9TSEFERVIsIGZzU291cmNlKTtcbiAgICAgICAgdmFyIHNoYWRlclByb2dyYW0gPSB0aGlzLmdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgaWYgKHNoYWRlclByb2dyYW0gPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBcIkZhaWxlZCBjcmVhdGluZyBzaGFkZXIgcHJvZ3JhbVwiO1xuICAgICAgICB0aGlzLmdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuICAgICAgICB0aGlzLmdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gICAgICAgIHRoaXMuZ2wubGlua1Byb2dyYW0oc2hhZGVyUHJvZ3JhbSk7XG4gICAgICAgIGlmICghdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIHRoaXMuZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgICAgICB0aHJvdyAoJ1VuYWJsZSB0byBpbml0aWFsaXplIHRoZSBzaGFkZXIgcHJvZ3JhbTogJyArIHRoaXMuZ2wuZ2V0UHJvZ3JhbUluZm9Mb2coc2hhZGVyUHJvZ3JhbSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaGFkZXJQcm9ncmFtO1xuICAgIH07XG4gICAgUmVuZGVyZXIucHJvdG90eXBlLmdldExhc3RQYXNzVGV4dHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIHRoaXMuZ2wuY29weVRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCAwLCB0aGlzLmdsLlJHQkEsIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQsIDApO1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICB9O1xuICAgIFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAocGFzcykge1xuICAgICAgICAvL3Jlc2l6ZSgpO1xuICAgICAgICB2YXIgcnAgPSB0aGlzLnJlbmRlclBhc3NbcGFzc107XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbShycC5wcm9ncmFtKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5nbC5jYW52YXMud2lkdGgsIHRoaXMuZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIHJwLnVCaW5kKHRoaXMuZ2wpO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgICAgdmFyIHZlcnRleENvdW50ID0gNDtcbiAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZ2wuVFJJQU5HTEVfU1RSSVAsIG9mZnNldCwgdmVydGV4Q291bnQpO1xuICAgIH07XG4gICAgUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclRvVGV4dHVyZSA9IGZ1bmN0aW9uIChmcmFtZUJ1ZmZlciwgcGFzcykge1xuICAgICAgICAvL3Jlc2l6ZSgpO1xuICAgICAgICB2YXIgcnAgPSB0aGlzLnJlbmRlclBhc3NbcGFzc107XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbShycC5wcm9ncmFtKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGhpcy5nbC5GUkFNRUJVRkZFUiwgZnJhbWVCdWZmZXIpO1xuICAgICAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuZ2wuY2FudmFzLndpZHRoLCB0aGlzLmdsLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAvKmdsLmNsZWFyQ29sb3IoMC4wLCAwLjAsIDAuMCwgMS4wKTtcbiAgICAgICAgZ2wuY2xlYXJEZXB0aCgxLjApO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7Ki9cbiAgICAgICAgcnAudUJpbmQodGhpcy5nbCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICB2YXIgdmVydGV4Q291bnQgPSA0O1xuICAgICAgICB0aGlzLmdsLmRyYXdBcnJheXModGhpcy5nbC5UUklBTkdMRV9TVFJJUCwgb2Zmc2V0LCB2ZXJ0ZXhDb3VudCk7XG4gICAgfTtcbiAgICBSZW5kZXJlci5wcm90b3R5cGUubmV4dFBhc3MgPSBmdW5jdGlvbiAocnApIHtcbiAgICAgICAgcnAuYUJpbmQodGhpcy5nbCk7XG4gICAgICAgIHRoaXMucmVuZGVyUGFzcy5wdXNoKHJwKTtcbiAgICB9O1xuICAgIHJldHVybiBSZW5kZXJlcjtcbn0oKSk7XG5leHBvcnRzLlJlbmRlcmVyID0gUmVuZGVyZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmRlMgPSBleHBvcnRzLnBvaW50RlMgPSBleHBvcnRzLmRlZlZTID0gdm9pZCAwO1xuZXhwb3J0cy5kZWZWUyA9IFwiXFxucHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuXFxuYXR0cmlidXRlIHZlYzQgYVZlcnRleFBvc2l0aW9uO1xcbnZhcnlpbmcgdmVjMiBpblBvc2l0aW9uO1xcblxcbnZvaWQgbWFpbigpIHtcXG4gICAgaW5Qb3NpdGlvbiA9ICgoYVZlcnRleFBvc2l0aW9uK3ZlYzQoMS4wLDEuMCwxLjAsMS4wKSkvMi4wKS54eTtcXG4gICAgZ2xfUG9zaXRpb24gPSBhVmVydGV4UG9zaXRpb247XFxufVxcblwiO1xuZXhwb3J0cy5wb2ludEZTID0gXCJcXG5wcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcXG5cXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcbnVuaWZvcm0gdmVjMiBwb2ludHNbNTAwXTtcXG51bmlmb3JtIGZsb2F0IHBvaW50U2l6ZVs1MDBdO1xcbnVuaWZvcm0gaW50IHBvaW50Q291bnQ7XFxudW5pZm9ybSBmbG9hdCBzY3JlZW5SYXRpbztcXG5cXG52YXJ5aW5nIHZlYzIgaW5Qb3NpdGlvbjtcXG5cXG5cXG52b2lkIG1haW4oKSB7XFxuICAgIHZlYzIgcG9zaXRpb24gPSBpblBvc2l0aW9uKnZlYzIoc2NyZWVuUmF0aW8sMS4wKTtcXG5cXG4gICAgdmVjMyBjb2xvciA9IHZlYzMoMC4wLDAuMCwwLjApO1xcbiAgICB2ZWM0IHByZXZDb2xvciA9IHZlYzQodGV4dHVyZTJEKHRleHR1cmUsIGluUG9zaXRpb24pLnJnYiwgMS4wKTtcXG4gICAgaWYobGVuZ3RoKHByZXZDb2xvci5yZ2IpIDwgMC4zKXByZXZDb2xvciA9IHZlYzQoMCwwLDAsMS4wKTtcXG4gICAgZm9yKGludCBpID0gMDsgaSA8IDUwMDsgaSsrKXtcXG4gICAgICAgIGlmKGkgPj0gcG9pbnRDb3VudCkgYnJlYWs7XFxuICAgICAgICBmbG9hdCBkaXN0ID0gZGlzdGFuY2UocG9pbnRzW2ldKnZlYzIoc2NyZWVuUmF0aW8sMS4wKSxwb3NpdGlvbik7XFxuICAgICAgICBpZihkaXN0IDwgcG9pbnRTaXplW2ldKXtcXG4gICAgICAgICAgICBmbG9hdCB3ZWlnaHQgPSAxLjAtZGlzdC9wb2ludFNpemVbaV07XFxuICAgICAgICAgICAgY29sb3IgPSB2ZWMzKHBvaW50c1tpXS54LDAuMSxwb2ludHNbaV0ueSkqdmVjMyh3ZWlnaHQsd2VpZ2h0LHdlaWdodCk7XFxuICAgICAgICAgICAgYnJlYWs7XFxuICAgICAgICB9XFxuICAgIH1cXG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwxLjApK3ByZXZDb2xvciowLjk1O1xcbn1cXG5cIjtcbmV4cG9ydHMuZGVmRlMgPSBcIlxcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xcblxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxuXFxudmFyeWluZyB2ZWMyIGluUG9zaXRpb247XFxuXFxuXFxuXFxudm9pZCBtYWluKCkge1xcbiAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKHRleHR1cmUsIGluUG9zaXRpb24pO1xcbiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KGNvbG9yLnJnYiwxLjApO1xcbn1cXG5cIjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBzaGFkZXJzXzEgPSByZXF1aXJlKFwiLi9zaGFkZXJzXCIpO1xudmFyIGdsX21vZHVsZXNfMSA9IHJlcXVpcmUoXCIuL2dsX21vZHVsZXNcIik7XG52YXIgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0NhbnZhcycpO1xudmFyIHJlbmRlcmVyID0gbmV3IGdsX21vZHVsZXNfMS5SZW5kZXJlcihjYW52YXMpO1xudmFyIGdsID0gcmVuZGVyZXIuZ2w7XG52YXIgcHJldmlvdXNGcmFtZUJ1ZmZlciA9IG51bGw7XG52YXIgcHJldmlvdXNUZXh0dXJlID0gbnVsbDtcbnZhciBjdXJyZW50RnJhbWVCdWZmZXIgPSBudWxsO1xudmFyIGN1cnJlbnRUZXh0dXJlID0gbnVsbDtcbnZhciBtb3VzZVBvc2l0aW9uWDtcbnZhciBtb3VzZVBvc2l0aW9uWTtcbnZhciBwb2ludHMgPSBbXTtcbnZhciBmb3JjZXMgPSBbXTtcbnZhciB0dGwgPSBbXTtcbnZhciB0aWNrID0gMDtcbnZhciBmcHMgPSA2MDtcbnZhciBwb2ludFNpemUgPSAwLjAyO1xudmFyIGRlZmF1bFRUTCA9IDMwMDA7XG53aW5kb3cub25sb2FkID0gbWFpbjtcbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgdmFyIG51bUNvbXBvbmVudHMgPSAyO1xuICAgIHZhciB0eXBlID0gV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GTE9BVDtcbiAgICB2YXIgbm9ybWFsaXplID0gZmFsc2U7XG4gICAgdmFyIHN0cmlkZSA9IDA7XG4gICAgdmFyIG9mZnNldCA9IDA7XG4gICAgdmFyIHNoYWRlclByb2dyYW0wID0gcmVuZGVyZXIuaW5pdFNoYWRlclByb2dyYW0oc2hhZGVyc18xLmRlZlZTLCBzaGFkZXJzXzEucG9pbnRGUyk7XG4gICAgcmVuZGVyZXIubmV4dFBhc3MobmV3IGdsX21vZHVsZXNfMS5TaGFkZXJEZWZpbml0aW9uKHNoYWRlclByb2dyYW0wLCBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtMCwgJ2FWZXJ0ZXhQb3NpdGlvbicpLCBudW1Db21wb25lbnRzLCB0eXBlLCBub3JtYWxpemUsIHN0cmlkZSwgb2Zmc2V0KTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTAsICdhVmVydGV4UG9zaXRpb24nKSk7XG4gICAgfSwgZnVuY3Rpb24gKGdsKSB7XG4gICAgICAgIHZhciBwZnYgPSBuZXcgRmxvYXQzMkFycmF5KDEwMDApO1xuICAgICAgICB2YXIgc2Z2ID0gbmV3IEZsb2F0MzJBcnJheSg1MDApO1xuICAgICAgICB2YXIgbiA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5taW4ocG9pbnRzLmxlbmd0aCwgNTAwKTsgaSsrKSB7XG4gICAgICAgICAgICBwZnZbbisrXSA9IHBvaW50c1tpXS54O1xuICAgICAgICAgICAgcGZ2W24rK10gPSBwb2ludHNbaV0ueTtcbiAgICAgICAgICAgIHNmdltpXSA9IHBvaW50c1tpXS5zO1xuICAgICAgICB9XG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTApO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCBwcmV2aW91c1RleHR1cmUpO1xuICAgICAgICBnbC51bmlmb3JtMWkoZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW0wLCAndGV4dHVyZScpLCAwKTtcbiAgICAgICAgZ2wudW5pZm9ybTJmdihnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTAsICdwb2ludHMnKSwgcGZ2KTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtMCwgJ3BvaW50Q291bnQnKSwgTWF0aC5taW4ocG9pbnRzLmxlbmd0aCwgNTAwKSk7XG4gICAgICAgIGdsLnVuaWZvcm0xZnYoZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW0wLCAncG9pbnRTaXplJyksIHNmdik7XG4gICAgICAgIGdsLnVuaWZvcm0xZihnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTAsICdzY3JlZW5SYXRpbycpLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgfSkpO1xuICAgIHZhciBzaGFkZXJQcm9ncmFtMSA9IHJlbmRlcmVyLmluaXRTaGFkZXJQcm9ncmFtKHNoYWRlcnNfMS5kZWZWUywgc2hhZGVyc18xLmRlZkZTKTtcbiAgICByZW5kZXJlci5uZXh0UGFzcyhuZXcgZ2xfbW9kdWxlc18xLlNoYWRlckRlZmluaXRpb24oc2hhZGVyUHJvZ3JhbTEsIGZ1bmN0aW9uIChnbCkge1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0xLCAnYVZlcnRleFBvc2l0aW9uJyksIG51bUNvbXBvbmVudHMsIHR5cGUsIG5vcm1hbGl6ZSwgc3RyaWRlLCBvZmZzZXQpO1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtMSwgJ2FWZXJ0ZXhQb3NpdGlvbicpKTtcbiAgICB9LCBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIGN1cnJlbnRUZXh0dXJlKTtcbiAgICAgICAgZ2wudW5pZm9ybTFpKGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtMSwgJ3RleHR1cmUnKSwgMCk7XG4gICAgfSkpO1xuICAgIGN1cnJlbnRGcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgcHJldmlvdXNGcmFtZUJ1ZmZlciA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgcmVzaXplKCk7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIG1vdXNlUG9zaXRpb25YID0gZXZlbnQuY2xpZW50WCAvIHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBtb3VzZVBvc2l0aW9uWSA9IDEgLSAoZXZlbnQuY2xpZW50WSAvIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gKGV2ZW50KSB7IHJldHVybiBvblByZXNzKGV2ZW50KTsgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVzaXplKCk7IH0pO1xuICAgIHJlbmRlckxvb3AoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICBmb3IgKHZhciBpID0gcG9pbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHR0bFtpXS0tO1xuICAgICAgICBpZiAodHRsW2ldIDw9IDApIHtcbiAgICAgICAgICAgIHJlbW92ZVBvaW50KGkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGQgPSBkaXN0YW5jZShwb2ludHNbaV0ueCwgcG9pbnRzW2ldLnksIG1vdXNlUG9zaXRpb25YLCBtb3VzZVBvc2l0aW9uWSk7XG4gICAgICAgICAgICBpZiAoZCA8IDAuMDUpXG4gICAgICAgICAgICAgICAgcG9pbnRzW2ldLnMgPSBNYXRoLm1heChwb2ludFNpemUsIHBvaW50U2l6ZSArIHBvaW50U2l6ZSAqICgxIC0gKGQgLyAwLjA1KSkpO1xuICAgICAgICAgICAgcG9pbnRzW2ldLnggKz0gZm9yY2VzW2ldLng7XG4gICAgICAgICAgICBwb2ludHNbaV0ueSArPSBmb3JjZXNbaV0ueTtcbiAgICAgICAgICAgIGlmIChmb3JjZXNbaV0ueCA+IDApXG4gICAgICAgICAgICAgICAgZm9yY2VzW2ldLnggLT0gMC4wMDUgLyBmcHM7XG4gICAgICAgICAgICBpZiAoZm9yY2VzW2ldLnkgPiAtMSlcbiAgICAgICAgICAgICAgICBmb3JjZXNbaV0ueSAtPSAwLjA1IC8gZnBzO1xuICAgICAgICAgICAgaWYgKHBvaW50c1tpXS54IDwgMClcbiAgICAgICAgICAgICAgICByZW1vdmVQb2ludChpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aWNrKys7XG4gICAgaWYgKHRpY2sgJSAxMCA9PSAwKSB7XG4gICAgICAgIGFkZFBvaW50KE1hdGgucmFuZG9tKCksIE1hdGgucmFuZG9tKCkgLyAyLCBNYXRoLnJhbmRvbSgpICogMC4wMiAtIDAuMDEsIDAuMDMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHJlbmRlckxvb3AoKSB7XG4gICAgdXBkYXRlKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBjdXJyZW50RnJhbWVCdWZmZXIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgY3VycmVudFRleHR1cmUsIDApO1xuICAgIHJlbmRlcmVyLnJlbmRlclRvVGV4dHVyZShjdXJyZW50RnJhbWVCdWZmZXIsIDApO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgcHJldmlvdXNGcmFtZUJ1ZmZlcik7XG4gICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoZ2wuRlJBTUVCVUZGRVIsIGdsLkNPTE9SX0FUVEFDSE1FTlQwLCBnbC5URVhUVVJFXzJELCBwcmV2aW91c1RleHR1cmUsIDApO1xuICAgIHJlbmRlcmVyLnJlbmRlclRvVGV4dHVyZShwcmV2aW91c0ZyYW1lQnVmZmVyLCAxKTtcbiAgICByZW5kZXJlci5yZW5kZXIoMSk7XG4gICAgd2luZG93LnNldFRpbWVvdXQocmVuZGVyTG9vcCwgMTAwMCAvIGZwcyk7XG59XG5mdW5jdGlvbiByZXNpemUoKSB7XG4gICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICBwcmV2aW91c1RleHR1cmUgPSByZW5kZXJlci5jcmVhdGVUZXh0dXJlKCk7XG4gICAgY3VycmVudFRleHR1cmUgPSByZW5kZXJlci5jcmVhdGVUZXh0dXJlKCk7XG59XG5mdW5jdGlvbiBvblByZXNzKGV2ZW50KSB7XG4gICAgYWRkUG9pbnQobW91c2VQb3NpdGlvblgsIG1vdXNlUG9zaXRpb25ZLCBNYXRoLnJhbmRvbSgpICogMC4wMiAtIDAuMDEsIDAuMDMpO1xufVxuZnVuY3Rpb24gYWRkUG9pbnQoeCwgeSwgZngsIGZ5KSB7XG4gICAgaWYgKHBvaW50cy5sZW5ndGggPj0gNTAwKVxuICAgICAgICByZXR1cm47XG4gICAgcG9pbnRzLnB1c2goeyB4OiB4LCB5OiB5LCBzOiBwb2ludFNpemUgfSk7XG4gICAgZm9yY2VzLnB1c2goeyB4OiBmeCwgeTogZnkgfSk7XG4gICAgdHRsLnB1c2goZGVmYXVsVFRMKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVBvaW50KGkpIHtcbiAgICBmb3JjZXMuc3BsaWNlKGksIDEpO1xuICAgIHBvaW50cy5zcGxpY2UoaSwgMSk7XG4gICAgdHRsLnNwbGljZShpLCAxKTtcbn1cbmZ1bmN0aW9uIGRpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4MSAtIHgyLCAyKSArIE1hdGgucG93KHkxIC0geTIsIDIpKTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==