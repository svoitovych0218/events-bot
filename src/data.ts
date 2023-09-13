export interface IOctreeNode {
    x: 0 | 1;
    y: 0 | 1;
    z: 0 | 1;
    children: IOctreeNode[];
    point?: IOctreeDataPoint;
}

export interface IOctreeDataPoint {
    color: string;
}

export interface IOctreeRoot {
    nodes: IOctreeNode[];
    centerPosition: {
        x: number;
        y: number;
        z: number;
    };
    size: number;
}
