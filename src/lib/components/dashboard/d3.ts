/*
 * The few d3 factories the dashboard charts hand to LayerChart's `xScale` / `curve` props.
 * d3-scale and d3-shape are direct dependencies (with types) so this stays a thin re-export.
 */
export { curveMonotoneX } from 'd3-shape';
export { scaleBand, scaleUtc } from 'd3-scale';
