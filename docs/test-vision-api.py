import base64
from pathlib import Path
import json
import os
from urllib import request
from urllib.error import URLError


def image_to_base64(image_path):
    """Convert image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def test_vision_api():
    """Test the vision API endpoint with a sample image."""
    # API endpoint URL (adjust if needed)
    api_url = "http://localhost:3000/api/vision"

    # Path to the sample image
    current_dir = Path(__file__).parent
    image_path = current_dir / "sample.jpg"

    # Convert image to base64
    try:
        base64_image = image_to_base64(str(image_path))

        # Prepare the request payload - ensure proper data URI format
        payload = {"image": f"data:image/jpeg;base64,{base64_image}"}

        # Convert payload to bytes
        data = json.dumps(payload).encode("utf-8")

        # Create request object with headers
        req = request.Request(
            api_url,
            data=data,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )

        # Make the POST request
        try:
            with request.urlopen(req) as response:
                # Read and decode the response
                response_data = response.read().decode("utf-8")
                print("✅ API request successful")
                print("\nResponse content:")
                print(json.dumps(json.loads(response_data), indent=2))
        except URLError as e:
            print(f"❌ API request failed: {str(e)}")
            if hasattr(e, "read"):
                print("Response:", e.read().decode("utf-8"))

    except FileNotFoundError:
        print(f"❌ Error: Sample image not found at {image_path}")
    except Exception as e:
        print(f"❌ Error occurred: {str(e)}")


if __name__ == "__main__":
    test_vision_api()
