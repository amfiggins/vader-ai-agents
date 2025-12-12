# Creating a Dock Icon for the Orchestrator

This guide will help you create a macOS application icon that you can place in your dock.

## Option 1: Using Automator (Easiest)

1. **Open Automator** (Applications → Automator)

2. **Create New Document**
   - Choose "Application" when prompted

3. **Add "Run Shell Script" Action**
   - Search for "Run Shell Script" in the actions library
   - Drag it to the workflow area

4. **Configure the Script**
   - Set "Shell" to `/bin/bash`
   - Set "Pass input" to "as arguments"
   - Paste this in the script area:
   ```bash
   cd "/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
   bash launch-orchestrator.sh
   ```

5. **Save the Application**
   - File → Save
   - Name it "Vader AI Orchestrator"
   - Save it to Applications folder (or wherever you prefer)
   - Make sure "File Format" is set to "Application"

6. **Set a Custom Icon (Optional)**
   - Right-click the app → Get Info
   - Drag an icon image onto the icon in the top-left of the Info window
   - Or use an online icon generator

7. **Add to Dock**
   - Drag the app from Applications to your Dock

## Option 2: Using Platypus (More Control)

1. **Download Platypus** (free): https://sveinbjorn.org/platypus

2. **Create New App**
   - App Name: "Vader AI Orchestrator"
   - Script Type: Shell
   - Script Path: Select `launch-orchestrator.sh`

3. **Configure**
   - Interface: None (runs in background)
   - Icon: Choose a custom icon if desired

4. **Build**
   - Click "Create App"
   - Save to Applications

## Option 3: Quick Script Wrapper (Simplest)

Run this command to create the app directly:

```bash
cd "/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator"
chmod +x launch-orchestrator.sh

# Create app using osacompile
osacompile -o "Vader AI Orchestrator.app" << 'APPLESCRIPT'
on run
    do shell script "bash '/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator/launch-orchestrator.sh'"
end run
APPLESCRIPT
```

Then:
- Move "Vader AI Orchestrator.app" to Applications
- Drag it to your Dock

## Making the Script Executable

Before using any option, make sure the script is executable:

```bash
chmod +x "/Users/anthonyfiggins/Library/CloudStorage/GoogleDrive-amfiggins@gmail.com/Other computers/Silabs/Documents/GitHub/vader-ai-agents/orchestrator/launch-orchestrator.sh"
```

## Custom Icon

You can create or download an icon:
- Use an AI icon generator
- Use an icon from https://icons8.com or similar
- Create one using https://www.favicon-generator.org/

To set a custom icon:
1. Get a `.icns` file or `.png` (512x512 recommended)
2. Right-click the app → Get Info
3. Drag the icon file onto the app icon in the Info window

## Testing

1. Click the dock icon
2. It should:
   - Check if server is running
   - Start it if needed
   - Open http://localhost:3002 in your browser
   - Show a notification

## Troubleshooting

**Script won't run:**
- Make sure it's executable: `chmod +x launch-orchestrator.sh`
- Check the path in the script matches your actual path

**Server won't start:**
- Check if port 3002 is available
- Make sure npm dependencies are installed
- Check `/tmp/orchestrator.log` for errors

**Browser won't open:**
- Make sure the server started successfully
- Try opening http://localhost:3002 manually
