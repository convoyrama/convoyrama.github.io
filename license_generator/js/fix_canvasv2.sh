#!/bin/bash

FILE="canvasv2.js"

# Create a backup of the original file
cp "$FILE" "${FILE}.bak"

# Remove trailing backslashes from lines in the file
sed -i 's/\\$//' "$FILE"

echo "Trailing backslashes removed from $FILE. A backup was created at ${FILE}.bak"
