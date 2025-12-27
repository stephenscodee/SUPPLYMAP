import requests
import uuid

API_BASE = "http://localhost:8000"

def seed_data():
    # 1. Create Suppliers
    suppliers = [
        {"name": "AWS Europe", "criticality": 5, "location": "Ireland", "notes": "Main cloud infrastructure provider."},
        {"name": "Stripe", "criticality": 4, "location": "USA (Global)", "notes": "Payment processing gateway."},
        {"name": "Logistics Express", "criticality": 3, "location": "Spain", "notes": "Last-mile delivery partner."},
        {"name": "DevOps Experts SL", "criticality": 2, "location": "Madrid", "notes": "Managed infrastructure support."}
    ]
    
    s_ids = []
    for s in suppliers:
        res = requests.post(f"{API_BASE}/suppliers", json=s)
        s_ids.append((res.json()["id"], s["name"]))
        print(f"Created Supplier: {s['name']}")

    # 2. Create Processes
    processes = [
        {"name": "Checkout Flow", "impact_score": 5, "owner": "Product Team", "notes": "Critical revenue-generating process."},
        {"name": "API Service", "impact_score": 5, "owner": "Engineering", "notes": "Internal and external API uptime."},
        {"name": "Order Shipping", "impact_score": 4, "owner": "Operations", "notes": "Physical goods delivery."},
        {"name": "Customer Support Dashboard", "impact_score": 2, "owner": "Support", "notes": "Internal dashboard for agents."}
    ]
    
    p_ids = []
    for p in processes:
        res = requests.post(f"{API_BASE}/processes", json=p)
        p_ids.append((res.json()["id"], p["name"]))
        print(f"Created Process: {p['name']}")

    # 3. Create Dependencies
    # AWS -> API Service (Blocker)
    # API Service -> Checkout Flow (Blocker)
    # Stripe -> Checkout Flow (High)
    # Logistics Express -> Order Shipping (High)
    
    aws_id = next(id for id, name in s_ids if name == "AWS Europe")
    stripe_id = next(id for id, name in s_ids if name == "Stripe")
    logistics_id = next(id for id, name in s_ids if name == "Logistics Express")
    
    api_id = next(id for id, name in p_ids if name == "API Service")
    checkout_id = next(id for id, name in p_ids if name == "Checkout Flow")
    shipping_id = next(id for id, name in p_ids if name == "Order Shipping")

    dependencies = [
        {
            "source_id": aws_id, "source_type": "supplier",
            "target_id": api_id, "target_type": "process",
            "criticality": "blocker"
        },
        {
            "source_id": api_id, "source_type": "process",
            "target_id": checkout_id, "target_type": "process",
            "criticality": "blocker"
        },
        {
            "source_id": stripe_id, "source_type": "supplier",
            "target_id": checkout_id, "target_type": "process",
            "criticality": "high"
        },
        {
            "source_id": logistics_id, "source_type": "supplier",
            "target_id": shipping_id, "target_type": "process",
            "criticality": "high"
        }
    ]

    for d in dependencies:
        requests.post(f"{API_BASE}/dependencies", json=d)
        print(f"Created Dependency: {d['source_type']} -> {d['target_type']}")

if __name__ == "__main__":
    try:
        seed_data()
        print("\nSeeding complete!")
    except Exception as e:
        print(f"Seeding failed: {e}")
