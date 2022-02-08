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
exports.pointFS = "\nprecision mediump float;\n\nuniform sampler2D texture;\nuniform vec2 points[500];\nuniform float pointSize[500];\nuniform int pointCount;\nuniform float screenRatio;\n\nvarying vec2 inPosition;\n\n\nvoid main() {\n    vec2 position = inPosition*vec2(screenRatio,1.0);\n\n    vec4 color = vec4(0.0,0.0,0.0,1.0);\n    vec4 prevColor = vec4(texture2D(texture, inPosition).rgb, 1.0);\n    for(int i = 0; i < 500; i++){\n        if(i >= pointCount) break;\n        if(distance(points[i]*vec2(screenRatio,1.0),position) < pointSize[i]){\n            color = vec4(points[i].x,0.1,points[i].y,1.0);\n            break;\n        }\n    }\n    gl_FragColor = color+prevColor;\n}\n";
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
var fps = 60;
var pointSize = 0.02;
var defaulTTL = 10000;
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
            if (d < 0.1)
                points[i].s = Math.max(pointSize, pointSize * (1 - d));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwwQkFBMEI7QUFDNUMsa0JBQWtCLGNBQWM7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9nbF9tb2R1bGVzLnRzIiwid2VicGFjazovLy8uL3NoYWRlcnMudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy8uL3NjcmlwdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVuZGVyZXIgPSBleHBvcnRzLlNoYWRlckRlZmluaXRpb24gPSB2b2lkIDA7XG52YXIgU2hhZGVyRGVmaW5pdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTaGFkZXJEZWZpbml0aW9uKHByb2dyYW0sIGF0dHJpYkJpbmQsIHVuaWZvcm1CaW5kKSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIHRoaXMuYUJpbmQgPSBhdHRyaWJCaW5kO1xuICAgICAgICB0aGlzLnVCaW5kID0gdW5pZm9ybUJpbmQ7XG4gICAgfVxuICAgIHJldHVybiBTaGFkZXJEZWZpbml0aW9uO1xufSgpKTtcbmV4cG9ydHMuU2hhZGVyRGVmaW5pdGlvbiA9IFNoYWRlckRlZmluaXRpb247XG52YXIgUmVuZGVyZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmVuZGVyZXIoY2FudmFzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyUGFzcyA9IFtdO1xuICAgICAgICB2YXIgYyA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2wyXCIpO1xuICAgICAgICBpZiAoYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgKFwiVW5hYmxlIHRvIGluaXRpYWxpemUgV2ViR0wuIFlvdXIgYnJvd3NlciBvciBtYWNoaW5lIG1heSBub3Qgc3VwcG9ydCBpdC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdsID0gYztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdmFyIGJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKTtcbiAgICAgICAgdmFyIGZpbGwgPSBbXG4gICAgICAgICAgICAxLjAsIDEuMCxcbiAgICAgICAgICAgIC0xLjAsIDEuMCxcbiAgICAgICAgICAgIDEuMCwgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsIC0xLjBcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KGZpbGwpLCB0aGlzLmdsLlNUQVRJQ19EUkFXKTtcbiAgICB9XG4gICAgLypcbiAgICBDcmVhdGUgY2FudmFzIHNpemVkIHRleHR1cmUuXG4gICAgKi9cbiAgICBSZW5kZXJlci5wcm90b3R5cGUuY3JlYXRlVGV4dHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRleHR1cmUgPSB0aGlzLmdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICAgICAgaWYgKHRleHR1cmUgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBcIldoYXRcIjtcbiAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuICAgICAgICB2YXIgZm9ybWF0dGVkID0gbnVsbDtcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIHZhciBsZXZlbCA9IDA7XG4gICAgICAgIHZhciBpbnRlcm5hbEZvcm1hdCA9IHRoaXMuZ2wuUkdCQTtcbiAgICAgICAgdmFyIGJvcmRlciA9IDA7XG4gICAgICAgIHZhciBzcmNGb3JtYXQgPSB0aGlzLmdsLlJHQkE7XG4gICAgICAgIHZhciBzcmNUeXBlID0gdGhpcy5nbC5VTlNJR05FRF9CWVRFO1xuICAgICAgICB0aGlzLmdsLnRleEltYWdlMkQodGhpcy5nbC5URVhUVVJFXzJELCBsZXZlbCwgaW50ZXJuYWxGb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGJvcmRlciwgc3JjRm9ybWF0LCBzcmNUeXBlLCBmb3JtYXR0ZWQpO1xuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGhpcy5nbC5URVhUVVJFXzJELCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKTtcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRoaXMuZ2wuVEVYVFVSRV8yRCwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTkVBUkVTVCk7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH07XG4gICAgLypcbiAgICBjcmVhdGVzIGEgc2hhZGVyIG9mIHRoZSBnaXZlbiB0eXBlLCB1cGxvYWRzIHRoZSBzb3VyY2UgYW5kXG4gICAgY29tcGlsZXMgaXQuXG4gICAgKi9cbiAgICBSZW5kZXJlci5wcm90b3R5cGUubG9hZFNoYWRlciA9IGZ1bmN0aW9uICh0eXBlLCBzb3VyY2UpIHtcbiAgICAgICAgdmFyIHNoYWRlciA9IHRoaXMuZ2wuY3JlYXRlU2hhZGVyKHR5cGUpO1xuICAgICAgICBpZiAoc2hhZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgXCJFcnJvciBsb2FkaW5nIHNoYWRlciwgdHlwZTogXCIgKyB0eXBlO1xuICAgICAgICB0aGlzLmdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgICAgIHRoaXMuZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuICAgICAgICBpZiAoIXRoaXMuZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgdGhpcy5nbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgICAgIHZhciBlID0gKCdBbiBlcnJvciBvY2N1cnJlZCBjb21waWxpbmcgdHlwZSAnICsgdHlwZSArICcgc2hhZGVyOiAnICsgdGhpcy5nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgICAgICAgdGhpcy5nbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9O1xuICAgIC8qXG4gICAgSW5pdGlhbGl6ZSBhIHNoYWRlciBwcm9ncmFtLCBzbyBXZWJ0aGlzLkdMIGtub3dzIGhvdyB0byBkcmF3IG91ciBkYXRhXG4gICAgKi9cbiAgICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdFNoYWRlclByb2dyYW0gPSBmdW5jdGlvbiAodnNTb3VyY2UsIGZzU291cmNlKSB7XG4gICAgICAgIHZhciB2ZXJ0ZXhTaGFkZXIgPSB0aGlzLmxvYWRTaGFkZXIodGhpcy5nbC5WRVJURVhfU0hBREVSLCB2c1NvdXJjZSk7XG4gICAgICAgIHZhciBmcmFnbWVudFNoYWRlciA9IHRoaXMubG9hZFNoYWRlcih0aGlzLmdsLkZSQUdNRU5UX1NIQURFUiwgZnNTb3VyY2UpO1xuICAgICAgICB2YXIgc2hhZGVyUHJvZ3JhbSA9IHRoaXMuZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgICBpZiAoc2hhZGVyUHJvZ3JhbSA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IFwiRmFpbGVkIGNyZWF0aW5nIHNoYWRlciBwcm9ncmFtXCI7XG4gICAgICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoYWRlcik7XG4gICAgICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcbiAgICAgICAgdGhpcy5nbC5saW5rUHJvZ3JhbShzaGFkZXJQcm9ncmFtKTtcbiAgICAgICAgaWYgKCF0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIoc2hhZGVyUHJvZ3JhbSwgdGhpcy5nbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgICAgIHRocm93ICgnVW5hYmxlIHRvIGluaXRpYWxpemUgdGhlIHNoYWRlciBwcm9ncmFtOiAnICsgdGhpcy5nbC5nZXRQcm9ncmFtSW5mb0xvZyhzaGFkZXJQcm9ncmFtKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNoYWRlclByb2dyYW07XG4gICAgfTtcbiAgICBSZW5kZXJlci5wcm90b3R5cGUuZ2V0TGFzdFBhc3NUZXh0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGV4dHVyZSA9IHRoaXMuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgdGhpcy5nbC5jb3B5VGV4SW1hZ2UyRCh0aGlzLmdsLlRFWFRVUkVfMkQsIDAsIHRoaXMuZ2wuUkdCQSwgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCwgMCk7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH07XG4gICAgUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIChwYXNzKSB7XG4gICAgICAgIC8vcmVzaXplKCk7XG4gICAgICAgIHZhciBycCA9IHRoaXMucmVuZGVyUGFzc1twYXNzXTtcbiAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHJwLnByb2dyYW0pO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB0aGlzLmdsLmNhbnZhcy53aWR0aCwgdGhpcy5nbC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgcnAudUJpbmQodGhpcy5nbCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICB2YXIgdmVydGV4Q291bnQgPSA0O1xuICAgICAgICB0aGlzLmdsLmRyYXdBcnJheXModGhpcy5nbC5UUklBTkdMRV9TVFJJUCwgb2Zmc2V0LCB2ZXJ0ZXhDb3VudCk7XG4gICAgfTtcbiAgICBSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyVG9UZXh0dXJlID0gZnVuY3Rpb24gKGZyYW1lQnVmZmVyLCBwYXNzKSB7XG4gICAgICAgIC8vcmVzaXplKCk7XG4gICAgICAgIHZhciBycCA9IHRoaXMucmVuZGVyUGFzc1twYXNzXTtcbiAgICAgICAgdGhpcy5nbC51c2VQcm9ncmFtKHJwLnByb2dyYW0pO1xuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBmcmFtZUJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wudmlld3BvcnQoMCwgMCwgdGhpcy5nbC5jYW52YXMud2lkdGgsIHRoaXMuZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIC8qZ2wuY2xlYXJDb2xvcigwLjAsIDAuMCwgMC4wLCAxLjApO1xuICAgICAgICBnbC5jbGVhckRlcHRoKDEuMCk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTsqL1xuICAgICAgICBycC51QmluZCh0aGlzLmdsKTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDA7XG4gICAgICAgIHZhciB2ZXJ0ZXhDb3VudCA9IDQ7XG4gICAgICAgIHRoaXMuZ2wuZHJhd0FycmF5cyh0aGlzLmdsLlRSSUFOR0xFX1NUUklQLCBvZmZzZXQsIHZlcnRleENvdW50KTtcbiAgICB9O1xuICAgIFJlbmRlcmVyLnByb3RvdHlwZS5uZXh0UGFzcyA9IGZ1bmN0aW9uIChycCkge1xuICAgICAgICBycC5hQmluZCh0aGlzLmdsKTtcbiAgICAgICAgdGhpcy5yZW5kZXJQYXNzLnB1c2gocnApO1xuICAgIH07XG4gICAgcmV0dXJuIFJlbmRlcmVyO1xufSgpKTtcbmV4cG9ydHMuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZGUyA9IGV4cG9ydHMucG9pbnRGUyA9IGV4cG9ydHMuZGVmVlMgPSB2b2lkIDA7XG5leHBvcnRzLmRlZlZTID0gXCJcXG5wcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcXG5cXG5hdHRyaWJ1dGUgdmVjNCBhVmVydGV4UG9zaXRpb247XFxudmFyeWluZyB2ZWMyIGluUG9zaXRpb247XFxuXFxudm9pZCBtYWluKCkge1xcbiAgICBpblBvc2l0aW9uID0gKChhVmVydGV4UG9zaXRpb24rdmVjNCgxLjAsMS4wLDEuMCwxLjApKS8yLjApLnh5O1xcbiAgICBnbF9Qb3NpdGlvbiA9IGFWZXJ0ZXhQb3NpdGlvbjtcXG59XFxuXCI7XG5leHBvcnRzLnBvaW50RlMgPSBcIlxcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xcblxcbnVuaWZvcm0gc2FtcGxlcjJEIHRleHR1cmU7XFxudW5pZm9ybSB2ZWMyIHBvaW50c1s1MDBdO1xcbnVuaWZvcm0gZmxvYXQgcG9pbnRTaXplWzUwMF07XFxudW5pZm9ybSBpbnQgcG9pbnRDb3VudDtcXG51bmlmb3JtIGZsb2F0IHNjcmVlblJhdGlvO1xcblxcbnZhcnlpbmcgdmVjMiBpblBvc2l0aW9uO1xcblxcblxcbnZvaWQgbWFpbigpIHtcXG4gICAgdmVjMiBwb3NpdGlvbiA9IGluUG9zaXRpb24qdmVjMihzY3JlZW5SYXRpbywxLjApO1xcblxcbiAgICB2ZWM0IGNvbG9yID0gdmVjNCgwLjAsMC4wLDAuMCwxLjApO1xcbiAgICB2ZWM0IHByZXZDb2xvciA9IHZlYzQodGV4dHVyZTJEKHRleHR1cmUsIGluUG9zaXRpb24pLnJnYiwgMS4wKTtcXG4gICAgZm9yKGludCBpID0gMDsgaSA8IDUwMDsgaSsrKXtcXG4gICAgICAgIGlmKGkgPj0gcG9pbnRDb3VudCkgYnJlYWs7XFxuICAgICAgICBpZihkaXN0YW5jZShwb2ludHNbaV0qdmVjMihzY3JlZW5SYXRpbywxLjApLHBvc2l0aW9uKSA8IHBvaW50U2l6ZVtpXSl7XFxuICAgICAgICAgICAgY29sb3IgPSB2ZWM0KHBvaW50c1tpXS54LDAuMSxwb2ludHNbaV0ueSwxLjApO1xcbiAgICAgICAgICAgIGJyZWFrO1xcbiAgICAgICAgfVxcbiAgICB9XFxuICAgIGdsX0ZyYWdDb2xvciA9IGNvbG9yK3ByZXZDb2xvcjtcXG59XFxuXCI7XG5leHBvcnRzLmRlZkZTID0gXCJcXG5wcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcXG5cXG51bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xcblxcbnZhcnlpbmcgdmVjMiBpblBvc2l0aW9uO1xcblxcblxcblxcbnZvaWQgbWFpbigpIHtcXG4gICAgdmVjNCBjb2xvciA9IHRleHR1cmUyRCh0ZXh0dXJlLCBpblBvc2l0aW9uKTtcXG4gICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvci5yZ2IsMS4wKTtcXG59XFxuXCI7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgc2hhZGVyc18xID0gcmVxdWlyZShcIi4vc2hhZGVyc1wiKTtcbnZhciBnbF9tb2R1bGVzXzEgPSByZXF1aXJlKFwiLi9nbF9tb2R1bGVzXCIpO1xudmFyIGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNDYW52YXMnKTtcbnZhciByZW5kZXJlciA9IG5ldyBnbF9tb2R1bGVzXzEuUmVuZGVyZXIoY2FudmFzKTtcbnZhciBnbCA9IHJlbmRlcmVyLmdsO1xudmFyIHByZXZpb3VzRnJhbWVCdWZmZXIgPSBudWxsO1xudmFyIHByZXZpb3VzVGV4dHVyZSA9IG51bGw7XG52YXIgY3VycmVudEZyYW1lQnVmZmVyID0gbnVsbDtcbnZhciBjdXJyZW50VGV4dHVyZSA9IG51bGw7XG52YXIgbW91c2VQb3NpdGlvblg7XG52YXIgbW91c2VQb3NpdGlvblk7XG52YXIgcG9pbnRzID0gW107XG52YXIgZm9yY2VzID0gW107XG52YXIgdHRsID0gW107XG52YXIgZnBzID0gNjA7XG52YXIgcG9pbnRTaXplID0gMC4wMjtcbnZhciBkZWZhdWxUVEwgPSAxMDAwMDtcbndpbmRvdy5vbmxvYWQgPSBtYWluO1xuZnVuY3Rpb24gbWFpbigpIHtcbiAgICB2YXIgbnVtQ29tcG9uZW50cyA9IDI7XG4gICAgdmFyIHR5cGUgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZMT0FUO1xuICAgIHZhciBub3JtYWxpemUgPSBmYWxzZTtcbiAgICB2YXIgc3RyaWRlID0gMDtcbiAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICB2YXIgc2hhZGVyUHJvZ3JhbTAgPSByZW5kZXJlci5pbml0U2hhZGVyUHJvZ3JhbShzaGFkZXJzXzEuZGVmVlMsIHNoYWRlcnNfMS5wb2ludEZTKTtcbiAgICByZW5kZXJlci5uZXh0UGFzcyhuZXcgZ2xfbW9kdWxlc18xLlNoYWRlckRlZmluaXRpb24oc2hhZGVyUHJvZ3JhbTAsIGZ1bmN0aW9uIChnbCkge1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0wLCAnYVZlcnRleFBvc2l0aW9uJyksIG51bUNvbXBvbmVudHMsIHR5cGUsIG5vcm1hbGl6ZSwgc3RyaWRlLCBvZmZzZXQpO1xuICAgICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtMCwgJ2FWZXJ0ZXhQb3NpdGlvbicpKTtcbiAgICB9LCBmdW5jdGlvbiAoZ2wpIHtcbiAgICAgICAgdmFyIHBmdiA9IG5ldyBGbG9hdDMyQXJyYXkoMTAwMCk7XG4gICAgICAgIHZhciBzZnYgPSBuZXcgRmxvYXQzMkFycmF5KDUwMCk7XG4gICAgICAgIHZhciBuID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLm1pbihwb2ludHMubGVuZ3RoLCA1MDApOyBpKyspIHtcbiAgICAgICAgICAgIHBmdltuKytdID0gcG9pbnRzW2ldLng7XG4gICAgICAgICAgICBwZnZbbisrXSA9IHBvaW50c1tpXS55O1xuICAgICAgICAgICAgc2Z2W2ldID0gcG9pbnRzW2ldLnM7XG4gICAgICAgIH1cbiAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHByZXZpb3VzVGV4dHVyZSk7XG4gICAgICAgIGdsLnVuaWZvcm0xaShnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTAsICd0ZXh0dXJlJyksIDApO1xuICAgICAgICBnbC51bmlmb3JtMmZ2KGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtMCwgJ3BvaW50cycpLCBwZnYpO1xuICAgICAgICBnbC51bmlmb3JtMWkoZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW0wLCAncG9pbnRDb3VudCcpLCBNYXRoLm1pbihwb2ludHMubGVuZ3RoLCA1MDApKTtcbiAgICAgICAgZ2wudW5pZm9ybTFmdihnbC5nZXRVbmlmb3JtTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTAsICdwb2ludFNpemUnKSwgc2Z2KTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKGdsLmdldFVuaWZvcm1Mb2NhdGlvbihzaGFkZXJQcm9ncmFtMCwgJ3NjcmVlblJhdGlvJyksIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB9KSk7XG4gICAgdmFyIHNoYWRlclByb2dyYW0xID0gcmVuZGVyZXIuaW5pdFNoYWRlclByb2dyYW0oc2hhZGVyc18xLmRlZlZTLCBzaGFkZXJzXzEuZGVmRlMpO1xuICAgIHJlbmRlcmVyLm5leHRQYXNzKG5ldyBnbF9tb2R1bGVzXzEuU2hhZGVyRGVmaW5pdGlvbihzaGFkZXJQcm9ncmFtMSwgZnVuY3Rpb24gKGdsKSB7XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbTEsICdhVmVydGV4UG9zaXRpb24nKSwgbnVtQ29tcG9uZW50cywgdHlwZSwgbm9ybWFsaXplLCBzdHJpZGUsIG9mZnNldCk7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0xLCAnYVZlcnRleFBvc2l0aW9uJykpO1xuICAgIH0sIGZ1bmN0aW9uIChnbCkge1xuICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgY3VycmVudFRleHR1cmUpO1xuICAgICAgICBnbC51bmlmb3JtMWkoZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHNoYWRlclByb2dyYW0xLCAndGV4dHVyZScpLCAwKTtcbiAgICB9KSk7XG4gICAgY3VycmVudEZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBwcmV2aW91c0ZyYW1lQnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICByZXNpemUoKTtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgbW91c2VQb3NpdGlvblggPSBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIG1vdXNlUG9zaXRpb25ZID0gMSAtIChldmVudC5jbGllbnRZIC8gd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbiAoZXZlbnQpIHsgcmV0dXJuIG9uUHJlc3MoZXZlbnQpOyB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7IHJldHVybiByZXNpemUoKTsgfSk7XG4gICAgcmVuZGVyTG9vcCgpO1xufVxuZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgIGZvciAodmFyIGkgPSBwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdHRsW2ldLS07XG4gICAgICAgIGlmICh0dGxbaV0gPD0gMCkge1xuICAgICAgICAgICAgcmVtb3ZlUG9pbnQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZCA9IGRpc3RhbmNlKHBvaW50c1tpXS54LCBwb2ludHNbaV0ueSwgbW91c2VQb3NpdGlvblgsIG1vdXNlUG9zaXRpb25ZKTtcbiAgICAgICAgICAgIGlmIChkIDwgMC4xKVxuICAgICAgICAgICAgICAgIHBvaW50c1tpXS5zID0gTWF0aC5tYXgocG9pbnRTaXplLCBwb2ludFNpemUgKiAoMSAtIGQpKTtcbiAgICAgICAgICAgIHBvaW50c1tpXS54ICs9IGZvcmNlc1tpXS54O1xuICAgICAgICAgICAgcG9pbnRzW2ldLnkgKz0gZm9yY2VzW2ldLnk7XG4gICAgICAgICAgICBpZiAoZm9yY2VzW2ldLnggPiAwKVxuICAgICAgICAgICAgICAgIGZvcmNlc1tpXS54IC09IDAuMDA1IC8gZnBzO1xuICAgICAgICAgICAgaWYgKGZvcmNlc1tpXS55ID4gLTEpXG4gICAgICAgICAgICAgICAgZm9yY2VzW2ldLnkgLT0gMC4wNSAvIGZwcztcbiAgICAgICAgICAgIGlmIChwb2ludHNbaV0ueCA8IDApXG4gICAgICAgICAgICAgICAgcmVtb3ZlUG9pbnQoaSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiByZW5kZXJMb29wKCkge1xuICAgIHVwZGF0ZSgpO1xuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgY3VycmVudEZyYW1lQnVmZmVyKTtcbiAgICBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRChnbC5GUkFNRUJVRkZFUiwgZ2wuQ09MT1JfQVRUQUNITUVOVDAsIGdsLlRFWFRVUkVfMkQsIGN1cnJlbnRUZXh0dXJlLCAwKTtcbiAgICByZW5kZXJlci5yZW5kZXJUb1RleHR1cmUoY3VycmVudEZyYW1lQnVmZmVyLCAwKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIHByZXZpb3VzRnJhbWVCdWZmZXIpO1xuICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGdsLkZSQU1FQlVGRkVSLCBnbC5DT0xPUl9BVFRBQ0hNRU5UMCwgZ2wuVEVYVFVSRV8yRCwgcHJldmlvdXNUZXh0dXJlLCAwKTtcbiAgICByZW5kZXJlci5yZW5kZXJUb1RleHR1cmUocHJldmlvdXNGcmFtZUJ1ZmZlciwgMSk7XG4gICAgcmVuZGVyZXIucmVuZGVyKDEpO1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KHJlbmRlckxvb3AsIDEwMDAgLyBmcHMpO1xufVxuZnVuY3Rpb24gcmVzaXplKCkge1xuICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgcHJldmlvdXNUZXh0dXJlID0gcmVuZGVyZXIuY3JlYXRlVGV4dHVyZSgpO1xuICAgIGN1cnJlbnRUZXh0dXJlID0gcmVuZGVyZXIuY3JlYXRlVGV4dHVyZSgpO1xufVxuZnVuY3Rpb24gb25QcmVzcyhldmVudCkge1xuICAgIGFkZFBvaW50KG1vdXNlUG9zaXRpb25YLCBtb3VzZVBvc2l0aW9uWSwgTWF0aC5yYW5kb20oKSAqIDAuMDIgLSAwLjAxLCAwLjAzKTtcbn1cbmZ1bmN0aW9uIGFkZFBvaW50KHgsIHksIGZ4LCBmeSkge1xuICAgIGlmIChwb2ludHMubGVuZ3RoID49IDUwMClcbiAgICAgICAgcmV0dXJuO1xuICAgIHBvaW50cy5wdXNoKHsgeDogeCwgeTogeSwgczogcG9pbnRTaXplIH0pO1xuICAgIGZvcmNlcy5wdXNoKHsgeDogZngsIHk6IGZ5IH0pO1xuICAgIHR0bC5wdXNoKGRlZmF1bFRUTCk7XG59XG5mdW5jdGlvbiByZW1vdmVQb2ludChpKSB7XG4gICAgZm9yY2VzLnNwbGljZShpLCAxKTtcbiAgICBwb2ludHMuc3BsaWNlKGksIDEpO1xuICAgIHR0bC5zcGxpY2UoaSwgMSk7XG59XG5mdW5jdGlvbiBkaXN0YW5jZSh4MSwgeTEsIHgyLCB5Mikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDEgLSB4MiwgMikgKyBNYXRoLnBvdyh5MSAtIHkyLCAyKSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=