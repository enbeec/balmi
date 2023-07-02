import { create, curveBumpX, link, select, zoom } from 'd3';
import { HierarchyPointNode, hierarchy, tree } from 'd3-hierarchy';
import { TrieNode, Trie } from "./trie";
import { type AlpineComponent } from 'alpinejs';
import { Observable, Subject, combineLatestWith, distinctUntilChanged, map, tap } from 'rxjs';

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
 * @param dataSource an observable of the given data type (currently the Trie is the only supported)
 * @param dimensions [height, width]
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

    return {
        // PUBLIC INTERFACE
        resize(h: number, w: number) {
            _dimensions$.next([h, w]);
            select(this._svg)
                .attr('height', h).attr('width', w);
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
                .attr('font-family', 'sans-serif')
                .attr('font-size', 16)
                .attr('style', `min-height: 100%; width: 100%; max-width: 100%;`)
                .attr('id', this._svgId)
                .attr('height', height).attr('width', width)
                .call(zoom);

            this.$el.replaceChildren(svg.node() as Node);
        },
        drawSVG([h,w]: [number, number], data: HierarchyDatum) {
            // see: https://observablehq.com/@d3/tree
            const curve = curveBumpX;

            const fill = '#999';

            const halo = '#fff';
            const haloWidth = 3;

            const stroke = '#555';
            const strokeWidth = 3;
            const strokeOpacity = 1;
            const strokeLinecap = '';
            const strokeLinejoin = '';

            const r = 12;
            const padding = 1;

            const root = hierarchy(data);
            root.sort((a,b) => a.data.name.localeCompare(b.data.name));
            const label = root.descendants().map(d => d.data.name);

            // START layout calulation
            // TODO: make this reusable and idempotent (for the resize handler)
            const dx = 30;
            const dy = w / (root.height + padding);
            tree<HierarchyDatum>().nodeSize([dx, dy])(root);

            let x0 = Infinity;
            let x1 = -x0;
            (root as HierarchyPointNode<HierarchyDatum>).each(d => {
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
            });

            const viewbox = [-dy * padding / 2, x0 - dx, w, h];
            // END layout calculatio

            const svg = select(this._svg).attr("viewBox", viewbox)

            svg.selectAll('*').remove();

            // TODO: rewrite this to be idempotent
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
                // @ts-ignore
                .attr("d", link(curve).x(d => d.y).y(d => d.x));

            const node = svg.append("g")
                .selectAll("a")
                .data(root.descendants())
                .join("a")
                // @ts-ignore
                .attr("transform", (d) => `translate(${d.y},${d.x})`);

            node.append("circle")
                .attr("fill", d => d.children ? stroke : fill)
                .attr("r", d => d.data.name === ' ' || !d.depth ? 5 : r);

            node.append("text")
                .attr("dy", "0.5em")
                .attr("x", d => d.children ? -6 : 6)
                .attr("text-anchor", d => d.children ? "end" : "start")
                .attr("paint-order", "stroke")
                .attr("stroke", halo)
                .attr("stroke-width", haloWidth)
                .text((d, i) => label[i]);
        },
        subscribe() {
            this.subscription = dimensions$.pipe(
                combineLatestWith(dataSource.pipe(
                    map(trie => ({ ...trie.root })),
                    tap(console.info),
                    map(fromTrie),
                    tap(console.info),
                )),
            ).subscribe(
                ([dimensions, data]) => this.drawSVG(dimensions, data)
            );
            _dimensions$.next([height, width]);
        },
        unsubscribe() {
            this.subscription.unsubscribe();
        },
    }
}