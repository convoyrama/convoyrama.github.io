#!/bin/bash

FILE="canvasv2.js"

# Create a backup of the original file
cp "$FILE" "${FILE}.bak"

# Remove trailing backslashes from lines in the file
sed -i 's/\\$//' "$FILE"

# Replace \' with '
 sed -i "s/\\\'/\'/g" "$FILE"

echo "Trailing backslashes and \\' sequences removed from $FILE. A backup was created at ${FILE}.bak"