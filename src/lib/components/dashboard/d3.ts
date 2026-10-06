/*
 * d3-scale / d3-shape come with layerchart (they are not direct dependencies) and ship without type
 * declarations, so the few factories the dashboard charts use are re-exported here, typed loosely
 * for LayerChart's `xScale` / `curve` props.
 */
// @ts-expect-error -- untyped transitive dependency of layerchart
import { curveMonotoneX as monotoneX } from 'd3-shape';
// @ts-expect-error -- untyped transitive dependency of layerchart
import { scaleBand as band, scaleUtc as utc } from 'd3-scale';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export const curveMonotoneX: Any = monotoneX;
export const scaleUtc: () => Any = utc;
export const scaleBand: () => Any = band;
