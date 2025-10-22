/**
 * exposed const to end user
 * @module
 */
const ErrorCorrectionLevel = {
    L: "L",
    M: "M",
    Q: "Q",
    H: "H",
};
const Mode = {
    Numeric: "Numeric",
    AlphaNumeric: "AlphaNumeric",
    Byte: "Byte",
    Kanji: "Kanji",
};
const ReservedBits = {
    FinderPattern: "FinderPattern",
    AlignmentPattern: "AlignmentPattern",
    TimingPattern: "TimingPattern",
    FormatInfo: "FormatInfo",
    VersionInfo: "VersionInfo",
    DarkModule: "DarkModule",
    Separator: "Separator",
};

/**
 * constants used in generating the qr
 * @module
 */
/**
 * Alphanumeric mode character set
 * - 0 : 0
 * - 1 : 1
 * - ...
 * - A : 10
 * - B : 11
 * - ...
 */
const ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
/**
 * No of modules for outer dark square of Finder Pattern: `7 x 7`
 */
const FINDER_PATTERN_SIZE = 7;
/**
 * No of modules for outer dark square of Alignment Pattern: `5 x 5`
 */
const ALIGNMENT_PATTERN_SIZE = 5;
/**
 * No of alignment patterns for a given QR version
 * - v 01-06   : index 0
 * - v 07-13  : index 1
 * - v 14-20 : index 2
 * - ...
 * @example // to get the value of a specific version
 * index = floor(version / 7)
 * ALIGNMENT_PATTERN_TOTALS[index]
 */
const ALIGNMENT_PATTERN_TOTALS = [1, 6, 13, 22, 33, 46];
/**
 * ALIGNMENT_PATTERN_DIFFS
 */
const ALIGNMENT_PATTERN_DIFFS = [
    0, 12, 16, 20, 24, 28, 16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28,
    22, 24, 24, 26, 26, 28, 28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28,
    28,
];
/**
 * Mode Indicator Total `4 bits`
 */
const MODE_INDICATOR_BITS = 4;
/**
 * Mode Indicator values for different modes
 * - Numeric:       0001 (0x1)
 * - AlphaNumeric:  0010 (0x2)
 * - Byte:          0100 (0x4)
 * - Kanji:         1000 (0x8)
 */
const MODE_INDICATOR = {
    [Mode.Numeric]: 0b0001,
    [Mode.AlphaNumeric]: 0b0010,
    [Mode.Byte]: 0b0100,
    [Mode.Kanji]: 0b1000,
};
/**
 * get version range of the qr based on the character count
 * - index 0 : v < 9
 * - index 1 : v < 26
 * - index 2 : v < 40
 */
const CHARACTER_COUNT_MAX_VERSION = [9, 26, 40];
/**
 * Number of bits in Character Count Indicator for different mode and Qr version
 * - v 01-09 : index 0
 * - v 10-26 : index 1
 * - v 27-40 : index 2
 * @example // to get the value of a specific mode and version
 * index = 0
 * if version > 9
 *   index = 1
 * if version > 26
 *   index = 2
 * CHARACTER_COUNT_INDICATOR[Mode][index]
 */
const CHARACTER_COUNT_INDICATOR = {
    [Mode.Numeric]: [10, 12, 14],
    [Mode.AlphaNumeric]: [9, 11, 13],
    [Mode.Byte]: [8, 16, 16],
    [Mode.Kanji]: [8, 10, 12],
};
/**
 * Number of bits for a mode
 * - Numeric      : 10 bits 3 character
 * - AlphaNumeric : 11 bits 2 character
 * - Byte         : 8 bits per character
 * - Kanji        : 13 bits per character
 */
const MODE_BITS = {
    [Mode.Numeric]: [4, 7, 10],
    [Mode.AlphaNumeric]: [6, 11],
    [Mode.Byte]: [8],
    [Mode.Kanji]: [13],
};
/**
 * Number of bits for a error correction level indicator
 */
const ERROR_CORRECTION_BITS = {
    [ErrorCorrectionLevel.L]: 0b01,
    [ErrorCorrectionLevel.M]: 0b00,
    [ErrorCorrectionLevel.Q]: 0b11,
    [ErrorCorrectionLevel.H]: 0b10,
};
// QR Code mask patterns
const MASK_PATTERNS = [
    (i, j) => (i + j) % 2 === 0,
    (i, _) => i % 2 === 0,
    (_, j) => j % 3 === 0,
    (i, j) => (i + j) % 3 === 0,
    (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
    (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
    (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
    (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];
/**
 * Pad Codewords
 * - 11101100 (0xEC) : index 0
 * - 00010001 (0x11) : index 1
 */
const PAD_CODEWORDS = [0xec, 0x11];
/**
 * Number of data Codewords for Qr version
 * - v 1 : index 0
 * - v 2 : index 1
 * - v 3 : index 2
 * - ...
 * @example // to get the value of a specific version
 *   index = version - 1
 *   codewords = CODEWORDS[index]
 */
const CODEWORDS = [
    26, 44, 70, 100, 134, 172, 196, 242, 292, 346, 404, 466, 532, 581, 655, 733,
    815, 901, 991, 1085, 1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051,
    2185, 2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706,
];
/**
 * Number of data Codewords for different error correction level and Qr version
 * @example // to get the value of a specific mode and version
 *   index = version - 1
 *   errorCorrectionLevel = ErrorCorrectionLevel.M
 *   errorCOrrectionBlock = ERROR_CORRECTION_BLOCK[errorCorrectionLevel][index]
 */
const ERROR_CORRECTION_CODEWORDS = {
    [ErrorCorrectionLevel.L]: [
        7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 104, 120, 132, 144, 168, 180,
        196, 224, 224, 252, 270, 300, 312, 336, 360, 390, 420, 450, 480, 510, 540,
        570, 570, 600, 630, 660, 720, 750,
    ],
    [ErrorCorrectionLevel.M]: [
        10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280, 308,
        338, 364, 416, 442, 476, 504, 560, 588, 644, 700, 728, 784, 812, 868, 924,
        980, 1036, 1064, 1120, 1204, 1260, 1316, 1372,
    ],
    [ErrorCorrectionLevel.Q]: [
        13, 22, 36, 52, 72, 96, 108, 132, 160, 192, 224, 260, 288, 320, 360, 408,
        448, 504, 546, 600, 644, 690, 750, 810, 870, 952, 1020, 1050, 1140, 1200,
        1290, 1350, 1440, 1530, 1590, 1680, 1770, 1860, 1950, 2040,
    ],
    [ErrorCorrectionLevel.H]: [
        17, 28, 44, 64, 88, 112, 130, 156, 192, 224, 264, 308, 352, 384, 432, 480,
        532, 588, 650, 700, 750, 816, 900, 960, 1050, 1110, 1200, 1260, 1350, 1440,
        1530, 1620, 1710, 1800, 1890, 1980, 2100, 2220, 2310, 2430,
    ],
};
/**
 * Number of data Codewords for different error correction level and version
 * @example // to get the value of a specific mode and version
 *   index = version - 1
 *   errorCorrectionLevel = ErrorCorrectionLevel.M
 *   errorCOrrectionBlock = ERROR_CORRECTION_BLOCK[errorCorrectionLevel][index]
 */
const ERROR_CORRECTION_BLOCK = {
    [ErrorCorrectionLevel.L]: [
        1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12,
        12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
    ],
    [ErrorCorrectionLevel.M]: [
        1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17,
        18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
    ],
    [ErrorCorrectionLevel.Q]: [
        1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23,
        25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
    ],
    [ErrorCorrectionLevel.H]: [
        1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25,
        34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
    ],
};

/**
 * This module contains function to generate reed solomon error correction code.
 * @module
 */
// Galois Field arithmetic
const GF_EXP = new Uint8Array(256);
const GF_LOG = new Uint8Array(256);
// Initialize tables
function initTables() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x = x * 2;
        if (x > 255)
            x ^= 0x11d; // x^8 + x^4 + x^3 + x^2 + 1
    }
    GF_EXP[255] = GF_EXP[0];
}
// Galois Field multiplication
function gfMul(x, y) {
    if (x === 0 || y === 0)
        return 0;
    return GF_EXP[(GF_LOG[x] + GF_LOG[y]) % 255];
}
// Polynomial multiplication
function polyMul(p1, p2) {
    const result = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
            result[i + j] ^= gfMul(p1[i], p2[j]);
        }
    }
    return result;
}
// Generate generator polynomial
function generateGenerator(n) {
    let g = [1];
    for (let i = 0; i < n; i++) {
        g = polyMul(g, [1, GF_EXP[i]]);
    }
    return g;
}
// Encode message
function rsEncode(data, ecBytes) {
    initTables();
    const generator = generateGenerator(ecBytes);
    const encoded = new Uint8Array(data.length + ecBytes);
    encoded.set(data);
    for (let i = 0; i < data.length; i++) {
        const coeff = encoded[i];
        if (coeff !== 0) {
            for (let j = 0; j < generator.length; j++) {
                encoded[i + j] ^= gfMul(generator[j], coeff);
            }
        }
    }
    return encoded.slice(-ecBytes);
}

/**
 * This module contains utility function used to generate a qr.
 * @module
 */
/**
 * special characters used in Alpha Numeric character in QR
 */
const ALPHANUMERIC_SPECIAL_CHARSET = " $%*+\\-./:";
/**
 * basic regex string for Numeric | Alphanumeric and Byte selection
 */
const regexString = {
    [Mode.Numeric]: "[0-9]+",
    [Mode.AlphaNumeric]: `[A-Z${ALPHANUMERIC_SPECIAL_CHARSET}]+`,
    [Mode.Byte]: `[^A-Z0-9${ALPHANUMERIC_SPECIAL_CHARSET}]+`,
};
/**
 * get the bit length for the given segment
 */
function getBitsLength(data) {
    const dataLength = data.value.length;
    if (data.mode === Mode.Numeric) {
        const maxModeBit = MODE_BITS[Mode.Numeric][2];
        const modeLength = MODE_BITS[Mode.Numeric].length;
        return (maxModeBit * Math.floor(dataLength / modeLength) +
            (dataLength % modeLength ? (dataLength % modeLength) * modeLength + 1 : 0));
    }
    if (data.mode === Mode.AlphaNumeric) {
        const [firstBit, secondBit] = MODE_BITS[Mode.AlphaNumeric];
        const modeLength = MODE_BITS[Mode.AlphaNumeric].length;
        return (secondBit * Math.floor(dataLength / modeLength) +
            firstBit * (dataLength % modeLength));
    }
    return new TextEncoder().encode(data.value).length * MODE_BITS[Mode.Byte][0];
}
/**
 * get the bit of character count indicator
 */
function getCharCountIndicator(mode, version) {
    let index = 0;
    if (version > 26) {
        index = 2;
    }
    else if (version > 9) {
        index = 1;
    }
    return CHARACTER_COUNT_INDICATOR[mode][index];
}
/**
 * get the version info bit
 */
function getVersionInfoBits(version) {
    // Golay code generator polynomial 0x1F25 (0b1111100100101)
    const GOLAY_GENERATOR = 0x1f25;
    // The 6 bits representing the version number
    let versionBits = version << 12;
    // Calculate the error correction bits
    let dividend = versionBits;
    for (let i = 17; i >= 12; i--) {
        if (dividend & (1 << i)) {
            dividend ^= GOLAY_GENERATOR << (i - 12);
        }
    }
    // Combine version and error correction bits
    return versionBits | (dividend & 0xfff);
}
/**
 * get the format info bit
 */
function getFormatInfoBits(errorCorrectionBit, maskPattern) {
    // Golay Generator polynomial for QR code format information
    const GOLAY_GENERATOR = 0x537;
    // XOR mask for format information
    const FORMAT_MASK = 0x5412;
    let formatInfo = (errorCorrectionBit << 3) | maskPattern;
    let reg = formatInfo << 10;
    // Calculate error correction bits
    for (let i = 4; i >= 0; i--) {
        if (reg & (1 << (i + 10))) {
            reg ^= GOLAY_GENERATOR << i;
        }
    }
    let errorCorrectionBits = reg & 0x3ff;
    // Combine format info with error correction bits
    let pattern = (formatInfo << 10) | errorCorrectionBits;
    // XOR with the format mask
    return (pattern ^= FORMAT_MASK);
}
/**
 * get the capacity
 */
function getCapacity(version, errorCorrectionLevel, mode) {
    const totalCodeWord = CODEWORDS[version - 1];
    const ecTotalCodeWord = ERROR_CORRECTION_CODEWORDS[errorCorrectionLevel][version - 1];
    const dataTotalCodewordsBits = (totalCodeWord - ecTotalCodeWord) * 8;
    if (mode === "Mixed") {
        return dataTotalCodewordsBits;
    }
    const usableBits = dataTotalCodewordsBits -
        (getCharCountIndicator(mode, version) + MODE_INDICATOR_BITS);
    switch (mode) {
        case Mode.Numeric: {
            return Math.floor((usableBits / 10) * 3);
        }
        case Mode.AlphaNumeric: {
            return Math.floor((usableBits / 11) * 2);
        }
        case Mode.Kanji: {
            return Math.floor(usableBits / 13);
        }
        case Mode.Byte: {
            return Math.floor(usableBits / 8);
        }
    }
    return 0;
}
/**
 * get the encoded value of a segment for the given mode
 */
function getEncodedSegmentData(data) {
    let bitArray = [];
    const { value, mode } = data;
    if (mode === Mode.Numeric) {
        for (let i = 0; i < value.length; i = i + 3) {
            const first = value[i];
            const second = value[i + 1] || null;
            const third = value[i + 2] || null;
            if (third !== null) {
                let num = Number(first + second + third);
                bitArray.push({ data: num, bitLength: MODE_BITS[Mode.Numeric][2] });
            }
            else if (second !== null) {
                let num = Number(first + second);
                bitArray.push({ data: num, bitLength: MODE_BITS[Mode.Numeric][1] });
            }
            else {
                let num = Number(first);
                bitArray.push({ data: num, bitLength: MODE_BITS[Mode.Numeric][0] });
            }
        }
        return bitArray;
    }
    if (mode === Mode.AlphaNumeric) {
        for (let i = 0; i < value.length; i = i + 2) {
            const first = ALPHANUMERIC_CHARSET.indexOf(value[i]);
            const second = value[i + 1]
                ? ALPHANUMERIC_CHARSET.indexOf(value[i + 1])
                : null;
            if (second !== null) {
                const num = first * 45 + second;
                const bitLength = MODE_BITS[Mode.AlphaNumeric][1];
                bitArray.push({ data: num, bitLength });
            }
            else {
                const num = first;
                const bitLength = MODE_BITS[Mode.AlphaNumeric][0];
                bitArray.push({ data: num, bitLength });
            }
        }
        return bitArray;
    }
    if (mode === Mode.Byte) {
        const encodedData = new TextEncoder().encode(value);
        for (let i = 0; i < encodedData.length; i++) {
            let num = encodedData[i];
            bitArray.push({ data: num, bitLength: MODE_BITS[Mode.Byte][0] });
        }
    }
    return bitArray;
}
/**
 * get mask penalty
 */
function getMaskPenalty(data, size) {
    let penalty = 0;
    // Rule 1: Five or more same-colored modules in a row
    for (let i = 0; i < size; i++) {
        let rowPenalty = 0;
        let colPenalty = 0;
        let lastRowBit = data[i * size];
        let lastColBit = data[i];
        let rowCount = 0;
        let colCount = 0;
        for (let j = 0; j < size; j++) {
            const rowBit = data[i * size + j];
            if (rowBit === lastRowBit) {
                rowCount++;
            }
            else {
                if (rowCount >= 5)
                    rowPenalty += 3 + (rowCount - 5);
                rowCount = 1;
                lastRowBit = rowBit;
            }
            const colBit = data[j * size + i];
            if (colBit === lastColBit) {
                colCount++;
            }
            else {
                if (colCount >= 5)
                    colPenalty += 3 + (colCount - 5);
                colCount = 1;
                lastColBit = colBit;
            }
        }
        if (rowCount >= 5)
            rowPenalty += 3 + (rowCount - 5);
        if (colCount >= 5)
            colPenalty += 3 + (colCount - 5);
        penalty += rowPenalty + colPenalty;
    }
    // Rule 2: 2x2 blocks of same-colored modules
    for (let i = 0; i < size - 1; i++) {
        for (let j = 0; j < size - 1; j++) {
            const color = data[i * size + j];
            if (color === data[(i + 1) * size + j] &&
                color === data[i * size + (j + 1)] &&
                color === data[(i + 1) * size + (j + 1)]) {
                penalty += 3;
            }
        }
    }
    // Rule 3: Specific patterns in rows or columns
    const pattern1 = new Uint8Array([1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0]);
    const pattern2 = new Uint8Array([0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1]);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j <= size - pattern1.length; j++) {
            let matchRow1 = true;
            let matchRow2 = true;
            let matchCol1 = true;
            let matchCol2 = true;
            for (let k = 0; k < pattern1.length; k++) {
                if (data[i * size + j + k] !== pattern1[k])
                    matchRow1 = false;
                if (data[i * size + j + k] !== pattern2[k])
                    matchRow2 = false;
                if (data[(j + k) * size + i] !== pattern1[k])
                    matchCol1 = false;
                if (data[(j + k) * size + i] !== pattern2[k])
                    matchCol2 = false;
            }
            if (matchRow1 || matchRow2)
                penalty += 40;
            if (matchCol1 || matchCol2)
                penalty += 40;
        }
    }
    // Rule 4: Balance of dark and light modules
    const darkModules = data.reduce((sum, bit) => sum + bit, 0);
    const totalModules = data.length;
    const darkPercentage = (darkModules * 100) / totalModules;
    const previousMultiple = Math.floor(darkPercentage / 5) * 5;
    const nextMultiple = Math.ceil(darkPercentage / 5) * 5;
    penalty +=
        Math.min(Math.abs(previousMultiple - 50) / 5, Math.abs(nextMultiple - 50) / 5) * 10;
    return penalty;
}

/**
 * function to find shortest distant in graph(segments) using dijkstra algorithm
 * @module
 */
/**
 * a simple priority queue implementation
 */
class PriorityQueue {
    data = [];
    enqueue(node, priority) {
        this.data.push({ node, priority });
        this.data.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.data.shift()?.node;
    }
    isEmpty() {
        return this.data.length === 0;
    }
}
/**
 * dijkstra implementation
 */
function dijkstra(graph, start) {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    const visited = new Set();
    // Initialize distances with infinity
    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    // Start with the starting node
    pq.enqueue(start, 0);
    while (!pq.isEmpty()) {
        const currentNode = pq.dequeue();
        if (visited.has(currentNode)) {
            continue;
        }
        visited.add(currentNode);
        const neighbors = graph[currentNode];
        for (const neighbor in neighbors) {
            const newDist = distances[currentNode] + neighbors[neighbor];
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = currentNode;
                pq.enqueue(neighbor, newDist);
            }
        }
    }
    return { distances, previous };
}
function getPath(previous, start, target) {
    const path = [];
    let currentNode = target;
    while (currentNode) {
        path.push(currentNode);
        currentNode = previous[currentNode];
    }
    // If the start node is not in the path, it means there is no path to the target
    if (path[path.length - 1] !== start) {
        return []; // No path found
    }
    return path.reverse();
}

/**
 * This module contains function to divide input sting to suitable segments for qr.
 * @module
 */
const GRAPH_START_NODE = "start";
const GRAPH_END_NODE = "end";
/**
 * split the string into basic Mode
 * @example
 * getBasicInputSegments("Hello")
 * // output
 * [{value: 'H', mode: 'AlphaNumeric' }, {value: 'ello', mode: 'Byte' }]
 */
function getBasicInputSegments(data) {
    const regStr = [
        `(${regexString[Mode.AlphaNumeric]})`,
        `(${regexString[Mode.Numeric]})`,
        `(${regexString[Mode.Byte]})`,
    ];
    const regex = new RegExp(regStr.join("|"), "g");
    let match;
    const inputType = [];
    // split the input string to specific mode
    while ((match = regex.exec(data)) !== null) {
        if (match[1]) {
            inputType.push({ value: match[1], mode: Mode.AlphaNumeric });
        }
        else if (match[2]) {
            inputType.push({ value: match[2], mode: Mode.Numeric });
        }
        else if (match[3]) {
            inputType.push({ value: match[3], mode: Mode.Byte });
        }
    }
    return inputType;
}
/**
 * optimize the segment using dijkstra
 * @example
 * getOptimizedSegments([{value: 'H', mode: 'AlphaNumeric' }, {value: 'ello', mode: 'Byte' }])
 * // output
 * [{value: 'Hello', mode: 'Byte' }]
 */
function getOptimizedSegments(segments, ccIndex) {
    let graph = {
        [GRAPH_START_NODE]: {},
    };
    let nodes = {};
    let keys = [GRAPH_START_NODE];
    // generate a graph of all possible mode as nodes and bits as their weight
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
        const element = segments[segmentIndex];
        let connects = [element];
        let currentKeys = [];
        // add other possible mode types
        if (element.mode === Mode.Numeric) {
            connects.push({ value: element.value, mode: Mode.AlphaNumeric }, { value: element.value, mode: Mode.Byte });
        }
        if (element.mode === Mode.AlphaNumeric) {
            connects.push({ value: element.value, mode: Mode.Byte });
        }
        // loop through connect(possible mode) and add them in graph with weight as the byte
        for (let connectIndex = 0; connectIndex < connects.length; connectIndex++) {
            const connectElement = connects[connectIndex];
            const key = `${segmentIndex}${connectIndex}`;
            nodes[key] = connectElement;
            currentKeys.push(key);
            // calculate byte and add to the previous nodes
            for (let i = 0; i < keys.length; i++) {
                const graphKey = keys[i];
                // if previous node is same as current then no mode indicator and character count indicator bits
                if (nodes[graphKey] && nodes[graphKey].mode === connectElement.mode) {
                    const segmentSum = {
                        value: nodes[graphKey].value + connectElement.value,
                        mode: connectElement.mode,
                    };
                    graph[graphKey][key] =
                        getBitsLength(segmentSum) - getBitsLength(nodes[graphKey]);
                }
                else {
                    graph[graphKey][key] =
                        getBitsLength(connectElement) +
                            MODE_INDICATOR_BITS +
                            CHARACTER_COUNT_INDICATOR[connectElement.mode][ccIndex];
                }
            }
            // if graph ends add end node
            graph[key] =
                segmentIndex === segments.length - 1 ? { [GRAPH_END_NODE]: 0 } : {};
        }
        keys = currentKeys;
    }
    const result = dijkstra({ ...graph, end: {} }, GRAPH_START_NODE);
    const path = getPath(result.previous, GRAPH_START_NODE, GRAPH_END_NODE);
    let data = [];
    // filter and merge similar modes
    for (let i = 0; i < path.length; i++) {
        const element = nodes[path[i]];
        const prevElement = nodes[path[i - 1]];
        if (prevElement && prevElement?.mode === element?.mode) {
            data[data.length - 1] = {
                value: data[data.length - 1].value + element.value,
                mode: element.mode,
            };
        }
        else if (element) {
            data.push(element);
        }
    }
    return data;
}

/**
 * QR class, generates the qr code in Uint8Array of 1's and 0's from the given input.
 * @module
 */
/**
 * Generates a Qr code
 */
class QR {
    inputData;
    segments;
    data;
    gridSize;
    version;
    errorCorrection;
    reservedBits;
    maskPatten;
    #codewords;
    #codeBitLength;
    constructor(inputData, options) {
        if (!inputData) {
            throw new Error("Not a valid string input");
        }
        this.inputData = inputData;
        this.errorCorrection =
            ErrorCorrectionLevel[options?.errorCorrection || ErrorCorrectionLevel.M];
        this.reservedBits = {};
        this.segments = getBasicInputSegments(inputData);
        this.version = this.#getVersion();
        this.gridSize = this.version * 4 + 17;
        this.data = new Uint8Array(this.gridSize * this.gridSize);
        this.#codewords = new Uint8Array(CODEWORDS[this.version - 1]);
        this.#codeBitLength = 0;
        this.maskPatten = 0;
        this.#generateQr();
    }
    #generateQr() {
        this.#generateCodeword();
        this.#fillFinderPattern();
        this.#fillTimingPattern();
        this.#fillAlignmentPattern();
        if (this.version >= 7) {
            this.#fillVersionInfo();
        }
        this.#reserveBits();
        this.#fillCodeword();
        this.#mask();
        this.#fillFormatInfo();
    }
    /**
     * calculate the minimum version required for the given input data and Error Correction Level
     */
    #getVersion() {
        let version = 0;
        let segments = [];
        // outer loop character count (CHARACTER_COUNT_INDICATOR length is 3)
        ccLoop: for (let ccIndex = 0; ccIndex < 3; ccIndex++) {
            segments = getOptimizedSegments(this.segments, ccIndex);
            const isMixedMode = segments.length > 1;
            const mode = isMixedMode ? "Mixed" : segments[0].mode;
            const maxCapacityVersion = CHARACTER_COUNT_MAX_VERSION[ccIndex];
            let bitSize = 0;
            if (!isMixedMode) {
                bitSize =
                    segments[0].mode === Mode.Byte
                        ? getEncodedSegmentData(segments[0]).length
                        : segments[0].value.length;
            }
            const maxDataCapacity = getCapacity(maxCapacityVersion, this.errorCorrection, mode);
            if (isMixedMode) {
                segments.forEach((d) => {
                    bitSize +=
                        MODE_INDICATOR_BITS +
                            CHARACTER_COUNT_INDICATOR[d.mode][ccIndex] +
                            getBitsLength(d);
                });
            }
            if (bitSize <= maxDataCapacity) {
                let startIndex = CHARACTER_COUNT_MAX_VERSION[ccIndex - 1] || 1;
                // inner loop qr version
                for (let i = startIndex; i <= maxCapacityVersion; i++) {
                    const capacity = getCapacity(i, this.errorCorrection, mode);
                    if (bitSize <= capacity) {
                        version = i;
                        break ccLoop;
                    }
                }
            }
        }
        this.segments = segments;
        return version;
    }
    /**
     * encode the data to it's binary 8 bit format
     */
    #encodeCodeword(codewords, data, bitLen) {
        for (let i = 0; i < bitLen; i++) {
            const bit = (data >>> (bitLen - i - 1)) & 1;
            const codewordIndex = Math.floor(this.#codeBitLength / 8);
            if (codewords.length <= codewordIndex) {
                codewords[codewordIndex + 1] = 0;
            }
            if (bit) {
                codewords[codewordIndex] |= 0x80 >>> this.#codeBitLength % 8;
            }
            this.#codeBitLength++;
        }
    }
    /**
     * Generate and encode the Input data to it equivalent Modes and Error Correction Codewords
     */
    #generateCodeword() {
        const totalCodeword = this.#codewords.length;
        const ecTotalCodeword = ERROR_CORRECTION_CODEWORDS[this.errorCorrection][this.version - 1];
        const dataTotalCodeword = totalCodeword - ecTotalCodeword;
        const dataTotalCodewordBit = dataTotalCodeword * 8;
        const dcData = new Uint8Array(totalCodeword - ecTotalCodeword);
        const ecData = new Uint8Array(ecTotalCodeword);
        // encode segment data
        for (let index = 0; index < this.segments.length; index++) {
            const segment = this.segments[index];
            // encode mode
            this.#encodeCodeword(dcData, MODE_INDICATOR[segment.mode], MODE_INDICATOR_BITS);
            // get encoded segment data
            const segmentBitArray = getEncodedSegmentData(segment);
            // encode character count indicator
            const ccLength = segment.mode === Mode.Byte
                ? segmentBitArray.length
                : segment.value.length;
            this.#encodeCodeword(dcData, ccLength, getCharCountIndicator(segment.mode, this.version));
            // encode segment
            for (let i = 0; i < segmentBitArray.length; i++) {
                const segmentBit = segmentBitArray[i];
                this.#encodeCodeword(dcData, segmentBit.data, segmentBit.bitLength);
            }
        }
        // Add terminator Bits 4 0s (if bitString is more than 4 bit shorter than totalCodewordBit)
        if (this.#codeBitLength + 4 <= dataTotalCodewordBit) {
            this.#encodeCodeword(dcData, 0, 4);
        }
        // Add 0's till the bitString is a multiple of 8
        if (this.#codeBitLength % 8 !== 0) {
            this.#encodeCodeword(dcData, 0, 8 - (this.#codeBitLength % 8));
        }
        // Add pad words if bitString is still shorter than the totalCodewordBit
        const remainingByte = (dataTotalCodewordBit - this.#codeBitLength) / 8;
        for (let i = 0; i < remainingByte; i++) {
            this.#encodeCodeword(dcData, PAD_CODEWORDS[i % 2], 8);
        }
        const ecTotalBlock = ERROR_CORRECTION_BLOCK[this.errorCorrection][this.version - 1];
        const group2Block = totalCodeword % ecTotalBlock;
        const group1Block = ecTotalBlock - group2Block;
        const group1TotalCodeword = Math.floor(totalCodeword / ecTotalBlock);
        const group1DataTotalCodeword = Math.floor(dataTotalCodeword / ecTotalBlock);
        const group2DataTotalCodeword = group1DataTotalCodeword + 1;
        // Number of error correction codewords is the same for both groups
        const ecCount = group1TotalCodeword - group1DataTotalCodeword;
        let offset = 0;
        let maxDataSize = 0;
        let blockIndexes = [offset];
        // calculate maxdataSize and generate error correction codewords for each block
        for (let b = 0; b < ecTotalBlock; b++) {
            const dataSize = b < group1Block ? group1DataTotalCodeword : group2DataTotalCodeword;
            blockIndexes.push(offset + dataSize);
            // Calculate EC codewords for this data block
            const blockData = dcData.slice(offset, offset + dataSize);
            const errorCodeword = rsEncode(blockData, ecCount);
            ecData.set(errorCodeword, b * ecCount);
            offset += dataSize;
            maxDataSize = Math.max(maxDataSize, dataSize);
        }
        // Interleave the Data Codewords
        let codewordIndex = 0;
        for (let i = 0; i < maxDataSize; i++) {
            for (let j = 0; j < ecTotalBlock; j++) {
                const index = blockIndexes[j] + i;
                if (index < blockIndexes[j + 1]) {
                    this.#codewords[codewordIndex++] = dcData[index];
                }
            }
        }
        // Interleave the Error Correction Codewords
        for (let i = 0; i < ecCount; i++) {
            for (let j = 0; j < ecTotalBlock; j++) {
                const index = j * ecCount + i;
                this.#codewords[codewordIndex++] = ecData[index];
            }
        }
    }
    /**
     * reserve Finder Pattern Separator bits, Format Information bits and Dark Module bit
     */
    #reserveBits() {
        const size = this.gridSize;
        // top-left Finder pattern
        this.#reserveFinderSeparatorBits(0, 0);
        // top-right Finder pattern
        this.#reserveFinderSeparatorBits(0, size - FINDER_PATTERN_SIZE);
        // bottom-left Finder pattern
        this.#reserveFinderSeparatorBits(size - FINDER_PATTERN_SIZE, 0);
        // Temporary reserve Format Info to preserve index so that dataCodeword can be filled easily
        // after data masking correct reservation will be applied
        for (let i = 0; i < 8; i++) {
            // top-right index of format info
            const rightTop = size * i + FINDER_PATTERN_SIZE + 1;
            const rightTopTimingBlock = size * (FINDER_PATTERN_SIZE - 1) + FINDER_PATTERN_SIZE + 1;
            // bottom-right index of format info
            const rightBottom = size * (size - i) + FINDER_PATTERN_SIZE + 1;
            // bottom-left index of format info
            let bottomLeft = size * (FINDER_PATTERN_SIZE + 1) + i;
            const bottomLeftTimingBlock = size * (FINDER_PATTERN_SIZE + 1) + FINDER_PATTERN_SIZE - 1;
            // bottom-right index of format info
            const bottomRight = size * (FINDER_PATTERN_SIZE + 1) + size - i - 1;
            if (rightTop && rightTop !== rightTopTimingBlock) {
                this.reservedBits[rightTop] = {
                    type: ReservedBits.FinderPattern,
                    dark: false,
                };
            }
            if (rightBottom && rightBottom < this.data.length) {
                this.reservedBits[rightBottom] = {
                    type: ReservedBits.FinderPattern,
                    dark: false,
                };
            }
            if (bottomLeft) {
                bottomLeft =
                    bottomLeft >= bottomLeftTimingBlock ? bottomLeft + 1 : bottomLeft;
                this.reservedBits[bottomLeft] = {
                    type: ReservedBits.FinderPattern,
                    dark: false,
                };
            }
            if (bottomRight) {
                this.reservedBits[bottomRight] = {
                    type: ReservedBits.FinderPattern,
                    dark: false,
                };
            }
        }
        // reserve Dark Module
        const darkModule = size * (size - FINDER_PATTERN_SIZE - 1) + (FINDER_PATTERN_SIZE + 1);
        this.data[darkModule] = 1;
        this.reservedBits[darkModule] = {
            type: ReservedBits.DarkModule,
            dark: true,
        };
    }
    /**
     * helper function to reserver Finder Pattern Separator bits for the given co ordinates
     */
    #reserveFinderSeparatorBits(x, y) {
        const size = FINDER_PATTERN_SIZE;
        const height = size + x - 1;
        const width = size + y - 1;
        for (let i = 0; i < size + 1; i++) {
            const left = this.gridSize * (i + x - 1) + y - 1;
            const top = this.gridSize * (x - 1) + i + y;
            const right = this.gridSize * (i + x) + width + 1;
            const down = this.gridSize * (height + 1) + i + y - 1;
            if (x > 0 && top - this.gridSize * (x - 1) < this.gridSize) {
                this.reservedBits[top] = {
                    type: ReservedBits.Separator,
                    dark: false,
                };
            }
            if (y > 0 && left >= 0) {
                this.reservedBits[left] = {
                    type: ReservedBits.Separator,
                    dark: false,
                };
            }
            if (this.gridSize - x > size &&
                down - this.gridSize * (height + 1) >= 0) {
                this.reservedBits[down] = {
                    type: ReservedBits.Separator,
                    dark: false,
                };
            }
            if (this.gridSize - y > size && right >= 0 && right <= this.data.length) {
                this.reservedBits[right] = {
                    type: ReservedBits.FinderPattern,
                    dark: false,
                };
            }
        }
    }
    /**
     * helper function set data for AlignmentPattern and FinderPattern
     */
    #fillBlock(x, y, size, rbType) {
        const height = size + x - 1;
        const width = size + y - 1;
        for (let i = x; i <= height; i++) {
            for (let j = y; j <= width; j++) {
                const index = i * this.gridSize + j;
                this.reservedBits[index] = { type: rbType, dark: false };
                // outer block
                if (j === y || j === width) {
                    this.data[index] = 1;
                    this.reservedBits[index] = { type: rbType, dark: true };
                }
                if (i === x || i === height) {
                    this.data[index] = 1;
                    this.reservedBits[index] = { type: rbType, dark: true };
                }
                // inner block
                if (j >= y + 2 && j <= width - 2 && i >= x + 2 && i <= height - 2) {
                    this.data[index] = 1;
                    this.reservedBits[index] = { type: rbType, dark: true };
                }
            }
        }
    }
    /**
     * set data for TimingPattern
     */
    #fillTimingPattern() {
        let length = this.gridSize - FINDER_PATTERN_SIZE * 2 - 2;
        for (let i = 1; i <= length; i++) {
            const hIndex = FINDER_PATTERN_SIZE + i + this.gridSize * 6;
            const vIndex = (FINDER_PATTERN_SIZE + i) * this.gridSize + 6;
            const dark = i % 2 !== 0;
            this.data[hIndex] = dark ? 1 : 0;
            this.reservedBits[hIndex] = {
                type: ReservedBits.TimingPattern,
                dark: dark,
            };
            this.data[vIndex] = dark ? 1 : 0;
            this.reservedBits[vIndex] = {
                type: ReservedBits.TimingPattern,
                dark: dark,
            };
        }
    }
    /**
     * set data for FinderPattern
     */
    #fillFinderPattern() {
        // top-left finder pattern
        this.#fillBlock(0, 0, FINDER_PATTERN_SIZE, ReservedBits.FinderPattern);
        // top-right finder pattern
        this.#fillBlock(0, this.gridSize - FINDER_PATTERN_SIZE, FINDER_PATTERN_SIZE, ReservedBits.FinderPattern);
        // bottom-left finder pattern
        this.#fillBlock(this.gridSize - FINDER_PATTERN_SIZE, 0, FINDER_PATTERN_SIZE, ReservedBits.FinderPattern);
    }
    /**
     * set data for AlignmentPattern
     */
    #fillAlignmentPattern() {
        // no AlignmentPattern for version 1
        if (this.version === 1) {
            return;
        }
        // calculate the co-ordinates of the alignment patterns
        const subdivisionCount = Math.floor(this.version / 7);
        const total = ALIGNMENT_PATTERN_TOTALS[subdivisionCount];
        const first = 6; // first co-ordinates is always 6
        const last = this.gridSize - 7; // last co-ordinates is always Modules-7
        const diff = ALIGNMENT_PATTERN_DIFFS[this.version - 1];
        const positions = [first];
        for (let i = subdivisionCount; i >= 1; i--) {
            positions.push(last - i * diff);
        }
        positions.push(last);
        let xIndex = 0;
        let yIndex = 1;
        for (let index = 0; index < total; index++) {
            if (yIndex === positions.length) {
                xIndex++;
                yIndex = 0;
            }
            if (positions[xIndex] === first && positions[yIndex] === last) {
                xIndex++;
                yIndex = 0;
            }
            if (positions[xIndex] === last && positions[yIndex] === first) {
                yIndex++;
            }
            const x = positions[xIndex];
            const y = positions[yIndex];
            this.#fillBlock(x - 2, y - 2, ALIGNMENT_PATTERN_SIZE, ReservedBits.AlignmentPattern);
            yIndex++;
        }
    }
    /**
     * set data for Version Information
     */
    #fillVersionInfo() {
        const bits = getVersionInfoBits(this.version);
        for (let i = 0; i < 18; i++) {
            const bit = (bits >> i) & 1;
            const row = Math.floor(i / 3);
            const col = this.gridSize - 11 + (i % 3);
            // Encode in top-right corner
            const topRightIndex = row * this.gridSize + col;
            this.data[topRightIndex] = bit;
            this.reservedBits[topRightIndex] = {
                type: ReservedBits.VersionInfo,
                dark: bit === 1,
            };
            // Encode in bottom-left corner
            const bottomLeftIndex = col * this.gridSize + row;
            this.data[bottomLeftIndex] = bit;
            this.reservedBits[bottomLeftIndex] = {
                type: ReservedBits.VersionInfo,
                dark: bit === 1,
            };
        }
    }
    /**
     * set data for Format Information
     */
    #fillFormatInfo(maskPattern, qrData) {
        const data = qrData || this.data;
        const mask = maskPattern || this.maskPatten;
        const bits = getFormatInfoBits(ERROR_CORRECTION_BITS[this.errorCorrection], mask);
        for (let i = 0; i < 15; i++) {
            const bit = (bits >> i) & 1;
            // vertical
            if (i < 6) {
                const index = i * this.gridSize + 8;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
            else if (i < 8) {
                const index = (i + 1) * this.gridSize + 8;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
            else {
                const index = (this.gridSize - 15 + i) * this.gridSize + 8;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
            // horizontal
            if (i < 8) {
                const index = 8 * this.gridSize + this.gridSize - i - 1;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
            else if (i < 9) {
                const index = 8 * this.gridSize + 15 - i;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
            else {
                const index = 8 * this.gridSize + 15 - i - 1;
                data[index] = bit;
                this.reservedBits[index] = {
                    type: ReservedBits.FormatInfo,
                    dark: bit === 1,
                };
            }
        }
    }
    /**
     * set data for codewords
     */
    #fillCodeword() {
        let dataIndex = 0;
        let bitIndex = 7; // Starting with the most significant bit of the first byte
        let reverse = true;
        // Traverse the QR code in the zigzag pattern
        for (let col = this.gridSize - 1; col >= 1; col -= 2) {
            if (col === 6)
                col = 5; // Skipping the vertical timing pattern
            for (let i = this.gridSize - 1; i >= 0; i--) {
                for (let j = 0; j < 2; j++) {
                    const row = reverse ? i : this.gridSize - i - 1;
                    const index = row * this.gridSize + col - j;
                    if (this.reservedBits[index] === undefined) {
                        if ((this.#codewords[dataIndex] & (1 << bitIndex)) !== 0) {
                            this.data[index] = 1;
                        }
                        // Move to the next bit
                        if (--bitIndex === -1) {
                            dataIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                if (i === 0) {
                    reverse = !reverse;
                }
            }
        }
    }
    /**
     * calculate mask and apply mask with lowest penalty
     */
    #mask() {
        let bestPattern = 0;
        let lowestPenalty = Infinity;
        for (let i = 0; i < MASK_PATTERNS.length; i++) {
            const maskedData = this.#applyMask(i, true);
            this.#fillFormatInfo(i, maskedData);
            const penalty = getMaskPenalty(maskedData, this.gridSize);
            if (penalty < lowestPenalty) {
                lowestPenalty = penalty;
                bestPattern = i;
            }
        }
        this.maskPatten = bestPattern;
        this.#applyMask(bestPattern);
    }
    /**
     * apply mask
     */
    #applyMask(maskPattern, newData) {
        const maskedData = newData ? new Uint8Array(this.data) : this.data;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const index = i * this.gridSize + j;
                if (this.reservedBits[index] === undefined) {
                    maskedData[index] =
                        this.data[index] ^ Number(MASK_PATTERNS[maskPattern](i, j));
                }
            }
        }
        return maskedData;
    }
}

export { ErrorCorrectionLevel, Mode, QR, ReservedBits };
//# sourceMappingURL=index.mjs.map
