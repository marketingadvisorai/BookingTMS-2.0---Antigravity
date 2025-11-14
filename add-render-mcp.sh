#!/bin/bash

# Script to add Render MCP server to Windsurf configuration

set -e

echo "🔧 Render MCP Server Setup"
echo "=========================="
echo ""

# Check if config file exists
CONFIG_FILE="$HOME/.codeium/windsurf/mcp_config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Windsurf MCP config file not found at: $CONFIG_FILE"
    echo "   Please make sure Windsurf is installed."
    exit 1
fi

echo "✅ Found Windsurf MCP config file"
echo ""

# Prompt for API key
echo "📝 Please enter your Render API key:"
echo "   (Get it from: https://dashboard.render.com/settings)"
echo ""
read -p "Render API Key (rnd_...): " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ API key cannot be empty"
    exit 1
fi

if [[ ! "$API_KEY" =~ ^rnd_ ]]; then
    echo "⚠️  Warning: API key doesn't start with 'rnd_'"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Aborted"
        exit 1
    fi
fi

echo ""
echo "📋 Backing up current config..."
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo "✅ Backup created: $CONFIG_FILE.backup"
echo ""

# Create temporary file with updated config
echo "🔄 Updating configuration..."

# Use Python to safely update JSON
python3 << EOF
import json

# Read current config
with open('$CONFIG_FILE', 'r') as f:
    config = json.load(f)

# Add Render MCP server
if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers']['render'] = {
    "url": "https://mcp.render.com/mcp",
    "headers": {
        "Authorization": "Bearer $API_KEY"
    }
}

# Write updated config
with open('$CONFIG_FILE', 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Configuration updated successfully!")
EOF

echo ""
echo "🎉 Render MCP Server Added!"
echo ""
echo "📋 Next Steps:"
echo "1. Restart Windsurf completely"
echo "2. In Windsurf chat, run: Set my Render workspace to My Workspace"
echo "3. Test with: List my Render services"
echo ""
echo "✅ Setup complete!"
