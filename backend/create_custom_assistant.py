import os
import json


def format_name_lowercase(name):
    # Convert to lowercase and replace spaces with underscores
    return name.lower().replace(" ", "_")

def format_name_title_case(name):
    # Replace underscores with spaces to handle both cases
    name = name.replace("_", " ")
    # Convert the first letter of each word to uppercase and the rest to lowercase
    return name.title()

def create_custom_config(data,path,name):
    file_path = os.path.join(path, f"{name}.json")

    os.makedirs(path, exist_ok=True)
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)



def create_assistant(name,prompt,voice):
    json_dir = './json_log/test@test.com'
    config_dir = './custom_config/test@test.com'

    lower_name = format_name_lowercase(name)

    file_path = os.path.join(json_dir, f"{lower_name}.json")
    
    # Data to be saved in the JSON file
    data = [{
        
        "role": 'system',
        "content": prompt
    }]
    
    # Write the data to a JSON file
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

    upper_name = format_name_title_case(name=name)


    config_data = {
    'id': lower_name, 'name': upper_name,'voice': voice
    }

    create_custom_config(data=config_data,path=config_dir,name=lower_name)

    return config_data