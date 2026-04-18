import requests

def process_query(query: str, session_id: str):
    print(f"[Worker] Picked up task for {session_id}. Forwarding to n8n...")
    
    # URL to the n8n webhook (internal docker network)
    n8n_webhook_url = "http://n8n:5678/webhook/ai-chat"
    
    payload = {
        "session_id": session_id,
        "query": query
    }
    
    try:
        # The worker pauses here while n8n executes the RAG and Gemini AI
        response = requests.post(n8n_webhook_url, json=payload, timeout=120)
        
        if response.status_code == 200:
            n8n_data = response.json()
            return {"message": n8n_data.get("message", "No message returned by n8n.")}
        else:
            print(f"n8n Error: {response.text}")
            return {"message": f"Error: n8n returned status {response.status_code}"}
            
    except Exception as e:
        print(f"Error calling n8n: {e}")
        return {"message": "Sorry, the AI engine is currently unreachable."}