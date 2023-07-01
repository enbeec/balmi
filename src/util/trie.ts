// source: https://www.lavivienpost.com/autocomplete-with-trie-code/

import { TreantNodeStructure } from "./treant";

class TrieNode {
    data: string;
    isEnd: boolean;
    children: Map<string, TrieNode>;

    //Constructor, Time O(1), Space O(1)
    constructor(c: string) {
        this.data = c;
        this.isEnd = false;
        this.children = new Map(); //map
    }
}

export class Trie {
    private root: TrieNode;

    //Constructor, Time O(1), Space O(1)
    constructor(wordList?: string[]) {
        this.root = new TrieNode('');
        if (wordList?.length) wordList.forEach(w => this.insert(w));
    }

    //inserts a word into the trie. Time O(s), Space O(s), s is word length
    public insert (word: string) {
        let node = this.root;
        for (let ch of word) {
            if (!node.children.has(ch))
                node.children.set(ch, new TrieNode(ch));
            node = node.children.get(ch)!;
        }
        node.isEnd = true;
    }

    //find all word with given prefix, call recursion function
    //Time O(n), Space O(n), n is number of nodes involved (include prefix and branches)
    public autocomplete (word: string) {
        let res: string[] = [];
        let node = this.root;
        for (let ch of word) {
            if (node.children.has(ch))
                node = node.children.get(ch)!;
            else
                return res;
        }
        this.helper(node, res, word.substring(0, word.length-1));
        return res;
    }

    //recursive function called by autocomplete
    //Time O(n), Space O(n), n is number of nodes in branches
    private helper (node: TrieNode, res: string[], prefix: string)  {
        if (node.isEnd)
            res.push(prefix + node.data);
        for (let c of node.children.keys())
            if (node.children.has(c))
                this.helper(
                    node.children.get(c)!,
                    res,
                    prefix + node.data
                );
    }

    public toTreant() {
        return toTreant(this.root);
    }
}

function toTreant(n: TrieNode): TreantNodeStructure {
    return {
        text: { name: n.data },
        children: Array.from(n.children.values()).map(toTreant),
    }
}