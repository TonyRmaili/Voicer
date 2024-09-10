import os


pre_defined_roles = [
    'assistant',
    'general',
    'teacher',
    'therapist',
    'chef',
    'personal_trainer'
]


def scan():
    directory = './json_log/test@test.com'
    store = []
    
    # List all files in the specified directory
    file_names = os.listdir(directory)

    # Filter out directories and keep only files
    files = [f for f in file_names if os.path.isfile(os.path.join(directory, f))]

    # Strip the .json extension from file names
    for file in files:
        
        base_name, _ = os.path.splitext(file)
        if base_name in pre_defined_roles:
            continue
        store.append(base_name)
    
    return store

if __name__ == "__main__":
    store = scan()
    print(store)