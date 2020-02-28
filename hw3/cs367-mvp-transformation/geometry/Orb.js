import ObjectGroup from '../core/ObjectGroup';
import { mat4, glMatrix } from 'gl-matrix';
import GLGeometry from 'gl-geometry';
import Polygonal from './Polygonal';
import Torus from './Torus';

let orb, orbRod;
let orbCF, orbRodCF;

export default class LegPairs extends ObjectGroup {
    constructor({glContext, positionAttribute, colorAttribute}) {
        super();


        orbCF = mat4.create();
        orbRodCF = mat4.fromTranslation(mat4.create(), [0, 0, -1]);

        /* setup the leg */
        let orbShape = new Torus({
            majorRadiusSlice: 30,
            minorRadiusSlice: 10,
            R: 1,
            r: .7
        });

        let orbColor = [];
        for (let k = 0; k < 30; k++) {
            for (let m = 0; m < 10; m++) {
                    if (k % 2 === 0) orbColor.push(0.6, 0.2, .8); // makes circles purple
                    else orbColor.push(0, 0, 0); // makes circle white
            }
        }

        orb = new GLGeometry(glContext)
            .attr('vertexPos', orbShape.geometry())
            .attr('vertexCol', orbColor);

        this.add({object: orb, frame: orbCF});


        /* setup the orb Rod */
        const N = 20;
        let orbRodShape = new Polygonal({
            topRadius: 0.2,
            bottomRadius: 0.2,
            height: 2,
            numberOfSlices: N
        });
        let orbRodColors = [];
        for (let k = 0; k < 2 * N + 2; k++){
            if (k % 3 == 0) orbRodColors.push(1, 1, 1);
            else if(k % 3 == 1) orbRodColors.push(0, 0, 0);
            else orbRodColors.push(0, 0, 1);
        }

        orbRod = new GLGeometry(glContext)
            .attr(positionAttribute, orbRodShape.geometry())
            .attr(colorAttribute, orbRodColors);

        this.add({object: orbRod, frame: orbRodCF});
    }
}