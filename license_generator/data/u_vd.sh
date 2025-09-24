#!/bin/bash
file="./vtcData.json"

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is not installed"
    exit 1
fi

# Initialize JSON file if it doesn't exist
if [ ! -f "$file" ]; then
    echo '{"vtcOwners":[],"starMap":{},"a":[]}' >"$file"
    echo "Created $file"
fi

# Function to validate links
validateLink() {
    local link=$1 type=$2
    if [ "$type" = "profile" ]; then
        if [[ ! "$link" =~ ^https://truckersmp\.com/user/[0-9]+$ ]]; then
            echo "Error: Invalid profile link. Must be https://truckersmp.com/user/[numbers]"
            return 1
        fi
    elif [ "$type" = "company" ]; then
        if [[ ! "$link" =~ ^https://truckersmp\.com/vtc/[0-9]+(-[a-zA-Z0-9-]+)?$ ]]; then
            echo "Error: Invalid company link. Must be https://truckersmp.com/vtc/[numbers][-optional-name]"
            return 1
        fi
    fi
    return 0
}

# Function to normalize links (remove trailing slashes, query params, and cosmetic names)
normalizeLink() {
    local link=$1
    echo "$link" | sed 's/\/\+$//' | sed 's/\?.*$//' | sed 's/-[a-z0-9-]\+$//'
}

# Prompt for input
echo "Enter details:"
read -p "Name: " name
if [ -z "$name" ]; then
    echo "Error: Name cannot be empty"
    exit 1
fi

read -p "Profile Link: " profileLink
validateLink "$profileLink" "profile" || exit 1
normalizedProfileLink=$(normalizeLink "$profileLink")

read -p "Company Link: " companyLink
validateLink "$companyLink" "company" || exit 1
normalizedCompanyLink=$(normalizeLink "$companyLink")

# Check for duplicate entry
existingEntry=$(jq -r ".vtcOwners[] | select(.profileLink==\"$normalizedProfileLink\" and .companyLink==\"$normalizedCompanyLink\") | .name" "$file")
if [ ! -z "$existingEntry" ]; then
    echo "Error: Duplicate entry for profile $normalizedProfileLink and company $normalizedCompanyLink"
    exit 1
fi

# Create JSON object for new entry
newEntry=$(jq -n --arg n "$name" --arg p "$normalizedProfileLink" --arg c "$normalizedCompanyLink" '{name:$n,profileLink:$p,companyLink:$c}')

# Add entry to vtcOwners
tempFile=$(mktemp)
jq ".vtcOwners += [$newEntry]" "$file" >"$tempFile"
if [ $? -ne 0 ]; then
    echo "Error: Failed to update JSON"
    rm "$tempFile"
    exit 1
fi
mv "$tempFile" "$file"

# Display success and JSON content
echo "Success:"
cat "$file"
echo -e "\nFormatted JSON:"
jq '.' "$file"
