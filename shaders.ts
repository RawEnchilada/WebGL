
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

    vec3 color = vec3(0.0,0.0,0.0);
    vec4 prevColor = vec4(texture2D(texture, inPosition).rgb, 1.0);
    if(length(prevColor.rgb) < 0.3)prevColor = vec4(0,0,0,1.0);
    for(int i = 0; i < 500; i++){
        if(i >= pointCount) break;
        float dist = distance(points[i]*vec2(screenRatio,1.0),position);
        if(dist < pointSize[i]){
            float weight = 1.0-dist/pointSize[i];
            color = vec3(points[i].x,0.1,points[i].y)*vec3(weight,weight,weight);
            break;
        }
    }
    gl_FragColor = vec4(color,1.0)+prevColor*0.95;
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
