
if __name__ == "__main__":
    import urllib.request
    
    try:
        url = "https://kroki.io/plantuml/png"
        
        with open('vista_fin_ai_deployment_diagram.puml', 'r') as f:
            data = f.read().encode('utf-8')
            
        print(f"Downloading from: {url} (POST)")
        
        req = urllib.request.Request(
            url, 
            data=data, 
            headers={
                'Content-Type': 'text/plain',
                'User-Agent': 'Mozilla/5.0'
            },
            method='POST'
        )
        
        output_file = 'vista_fin_ai_deployment_diagram.png'
        with urllib.request.urlopen(req) as response:
            with open(output_file, 'wb') as out_file:
                out_file.write(response.read())
                
        print(f"Successfully saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
