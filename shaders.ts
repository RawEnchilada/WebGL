
export const defVS = `
precision mediump float;

attribute vec4 aVertexPosition;
varying vec2 inPosition;

void main() {
    inPosition = ((aVertexPosition+vec4(1.0,1.0,1.0,1.0))/2.0).xy;
    gl_Position = aVertexPosition;
}
`;

export const pointFS = `
precision mediump float;

uniform sampler2D texture;
uniform vec2 points[500];
uniform float pointSize[500];
uniform int pointCount;
uniform float screenRatio;

varying vec2 inPosition;


void main() {
    vec2 position = inPosition*vec2(screenRatio,1.0);

    vec4 color = vec4(0.0,0.0,0.0,1.0);
    vec4 prevColor = vec4(texture2D(texture, inPosition).rgb, 1.0);
    for(int i = 0; i < 500; i++){
        if(i >= pointCount) break;
        if(distance(points[i]*vec2(screenRatio,1.0),position) < pointSize[i]){
            color = vec4(points[i].x,0.1,points[i].y,1.0);
            break;
        }
    }
    gl_FragColor = color+prevColor;
}
`;

export const defFS = `
precision mediump float;

uniform sampler2D texture;

varying vec2 inPosition;



void main() {
    vec4 color = texture2D(texture, inPosition);
    gl_FragColor = vec4(color.rgb,1.0);
}
`;
