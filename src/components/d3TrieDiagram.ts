import { create, curveBumpX, link, select } from 'd3';
import { HierarchyPointNode, hierarchy, tree } from 'd3-hierarchy';
import { TrieNode, Trie } from "../util/trie";
import { type AlpineComponent } from 'alpinejs';
import { 
    BehaviorSubject, 
    Observable, 
    ObservedValueOf, 
    Subject, 
    combineLatest, 
    debounceTime, 
    distinctUntilChanged, 
    map, 
    tap
} from 'rxjs';
import { BreakpointSelector } from '../layout/tailwind.helpers';

interface HierarchyDatum {
    name: string;
    children?: HierarchyDatum | HierarchyDatum[];
}

function fromTrie(n: TrieNode) {
    const toDatum = (n: TrieNode): HierarchyDatum => {
        return {
            name: n.name,
            children: Array.from(n.children.values()).map(toDatum),
        };
    }

    return toDatum(n);
}

/**
 * @param dataSource an observable trie
 */
export const D3Tree = <T extends Trie>(dataSource: Observable<T>, { height, width }: { 
    height: number, 
    width: number, 
}): AlpineComponent => {
    const _dimensions$ = new Subject<[number, number]>();
    const dimensions$ = _dimensions$.pipe(
        distinctUntilChanged(
            (a, b) => a[0] === b[0] && a[1] === b[1]
        ),
    );

    const responsiveProps = {
        sm: {
            dx: 50,
            dyOffset: 0,
            fontSize: 16,
            r: 12,
            padding: 1,
        },
        md: {
            dx: 50,
            dyOffset: 0,
            fontSize: 16,
            r: 12,
            padding: 1,
        },
        lg: {
            dx: 50,
            dyOffset: 14,
            // TODO: translate left
            fontSize: 28,
            r: 18,
            padding: 2,
        },
        xl: {
            dx: 50,
            dyOffset: 0,
            fontSize: 32,
            r: 24,
            padding: 3,
        },
    } satisfies Record<
        BreakpointSelector, 
        Record<'dx' | 'dyOffset' | 'r' | 'fontSize' | 'padding', number>
    >;

    const svgProps$ = new BehaviorSubject({
        curve: curveBumpX,

        fill: '#999',

        halo: '#345',
        haloWidth: 2,

        stroke: '#555',
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeLinecap: '',
        strokeLinejoin: '',

        ...responsiveProps.sm,
    });

    type SVGProps = ObservedValueOf<typeof svgProps$>;

    // not technically correct but good enough for our purposes
    type Viewbox = [number, number, number, number];

    return {
        // PUBLIC INTERFACE
        resize(h: number, w: number, bp: BreakpointSelector) {
            _dimensions$.next([h, w]);
            select(this._svg).attr('height', h).attr('width', w);
            svgProps$.next({ ...svgProps$.value, ...responsiveProps[bp] });
        },

        // LIFECYCLE
        init() {
            this.setupSVG();
            this.subscribe();
        },
        destroy() {
            this.unsubscribe();
        },

        // PRIVATE MEMBERS
        _svgId:  'd3tree',
        _svg:   '#d3tree',

        // private interface
        setupSVG() {
            const svg = create('svg')
                .attr('font-family', 'monospace')
                .attr('transform-origin', 'center')
                .attr('style', `height: 100%; width: 100%; overflow: clip;`)
                .attr('id', this._svgId)
                .attr('height', height).attr('width', width);

            this.$el.append(svg.node() as Node);
        },
        drawSVG(
            {
                strokeLinecap, strokeOpacity, strokeWidth, strokeLinejoin,
                stroke, r, curve, fontSize,
                halo, haloWidth,

            }: SVGProps,
            viewbox: Viewbox,
            root: HierarchyPointNode<HierarchyDatum>
        ) {
            // see: https://observablehq.com/@d3/tree
            // render data
            const label = root.descendants().map(d => d.data.name);
            const svg = select(this._svg).attr("viewBox", viewbox).attr('font-size', fontSize)
            svg.selectAll('*').remove();
            svg.append("g")
                .attr("fill", "none")
                .attr("stroke", stroke)
                .attr("stroke-opacity", strokeOpacity)
                .attr("stroke-linecap", strokeLinecap)
                .attr("stroke-linejoin", strokeLinejoin)
                .attr("stroke-width", strokeWidth)
                .selectAll("path")
                .data(root.links())
                .join("path")
                .attr(
                    "d", 
                    // @ts-ignore not even sure why this is borked in @types/d3
                    link(curve).x(d => d.y).y(d => d.x)
                );

            const node = svg.append("g")
                .selectAll("a")
                .data(root.descendants())
                .join("a")
                .attr("transform", (d) => `translate(${d.y},${d.x})`);

            node.append("circle")
                .attr("fill", stroke)
                .attr("r", d => !d.depth
                    ? 1
                    : d.data.name === ' '
                        ? 5
                        : r
                );

            node.append("text")
                .attr("dy", "0.5em")
                .attr("x", -6)
                .attr('y', -2)
                .attr("text-anchor", 'start')
                .attr("paint-order", "stroke")
                .style('fill', 'lightblue')
                .attr("stroke", halo)
                .attr("stroke-width", haloWidth)
                .text((_, i) => label[i]);
        },
        subscribe() {
            this.subscription = combineLatest([
                dimensions$,
                svgProps$.asObservable(),
                dataSource.pipe(
                    map(trie => ({ ...trie.root })),
                    map(fromTrie),
                )
            ])
                .pipe(
                    debounceTime(50),
                    map(([[_, w], props, data]) => {
                        // prepare data
                        const root = hierarchy(data);
                        root.sort((a,b) => a.data.name.localeCompare(b.data.name));

                        // calculate viewbox
                        const dx = props.dx;
                        const dy = w / (root.height + props.padding);
                        tree<HierarchyDatum>().nodeSize([dx, dy + props.dyOffset])(root);

                        let x0 = Infinity;
                        let x1 = -x0;
                        (root as HierarchyPointNode<HierarchyDatum>).each(d => {
                            if (d.x > x1) x1 = d.x;
                            if (d.x < x0) x0 = d.x;
                        });
                        const h = x1 - x0 + dx * 2;
                        const viewbox = [-dy * props.padding / 2, x0 - dx, w, h];

                        return [props, viewbox, root]
                    }),
                    tap(([props, viewbox, root]) => console.debug('draw d3tree svg', { props, viewbox, root }))
                )
                .subscribe(
                    (args) => this.drawSVG(...args)
                );
            _dimensions$.next([height, width]);
        },
        unsubscribe() {
            this.subscription.unsubscribe();
        },
    }
}