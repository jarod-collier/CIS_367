import GLGeometry from 'gl-geometry';
import ObjectGroup from '../core/ObjectGroup';
import Polygonal from '../geometry/Polygonal';
import Cone from '../geometry/Cone';
import {glMatrix, mat4, vec3} from 'gl-matrix';

export default class Legs extends ObjectGroup {
    constructor({glContext, positionAttribute, colorAttribute}) {
        super();
        const N = 20;

        /* setup the leg */
        let legShape = new Polygonal({
            topRadius: 0.25,
            bottomRadius: 0.25,
            height: 3,
            numberOfSlices: N
        });
        let legColors = [];
        for (let k = 0; k < 2 * N + 2; k++){
            if (k % 4 == 0) legColors.push(0, .3, 1);
            else if (k % 4 == 1) legColors.push(1, 1, .2);
            else if (k % 4 == 2) legColors.push(.6, .6, .7);
            else legColors.push(.3, 0.8, .3);
        }

        const leg = new GLGeometry(glContext)
            .attr(positionAttribute, legShape.geometry())
            .attr(colorAttribute, legColors);
        const legCF = mat4.create();

        this.add({object: leg, frame: legCF});

        /* setup the fire */
        let fireShape = new Cone({numberOfSlices: N, radius: .25, height: 1});
        let fireColor = [];
        for (let k = 0; k < N + 1; k++) fireColor.push(1, 0, 0);
        fireColor.push(1, 1, 0);
        const fire = new GLGeometry(glContext)
            .attr(positionAttribute, fireShape.geometry())
            .attr(colorAttribute, fireColor);
        const fireCF = mat4.fromTranslation(mat4.create(), [0, 0, 0]);
        const fireRotate = mat4.fromRotation(mat4.create(), glMatrix.toRadian(180), [1, 0, 0]);
        mat4.multiply(fireCF, fireCF, fireRotate);
        this.add({object: fire, frame: fireCF});
    }
}
