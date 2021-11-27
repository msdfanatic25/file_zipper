/* UI elements */
const inputView = document.getElementById("input");
const outputView = document.getElementById("output");
const inputSizeView = document.getElementById("input-size");
const outputSizeView = document.getElementById("output-size");
const compressionRatioView = document.getElementById("compression-ratio");
const encodeButton = document.getElementById("encode-button");
const errorDialog = new bootstrap.Modal(document.getElementById('modal'), {});
const tableWrapper = document.getElementById("table-wrapper");
const tableView = document.getElementById("table");

/* Event Listeners */

inputView.addEventListener("keyup", event => {
    let inputString = event.target.value;
    inputSizeView.textContent = inputString.length;
});

encodeButton.addEventListener("click", () => {
    let inputString = inputView.value;

    if (inputString === "") {
        errorDialog.show();
        return;
    }
    
    /* Huffman Algorithm */
    let frequencyTable = buildFrequencyTable(inputString);
    let huffmanTree = buildTree(frequencyTable);
    let codeTable = buildCodeTable(huffmanTree);
    let encodedString = encode(inputString, codeTable);

    /* Display the resulting code */
    outputView.textContent = encodedString;
    outputSizeView.textContent = Math.ceil(encodedString.length / 8);
    let compression=(outputSizeView.textContent/inputSizeView.textContent)*100;
    compressionRatioView.textContent = `${compression} %`
    /* Display code/frequency table data */
    displayTable(codeTable, frequencyTable);

});

function displayTable (codeTable = {}, frequencyTable = {}) {
    let rows = [];
    for (const [char, code] of Object.entries(codeTable)) {
        rows.push({
            char: char!==' ' && char!=='\n' ? char : (char===' ' ?'Space':'New Line'),
            freq: frequencyTable[char],
            code: code,
            length: code.length
        });
        console.log(rows[rows.length-1])
    }

    /* Sort the rows according to the characters */
    rows.sort((a, b) => {
        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return 0;
    });

    tableView.innerHTML = "";
    rows.forEach(row => {
        let html = `
            <tr>
                <td>${row.char}</td>
                <td>${row.freq}</td>
                <td>${row.code}</td>
                <td>${row.length}</td>
            </tr>
        `;
        tableView.innerHTML += html;
    });
    tableWrapper.style.display = "block";
}

/* Huffman-encodes a string given a code lookup table */
function encode (inputString = "", codeTable = {}) {
    let ans = "";
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        ans += codeTable[ inputString[i] ];
    }
    return ans;
}

/* Constructs a code lookup table based on a given tree */
function buildCodeTable (root = {}) {
    let codeTable = {};
    dfs(root, "");
    function dfs (node, code) {
        if (node.leftChild === null && node.rightChild === null) {
            codeTable[node.value] = code;
            return;
        }

        if (node.leftChild !== null) dfs(node.leftChild, code + "0");
        if (node.rightChild !== null) dfs(node.rightChild, code + "1");
    }
    return codeTable;
}

/* Constructs a Huffman tree based on a given frequency table */
function buildTree (table = {}) {
    /* Construct tree nodes and insert them into the priority queue */
    let queue = buckets.PriorityQueue(compareNodes);
    let entries = Object.entries(table);
    for (const [char, freq] of entries) {
        queue.add(new Node(char, freq));
    }
    /*
        Greedily build the tree bottom-up
        by continuously connecting the two trees with the minimum frequencies
        until there is only a single tree in the forest
    */
    while (queue.size() > 1) {
        let smallerNode = queue.dequeue(),
            biggerNode = queue.dequeue();
        
        let root = new Node(
            biggerNode.value + smallerNode.value,
            smallerNode.frequency + biggerNode.frequency
        );
        root.rightChild = smallerNode;
        root.leftChild = biggerNode;

        queue.enqueue(root);
    }

    let root = queue.peek();
    if (root.leftChild === null && root.rightChild === null) {
        let ans = new Node(root.value, root.frequency);
        ans.leftChild = root;
        return ans;
    }

    return queue.peek();
}

/* Given a string, returns an object containing every character and its frequency */
function buildFrequencyTable (inputString = "") {
    let table = {};
    let n = inputString.length;
    for (let i = 0; i < n; i++) {
        let char = inputString[i];
        if (!table.hasOwnProperty(char)) table[char] = 0;
        table[char]++;
    }
    return table;
}