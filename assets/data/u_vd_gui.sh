#!/bin/bash
file="./vtcData.json"

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
    zenity --error --text="Error: jq is not installed" --width=400
    exit 1
fi

# Check if zenity is installed
if ! command -v zenity >/dev/null 2>&1; then
    echo "Error: zenity is not installed"
    exit 1
fi

# Initialize JSON file if it doesn't exist
if [ ! -f "$file" ]; then
    echo '{"vtcOwners":[],"starMap":{},"a":[]}' >"$file"
    zenity --info --text="Created $file" --width=400
fi

# Function to validate links
validateLink() {
    local link=$1 type=$2
    if [ "$type" = "profile" ]; then
        if [[ ! "$link" =~ ^https://truckersmp\.com/user/[0-9]+$ ]]; then
            zenity --error --text="Error: Invalid profile link. Must be https://truckersmp.com/user/[numbers]" --width=400
            return 1
        fi
    elif [ "$type" = "company" ]; then
        if [[ ! "$link" =~ ^https://truckersmp\.com/vtc/[0-9]+(-[a-zA-Z0-9-]+)?$ ]]; then
            zenity --error --text="Error: Invalid company link. Must be https://truckersmp.com/vtc/[numbers][-optional-name]" --width=400
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

# Prompt for input using zenity
name=$(zenity --entry --title="Add VTC Owner" --text="Name:" --width=500)
if [ $? -ne 0 ]; then
    zenity --info --text="Cancelled" --width=400
    exit 0
fi
if [ -z "$name" ]; then
    zenity --error --text="Error: Name cannot be empty" --width=400
    exit 1
fi

profileLink=$(zenity --entry --title="Add VTC Owner" --text="Profile Link:" --width=500 --entry-text="https://truckersmp.com/user/")
if [ $? -ne 0 ]; then
    zenity --info --text="Cancelled" --width=400
    exit 0
fi
validateLink "$profileLink" "profile" || exit 1
normalizedProfileLink=$(normalizeLink "$profileLink")

companyLink=$(zenity --entry --title="Add VTC Owner" --text="Company Link:" --width=500 --entry-text="https://truckersmp.com/vtc/")
if [ $? -ne 0 ]; then
    zenity --info --text="Cancelled" --width=400
    exit 0
fi
validateLink "$companyLink" "company" || exit 1
normalizedCompanyLink=$(normalizeLink "$companyLink")

# Check for duplicate entry
existingEntry=$(jq -r ".vtcOwners[] | select(.profileLink==\"$normalizedProfileLink\" and .companyLink==\"$normalizedCompanyLink\") | .name" "$file")
if [ ! -z "$existingEntry" ]; then
    zenity --error --text="Error: Duplicate entry for profile $normalizedProfileLink and company $normalizedCompanyLink" --width=400
    exit 1
fi

# Create JSON object for new entry
newEntry=$(jq -n --arg n "$name" --arg p "$normalizedProfileLink" --arg c "$normalizedCompanyLink" '{name:$n,profileLink:$p,companyLink:$c}')

# Add entry to vtcOwners
tempFile=$(mktemp)
jq ".vtcOwners += [$newEntry]" "$file" >"$tempFile"
if [ $? -ne 0 ]; then
    zenity --error --text="Error: Failed to update JSON" --width=400
    rm "$tempFile"
    exit 1
fi
mv "$tempFile" "$file"

# Display success
zenity --text-info --title="Success" --width=600 --height=400 --filename="$file"
