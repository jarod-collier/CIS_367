import ObjectGroup from '../core/ObjectGroup';
import { mat4, glMatrix } from 'gl-matrix';
import Legs from "./Legs";

export default class LegPairs extends ObjectGroup {
    constructor({ glContext, positionAttribute, colorAttribute }) {
        super();

        // Setup Left Leg
        let leftLeg = new Legs({
            glContext,
            positionAttribute,
            colorAttribute
        });
        let leftLegFrame = mat4.fromTranslation(mat4.create(), [.25, 0.25, -3]);
        this.add({ object: leftLeg, frame: leftLegFrame });

        // Setup right leg
        let rightLeg = new Legs ({
            glContext,
            positionAttribute,
            colorAttribute
        });
        let rightLegFrame = mat4.fromTranslation(mat4.create(), [0.25, 1.25, -3]);
        this.add({ object: rightLeg, frame: rightLegFrame });
    }
}
