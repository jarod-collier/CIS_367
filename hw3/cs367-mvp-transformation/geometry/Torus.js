import GeometricObject from './GeometricObject';

export default class Torus extends GeometricObject {

    constructor({
                    majorRadiusSlices = 30,
                    minorRadiusSlices = 10,
                    R = 1,
                    r = .7}) {
        super();

        for (let k = 0; k < majorRadiusSlices; k++) {
            let phi = (k * 2 * Math.PI) / majorRadiusSlices;
            for (let m = 0; m < minorRadiusSlices; m++) {
                let theta = (m * 2 * Math.PI) / minorRadiusSlices;
                let x = (R + r * Math.cos(theta)) * Math.cos(phi);
                let y = (R + r * Math.cos(theta)) * Math.sin(phi);
                let z = r * Math.sin(theta);
                this.vertices.push([x, y, z]);
            }
        }

        // The lower half of the triangles
        for (let j = 0; j < majorRadiusSlices; j++) {
            for (let i = 0; i < minorRadiusSlices; i++) {

                let a = i + (j * minorRadiusSlices);
                let b = i + ((j + 1) * minorRadiusSlices) % (minorRadiusSlices * majorRadiusSlices);
                let c = (((i + 1) % minorRadiusSlices) + ((j + 1) * minorRadiusSlices))  % (minorRadiusSlices * majorRadiusSlices);

                this.triangles.push([a, b, c]);
            }
        }

        // The top half of the triangles
        for (let j = 0; j < majorRadiusSlices; j++) {
            for (let i = 0; i < minorRadiusSlices; i++) {

                let a = ((i + 1) % minorRadiusSlices) + (j * minorRadiusSlices);
                let b = i + (j * minorRadiusSlices);
                let c = (((i + 1) % minorRadiusSlices) + ((j + 1) * minorRadiusSlices))   % 300;

                this.triangles.push([a, b, c]);
            }
        }
    }
}