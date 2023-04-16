import * as source from "./scripts/webgl.js";

const WEB = new source.WebGL("webgl")


function main() {
    if(!WEB.sucess) return;

    let vShader = WEB.createShader("vertex"),
        fShader = WEB.createShader("fragment");
    
    let program = WEB.createProgram(vShader, fShader),
        pos_id = WEB.getAttrId(program, "position"),
        vertex_arr = WEB.createVertex()

    
    WEB.createBuffer("position", "array");
    
    let a = new source.Point(0, 0),
        b = new source.Point(0, 0.5),
        c = new source.Point(0.7, 0);

    WEB.insertData("position", source.Point.flatten(2, a, b, c), "static");
    WEB.updateVertex(pos_id, 2, "float");
    WEB.draw(program, vertex_arr, "triangle", 0, 3);
}

main();