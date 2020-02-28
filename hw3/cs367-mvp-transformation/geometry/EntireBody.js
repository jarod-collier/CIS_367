// import createContext from 'gl-context';
import GLGeometry from 'gl-geometry';
import { mat4, glMatrix } from 'gl-matrix';
import Body from "./Body";
import LegPairs from "./LegPairs";
import ArmPairs from "./ArmPairs";
import Head from "./Head";
import ObjectGroup from "../core/ObjectGroup";

let body, legs, arms, head;
let bodyCF, legsCF, armsCF, headCF;

export default class EntireBody extends ObjectGroup {
    constructor({glContext, positionAttribute, colorAttribute}) {
        super();

        bodyCF = mat4.create();
        headCF = mat4.create();
        legsCF = mat4.create();
        armsCF = mat4.create();

        // Creates the body
        const bodyTriangles = 12;
        const bodyShape = new Body({
            length: 1.5,
            height: 2,
            width: .5
        });

        let bodyColors = [];
        for (let k = 0; k < bodyTriangles; k++) {
            if (k % 4 == 0) bodyColors.push(0, .3, 1);
            else if (k % 4 == 1) bodyColors.push(1, 1, 1);
            else if (k % 4 == 2) bodyColors.push(.6, .6, .7);
            else bodyColors.push(.3, 0.8, .3);
        }

        body = new GLGeometry(glContext)
            .attr('vertexPos', bodyShape.geometry())
            .attr('vertexCol', bodyColors);

        this.add({object: body, frame: bodyCF});


        // Creates the head
        const headTriangles = 12;
        const headShape = new Head({
            length: .5,
            height: .5,
            width: .5
        });

        let headColors = [];
        for (let k = 0; k < headTriangles; k++) {
            if (k % 4 == 0) headColors.push(1, .2, .3);
            else if (k % 4 == 1) headColors.push(1, 1, 1);
            else if (k % 4 == 2) headColors.push(1, 1, .2);
            else headColors.push(0, 0, 0);
        }

        head = new GLGeometry(glContext)
            .attr('vertexPos', headShape.geometry())
            .attr('vertexCol', headColors);
        this.add({object: head, frame: headCF});

        // Create Legs
        legs = new LegPairs({
            glContext,
            positionAttribute,
            colorAttribute
        });
        this.add({object: legs, frame: legsCF});

        //Creates arms
        arms = new ArmPairs ({
            glContext,
            positionAttribute,
            colorAttribute
        });
        this.add({object: arms, frame: armsCF});
    }
}