import { create, link, curveBumpX } from 'd3';
import { hierarchy, tree } from 'd3-hierarchy';
import { TrieNode, Trie } from "./trie";
import { type AlpineComponent } from 'alpinejs';

export function fromTrie(t: Trie) {
    return hierarchy(t.root, (node: TrieNode) => Array.from(node.children.values()))
}

export const D3Tree = (root: Trie | ReturnType<typeof hierarchy>, props?: { 
    height: string, 
    width: string, 
}): AlpineComponent => {
    const {
        height, 
        width, 
    } = {
        height: '200px',
        width: '200px',
        ...props || {},
    } 

    return {
        height,
        width,
        root: root instanceof Trie ? fromTrie(root) : root,
        layout: tree(),
        resize(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.render();
        },
        render() {
            // clear out element
            this.$el.replaceChildren();
            this.$el.append(makeTree({
                height: this.height,
                width: this.width,
                layout: this.layout, 
                data: this.root,
            }));
        },
        init() {
            this.render();
        },
    }
}

function makeTree({
    width, height,
    layout, data,
}: {
    width: number,
    height: number,
    layout: ReturnType<typeof tree<TrieNode>>;
    data: ReturnType<typeof hierarchy<TrieNode>>;
}) {
    const svg = create('svg')
        .attr('height', height)
        .attr('width', width)
        .attr('font-family', 'sans-serif')
        .attr('font-size', 16)
        .attr('style', 'height: 100%; max-width: 100%;')

    // TODO: https://observablehq.com/@d3/tree or similar

    return svg.node() as Node;
}