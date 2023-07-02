// source: https://www.lavivienpost.com/autocomplete-with-trie-code/

export class TrieNode {
    name: string;
    isEnd: boolean;
    children: Map<string, TrieNode>;

    //Constructor, Time O(1), Space O(1)
    constructor(c: string) {
        this.name = c;
        this.isEnd = false;
        this.children = new Map(); //map
    }
}

export class Trie {
    private _root: TrieNode;

    //Constructor, Time O(1), Space O(1)
    constructor(wordList?: string[]) {
        this._root = new TrieNode('');
        if (wordList?.length) wordList.forEach(w => this.insert(w));
    }

    get root() { return this._root }

    //inserts a word into the trie. Time O(s), Space O(s), s is word length
    public insert (word: string) {
        let node = this._root;
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
        let node = this._root;
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
            res.push(prefix + node.name);
        for (let c of node.children.keys())
            if (node.children.has(c))
                this.helper(
                    node.children.get(c)!,
                    res,
                    prefix + node.name
                );
    }
}
