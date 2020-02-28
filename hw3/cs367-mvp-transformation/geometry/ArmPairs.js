import ObjectGroup from '../core/ObjectGroup';
import { mat4, glMatrix } from 'gl-matrix';
import Arms from "./Arms";

export default class ArmPairs extends ObjectGroup {
    constructor({ glContext, positionAttribute, colorAttribute }) {
        super();

        // Setup Left arm
        let leftArm = new Arms({
            glContext,
            positionAttribute,
            colorAttribute
        });
        let leftArmFrame = mat4.fromTranslation(mat4.create(), [0.25, -1.15, .4]);
        let leftArmRotate = mat4.fromRotation(mat4.create(), glMatrix.toRadian(-135), [1, 0, 0]);
        mat4.multiply(leftArmFrame, leftArmFrame, leftArmRotate);
        this.add({ object: leftArm, frame: leftArmFrame });

        // Setup right arm
        let rightArm = new Arms ({
            glContext,
            positionAttribute,
            colorAttribute
        });
        let rightArmFrame = mat4.fromTranslation(mat4.create(), [0.25, 2.75, .4]);
        let rightArmRotate = mat4.fromRotation(mat4.create(), glMatrix.toRadian(-45), [1, 0, 0]);
        mat4.multiply(rightArmFrame, rightArmFrame, rightArmRotate);
        this.add({ object: rightArm, frame: rightArmFrame });
    }
}
