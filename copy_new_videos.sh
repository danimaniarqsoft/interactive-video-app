#!/bin/bash

# --- Variables loading from .env file ---
ENV_FILE=".env"

# Check if the the .evn file exists in the current directory
if [ -f "$ENV_FILE" ]; then
    # set -a loading all variables
    set -a
    source "$ENV_FILE"
    set +a
    echo "Success: Configuration loaded correctly from $ENV_FILE."
else
    echo "Error: File $ENV_FILE not found in the current directory."
    exit 1
fi
# ------------------------------------------------------------

# 1. Verify that the source directory exists
if [ ! -d "$SRC_DIR" ]; then
    echo "Error: Source directory $SRC_DIR does not exist."
    exit 1
fi

# 2. Ensure the destination directory exists (creates it if missing)
if [ ! -d "$DEST_DIR" ]; then
    echo "Destination directory missing. Creating: $DEST_DIR"
    mkdir -p "$DEST_DIR"
fi

# 3. Check if there are any .mp4 files in the root of the source directory
shopt -s nullglob
files=("$SRC_DIR"/*.mp4)

if [ ${#files[@]} -eq 0 ]; then
    echo "No .mp4 files found in the root of $SRC_DIR."
    exit 0
fi

# 4. Move the .mp4 files
echo "Moving ${#files[@]} video(s) to $DEST_DIR..."
for file in "${files[@]}"; do
    mv "$file" "$DEST_DIR/"
    echo "Moved: $(basename "$file")"
done

echo "Operation complete!"