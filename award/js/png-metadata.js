// --- PNG Metadata Injection ---

// Helper to write a 32-bit unsigned integer to a DataView
function writeUint32(view, offset, value) {
    view.setUint32(offset, value, false); // PNG uses big-endian
}

// CRC32 checksum calculation
const crc32 = (function() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        table[i] = c;
    }
    return function(bytes, start = 0, length = bytes.length - start) {
        let crc = -1;
        for (let i = start, l = start + length; i < l; i++) {
            crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
        }
        return (crc ^ -1) >>> 0;
    };
})();

/**
 * Injects a tEXt chunk with custom metadata into a PNG ArrayBuffer.
 * @param {ArrayBuffer} pngBuffer The original PNG data.
 * @param {string} key The metadata key (e.g., "convoyrama-data").
 * @param {string} value The metadata value (e.g., a JSON string).
 * @returns {ArrayBuffer} A new ArrayBuffer with the injected chunk.
 */
function injectMetadataIntoPNG(pngBuffer, key, value) {
    const IEND_CHUNK_TYPE = 'IEND';
    const TEXT_CHUNK_TYPE = 'tEXt';

    const dataView = new DataView(pngBuffer);
    // PNG signature
    if (dataView.getUint32(0) !== 0x89504E47 || dataView.getUint32(4) !== 0x0D0A1A0A) {
        console.error("Invalid PNG signature.");
        return pngBuffer;
    }

    let offset = 8;
    while (offset < pngBuffer.byteLength) {
        const length = dataView.getUint32(offset);
        const type = String.fromCharCode(
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5),
            dataView.getUint8(offset + 6),
            dataView.getUint8(offset + 7)
        );
        
        // Find the IEND chunk, which must be the last one.
        if (type === IEND_CHUNK_TYPE) {
            const iendChunk = pngBuffer.slice(offset);
            const pngWithoutIend = pngBuffer.slice(0, offset);

            // Create the new tEXt chunk
            const keywordBytes = new TextEncoder().encode(key);
            const valueBytes = new TextEncoder().encode(value);
            const chunkDataLength = keywordBytes.length + 1 + valueBytes.length;
            
            const newChunkBuffer = new ArrayBuffer(12 + chunkDataLength);
            const newChunkView = new DataView(newChunkBuffer);
            const newChunkBytes = new Uint8Array(newChunkBuffer);

            writeUint32(newChunkView, 0, chunkDataLength);
            newChunkBytes.set(new TextEncoder().encode(TEXT_CHUNK_TYPE), 4);
            newChunkBytes.set(keywordBytes, 8);
            newChunkBytes[8 + keywordBytes.length] = 0; // Null separator
            newChunkBytes.set(valueBytes, 8 + keywordBytes.length + 1);
            
            const crc = crc32(newChunkBytes, 4, chunkDataLength + 4);
            writeUint32(newChunkView, 8 + chunkDataLength, crc);

            // Combine the parts: original PNG (without IEND) + new chunk + IEND chunk
            const finalPngBuffer = new ArrayBuffer(pngWithoutIend.byteLength + newChunkBuffer.byteLength + iendChunk.byteLength);
            const finalPngBytes = new Uint8Array(finalPngBuffer);
            
            finalPngBytes.set(new Uint8Array(pngWithoutIend), 0);
            finalPngBytes.set(new Uint8Array(newChunkBuffer), pngWithoutIend.byteLength);
            finalPngBytes.set(new Uint8Array(iendChunk), pngWithoutIend.byteLength + newChunkBuffer.byteLength);

            return finalPngBuffer;
        }
        offset += 12 + length;
    }

    console.error("IEND chunk not found.");
    return pngBuffer; // Return original buffer if IEND is not found
}

export { injectMetadataIntoPNG };
