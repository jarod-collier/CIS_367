import GLGeometry from 'gl-geometry';
import ObjectGroup from '../core/ObjectGroup';
import Polygonal from '../geometry/Polygonal';
import Cone from '../geometry/Cone';
import {glMatrix, mat4, vec3} from 'gl-matrix';

export default class Arms extends ObjectGroup {
    constructor({glContext, positionAttribute, colorAttribute}) {
        super();
        const N = 20;

        /* setup the arm */
        let armShape = new Polygonal({
            topRadius: 0.2,
            bottomRadius: 0.2,
            height: 2,
            numberOfSlices: N
        });
        let armColors = [];
        for (let k = 0; k < 2 * N + 2; k++){
            if (k % 4 == 0) armColors.push(1, .2, .3);
            else if (k % 4 == 1) armColors.push(1, 1, 1);
            else if (k % 4 == 2) armColors.push(1, 1, .2);
            else armColors.push(0, 0, 0);
        }

        const arm = new GLGeometry(glContext)
            .attr(positionAttribute, armShape.geometry())
            .attr(colorAttribute, armColors);
        const armCF = mat4.fromRotation(mat4.create(), glMatrix.toRadian(90), [1, 0, 0]);

        this.add({object: arm, frame: armCF});

        /* setup the fire */
        let fireShape = new Cone({numberOfSlices: N, radius: .2, height: 1});
        let fireColor = [];
        for (let k = 0; k < N + 1; k++) fireColor.push(1, 0, 0);
        fireColor.push(1, 1, 0);
        const fire = new GLGeometry(glContext)
            .attr(positionAttribute, fireShape.geometry())
            .attr(colorAttribute, fireColor);
        const fireCF = mat4.fromTranslation(mat4.create(), [0, 0, 0]);
        const fireRotate = mat4.fromRotation(mat4.create(), glMatrix.toRadian(-90), [1, 0, 0]);
        mat4.multiply(fireCF, fireCF, fireRotate);
        this.add({object: fire, frame: fireCF});
    }
}
