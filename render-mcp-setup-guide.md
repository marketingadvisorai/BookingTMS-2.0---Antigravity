# 🔧 Render MCP Server Setup Guide

## Step 1: Get Your Render API Key

### **Go to Account Settings:**
👉 **[https://dashboard.render.com/settings](https://dashboard.render.com/settings)**

### **Create API Key:**
1. Scroll to "API Keys" section
2. Click "Create API Key"
3. Name: `Windsurf MCP Server`
4. Click "Create API Key"
5. **Copy the key immediately** (starts with `rnd_...`)
   - ⚠️ You won't be able to see it again!

---

## Step 2: Update Windsurf MCP Config

### **Option 1: Manual Update**

1. Open the file:
   ```bash
   code ~/.codeium/windsurf/mcp_config.json
   ```

2. Add this configuration inside the `"mcpServers"` object:
   ```json
   "render": {
     "url": "https://mcp.render.com/mcp",
     "headers": {
       "Authorization": "Bearer <YOUR_API_KEY>"
     }
   }
   ```

3. Replace `<YOUR_API_KEY>` with your actual Render API key

4. Save the file

### **Option 2: Let Me Do It**

Provide your Render API key and I'll update the configuration automatically.

---

## Step 3: Restart Windsurf

After updating the configuration:
1. Close Windsurf completely
2. Reopen Windsurf
3. The Render MCP server will be loaded

---

## Step 4: Set Your Workspace

In Windsurf chat, run:
```
Set my Render workspace to My Workspace
```

Or use your actual workspace name.

---

## ✅ Verify Setup

Try these commands in Windsurf:

```
List my Render services
```

```
Show me the status of bookingtms-backend-api
```

```
Get logs for srv-d49gml95pdvs73ctdb5g
```

---

## 🎯 What You Can Do with Render MCP

### **Service Management:**
- List all services
- Get service details
- View service logs
- Check deployment status

### **Environment Variables:**
- List environment variables
- Add new variables
- Update existing variables
- Delete variables

### **Deployments:**
- Trigger manual deploys
- View deployment history
- Check deployment status
- View build logs

### **Example Prompts:**
```
List all my Render services
```

```
Show me the environment variables for bookingtms-backend-api
```

```
Add environment variable SUPABASE_URL with value https://xxx.supabase.co to bookingtms-backend-api
```

```
Trigger a deploy for bookingtms-backend-api
```

```
Show me the latest deployment logs for srv-d49gml95pdvs73ctdb5g
```

---

## 🔐 Security Notes

### **API Key Permissions:**
- Render API keys have broad access
- They can access all workspaces and services
- Currently supports modifying environment variables
- Keep your API key secure

### **Best Practices:**
- Don't share your API key
- Don't commit it to Git
- Rotate it regularly
- Use descriptive names for tracking

---

## 📚 Documentation

- **Render MCP Docs:** https://render.com/docs/mcp-server
- **Windsurf MCP Docs:** https://docs.windsurf.com/windsurf/cascade/mcp
- **MCP Protocol:** https://modelcontextprotocol.io

---

## 🆘 Troubleshooting

### **MCP Server Not Loading:**
1. Check the config file syntax is valid JSON
2. Restart Windsurf completely
3. Check Windsurf logs for errors

### **Authentication Errors:**
1. Verify API key is correct
2. Check it starts with `rnd_`
3. Recreate the API key if needed

### **Workspace Not Found:**
1. List your workspaces first
2. Use exact workspace name
3. Check you have access to the workspace

---

## ✅ Quick Setup Checklist

- [ ] Go to Render Account Settings
- [ ] Create API Key
- [ ] Copy API key (rnd_...)
- [ ] Update mcp_config.json
- [ ] Add Render MCP configuration
- [ ] Replace <YOUR_API_KEY> with actual key
- [ ] Save file
- [ ] Restart Windsurf
- [ ] Set workspace
- [ ] Test with "List my Render services"

---

**Once configured, you'll be able to manage your Render services directly from Windsurf!** 🚀
