import os
import json

pre_defined_roles = [
    'assistant',
    'general',
    'teacher',
    'therapist',
    'chef',
    'personal_trainer'
]


def scan():
    directory = './custom_config/test@test.com'
    store = []
    
    # List all files in the specified directory
    file_names = os.listdir(directory)

    # Filter out directories and keep only files
    files = [f for f in file_names if os.path.isfile(os.path.join(directory, f))]

    # Process each file and store the JSON content
    for file in files:
        base_name, ext = os.path.splitext(file)
        if base_name in pre_defined_roles or ext != '.json':  # Skip non-JSON and pre-defined roles
            continue
        file_path = os.path.join(directory, file)
        try:
            # Read the JSON file and append its content to the store list
            with open(file_path, 'r') as json_file:
                data = json.load(json_file)
                store.append(data)
        except json.JSONDecodeError as e:
            print(f"Error reading {file}: {e}")
    
    return store



if __name__ == "__main__":
    store = scan()
    print(store)