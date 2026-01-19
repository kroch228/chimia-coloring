import os
import glob
import json

def update_manifest():
    # Define paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    js_dir = os.path.join(base_dir, 'js')
    
    # Ensure js directory exists
    if not os.path.exists(js_dir):
        os.makedirs(js_dir)
        
    # Scan for .js files in data directory
    # We explicitly exclude auto_gallery.js if it exists to avoid loops, though it shouldn't matter
    js_files = []
    if os.path.exists(data_dir):
        # Glob for all .js files
        files = glob.glob(os.path.join(data_dir, '*.js'))
        for f in files:
            filename = os.path.basename(f)
            # Add to list
            js_files.append(filename)
            
    # Remove duplicates and sort
    js_files = sorted(list(set(js_files)))
    
    print(f"Found {len(js_files)} data files: {', '.join(js_files)}")
    
    # Create the manifest content
    manifest_path = os.path.join(js_dir, 'manifest.js')
    
    content = "// Auto-generated manifest file. Do not edit manually.\n"
    content += "window.DATA_MANIFEST = " + json.dumps(js_files, indent=4) + ";\n"
    
    # Write to file
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Manifest written to {manifest_path}")

if __name__ == "__main__":
    update_manifest()
