#!/usr/bin/env python3
"""
Test script for Brand Challenge API endpoints
Run this after starting the server with: uvicorn main:app --reload
"""
import requests
import json
from datetime import datetime

# API base URL (change for production)
BASE_URL = "http://localhost:8000"

def print_section(title):
    """Print section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_health():
    """Test health check endpoint"""
    print_section("1. Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        print("✅ Health check passed")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

def test_user_login():
    """Test user login/registration"""
    print_section("2. Testing User Login")
    user_data = {
        "telegram_id": 123456789,
        "username": "test_user",
        "first_name": "Test",
        "last_name": "User",
        "photo_url": "https://example.com/photo.jpg"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/login", json=user_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        print("✅ User login passed")
        return response.json()
    except Exception as e:
        print(f"❌ User login failed: {e}")
        return None

def test_wallet_link(telegram_id):
    """Test wallet linking"""
    print_section("3. Testing Wallet Link")
    wallet_data = {
        "telegram_id": telegram_id,
        "wallet_address": "EQDrf...test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/wallet", json=wallet_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        print("✅ Wallet link passed")
    except Exception as e:
        print(f"❌ Wallet link failed: {e}")

def test_get_challenges():
    """Test getting challenges"""
    print_section("4. Testing Get Challenges")
    try:
        response = requests.get(f"{BASE_URL}/challenges")
        print(f"Status: {response.status_code}")
        challenges = response.json()
        print(f"Found {len(challenges)} challenges")
        if challenges:
            print(f"First challenge: {json.dumps(challenges[0], indent=2)}")
        assert response.status_code == 200
        print("✅ Get challenges passed")
        return challenges
    except Exception as e:
        print(f"❌ Get challenges failed: {e}")
        return []

def test_get_challenge_detail(challenge_id):
    """Test getting challenge detail"""
    print_section("5. Testing Get Challenge Detail")
    try:
        response = requests.get(f"{BASE_URL}/challenges/{challenge_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        print("✅ Get challenge detail passed")
    except Exception as e:
        print(f"❌ Get challenge detail failed: {e}")

def test_submit_photo(telegram_id, challenge_id):
    """Test photo submission"""
    print_section("6. Testing Photo Submission")
    submission_data = {
        "telegram_id": telegram_id,
        "challenge_id": challenge_id,
        "image_url": f"https://example.com/test_submission_{datetime.now().timestamp()}.jpg"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/submissions", json=submission_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            print("ℹ️  Already submitted (expected if running test multiple times)")
        else:
            assert response.status_code == 200
            print("✅ Photo submission passed")
    except Exception as e:
        print(f"❌ Photo submission failed: {e}")

def test_get_user_submissions(telegram_id):
    """Test getting user submissions"""
    print_section("7. Testing Get User Submissions")
    try:
        response = requests.get(f"{BASE_URL}/submissions/user/{telegram_id}")
        print(f"Status: {response.status_code}")
        submissions = response.json()
        print(f"Found {len(submissions)} submissions")
        if submissions:
            print(f"First submission: {json.dumps(submissions[0], indent=2)}")
        assert response.status_code == 200
        print("✅ Get user submissions passed")
    except Exception as e:
        print(f"❌ Get user submissions failed: {e}")

def test_leaderboard():
    """Test leaderboard"""
    print_section("8. Testing Leaderboard")
    try:
        response = requests.get(f"{BASE_URL}/leaderboard?limit=5")
        print(f"Status: {response.status_code}")
        leaderboard = response.json()
        print(f"Leaderboard entries: {len(leaderboard)}")
        for idx, entry in enumerate(leaderboard[:3], 1):
            print(f"  {idx}. @{entry['username']}: {entry['submission_count']} submissions")
        assert response.status_code == 200
        print("✅ Leaderboard passed")
    except Exception as e:
        print(f"❌ Leaderboard failed: {e}")

def test_stats():
    """Test platform stats"""
    print_section("9. Testing Platform Stats")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == 200
        print("✅ Platform stats passed")
    except Exception as e:
        print(f"❌ Platform stats failed: {e}")

def main():
    """Run all tests"""
    print("\n")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║         🧪  API ENDPOINT TESTING SUITE  🧪                   ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print(f"\nTesting API at: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Run tests
    test_health()
    
    user = test_user_login()
    if user:
        telegram_id = user['telegram_id']
        test_wallet_link(telegram_id)
        
        challenges = test_get_challenges()
        if challenges:
            challenge_id = challenges[0]['id']
            test_get_challenge_detail(challenge_id)
            test_submit_photo(telegram_id, challenge_id)
        
        test_get_user_submissions(telegram_id)
    
    test_leaderboard()
    test_stats()
    
    print("\n" + "="*60)
    print("  ✅ All tests completed!")
    print("="*60)
    print("\n💡 Tip: Check the API documentation at: http://localhost:8000/docs\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to API")
        print("Make sure the server is running: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
