import { create, curveBumpX } from 'd3';
import { hierarchy, tree } from 'd3-hierarchy';
import { TrieNode, Trie } from "./trie";
import { type AlpineComponent } from 'alpinejs';

export function fromTrie(t: Trie) {
    return hierarchy(t.root, (node: TrieNode) => Array.from(node.children.values()))
}

export const D3Tree = (root: Trie | ReturnType<typeof hierarchy>, props: Partial<{ 
    height: string, 
    width: string, 
    r: number,
    padding: number,
    fill: string,
    stroke: string,
    strokeWidth: number,
    halo: string,
    curve: typeof curveBumpX,
}>): AlpineComponent => {
    const {
        height, 
        width, 
        r,
        padding,
        fill,
        stroke,
        strokeWidth,
        halo,
        curve,
    } = {
        height: '200px',
        width: '200px',
        r: 3,
        padding: 1,
        fill: '#999',
        stroke: '#555',
        strokeWidth: 1.5,
        halo: '#fff',
        curve: curveBumpX,
        ...props,
    } 

    return {
        height,
        width,
        root: root instanceof Trie ? fromTrie(root) : root,
        tree: tree(),
        svg: create('svg')
            .attr('height', height)
            .attr('width', width)
            .attr("style", "height: 100%; max-width: 100%; background-color: lightgray;")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16),
        resize(width: number, height: number) {
            this.width = width;
            this.height = height;
            this.render();
        },
        render() {
            // clear out element
            this.$el.replaceChildren();
            // @ts-ignore because svg.node() lies
            this.$el.append(this.svg.node());
        },
        init() {
            this.svg.append("text").attr("x", 100).attr("y", 100).text("Hellooooo")
            this.render();
        },
    }
}